import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";
import { getLimits, upgradeResponse, PLAN_LIMITS } from "@/lib/plan-limits";

const BrandingSchema = z.object({
  logoUrl:              z.string().url().max(2048).nullable().optional(),
  brandingPrimaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a hex colour like #2563eb").nullable().optional(),
  brandingDisplayName:  z.string().max(100).nullable().optional(),
  // Pro+ only: how many days-before warnings to fire on expiring evidence.
  expiryThresholds:     z.array(z.number().int().min(1).max(365)).max(10).optional(),
});

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!prisma) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const membership = await prisma.orgMember.findFirst({
    where: { userId: session.user.id, role: { in: ["OWNER", "ADMIN"] } },
  });
  if (!membership) return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });

  const { plan, limits } = await getLimits(membership.orgId);
  if (!limits.brandedReports) {
    return NextResponse.json(
      upgradeResponse("Branded reports & custom branding", 0, 0, plan),
      { status: 402 },
    );
  }

  const parsed = BrandingSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }
  const { logoUrl, brandingPrimaryColor, brandingDisplayName, expiryThresholds } = parsed.data;

  // Enforce the per-plan cap on number of expiry thresholds.
  if (expiryThresholds && expiryThresholds.length > limits.expiryThresholdsMax) {
    const cap = PLAN_LIMITS[plan].expiryThresholdsMax;
    return NextResponse.json(
      { error: `Your plan allows at most ${cap} expiry threshold${cap === 1 ? "" : "s"}.`, upgradeRequired: false },
      { status: 400 },
    );
  }

  const org = await prisma.organisation.update({
    where: { id: membership.orgId },
    data: {
      ...(logoUrl !== undefined && { logoUrl }),
      ...(brandingPrimaryColor !== undefined && { brandingPrimaryColor }),
      ...(brandingDisplayName !== undefined && { brandingDisplayName }),
      ...(expiryThresholds !== undefined && { expiryThresholds }),
    },
  });

  await writeAuditLog({
    orgId: membership.orgId,
    userId: session.user.id,
    userName: session.user.name ?? session.user.email ?? "Unknown",
    action: "org.branding_updated",
    entityId: org.id,
    meta: { logoUrl, brandingPrimaryColor, brandingDisplayName, expiryThresholds },
  });

  return NextResponse.json({
    org: {
      id: org.id,
      logoUrl: org.logoUrl,
      brandingPrimaryColor: org.brandingPrimaryColor,
      brandingDisplayName: org.brandingDisplayName,
      expiryThresholds: org.expiryThresholds,
    },
  });
}
