import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";
import { getLimits, upgradeResponse } from "@/lib/plan-limits";

const CATEGORIES = ["OPERATIONAL", "SECURITY", "COMPLIANCE", "FINANCIAL", "REPUTATIONAL", "STRATEGIC", "TECHNOLOGY"] as const;
const TREATMENTS = ["AVOID", "MITIGATE", "TRANSFER", "ACCEPT"] as const;
const STATUSES   = ["OPEN", "IN_TREATMENT", "CLOSED", "ACCEPTED"] as const;

const CreateRiskSchema = z.object({
  title:          z.string().min(1).max(255),
  description:    z.string().max(2000).optional(),
  category:       z.enum(CATEGORIES).default("OPERATIONAL"),
  likelihood:     z.number().int().min(1).max(5),
  impact:         z.number().int().min(1).max(5),
  treatment:      z.enum(TREATMENTS).default("MITIGATE"),
  treatmentNotes: z.string().max(2000).optional(),
  ownerId:        z.string().cuid().optional(),
  reviewDate:     z.string().datetime().optional(),
  status:         z.enum(STATUSES).default("OPEN"),
  projectId:      z.string().cuid().optional(),
});

// Risk register is a Pro+ feature.
function risksGated(plan: string) {
  return plan === "STARTER";
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ risks: [] });
  if (!prisma) return NextResponse.json({ risks: [] });

  const membership = await prisma.orgMember.findFirst({ where: { userId: session.user.id } });
  if (!membership) return NextResponse.json({ risks: [] });

  const { plan } = await getLimits(membership.orgId);
  if (risksGated(plan)) {
    return NextResponse.json(upgradeResponse("Risk register", 0, 0, plan), { status: 402 });
  }

  const url = new URL(req.url);
  const status    = url.searchParams.get("status");
  const projectId = url.searchParams.get("projectId");

  const risks = await prisma.risk.findMany({
    where: {
      orgId: membership.orgId,
      ...(status ? { status: status as typeof STATUSES[number] } : {}),
      ...(projectId ? { projectId } : {}),
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({
    risks: risks.map((r) => ({
      ...r,
      score: r.likelihood * r.impact,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
      reviewDate: r.reviewDate?.toISOString() ?? null,
    })),
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!prisma) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const membership = await prisma.orgMember.findFirst({
    where: { userId: session.user.id, role: { in: ["OWNER", "ADMIN", "MEMBER"] } },
  });
  if (!membership) return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });

  const { plan } = await getLimits(membership.orgId);
  if (risksGated(plan)) {
    return NextResponse.json(upgradeResponse("Risk register", 0, 0, plan), { status: 402 });
  }

  const parsed = CreateRiskSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }
  const data = parsed.data;

  // Look up owner name for denormalised display
  let ownerName: string | null = null;
  if (data.ownerId) {
    const owner = await prisma.user.findUnique({ where: { id: data.ownerId }, select: { name: true, email: true } });
    ownerName = owner?.name ?? owner?.email ?? null;
  }

  const risk = await prisma.risk.create({
    data: {
      orgId: membership.orgId,
      projectId: data.projectId ?? null,
      title: data.title,
      description: data.description,
      category: data.category,
      likelihood: data.likelihood,
      impact: data.impact,
      treatment: data.treatment,
      treatmentNotes: data.treatmentNotes,
      ownerId: data.ownerId ?? null,
      ownerName,
      reviewDate: data.reviewDate ? new Date(data.reviewDate) : null,
      status: data.status,
    },
  });

  await writeAuditLog({
    orgId: membership.orgId,
    userId: session.user.id,
    userName: session.user.name ?? session.user.email ?? "Unknown",
    action: "risk.created",
    entityId: risk.id,
    meta: { title: risk.title, likelihood: risk.likelihood, impact: risk.impact, treatment: risk.treatment },
  });

  return NextResponse.json({
    risk: {
      ...risk,
      score: risk.likelihood * risk.impact,
      createdAt: risk.createdAt.toISOString(),
      updatedAt: risk.updatedAt.toISOString(),
      reviewDate: risk.reviewDate?.toISOString() ?? null,
    },
  });
}
