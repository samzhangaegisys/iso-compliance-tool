import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ project: null }, { status: 401 });
  if (!prisma) return NextResponse.json({ project: null }, { status: 503 });

  const { id } = await params;

  const membership = await prisma.orgMember.findFirst({
    where: { userId: session.user.id },
  });
  if (!membership) return NextResponse.json({ project: null }, { status: 403 });

  const project = await prisma.complianceProject.findFirst({
    where: { id, orgId: membership.orgId },
    include: {
      standard: {
        include: {
          clauses: {
            orderBy: { clauseNumber: "asc" },
            include: { controls: { orderBy: { controlRef: "asc" } } },
          },
        },
      },
      controls: {
        include: {
          control: true,
          tasks: { select: { id: true, status: true } },
          evidence: { select: { id: true } },
        },
      },
    },
  });

  if (!project) return NextResponse.json({ project: null }, { status: 404 });

  const pcMap = new Map(project.controls.map((pc) => [pc.controlId, pc]));

  const clauses = project.standard.clauses.map((clause) => ({
    number: clause.clauseNumber,
    title: clause.title,
    controls: clause.controls.map((ctrl) => {
      const pc = pcMap.get(ctrl.id);
      return {
        id: ctrl.id,
        projectControlId: pc?.id ?? null,
        ref: ctrl.controlRef,
        title: ctrl.title,
        description: ctrl.description ?? "",
        status: (pc?.status ?? "NOT_STARTED") as string,
        notes: pc?.notes ?? "",
        evidenceCount: pc?.evidence.length ?? 0,
        taskCount: pc?.tasks.length ?? 0,
      };
    }),
  }));

  const total       = project.controls.length;
  const implemented = project.controls.filter((c) => c.status === "IMPLEMENTED").length;
  const inProgress  = project.controls.filter((c) => c.status === "IN_PROGRESS").length;
  const notStarted  = project.controls.filter((c) => c.status === "NOT_STARTED").length;
  const nonCompliant= project.controls.filter((c) => c.status === "NON_COMPLIANT").length;
  const score       = total > 0 ? Math.round((implemented / total) * 100) : 0;

  return NextResponse.json({
    project: {
      id: project.id,
      name: project.name,
      description: project.description ?? "",
      standardCode: project.standard.code,
      standardName: project.standard.name,
      status: project.status,
      score,
      implemented,
      inProgress,
      notStarted,
      nonCompliant,
      total,
      targetDate: project.targetDate?.toISOString() ?? null,
      startDate: project.startDate?.toISOString() ?? null,
      clauses,
    },
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!prisma) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const { id } = await params;

  const membership = await prisma.orgMember.findFirst({
    where: { userId: session.user.id },
  });
  if (!membership) return NextResponse.json({ error: "No org" }, { status: 403 });

  const { controlId, status, notes } = await req.json();
  if (!controlId || !status) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const pc = await prisma.projectControl.update({
    where: { projectId_controlId: { projectId: id, controlId } },
    data: { status, ...(notes !== undefined ? { notes } : {}) },
  });

  return NextResponse.json({ projectControl: { id: pc.id, status: pc.status } });
}
