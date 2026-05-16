import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";
import { getLimits, upgradeResponse } from "@/lib/plan-limits";

const RISK_LEVELS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
const STATUSES    = ["ACTIVE", "PENDING_REVIEW", "ARCHIVED"] as const;

const CreateVendorSchema = z.object({
  name:            z.string().min(1).max(255),
  service:         z.string().max(255).optional(),
  dataCategories:  z.array(z.string().max(50)).max(20).optional(),
  inherentRisk:    z.enum(RISK_LEVELS).default("MEDIUM"),
  certifications:  z.array(z.string().max(50)).max(20).optional(),
  certExpiry:      z.string().datetime().optional(),
  lastReviewDate:  z.string().datetime().optional(),
  dpaSignedOn:     z.string().datetime().optional(),
  ownerId:         z.string().cuid().optional(),
  contactEmail:    z.string().email().optional(),
  websiteUrl:      z.string().url().optional(),
  notes:           z.string().max(2000).optional(),
  status:          z.enum(STATUSES).default("ACTIVE"),
});

// Pro: up to 25 vendors. Enterprise: unlimited. Starter: feature locked.
function vendorCap(plan: "STARTER" | "PROFESSIONAL" | "ENTERPRISE") {
  if (plan === "STARTER")      return 0;
  if (plan === "PROFESSIONAL") return 25;
  return Number.POSITIVE_INFINITY;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ vendors: [] });
  if (!prisma) return NextResponse.json({ vendors: [] });

  const membership = await prisma.orgMember.findFirst({ where: { userId: session.user.id } });
  if (!membership) return NextResponse.json({ vendors: [] });

  const { plan } = await getLimits(membership.orgId);
  if (plan === "STARTER") {
    return NextResponse.json(upgradeResponse("Vendor / TPRM module", 0, 0, plan), { status: 402 });
  }

  const vendors = await prisma.vendor.findMany({
    where: { orgId: membership.orgId },
    orderBy: [{ status: "asc" }, { name: "asc" }],
  });

  return NextResponse.json({
    vendors: vendors.map((v) => ({
      ...v,
      createdAt: v.createdAt.toISOString(),
      updatedAt: v.updatedAt.toISOString(),
      certExpiry: v.certExpiry?.toISOString() ?? null,
      lastReviewDate: v.lastReviewDate?.toISOString() ?? null,
      dpaSignedOn: v.dpaSignedOn?.toISOString() ?? null,
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
  const cap = vendorCap(plan);
  if (cap === 0) {
    return NextResponse.json(upgradeResponse("Vendor / TPRM module", 0, 0, plan), { status: 402 });
  }
  const used = await prisma.vendor.count({ where: { orgId: membership.orgId } });
  if (used >= cap) {
    return NextResponse.json(upgradeResponse("Vendor records", used, cap, plan), { status: 402 });
  }

  const parsed = CreateVendorSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }
  const d = parsed.data;

  let ownerName: string | null = null;
  if (d.ownerId) {
    const owner = await prisma.user.findUnique({ where: { id: d.ownerId }, select: { name: true, email: true } });
    ownerName = owner?.name ?? owner?.email ?? null;
  }

  const vendor = await prisma.vendor.create({
    data: {
      orgId: membership.orgId,
      name: d.name,
      service: d.service,
      dataCategories: d.dataCategories ?? [],
      inherentRisk: d.inherentRisk,
      certifications: d.certifications ?? [],
      certExpiry: d.certExpiry ? new Date(d.certExpiry) : null,
      lastReviewDate: d.lastReviewDate ? new Date(d.lastReviewDate) : null,
      dpaSignedOn: d.dpaSignedOn ? new Date(d.dpaSignedOn) : null,
      ownerId: d.ownerId ?? null,
      ownerName,
      contactEmail: d.contactEmail,
      websiteUrl: d.websiteUrl,
      notes: d.notes,
      status: d.status,
    },
  });

  await writeAuditLog({
    orgId: membership.orgId,
    userId: session.user.id,
    userName: session.user.name ?? session.user.email ?? "Unknown",
    action: "vendor.created",
    entityId: vendor.id,
    meta: { name: vendor.name, inherentRisk: vendor.inherentRisk },
  });

  return NextResponse.json({ vendor: { ...vendor, createdAt: vendor.createdAt.toISOString(), updatedAt: vendor.updatedAt.toISOString() } });
}
