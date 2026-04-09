import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

  // Verify the task belongs to this org
  const task = await prisma.controlTask.findFirst({
    where: {
      id,
      projectControl: { project: { orgId: membership.orgId } },
    },
  });
  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  const { status, priority, assigneeId, dueDate, title, description } = await req.json();

  const updated = await prisma.controlTask.update({
    where: { id },
    data: {
      ...(status      !== undefined ? { status }      : {}),
      ...(priority    !== undefined ? { priority }    : {}),
      ...(assigneeId  !== undefined ? { assigneeId }  : {}),
      ...(dueDate     !== undefined ? { dueDate: dueDate ? new Date(dueDate) : null } : {}),
      ...(title       !== undefined ? { title }       : {}),
      ...(description !== undefined ? { description } : {}),
    },
  });

  return NextResponse.json({ task: { id: updated.id, status: updated.status } });
}
