import { NextResponse } from "next/server";

// Stripe price IDs — configure these in your .env file
// STRIPE_PRICE_PROFESSIONAL=price_xxx
// STRIPE_PRICE_ENTERPRISE=price_xxx
const PRICE_IDS: Record<string, string | undefined> = {
  professional: process.env.STRIPE_PRICE_PROFESSIONAL,
  enterprise: process.env.STRIPE_PRICE_ENTERPRISE,
};

export async function POST(req: Request) {
  const { plan, email, userId, regToken, successUrl, cancelUrl } = await req.json();

  if (!process.env.STRIPE_SECRET_KEY) {
    // Stripe not configured — allow proceeding without payment in dev
    if (process.env.NODE_ENV !== "production") {
      return NextResponse.json({ devMode: true });
    }
    return NextResponse.json({ error: "Payment not configured. Please contact support." }, { status: 503 });
  }

  const priceId = PRICE_IDS[plan?.toLowerCase()];
  if (!priceId) {
    return NextResponse.json({ error: "Invalid plan selected." }, { status: 400 });
  }

  try {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl ?? `${process.env.NEXTAUTH_URL}/register?step=verify&userId=${userId}&regToken=${regToken}&paid=1`,
      cancel_url: cancelUrl ?? `${process.env.NEXTAUTH_URL}/register?step=pay`,
      metadata: { userId, regToken, plan },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Payment setup failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
