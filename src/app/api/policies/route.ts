import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";
import { getLimits, upgradeResponse } from "@/lib/plan-limits";

const CATEGORIES = [
  "INFOSEC", "ACCEPTABLE_USE", "DATA_RETENTION", "INCIDENT_RESPONSE",
  "ACCESS_CONTROL", "BUSINESS_CONTINUITY", "CHANGE_MANAGEMENT",
  "THIRD_PARTY", "PRIVACY", "OTHER",
] as const;
const STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;

const CreatePolicySchema = z.object({
  title:          z.string().min(1).max(255),
  description:    z.string().max(2000).optional(),
  category:       z.enum(CATEGORIES).default("INFOSEC"),
  content:        z.string().min(1).max(200_000), // markdown body for v1
  ownerId:        z.string().cuid().optional(),
  nextReviewDate: z.string().datetime().optional(),
  status:         z.enum(STATUSES).default("DRAFT"),
});

// Policy library: Pro+ only.
function policyCap(plan: "STARTER" | "PROFESSIONAL" | "ENTERPRISE") {
  if (plan === "STARTER")      return 0;
  if (plan === "PROFESSIONAL") return 50;
  return Number.POSITIVE_INFINITY;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ policies: [] });
  if (!prisma) return NextResponse.json({ policies: [] });

  const membership = await prisma.orgMember.findFirst({ where: { userId: session.user.id } });
  if (!membership) return NextResponse.json({ policies: [] });

  const { plan } = await getLimits(membership.orgId);
  if (plan === "STARTER") {
    return NextResponse.json(upgradeResponse("Policy library", 0, 0, plan), { status: 402 });
  }

  const policies = await prisma.policy.findMany({
    where: { orgId: membership.orgId },
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
  });

  return NextResponse.json({
    policies: policies.map((p) => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      nextReviewDate: p.nextReviewDate?.toISOString() ?? null,
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
  const cap = policyCap(plan);
  if (cap === 0) {
    return NextResponse.json(upgradeResponse("Policy library", 0, 0, plan), { status: 402 });
  }
  const used = await prisma.policy.count({ where: { orgId: membership.orgId } });
  if (used >= cap) {
    return NextResponse.json(upgradeResponse("Policies", used, cap, plan), { status: 402 });
  }

  const parsed = CreatePolicySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }
  const d = parsed.data;

  let ownerName: string | null = null;
  if (d.ownerId) {
    const owner = await prisma.user.findUnique({ where: { id: d.ownerId }, select: { name: true, email: true } });
    ownerName = owner?.name ?? owner?.email ?? null;
  }

  // Create policy + initial version atomically.
  const policy = await prisma.policy.create({
    data: {
      orgId: membership.orgId,
      title: d.title,
      description: d.description,
      category: d.category,
      currentVersion: 1,
      status: d.status,
      ownerId: d.ownerId ?? null,
      ownerName,
      nextReviewDate: d.nextReviewDate ? new Date(d.nextReviewDate) : null,
      versions: {
        create: {
          version: 1,
          content: d.content,
          createdBy: session.user.name ?? session.user.email ?? "Unknown",
        },
      },
    },
  });

  await writeAuditLog({
    orgId: membership.orgId,
    userId: session.user.id,
    userName: session.user.name ?? session.user.email ?? "Unknown",
    action: "policy.created",
    entityId: policy.id,
    meta: { title: policy.title, category: policy.category, status: policy.status },
  });

  return NextResponse.json({ policy: { ...policy, createdAt: policy.createdAt.toISOString(), updatedAt: policy.updatedAt.toISOString() } });
}
