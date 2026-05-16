import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";
import { getLimits, upgradeResponse } from "@/lib/plan-limits";

const CATEGORIES = ["OPERATIONAL", "SECURITY", "COMPLIANCE", "FINANCIAL", "REPUTATIONAL", "STRATEGIC", "TECHNOLOGY"] as const;
const TREATMENTS = ["AVOID", "MITIGATE", "TRANSFER", "ACCEPT"] as const;
const STATUSES   = ["OPEN", "IN_TREATMENT", "CLOSED", "ACCEPTED"] as const;

const UpdateRiskSchema = z.object({
  title:          z.string().min(1).max(255).optional(),
  description:    z.string().max(2000).nullable().optional(),
  category:       z.enum(CATEGORIES).optional(),
  likelihood:     z.number().int().min(1).max(5).optional(),
  impact:         z.number().int().min(1).max(5).optional(),
  treatment:      z.enum(TREATMENTS).optional(),
  treatmentNotes: z.string().max(2000).nullable().optional(),
  ownerId:        z.string().cuid().nullable().optional(),
  reviewDate:     z.string().datetime().nullable().optional(),
  status:         z.enum(STATUSES).optional(),
});

async function gateAndLoad(userId: string, riskId: string) {
  if (!prisma) return { error: "DB unavailable", status: 503 as const };
  const membership = await prisma.orgMember.findFirst({ where: { userId } });
  if (!membership) return { error: "Unauthorized", status: 401 as const };

  const { plan } = await getLimits(membership.orgId);
  if (plan === "STARTER") {
    return { upgrade: upgradeResponse("Risk register", 0, 0, plan), status: 402 as const };
  }

  const risk = await prisma.risk.findFirst({ where: { id: riskId, orgId: membership.orgId } });
  if (!risk) return { error: "Risk not found", status: 404 as const };

  return { membership, risk };
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const ctx = await gateAndLoad(session.user.id, id);
  if ("error" in ctx) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  if ("upgrade" in ctx) return NextResponse.json(ctx.upgrade, { status: ctx.status });

  const parsed = UpdateRiskSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }
  const data = parsed.data;

  let ownerName: string | null | undefined = undefined;
  if (data.ownerId !== undefined) {
    if (data.ownerId === null) ownerName = null;
    else {
      const owner = await prisma!.user.findUnique({ where: { id: data.ownerId }, select: { name: true, email: true } });
      ownerName = owner?.name ?? owner?.email ?? null;
    }
  }

  const updated = await prisma!.risk.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.likelihood !== undefined && { likelihood: data.likelihood }),
      ...(data.impact !== undefined && { impact: data.impact }),
      ...(data.treatment !== undefined && { treatment: data.treatment }),
      ...(data.treatmentNotes !== undefined && { treatmentNotes: data.treatmentNotes }),
      ...(data.ownerId !== undefined && { ownerId: data.ownerId }),
      ...(ownerName !== undefined && { ownerName }),
      ...(data.reviewDate !== undefined && { reviewDate: data.reviewDate ? new Date(data.reviewDate) : null }),
      ...(data.status !== undefined && { status: data.status }),
    },
  });

  await writeAuditLog({
    orgId: ctx.membership.orgId,
    userId: session.user.id,
    userName: session.user.name ?? session.user.email ?? "Unknown",
    action: "risk.updated",
    entityId: updated.id,
    meta: { changed: Object.keys(data) },
  });

  return NextResponse.json({
    risk: {
      ...updated,
      score: updated.likelihood * updated.impact,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
      reviewDate: updated.reviewDate?.toISOString() ?? null,
    },
  });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const ctx = await gateAndLoad(session.user.id, id);
  if ("error" in ctx) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  if ("upgrade" in ctx) return NextResponse.json(ctx.upgrade, { status: ctx.status });

  await prisma!.risk.delete({ where: { id } });
  await writeAuditLog({
    orgId: ctx.membership.orgId,
    userId: session.user.id,
    userName: session.user.name ?? session.user.email ?? "Unknown",
    action: "risk.deleted",
    entityId: id,
    meta: { title: ctx.risk.title },
  });
  return NextResponse.json({ success: true });
}
