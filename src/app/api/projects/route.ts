import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ISO_STANDARDS } from "@/lib/iso-data";
import { writeAuditLog } from "@/lib/audit";

const CreateProjectSchema = z.object({
  standardCode: z.string().min(1).max(50),
  name:         z.string().min(1).max(255),
  description:  z.string().max(1000).optional(),
  targetDate:   z.string().datetime().optional(),
  startDate:    z.string().datetime().optional(),
  leadUserId:   z.string().cuid().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ projects: [] });
  if (!prisma) return NextResponse.json({ projects: [] });

  const membership = await prisma.orgMember.findFirst({
    where: { userId: session.user.id },
  });
  if (!membership) return NextResponse.json({ projects: [] });

  const projects = await prisma.complianceProject.findMany({
    where: { orgId: membership.orgId },
    include: {
      standard: true,
      controls: { select: { status: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    projects: projects.map((p) => {
      const total       = p.controls.length;
      const implemented = p.controls.filter((c) => c.status === "IMPLEMENTED").length;
      const inProgress  = p.controls.filter((c) => c.status === "IN_PROGRESS").length;
      const score = total > 0 ? Math.round((implemented / total) * 100) : 0;
      return {
        id: p.id,
        name: p.name,
        description: p.description ?? "",
        standardId: p.standardId,
        standardCode: p.standard.code,
        standardName: p.standard.name,
        status: p.status,
        targetDate: p.targetDate?.toISOString() ?? null,
        startDate: p.startDate?.toISOString() ?? null,
        leadUserId: p.leadUserId ?? null,
        createdAt: p.createdAt.toISOString(),
        score,
        implemented,
        inProgress,
        total,
      };
    }),
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!prisma) return NextResponse.json({ error: "Database not available" }, { status: 503 });

  const membership = await prisma.orgMember.findFirst({
    where: { userId: session.user.id },
  });
  if (!membership) return NextResponse.json({ error: "No organisation found" }, { status: 400 });

  const parsed = CreateProjectSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }
  const { standardCode, name, description, targetDate, startDate, leadUserId } = parsed.data;

  // Validate leadUserId is a member of this org
  if (leadUserId) {
    const leadMember = await prisma.orgMember.findFirst({
      where: { userId: leadUserId, orgId: membership.orgId },
    });
    if (!leadMember) {
      return NextResponse.json({ error: "Lead user is not a member of this organisation" }, { status: 400 });
    }
  }

  let standard = await prisma.isoStandard.findUnique({ where: { code: standardCode } });

  if (!standard) {
    const staticStd = ISO_STANDARDS.find((s) => s.code === standardCode);
    if (!staticStd) return NextResponse.json({ error: "Unknown standard code" }, { status: 400 });

    standard = await prisma.isoStandard.create({
      data: {
        code: staticStd.code,
        name: staticStd.name,
        version: staticStd.version,
        description: staticStd.description,
        clauses: {
          create: staticStd.clauses.map((clause) => ({
            clauseNumber: clause.number,
            title: clause.title,
            controls: {
              create: clause.controls.map((ctrl) => ({
                controlRef: ctrl.ref,
                title: ctrl.title,
                description: ctrl.description,
              })),
            },
          })),
        },
      },
    });
  }

  const fullStandard = await prisma.isoStandard.findUnique({
    where: { id: standard.id },
    include: { clauses: { include: { controls: true } } },
  });
  if (!fullStandard) return NextResponse.json({ error: "Standard not found" }, { status: 404 });

  const allControls = fullStandard.clauses.flatMap((c) => c.controls);

  const project = await prisma.complianceProject.create({
    data: {
      orgId: membership.orgId,
      standardId: fullStandard.id,
      name,
      description: description || null,
      startDate: startDate ? new Date(startDate) : new Date(),
      targetDate: targetDate ? new Date(targetDate) : null,
      leadUserId: leadUserId || null,
      controls: {
        create: allControls.map((ctrl) => ({
          controlId: ctrl.id,
          status: "NOT_STARTED",
        })),
      },
    },
    include: { standard: true },
  });

  await writeAuditLog({
    orgId: membership.orgId,
    userId: session.user.id,
    userName: session.user.name ?? session.user.email ?? "Unknown",
    action: "project.created",
    entityId: project.id,
    meta: { name, standardCode },
  });

  return NextResponse.json({
    project: {
      id: project.id,
      name: project.name,
      standardCode: project.standard.code,
      standardName: project.standard.name,
      score: 0,
      implemented: 0,
      total: allControls.length,
    },
  });
}
