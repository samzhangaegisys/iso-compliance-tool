import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const PRICE_IDS: Record<string, string | undefined> = {
  professional: process.env.STRIPE_PRICE_PROFESSIONAL,
  enterprise:   process.env.STRIPE_PRICE_ENTERPRISE,
};

const CheckoutSchema = z.object({
  plan:       z.enum(["professional", "enterprise"]),
  // Only used by the unauthenticated registration flow; ignored for session-authed requests
  email:      z.string().email().max(254).optional(),
  userId:     z.string().cuid().optional(),
  regToken:   z.string().min(1).optional(),
  successUrl: z.string().url().optional(),
  cancelUrl:  z.string().url().optional(),
});

function isAllowedUrl(url: string | undefined): boolean {
  if (!url) return true;
  const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  return url.startsWith(base);
}

export async function POST(req: Request) {
  const session = await auth();

  const parsed = CheckoutSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }
  const { plan, email: bodyEmail, userId: bodyUserId, regToken, successUrl, cancelUrl } = parsed.data;

  if (!isAllowedUrl(successUrl) || !isAllowedUrl(cancelUrl)) {
    return NextResponse.json({ error: "Invalid redirect URL." }, { status: 400 });
  }

  let resolvedEmail: string;
  let resolvedUserId: string;

  if (session?.user?.id) {
    // Authenticated (settings page upgrade) — trust session, ignore body identity fields
    resolvedEmail  = session.user.email!;
    resolvedUserId = session.user.id;
  } else {
    // Unauthenticated registration flow — regToken is the pre-auth proof
    if (!regToken || !bodyEmail || !bodyUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!prisma) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });
    const tokenRecord = await prisma.verificationToken.findUnique({
      where: { identifier_token: { identifier: `reg:${bodyUserId}`, token: regToken } },
    });
    if (!tokenRecord || tokenRecord.expires < new Date()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    resolvedEmail  = bodyEmail;
    resolvedUserId = bodyUserId;
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    if (process.env.NODE_ENV !== "production") {
      return NextResponse.json({ devMode: true });
    }
    return NextResponse.json({ error: "Payment not configured. Please contact support." }, { status: 503 });
  }

  const priceId = PRICE_IDS[plan];
  if (!priceId) {
    return NextResponse.json({ error: "Plan price not configured." }, { status: 503 });
  }

  try {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const stripeSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: resolvedEmail,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl ?? `${process.env.NEXTAUTH_URL}/register?step=verify&userId=${resolvedUserId}&regToken=${regToken ?? ""}&paid=1`,
      cancel_url:  cancelUrl  ?? `${process.env.NEXTAUTH_URL}/register?step=pay`,
      metadata: { userId: resolvedUserId, regToken: regToken ?? "", plan },
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Payment setup failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
