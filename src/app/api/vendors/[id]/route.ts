import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";
import { getLimits, upgradeResponse } from "@/lib/plan-limits";

const RISK_LEVELS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
const STATUSES    = ["ACTIVE", "PENDING_REVIEW", "ARCHIVED"] as const;

const UpdateVendorSchema = z.object({
  name:            z.string().min(1).max(255).optional(),
  service:         z.string().max(255).nullable().optional(),
  dataCategories:  z.array(z.string().max(50)).max(20).optional(),
  inherentRisk:    z.enum(RISK_LEVELS).optional(),
  certifications:  z.array(z.string().max(50)).max(20).optional(),
  certExpiry:      z.string().datetime().nullable().optional(),
  lastReviewDate:  z.string().datetime().nullable().optional(),
  dpaSignedOn:     z.string().datetime().nullable().optional(),
  ownerId:         z.string().cuid().nullable().optional(),
  contactEmail:    z.string().email().nullable().optional(),
  websiteUrl:      z.string().url().nullable().optional(),
  notes:           z.string().max(2000).nullable().optional(),
  status:          z.enum(STATUSES).optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!prisma) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const { id } = await params;
  const membership = await prisma.orgMember.findFirst({ where: { userId: session.user.id } });
  if (!membership) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { plan } = await getLimits(membership.orgId);
  if (plan === "STARTER") {
    return NextResponse.json(upgradeResponse("Vendor / TPRM module", 0, 0, plan), { status: 402 });
  }

  const vendor = await prisma.vendor.findFirst({ where: { id, orgId: membership.orgId } });
  if (!vendor) return NextResponse.json({ error: "Vendor not found" }, { status: 404 });

  const parsed = UpdateVendorSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }
  const d = parsed.data;

  let ownerName: string | null | undefined = undefined;
  if (d.ownerId !== undefined) {
    if (d.ownerId === null) ownerName = null;
    else {
      const owner = await prisma.user.findUnique({ where: { id: d.ownerId }, select: { name: true, email: true } });
      ownerName = owner?.name ?? owner?.email ?? null;
    }
  }

  const updated = await prisma.vendor.update({
    where: { id },
    data: {
      ...(d.name !== undefined && { name: d.name }),
      ...(d.service !== undefined && { service: d.service }),
      ...(d.dataCategories !== undefined && { dataCategories: d.dataCategories }),
      ...(d.inherentRisk !== undefined && { inherentRisk: d.inherentRisk }),
      ...(d.certifications !== undefined && { certifications: d.certifications }),
      ...(d.certExpiry !== undefined && { certExpiry: d.certExpiry ? new Date(d.certExpiry) : null }),
      ...(d.lastReviewDate !== undefined && { lastReviewDate: d.lastReviewDate ? new Date(d.lastReviewDate) : null }),
      ...(d.dpaSignedOn !== undefined && { dpaSignedOn: d.dpaSignedOn ? new Date(d.dpaSignedOn) : null }),
      ...(d.ownerId !== undefined && { ownerId: d.ownerId }),
      ...(ownerName !== undefined && { ownerName }),
      ...(d.contactEmail !== undefined && { contactEmail: d.contactEmail }),
      ...(d.websiteUrl !== undefined && { websiteUrl: d.websiteUrl }),
      ...(d.notes !== undefined && { notes: d.notes }),
      ...(d.status !== undefined && { status: d.status }),
    },
  });

  await writeAuditLog({
    orgId: membership.orgId,
    userId: session.user.id,
    userName: session.user.name ?? session.user.email ?? "Unknown",
    action: "vendor.updated",
    entityId: updated.id,
    meta: { changed: Object.keys(d) },
  });

  return NextResponse.json({ vendor: { ...updated, createdAt: updated.createdAt.toISOString(), updatedAt: updated.updatedAt.toISOString() } });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!prisma) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const { id } = await params;
  const membership = await prisma.orgMember.findFirst({ where: { userId: session.user.id } });
  if (!membership) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const vendor = await prisma.vendor.findFirst({ where: { id, orgId: membership.orgId } });
  if (!vendor) return NextResponse.json({ error: "Vendor not found" }, { status: 404 });

  await prisma.vendor.delete({ where: { id } });
  await writeAuditLog({
    orgId: membership.orgId,
    userId: session.user.id,
    userName: session.user.name ?? session.user.email ?? "Unknown",
    action: "vendor.deleted",
    entityId: id,
    meta: { name: vendor.name },
  });
  return NextResponse.json({ success: true });
}
