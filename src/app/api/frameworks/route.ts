import { NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "crypto";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";
import { getLimits, upgradeResponse } from "@/lib/plan-limits";

const ControlSchema = z.object({
  controlRef:  z.string().min(1).max(50),
  title:       z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  guidance:    z.string().max(2000).optional(),
});

const ClauseSchema = z.object({
  clauseNumber: z.string().min(1).max(50),
  title:        z.string().min(1).max(255),
  controls:     z.array(ControlSchema).max(200),
});

const CreateFrameworkSchema = z.object({
  name:        z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  version:     z.string().min(1).max(50).default("1.0"),
  clauses:     z.array(ClauseSchema).min(1).max(50),
});

// Custom frameworks are Enterprise-only.
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ frameworks: [] });
  if (!prisma) return NextResponse.json({ frameworks: [] });

  const membership = await prisma.orgMember.findFirst({ where: { userId: session.user.id } });
  if (!membership) return NextResponse.json({ frameworks: [] });

  // Return both global ISO catalog entries and this org's custom frameworks.
  const standards = await prisma.isoStandard.findMany({
    where: { OR: [{ orgId: null }, { orgId: membership.orgId }] },
    include: { _count: { select: { clauses: true } } },
    orderBy: [{ orgId: "asc" }, { name: "asc" }],
  });

  return NextResponse.json({
    frameworks: standards.map((s) => ({
      id: s.id,
      code: s.code,
      name: s.name,
      description: s.description,
      version: s.version,
      isCustom: !!s.orgId,
      clauseCount: s._count.clauses,
      createdAt: s.createdAt.toISOString(),
    })),
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!prisma) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const membership = await prisma.orgMember.findFirst({
    where: { userId: session.user.id, role: { in: ["OWNER", "ADMIN"] } },
  });
  if (!membership) return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });

  const { plan } = await getLimits(membership.orgId);
  if (plan !== "ENTERPRISE") {
    return NextResponse.json(upgradeResponse("Custom frameworks", 0, 0, plan), { status: 402 });
  }

  const parsed = CreateFrameworkSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }
  const { name, description, version, clauses } = parsed.data;

  // Generate a unique code for the custom framework so it can't collide with the ISO catalog.
  const code = `custom_${randomUUID()}`;

  const standard = await prisma.isoStandard.create({
    data: {
      code,
      name,
      description,
      version,
      orgId: membership.orgId,
      clauses: {
        create: clauses.map((cl) => ({
          clauseNumber: cl.clauseNumber,
          title: cl.title,
          controls: {
            create: cl.controls.map((ctrl) => ({
              controlRef: ctrl.controlRef,
              title: ctrl.title,
              description: ctrl.description,
              guidance: ctrl.guidance,
            })),
          },
        })),
      },
    },
  });

  await writeAuditLog({
    orgId: membership.orgId,
    userId: session.user.id,
    userName: session.user.name ?? session.user.email ?? "Unknown",
    action: "framework.created",
    entityId: standard.id,
    meta: { name, version, clauseCount: clauses.length },
  });

  return NextResponse.json({ framework: { id: standard.id, code, name } });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!prisma) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id." }, { status: 400 });

  const membership = await prisma.orgMember.findFirst({
    where: { userId: session.user.id, role: { in: ["OWNER", "ADMIN"] } },
  });
  if (!membership) return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });

  // Must be an org-owned custom framework — not allowed to delete the global ISO catalog.
  const std = await prisma.isoStandard.findFirst({ where: { id, orgId: membership.orgId } });
  if (!std) return NextResponse.json({ error: "Custom framework not found." }, { status: 404 });

  await prisma.isoStandard.delete({ where: { id } });
  await writeAuditLog({
    orgId: membership.orgId,
    userId: session.user.id,
    userName: session.user.name ?? session.user.email ?? "Unknown",
    action: "framework.deleted",
    entityId: id,
    meta: { name: std.name },
  });
  return NextResponse.json({ success: true });
}
