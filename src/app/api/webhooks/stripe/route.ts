import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripePriceId, type BillingInterval } from "@/lib/plans";

export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });
  }

  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(body, signature, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const admin = createAdminClient();

  if (event.type === "account.updated") {
    const account = event.data.object as Stripe.Account;
    await admin
      .from("shops")
      .update({ stripe_connected: Boolean(account.charges_enabled) })
      .eq("stripe_account_id", account.id);
  }

  // Platform subscription billing (FlatPurse charging shop owners) — distinct
  // from the payment_intent.succeeded case below, which is an end-client paying
  // a shop through Connect.
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.mode === "subscription" && session.metadata?.context === "platform_subscription" && session.subscription) {
      const shopId = session.metadata.shop_id;
      const planKey = session.metadata.plan_key as "pro" | "pro_plus";
      const interval = session.metadata.interval as BillingInterval;
      const founderClaim = session.metadata.founder_claim === "true";
      const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription.id;

      let finalSubscriptionId = subscriptionId;

      if (founderClaim) {
        const { data: claimed } = await admin.rpc("claim_founder_spot");
        if (!claimed) {
          // Spots ran out between checkout creation and completion — rare (40-spot beta).
          // The 40%-off coupon was already shown and applied at checkout, so we honor it
          // rather than silently repricing a subscription the customer already agreed to.
          console.warn(`Founders spot claim missed for shop ${shopId} (checkout already showed the discount — honoring it)`);
        }

        const priceId = getStripePriceId(planKey, interval);
        const schedule = await stripe().subscriptionSchedules.create({ from_subscription: subscriptionId });
        await stripe().subscriptionSchedules.update(schedule.id, {
          end_behavior: "release",
          phases: [
            { items: [{ price: priceId, quantity: 1 }], duration: { interval: "month", interval_count: 12 }, discounts: [{ coupon: "founders-40-off" }] },
            { items: [{ price: priceId, quantity: 1 }], discounts: [{ coupon: "founders-25-off" }] },
          ],
        });
        finalSubscriptionId = schedule.id;
      }

      await admin
        .from("shops")
        .update({
          plan: planKey,
          billing_interval: interval,
          subscription_id: finalSubscriptionId,
          subscription_status: "active",
          ...(founderClaim ? { is_founder: true, founder_discount_claimed_at: new Date().toISOString() } : {}),
        })
        .eq("id", shopId);
    }
  }

  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
    const canceled = event.type === "customer.subscription.deleted";

    await admin
      .from("shops")
      .update({
        subscription_status: canceled ? "canceled" : sub.status,
        ...(canceled ? { plan: "starter", subscription_id: null, billing_interval: null } : {}),
      })
      .eq("stripe_customer_id", customerId);
  }

  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object as Stripe.PaymentIntent;
    const appointmentId = pi.metadata?.appointment_id;
    if (appointmentId) {
      await admin
        .from("appointments")
        .update({
          paid_amount: pi.amount_received / 100,
          payment_method: "card",
          status: "confirmed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", appointmentId);
    }
  }

  return NextResponse.json({ received: true });
}
