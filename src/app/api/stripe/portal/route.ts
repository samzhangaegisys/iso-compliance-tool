import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Billing not configured." }, { status: 503 });
  }

  if (!prisma) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const membership = await prisma.orgMember.findFirst({
    where: { userId: session.user.id, role: { in: ["OWNER", "ADMIN"] } },
  });
  if (!membership) {
    return NextResponse.json({ error: "Not authorized to manage billing." }, { status: 403 });
  }

  const subscription = await prisma.subscription.findFirst({
    where: { orgId: membership.orgId, stripeCustomerId: { not: null } },
  });
  if (!subscription?.stripeCustomerId) {
    return NextResponse.json({ error: "No active subscription found." }, { status: 404 });
  }

  try {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${baseUrl}/settings?tab=billing`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to open billing portal.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
