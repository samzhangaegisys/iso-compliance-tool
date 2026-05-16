import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";

const TYPES = ["EQUIVALENT", "SIMILAR", "RELATED"] as const;

const CreateSchema = z.object({
  sourceControlId: z.string().cuid(),
  targetControlId: z.string().cuid(),
  mappingType:     z.enum(TYPES).default("EQUIVALENT"),
  notes:           z.string().max(1000).optional(),
});

// Cross-mapping is available on all plans (a core ISO multi-standard differentiator).
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ mappings: [] });
  if (!prisma) return NextResponse.json({ mappings: [] });

  const membership = await prisma.orgMember.findFirst({ where: { userId: session.user.id } });
  if (!membership) return NextResponse.json({ mappings: [] });

  const mappings = await prisma.controlMapping.findMany({
    where: { orgId: membership.orgId },
    include: {
      sourceControl: { include: { clause: { include: { standard: true } } } },
      targetControl: { include: { clause: { include: { standard: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    mappings: mappings.map((m) => ({
      id: m.id,
      mappingType: m.mappingType,
      notes: m.notes,
      createdAt: m.createdAt.toISOString(),
      createdBy: m.createdBy,
      source: {
        id: m.sourceControl.id,
        ref: m.sourceControl.controlRef,
        title: m.sourceControl.title,
        clause: m.sourceControl.clause.clauseNumber,
        standardCode: m.sourceControl.clause.standard.code,
        standardName: m.sourceControl.clause.standard.name,
      },
      target: {
        id: m.targetControl.id,
        ref: m.targetControl.controlRef,
        title: m.targetControl.title,
        clause: m.targetControl.clause.clauseNumber,
        standardCode: m.targetControl.clause.standard.code,
        standardName: m.targetControl.clause.standard.name,
      },
    })),
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!prisma) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const membership = await prisma.orgMember.findFirst({
    where: { userId: session.user.id, role: { in: ["OWNER", "ADMIN", "MEMBER"] } },
  });
  if (!membership) return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });

  const parsed = CreateSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }
  const { sourceControlId, targetControlId, mappingType, notes } = parsed.data;
  if (sourceControlId === targetControlId) {
    return NextResponse.json({ error: "Source and target must be different controls." }, { status: 400 });
  }

  // Confirm both controls exist (they're catalog-wide so any logged-in org can reference them).
  const [src, tgt] = await Promise.all([
    prisma.isoControl.findUnique({ where: { id: sourceControlId } }),
    prisma.isoControl.findUnique({ where: { id: targetControlId } }),
  ]);
  if (!src || !tgt) return NextResponse.json({ error: "Control not found." }, { status: 404 });

  const mapping = await prisma.controlMapping.upsert({
    where: { orgId_sourceControlId_targetControlId: { orgId: membership.orgId, sourceControlId, targetControlId } },
    update: { mappingType, notes },
    create: { orgId: membership.orgId, sourceControlId, targetControlId, mappingType, notes, createdBy: session.user.name ?? session.user.email ?? "Unknown" },
  });

  await writeAuditLog({
    orgId: membership.orgId,
    userId: session.user.id,
    userName: session.user.name ?? session.user.email ?? "Unknown",
    action: "control_mapping.created",
    entityId: mapping.id,
    meta: { sourceControlId, targetControlId, mappingType },
  });

  return NextResponse.json({ mapping: { ...mapping, createdAt: mapping.createdAt.toISOString() } });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!prisma) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id." }, { status: 400 });

  const membership = await prisma.orgMember.findFirst({ where: { userId: session.user.id } });
  if (!membership) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const mapping = await prisma.controlMapping.findFirst({ where: { id, orgId: membership.orgId } });
  if (!mapping) return NextResponse.json({ error: "Mapping not found." }, { status: 404 });

  await prisma.controlMapping.delete({ where: { id } });
  await writeAuditLog({
    orgId: membership.orgId,
    userId: session.user.id,
    userName: session.user.name ?? session.user.email ?? "Unknown",
    action: "control_mapping.deleted",
    entityId: id,
  });
  return NextResponse.json({ success: true });
}
