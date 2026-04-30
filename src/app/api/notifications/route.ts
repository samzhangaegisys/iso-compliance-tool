import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ notifications: [] });
  if (!prisma) return NextResponse.json({ notifications: [] });

  const membership = await prisma.orgMember.findFirst({
    where: { userId: session.user.id },
  });
  if (!membership) return NextResponse.json({ notifications: [] });

  const now = new Date();
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const notifications: {
    id: string;
    type: "warning" | "info" | "success";
    title: string;
    body: string;
    time: string;
  }[] = [];

  // Overdue tasks assigned to current user
  const overdueTasks = await prisma.controlTask.findMany({
    where: {
      assigneeId: session.user.id,
      status: { not: "DONE" },
      dueDate: { lt: now },
      projectControl: { project: { orgId: membership.orgId } },
    },
    include: { projectControl: { include: { control: true, project: true } } },
    orderBy: { dueDate: "asc" },
    take: 5,
  });

  for (const task of overdueTasks) {
    const daysOverdue = Math.floor((now.getTime() - task.dueDate!.getTime()) / (1000 * 60 * 60 * 24));
    notifications.push({
      id: `overdue-${task.id}`,
      type: "warning",
      title: `Overdue task — ${task.projectControl.project.name}`,
      body: `"${task.title}" was due ${daysOverdue === 1 ? "yesterday" : `${daysOverdue} days ago`}.`,
      time: task.dueDate!.toLocaleDateString("en-AU", { day: "numeric", month: "short" }),
    });
  }

  // Tasks due within 7 days assigned to current user
  const upcomingTasks = await prisma.controlTask.findMany({
    where: {
      assigneeId: session.user.id,
      status: { not: "DONE" },
      dueDate: { gte: now, lte: in7Days },
      projectControl: { project: { orgId: membership.orgId } },
    },
    include: { projectControl: { include: { project: true } } },
    orderBy: { dueDate: "asc" },
    take: 5,
  });

  for (const task of upcomingTasks) {
    const daysLeft = Math.ceil((task.dueDate!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    notifications.push({
      id: `upcoming-${task.id}`,
      type: "info",
      title: `Task due ${daysLeft === 0 ? "today" : daysLeft === 1 ? "tomorrow" : `in ${daysLeft} days`}`,
      body: `"${task.title}" — ${task.projectControl.project.name}`,
      time: task.dueDate!.toLocaleDateString("en-AU", { day: "numeric", month: "short" }),
    });
  }

  // Non-compliant controls in org's active projects
  const nonCompliant = await prisma.projectControl.findMany({
    where: {
      status: "NON_COMPLIANT",
      project: { orgId: membership.orgId },
    },
    include: { control: true, project: true },
    take: 3,
  });

  if (nonCompliant.length > 0) {
    const refs = nonCompliant.map((pc) => pc.control.controlRef).join(", ");
    notifications.push({
      id: `non-compliant-${membership.orgId}`,
      type: "warning",
      title: `${nonCompliant.length} non-compliant control${nonCompliant.length > 1 ? "s" : ""}`,
      body: `Controls marked non-compliant: ${refs}`,
      time: "Now",
    });
  }

  return NextResponse.json({ notifications });
}
