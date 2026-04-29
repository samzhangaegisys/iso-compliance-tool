import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";

const GapSchema = z.object({
  ref:      z.string().min(1).max(50),
  title:    z.string().min(1).max(255),
  risk:     z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]),
  guidance: z.string().max(2000).optional(),
});

const CreateTasksSchema = z.object({
  projectId: z.string().cuid(),
  gaps:      z.array(GapSchema).min(1).max(200),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!prisma) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const membership = await prisma.orgMember.findFirst({
    where: { userId: session.user.id },
  });
  if (!membership) return NextResponse.json({ error: "No org" }, { status: 400 });

  const parsed = CreateTasksSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }
  const { projectId, gaps } = parsed.data;

  const project = await prisma.complianceProject.findFirst({
    where: { id: projectId, orgId: membership.orgId },
    include: {
      standard: true,
      controls: {
        include: {
          control: true,
          tasks: { select: { id: true } },
        },
      },
    },
  });

  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const pcByRef = new Map(project.controls.map((pc) => [pc.control.controlRef, pc]));

  let created = 0;
  let skipped = 0;

  for (const gap of gaps) {
    const pc = pcByRef.get(gap.ref);
    if (!pc) { skipped++; continue; }

    if (pc.tasks.length > 0) { skipped++; continue; }

    const description = [
      `Gap identified in ${project.standard.code} gap analysis. Risk level: ${gap.risk}.`,
      gap.guidance ? `\nHow to implement:\n${gap.guidance}` : "",
    ].join("").trim();

    await prisma.controlTask.create({
      data: {
        projectControlId: pc.id,
        title: `Implement ${gap.ref}: ${gap.title}`,
        description,
        priority: gap.risk,
        status: "TODO",
      },
    });
    created++;
  }

  await writeAuditLog({
    orgId: membership.orgId,
    userId: session.user.id,
    userName: session.user.name ?? session.user.email ?? "Unknown",
    action: "gap_analysis.tasks_created",
    entityId: projectId,
    meta: { created, skipped, projectName: project.name },
  });

  return NextResponse.json({ created, skipped, projectName: project.name });
}
