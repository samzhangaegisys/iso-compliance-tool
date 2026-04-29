import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

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
      const { userId, plan, seats } = session.metadata ?? {};
      if (!userId || !plan) break;

      const sub = session.subscription
        ? await stripe.subscriptions.retrieve(session.subscription as string)
        : null;

      await prisma.subscription.upsert({
        where: { orgId: userId },
        create: {
          orgId: userId,
          plan: plan.toUpperCase() as "STARTER" | "PROFESSIONAL" | "ENTERPRISE",
          status: "ACTIVE",
          stripeSubscriptionId: sub?.id ?? null,
          stripeCustomerId: session.customer as string ?? null,
          currentPeriodEnd: sub ? new Date(sub.current_period_end * 1000) : null,
          seats: seats ? Number(seats) : 5,
          billingInterval: sub?.items.data[0]?.plan.interval === "year" ? "ANNUAL" : "MONTHLY",
        },
        update: {
          plan: plan.toUpperCase() as "STARTER" | "PROFESSIONAL" | "ENTERPRISE",
          status: "ACTIVE",
          stripeSubscriptionId: sub?.id ?? null,
          stripeCustomerId: session.customer as string ?? null,
          currentPeriodEnd: sub ? new Date(sub.current_period_end * 1000) : null,
          seats: seats ? Number(seats) : 5,
          billingInterval: sub?.items.data[0]?.plan.interval === "year" ? "ANNUAL" : "MONTHLY",
        },
      });
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: sub.id },
        data: {
          status: sub.status === "active" ? "ACTIVE"
            : sub.status === "past_due" ? "PAST_DUE"
            : sub.status === "canceled" ? "CANCELLED"
            : "ACTIVE",
          currentPeriodEnd: new Date(sub.current_period_end * 1000),
        },
      });
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: sub.id },
        data: { status: "CANCELLED" },
      });
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      if (invoice.subscription) {
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: invoice.subscription as string },
          data: { status: "PAST_DUE" },
        });
      }
      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      if (invoice.subscription) {
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: invoice.subscription as string },
          data: { status: "ACTIVE" },
        });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
