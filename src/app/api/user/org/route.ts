import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ org: null });
  if (!prisma) return NextResponse.json({ org: null });

  const membership = await prisma.orgMember.findFirst({
    where: { userId: session.user.id },
    include: {
      organisation: {
        include: { subscriptions: { take: 1, orderBy: { createdAt: "desc" } } },
      },
    },
  });

  if (!membership) return NextResponse.json({ org: null });

  const org = membership.organisation;
  const sub = org.subscriptions[0];
  const rawPlan = sub?.plan ?? "FREE";
  const plan =
    rawPlan === "ENTERPRISE"
      ? "enterprise"
      : rawPlan === "PROFESSIONAL"
        ? "professional"
        : "starter";

  const isNew =
    Date.now() - new Date(org.createdAt).getTime() < 30 * 24 * 60 * 60 * 1000;

  return NextResponse.json({
    org: {
      id: org.id,
      name: org.name,
      slug: org.slug,
      createdAt: org.createdAt.toISOString(),
      plan,
      isNew,
      role: membership.role,
      logoUrl: org.logoUrl ?? null,
      brandingPrimaryColor: org.brandingPrimaryColor ?? null,
      brandingDisplayName: org.brandingDisplayName ?? null,
      expiryThresholds: org.expiryThresholds ?? [30],
    },
  });
}
