import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getLimits, upgradeResponse } from "@/lib/plan-limits";
import type { Prisma } from "@prisma/client";

// Audit log viewer is Enterprise-only.
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ entries: [] });
  if (!prisma) return NextResponse.json({ entries: [] });

  const membership = await prisma.orgMember.findFirst({ where: { userId: session.user.id } });
  if (!membership) return NextResponse.json({ entries: [] });

  const { plan } = await getLimits(membership.orgId);
  if (plan !== "ENTERPRISE") {
    return NextResponse.json(upgradeResponse("Audit log viewer", 0, 0, plan), { status: 402 });
  }

  const url      = new URL(req.url);
  const action   = url.searchParams.get("action");      // e.g. "risk.created"
  const userId   = url.searchParams.get("userId");
  const from     = url.searchParams.get("from");        // ISO date
  const to       = url.searchParams.get("to");
  const limit    = Math.min(Number.parseInt(url.searchParams.get("limit") ?? "100", 10) || 100, 500);
  const cursor   = url.searchParams.get("cursor");      // entry id for pagination

  const where: Prisma.AuditLogWhereInput = { orgId: membership.orgId };
  if (action) where.action = action;
  if (userId) where.userId = userId;
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to)   where.createdAt.lte = new Date(to);
  }

  const entries = await prisma.auditLog.findMany({
    where,
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    orderBy: { createdAt: "desc" },
  });

  const hasMore  = entries.length > limit;
  const trimmed  = hasMore ? entries.slice(0, limit) : entries;
  const nextCursor = hasMore ? trimmed[trimmed.length - 1]!.id : null;

  // Distinct actions for filter dropdown (only common ones — cheap query)
  const distinctActions = await prisma.auditLog.groupBy({
    by: ["action"],
    where: { orgId: membership.orgId },
    _count: { action: true },
    orderBy: { _count: { action: "desc" } },
    take: 30,
  });

  return NextResponse.json({
    entries: trimmed.map((e) => ({
      id: e.id,
      userId: e.userId,
      userName: e.userName,
      action: e.action,
      entityId: e.entityId,
      meta: e.meta,
      createdAt: e.createdAt.toISOString(),
    })),
    nextCursor,
    actions: distinctActions.map((a) => ({ action: a.action, count: a._count.action })),
  });
}
