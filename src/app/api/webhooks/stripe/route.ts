import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripePriceId, type BillablePlanKey, type BillingInterval } from "@/lib/plans";

export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");
  // Two separate Stripe webhook endpoints point at this route — one for platform
  // events (STRIPE_WEBHOOK_SECRET) and one with "Listen to events on Connected
  // accounts" enabled (STRIPE_CONNECT_WEBHOOK_SECRET) — each has its own signing
  // secret, so a signature only verifies against one of them.
  const secrets = [process.env.STRIPE_WEBHOOK_SECRET, process.env.STRIPE_CONNECT_WEBHOOK_SECRET].filter(
    (s): s is string => Boolean(s),
  );
  if (!signature || secrets.length === 0) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });
  }

  const body = await req.text();

  let event: Stripe.Event | undefined;
  for (const secret of secrets) {
    try {
      event = stripe().webhooks.constructEvent(body, signature, secret);
      break;
    } catch {
      continue;
    }
  }
  if (!event) {
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
      const planKey = session.metadata.plan_key as BillablePlanKey;
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
          console.warn(`Founders spot claim missed for shop ${shopId} (checkout already showed the discount, honoring it)`);
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

  // Disputes on either a platform subscription charge or a shop's own Connect
  // charge. `event.account` is only set for events on a connected account —
  // requires this endpoint to also be enabled for Connect events in the
  // Stripe Dashboard (Developers > Webhooks > this endpoint > "Listen to
  // events on Connected accounts"), not just direct platform events.
  if (event.type === "charge.dispute.created" || event.type === "charge.dispute.updated") {
    const dispute = event.data.object as Stripe.Dispute;
    const connectedAccountId = event.account ?? null;

    let shopId: string | null = null;
    if (connectedAccountId) {
      const { data: shop } = await admin.from("shops").select("id").eq("stripe_account_id", connectedAccountId).maybeSingle();
      shopId = (shop?.id as string | undefined) ?? null;
    }

    await admin.from("disputes").upsert(
      {
        stripe_dispute_id: dispute.id,
        stripe_charge_id: typeof dispute.charge === "string" ? dispute.charge : dispute.charge.id,
        shop_id: shopId,
        amount: dispute.amount / 100,
        currency: dispute.currency,
        reason: dispute.reason,
        status: dispute.status,
        is_platform: !connectedAccountId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "stripe_dispute_id" },
    );
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
