import { sendBillingEmail } from "@/lib/resend";
import { ownerContact } from "@/lib/billing/notices";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripePriceId, type BillablePlanKey, type BillingInterval } from "@/lib/plans";
import { settleReferralRewards } from "@/lib/referrals";
import { SHOP_BILLING_COLUMNS, sendDunningEmail, sendPausedEmail, sendRenewalReminder } from "@/lib/billing/notices";

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
      // Card-up-front trials arrive here as "trialing"; the first charge is at trial_end.
      const sub = await stripe().subscriptions.retrieve(subscriptionId);
      let trialEnd = sub.status === "trialing" && sub.trial_end ? sub.trial_end : null;

      // One free trial per card (FL-023): a card already used by another shop ends the trial now.
      const pmId = typeof sub.default_payment_method === "string" ? sub.default_payment_method : sub.default_payment_method?.id;
      if (pmId) {
        const pm = await stripe().paymentMethods.retrieve(pmId);
        const fingerprint = pm.card?.fingerprint ?? null;
        if (fingerprint) {
          await admin.from("shops").update({ card_fingerprint: fingerprint }).eq("id", shopId);
          if (trialEnd) {
            const { count } = await admin.from("shops").select("id", { count: "exact", head: true })
              .eq("card_fingerprint", fingerprint).neq("id", shopId);
            if ((count ?? 0) > 0) {
              await stripe().subscriptions.update(subscriptionId, { trial_end: "now" });
              trialEnd = null;
            }
          }
        }
      }

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
            // Keep the trial as its own phase so the 12 discounted months start at the first charge.
            ...(trialEnd ? [{ items: [{ price: priceId, quantity: 1 }], trial_end: trialEnd, end_date: trialEnd }] : []),
            { items: [{ price: priceId, quantity: 1 }], duration: { interval: "month" as const, interval_count: 12 }, discounts: [{ coupon: "founders-40-off" }] },
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
          subscription_status: trialEnd ? "trialing" : "active",
          ...(founderClaim ? { is_founder: true, founder_discount_claimed_at: new Date().toISOString() } : {}),
        })
        .eq("id", shopId);

      // Never fail the webhook over a referral: a Stripe retry would re-run the
      // founders schedule setup above, which isn't repeatable. A failed reward
      // is released back to 'signed_up' so it shows as pending, not lost.
      try {
        await settleReferralRewards(admin, shopId, session);
      } catch (e) {
        console.error("settleReferralRewards failed", e);
      }
    }
  }

  if (event.type === "invoice.payment_failed" || event.type === "invoice.paid" || event.type === "invoice.upcoming") {
    const inv = event.data.object as Stripe.Invoice;
    const customerId = typeof inv.customer === "string" ? inv.customer : inv.customer?.id;
    const { data: shop } = customerId
      ? await admin.from("shops").select(SHOP_BILLING_COLUMNS).eq("stripe_customer_id", customerId).maybeSingle()
      : { data: null };
    if (shop && event.type === "invoice.payment_failed" && inv.billing_reason !== "manual") {
      // Day 0 of dunning. Stripe Smart Retries handles the retries themselves.
      if (!shop.payment_failed_at) {
        await admin.from("shops").update({ payment_failed_at: new Date().toISOString(), dunning_step: 0, subscription_status: "past_due" }).eq("id", shop.id);
        await sendDunningEmail(admin, shop as never, 0);
      }
    } else if (shop && event.type === "invoice.paid" && inv.amount_paid > 0) {
      await admin.from("shops").update({ payment_failed_at: null, dunning_step: 0 }).eq("id", shop.id);
    } else if (shop && event.type === "invoice.upcoming") {
      await sendRenewalReminder(admin, shop as never, inv as never);
    }
  }

  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
    const canceled = event.type === "customer.subscription.deleted";
    const prev = (event.data as { previous_attributes?: { status?: string } }).previous_attributes?.status;

    // Final retry failed: Stripe marks the subscription unpaid (set "If all retries fail" to
    // "mark as unpaid" in Stripe settings). The account pauses; nothing is deleted.
    if (!canceled && (sub.status === "unpaid" || sub.status === "paused") && prev && prev !== sub.status) {
      const { data: owner } = await admin.from("shops").select("owner_id, name").eq("stripe_customer_id", customerId).maybeSingle();
      if (owner) await sendPausedEmail(admin, owner);
    }

    await admin
      .from("shops")
      .update({
        subscription_status: canceled ? "canceled" : sub.status,
        cancel_at: !canceled && sub.cancel_at ? new Date(sub.cancel_at * 1000).toISOString() : null,
        ...(sub.pause_collection ? {} : { paused_until: null }),
        ...(canceled ? { subscription_id: null, billing_interval: null, plan_ended_at: new Date().toISOString() } : { plan_ended_at: null }),
      })
      .eq("stripe_customer_id", customerId);

    // Comped (Unlimited) shops keep their admin-granted plan when an old
    // subscription ends; everyone else drops back to Starter.
    if (canceled) {
      await admin
        .from("shops")
        .update({ plan: "starter" })
        .eq("stripe_customer_id", customerId)
        .eq("trial_override", false);
    }
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
        evidence_due_by: dispute.evidence_details?.due_by ? new Date(dispute.evidence_details.due_by * 1000).toISOString() : null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "stripe_dispute_id" },
    );
    // FL-038: alert the owner once, with the deadline and what evidence helps.
    if (event.type === "charge.dispute.created" && shopId) {
      const { data: s } = await admin.from("shops").select("owner_id").eq("id", shopId).maybeSingle();
      const owner = s?.owner_id ? await ownerContact(admin, s.owner_id as string) : null;
      if (owner?.email) {
        const due = dispute.evidence_details?.due_by ? new Date(dispute.evidence_details.due_by * 1000).toLocaleDateString("en-CA", { month: "long", day: "numeric", year: "numeric" }) : "soon";
        await sendBillingEmail(owner.email, {
          subject: `A client disputed a $${(dispute.amount / 100).toFixed(2)} payment`,
          heading: "A payment was disputed",
          body: `A client's bank has disputed a $${(dispute.amount / 100).toFixed(2)} charge (reason: ${dispute.reason.replaceAll("_", " ")}). Send evidence by ${due}. Helpful evidence: the booking confirmation, your cancellation policy the client agreed to, check-in or completion time, any messages with the client, and the receipt. Respond in your Stripe dashboard under Payments > Disputes.`,
          ctaLabel: "Open Stripe", ctaUrl: "https://dashboard.stripe.com/disputes",
        }).catch(() => {});
        await admin.from("disputes").update({ alerted_at: new Date().toISOString() }).eq("stripe_dispute_id", dispute.id);
      }
    }
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
          stripe_payment_intent: pi.id,
          status: "confirmed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", appointmentId);
    }
  }

  return NextResponse.json({ received: true });
}
