import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ history: [] });
  if (!prisma) return NextResponse.json({ history: [] });

  const { id } = await params;

  const membership = await prisma.orgMember.findFirst({
    where: { userId: session.user.id },
  });
  if (!membership) return NextResponse.json({ history: [] });

  // Verify the evidence belongs to this org
  const evidence = await prisma.evidence.findFirst({
    where: {
      id,
      projectControl: { project: { orgId: membership.orgId } },
    },
  });
  if (!evidence) return NextResponse.json({ history: [] });

  const logs = await prisma.auditLog.findMany({
    where: { entityId: id, orgId: membership.orgId },
    orderBy: { createdAt: "asc" },
  });

  const history = logs.map((log, i) => ({
    version: `v${i + 1}.0`,
    date: log.createdAt.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }),
    by: log.userName,
    note: actionLabel(log.action, log.meta as Record<string, string> | null),
  }));

  // If no audit logs yet, fall back to the evidence creation record
  if (history.length === 0) {
    history.push({
      version: "v1.0",
      date: evidence.createdAt.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }),
      by: evidence.uploadedBy,
      note: "Initial upload",
    });
  }

  return NextResponse.json({ history });
}

function actionLabel(action: string, meta: Record<string, string> | null): string {
  switch (action) {
    case "evidence.uploaded": return "Initial upload";
    case "evidence.updated":  return meta?.note ?? "Updated";
    case "evidence.replaced": return "File replaced";
    default: return action.replace(/^evidence\./, "").replace(/_/g, " ");
  }
}
