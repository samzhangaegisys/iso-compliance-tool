import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ tasks: [] });
  if (!prisma) return NextResponse.json({ tasks: [] });

  const membership = await prisma.orgMember.findFirst({
    where: { userId: session.user.id },
  });
  if (!membership) return NextResponse.json({ tasks: [] });

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");

  // Tasks are scoped through: org → projects → project controls → tasks
  const tasks = await prisma.controlTask.findMany({
    where: {
      projectControl: {
        project: { orgId: membership.orgId, ...(projectId ? { id: projectId } : {}) },
      },
    },
    include: {
      projectControl: {
        include: {
          control: { include: { clause: { include: { standard: true } } } },
          project: true,
        },
      },
      assignee: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    tasks: tasks.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description ?? "",
      status: t.status,
      priority: t.priority,
      dueDate: t.dueDate?.toISOString() ?? null,
      assigneeId: t.assigneeId,
      assigneeName: t.assignee?.name ?? t.assignee?.email ?? "Unassigned",
      controlRef: t.projectControl.control.controlRef,
      standard: t.projectControl.control.clause.standard.code,
      projectId: t.projectControl.projectId,
      projectName: t.projectControl.project.name,
      createdAt: t.createdAt.toISOString(),
    })),
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!prisma) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const membership = await prisma.orgMember.findFirst({
    where: { userId: session.user.id },
  });
  if (!membership) return NextResponse.json({ error: "No org" }, { status: 400 });

  const { projectControlId, title, description, assigneeId, dueDate, priority } = await req.json();
  if (!projectControlId || !title) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  // Verify the projectControl belongs to this org
  const pc = await prisma.projectControl.findFirst({
    where: { id: projectControlId, project: { orgId: membership.orgId } },
  });
  if (!pc) return NextResponse.json({ error: "Control not found" }, { status: 404 });

  const task = await prisma.controlTask.create({
    data: {
      projectControlId,
      title,
      description: description || null,
      assigneeId: assigneeId || null,
      dueDate: dueDate ? new Date(dueDate) : null,
      priority: priority || "MEDIUM",
      status: "TODO",
    },
    include: {
      assignee: { select: { name: true, email: true } },
      projectControl: {
        include: {
          control: { include: { clause: { include: { standard: true } } } },
          project: true,
        },
      },
    },
  });

  return NextResponse.json({
    task: {
      id: task.id,
      title: task.title,
      description: task.description ?? "",
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate?.toISOString() ?? null,
      assigneeId: task.assigneeId,
      assigneeName: task.assignee?.name ?? task.assignee?.email ?? "Unassigned",
      controlRef: task.projectControl.control.controlRef,
      standard: task.projectControl.control.clause.standard.code,
      projectId: task.projectControl.projectId,
      projectName: task.projectControl.project.name,
      createdAt: task.createdAt.toISOString(),
    },
  });
}
