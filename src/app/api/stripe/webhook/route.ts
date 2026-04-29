import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Stripe v22 wraps responses in Response<T> — helper to extract the underlying object
function unwrapSub(sub: Stripe.Response<Stripe.Subscription> | Stripe.Subscription): Stripe.Subscription {
  return sub as Stripe.Subscription;
}

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (!prisma) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const { userId, plan } = session.metadata ?? {};
      if (!userId || !plan) break;

      const membership = await prisma.orgMember.findFirst({
        where: { userId, role: { in: ["OWNER", "ADMIN"] } },
      });
      if (!membership) break;

      const subId = typeof session.subscription === "string"
        ? session.subscription
        : (session.subscription as Stripe.Subscription | null)?.id ?? null;

      const sub = subId ? unwrapSub(await stripe.subscriptions.retrieve(subId)) : null;

      const planValue = (["STARTER", "PROFESSIONAL", "ENTERPRISE"].includes(plan.toUpperCase())
        ? plan.toUpperCase()
        : "STARTER") as "STARTER" | "PROFESSIONAL" | "ENTERPRISE";

      const customerId = typeof session.customer === "string" ? session.customer : null;

      await prisma.subscription.upsert({
        where: { stripeSubscriptionId: sub?.id ?? "" },
        create: {
          orgId: membership.orgId,
          plan: planValue,
          status: "ACTIVE",
          stripeSubscriptionId: sub?.id ?? null,
          stripeCustomerId: customerId,
          stripePriceId: sub?.items.data[0]?.price.id ?? null,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          currentPeriodEnd: sub ? new Date((sub as any).current_period_end * 1000) : null,
        },
        update: {
          plan: planValue,
          status: "ACTIVE",
          stripeCustomerId: customerId,
          stripePriceId: sub?.items.data[0]?.price.id ?? null,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          currentPeriodEnd: sub ? new Date((sub as any).current_period_end * 1000) : null,
        },
      });
      break;
    }

    case "customer.subscription.updated": {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sub = event.data.object as any;
      const status: "ACTIVE" | "PAST_DUE" | "CANCELED" | "TRIALING" =
        sub.status === "active"   ? "ACTIVE" :
        sub.status === "past_due" ? "PAST_DUE" :
        sub.status === "canceled" ? "CANCELED" :
        sub.status === "trialing" ? "TRIALING" : "ACTIVE";

      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: sub.id },
        data: {
          status,
          currentPeriodEnd: new Date(sub.current_period_end * 1000),
        },
      });
      break;
    }

    case "customer.subscription.deleted": {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sub = event.data.object as any;
      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: sub.id },
        data: { status: "CANCELED" },
      });
      break;
    }

    case "invoice.payment_failed": {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const invoice = event.data.object as any;
      const subId: string | null = invoice.subscription ?? null;
      if (subId) {
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subId },
          data: { status: "PAST_DUE" },
        });
      }
      break;
    }

    case "invoice.payment_succeeded": {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const invoice = event.data.object as any;
      const subId: string | null = invoice.subscription ?? null;
      if (subId) {
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subId },
          data: { status: "ACTIVE" },
        });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
