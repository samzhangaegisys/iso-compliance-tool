import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";

const CreateEvidenceSchema = z.object({
  projectId:      z.string().cuid(),
  controlRef:     z.string().min(1).max(50),
  name:           z.string().min(1).max(255),
  description:    z.string().max(1000).optional(),
  fileType:       z.string().max(100).optional(),
  fileSize:       z.number().int().positive().max(100 * 1024 * 1024).optional(), // 100 MB max
  classification: z.enum(["PUBLIC", "INTERNAL", "CONFIDENTIAL", "RESTRICTED"]).optional().default("INTERNAL"),
  expiresAt:      z.string().datetime().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ evidence: [] });
  if (!prisma) return NextResponse.json({ evidence: [] });

  const membership = await prisma.orgMember.findFirst({
    where: { userId: session.user.id },
  });
  if (!membership) return NextResponse.json({ evidence: [] });

  const evidence = await prisma.evidence.findMany({
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
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    evidence: evidence.map((e) => ({
      id: e.id,
      name: e.name,
      description: e.description ?? "",
      fileUrl: e.fileUrl,
      fileType: e.fileType,
      fileSize: e.fileSize,
      uploadedBy: e.uploadedBy,
      classification: e.classification,
      createdAt: e.createdAt.toISOString(),
      expiresAt: e.expiresAt?.toISOString() ?? null,
      controlRef: e.projectControl.control.controlRef,
      controlTitle: e.projectControl.control.title,
      standard: e.projectControl.control.clause.standard.code,
      projectName: e.projectControl.project.name,
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

  const parsed = CreateEvidenceSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }
  const { projectId, controlRef, name, description, fileType, fileSize, classification, expiresAt } = parsed.data;

  const projectControl = await prisma.projectControl.findFirst({
    where: {
      control: { controlRef },
      project: { id: projectId, orgId: membership.orgId },
    },
  });

  if (!projectControl) {
    return NextResponse.json({ error: "Control not found in this project" }, { status: 404 });
  }

  const evidence = await prisma.evidence.create({
    data: {
      projectControlId: projectControl.id,
      name,
      description,
      fileType,
      fileSize,
      uploadedBy: session.user.name ?? session.user.email ?? "Unknown",
      classification,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    },
  });

  await writeAuditLog({
    orgId: membership.orgId,
    userId: session.user.id,
    userName: session.user.name ?? session.user.email ?? "Unknown",
    action: "evidence.uploaded",
    entityId: evidence.id,
    meta: { name, controlRef, classification },
  });

  return NextResponse.json({ evidence: { id: evidence.id, name: evidence.name } });
}
