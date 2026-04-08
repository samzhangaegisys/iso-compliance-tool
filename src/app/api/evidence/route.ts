import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
      controlRef: e.projectControl.control.controlRef,
      controlTitle: e.projectControl.control.title,
      standard: e.projectControl.control.clause.standard.code,
      projectName: e.projectControl.project.name,
    })),
  });
}
