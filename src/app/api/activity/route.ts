import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ activity: [] });
  if (!prisma) return NextResponse.json({ activity: [] });

  const membership = await prisma.orgMember.findFirst({
    where: { userId: session.user.id },
  });
  if (!membership) return NextResponse.json({ activity: [] });

  const [evidenceItems, taskItems, commentItems] = await Promise.all([
    prisma.evidence.findMany({
      where: { projectControl: { project: { orgId: membership.orgId } } },
      include: {
        projectControl: {
          include: {
            control: { include: { clause: { include: { standard: true } } } },
            project: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    prisma.controlTask.findMany({
      where: { projectControl: { project: { orgId: membership.orgId } } },
      include: {
        projectControl: {
          include: {
            control: { include: { clause: { include: { standard: true } } } },
            project: true,
          },
        },
        assignee: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    prisma.controlComment.findMany({
      where: { projectControl: { project: { orgId: membership.orgId } } },
      include: {
        author: { select: { name: true, email: true } },
        projectControl: {
          include: {
            control: { include: { clause: { include: { standard: true } } } },
            project: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const events = [
    ...evidenceItems.map((e) => ({
      id: `ev-${e.id}`,
      type: "evidence" as const,
      title: `Evidence uploaded for "${e.projectControl.control.controlRef} — ${e.projectControl.control.title}"`,
      who: e.uploadedBy,
      when: e.createdAt.toISOString(),
      standard: e.projectControl.control.clause.standard.name,
      control: e.projectControl.control.controlRef,
      projectName: e.projectControl.project.name,
      fileName: e.name,
      fileType: e.fileType ?? null,
      fileSize: e.fileSize ?? null,
      body: null,
    })),
    ...taskItems.map((t) => ({
      id: `tk-${t.id}`,
      type: "task" as const,
      title: `Task created: ${t.title}`,
      who: t.assignee?.name ?? t.assignee?.email ?? "System",
      when: t.createdAt.toISOString(),
      standard: t.projectControl.control.clause.standard.name,
      control: t.projectControl.control.controlRef,
      projectName: t.projectControl.project.name,
      fileName: null,
      fileType: null,
      fileSize: null,
      body: t.description ?? null,
    })),
    ...commentItems.map((c) => ({
      id: `cm-${c.id}`,
      type: "comment" as const,
      title: `Comment on "${c.projectControl.control.controlRef} — ${c.projectControl.control.title}"`,
      who: c.author.name ?? c.author.email,
      when: c.createdAt.toISOString(),
      standard: c.projectControl.control.clause.standard.name,
      control: c.projectControl.control.controlRef,
      projectName: c.projectControl.project.name,
      fileName: null,
      fileType: null,
      fileSize: null,
      body: c.body,
    })),
  ]
    .sort((a, b) => new Date(b.when).getTime() - new Date(a.when).getTime())
    .slice(0, 50);

  return NextResponse.json({ activity: events });
}
