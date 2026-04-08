import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ tasks: [] });
  if (!prisma) return NextResponse.json({ tasks: [] });

  const membership = await prisma.orgMember.findFirst({
    where: { userId: session.user.id },
  });
  if (!membership) return NextResponse.json({ tasks: [] });

  // Tasks are scoped through: org → projects → project controls → tasks
  const tasks = await prisma.controlTask.findMany({
    where: {
      projectControl: {
        project: { orgId: membership.orgId },
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
