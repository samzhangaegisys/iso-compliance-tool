import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";

const PatchTaskSchema = z.object({
  status:      z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  priority:    z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  assigneeId:  z.string().cuid().nullable().optional(),
  dueDate:     z.string().datetime().nullable().optional(),
  title:       z.string().min(1).max(255).optional(),
  description: z.string().max(5000).nullable().optional(),
});

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

  const task = await prisma.controlTask.findFirst({
    where: {
      id,
      projectControl: { project: { orgId: membership.orgId } },
    },
  });
  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  const parsed = PatchTaskSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }
  const { status, priority, assigneeId, dueDate, title, description } = parsed.data;

  // Validate assignee is a member of this org (if being changed)
  if (assigneeId != null) {
    const assigneeMember = await prisma.orgMember.findFirst({
      where: { userId: assigneeId, orgId: membership.orgId },
    });
    if (!assigneeMember) {
      return NextResponse.json({ error: "Assignee is not a member of this organisation" }, { status: 400 });
    }
  }

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

  await writeAuditLog({
    orgId: membership.orgId,
    userId: session.user.id,
    userName: session.user.name ?? session.user.email ?? "Unknown",
    action: "task.updated",
    entityId: id,
    meta: { changes: parsed.data },
  });

  return NextResponse.json({ task: { id: updated.id, status: updated.status } });
}
