"use server";

import { logShopAction } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { getShopContext } from "@/lib/dashboard/shop";
import { getPlan, getStripePriceId, type BillingInterval } from "@/lib/plans";
import { sendBillingEmail } from "@/lib/resend";
import { fmtDate, ownerContact, trialStats } from "@/lib/billing/notices";

const DAY = 24 * 60 * 60 * 1000;
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://flow.flatpurse.com";
const BILLING_URL = `${SITE}/dashboard/settings?tab=billing`;

export type CancelReason = "expensive" | "not_using" | "seasonal" | "missing_feature" | "switching" | "technical" | "closing" | "other";
export type OfferKind = "downgrade_starter" | "half_off_2m" | "free_month" | "pause" | "none";

export type CancelContext = {
  plan: string;
  planLabel: string;
  trialing: boolean;
  isFounder: boolean;
  periodEnd: string;
  bookings: number;
  recovered: number;
  clients: number;
  offerUsed: boolean;
  pauseMonthsLeft: number;
  starterSaving: number;
  cancelAt: string | null;
};

async function load() {
  const ctx = await getShopContext();
  if (!ctx || ctx.role !== "owner") return null;
  const admin = createAdminClient();
  const { data: shop } = await admin.from("shops")
    .select("id, name, owner_id, plan, billing_interval, is_founder, subscription_id, subscription_status, trial_started_at, save_offer_at, pause_history, cancel_at")
    .eq("id", ctx.shopId).maybeSingle();
  if (!shop || !shop.subscription_id) return null;
  return { admin, shop };
}

/** The live subscription (Founders shops store a schedule id). */
async function liveSub(id: string): Promise<{ sub: Stripe.Subscription; scheduleId: string | null }> {
  if (id.startsWith("sub_sched_")) {
    const sched = await stripe().subscriptionSchedules.retrieve(id);
    const subId = typeof sched.subscription === "string" ? sched.subscription : sched.subscription?.id;
    return { sub: await stripe().subscriptions.retrieve(subId!), scheduleId: sched.status === "active" ? sched.id : null };
  }
  return { sub: await stripe().subscriptions.retrieve(id), scheduleId: null };
}

const periodEndOf = (sub: Stripe.Subscription) =>
  new Date(((sub.trial_end && sub.status === "trialing" ? sub.trial_end : sub.items.data[0]?.current_period_end) ?? 0) * 1000);

function pauseMonthsUsed(history: unknown) {
  const since = Date.now() - 365 * DAY;
  return ((history as { from: string; months: number }[]) ?? []).filter((p) => new Date(p.from).getTime() > since).reduce((n, p) => n + p.months, 0);
}

export async function getCancelContext(): Promise<CancelContext | null> {
  const l = await load();
  if (!l) return null;
  const { admin, shop } = l;
  const { sub } = await liveSub(shop.subscription_id as string);
  const [stats, { count: clients }] = await Promise.all([
    trialStats(admin, shop.id, "2000-01-01"),
    admin.from("clients").select("id", { count: "exact", head: true }).eq("shop_id", shop.id),
  ]);
  const p = getPlan(shop.plan);
  return {
    plan: shop.plan,
    planLabel: p.label,
    trialing: sub.status === "trialing",
    isFounder: Boolean(shop.is_founder),
    periodEnd: fmtDate(periodEndOf(sub)),
    bookings: stats.bookings,
    recovered: stats.recovered,
    clients: clients ?? 0,
    offerUsed: Boolean(shop.save_offer_at && Date.now() - new Date(shop.save_offer_at).getTime() < 365 * DAY),
    pauseMonthsLeft: Math.max(0, 3 - pauseMonthsUsed(shop.pause_history)),
    starterSaving: Math.max(0, (p.monthlyPrice ?? 0) - (getPlan("starter").monthlyPrice ?? 0)),
    cancelAt: shop.cancel_at ? fmtDate(new Date(shop.cancel_at)) : null,
  };
}

async function ensureCoupon(id: string, params: Stripe.CouponCreateParams) {
  try { await stripe().coupons.retrieve(id); } catch { await stripe().coupons.create({ id, ...params }); }
}

async function logFeedback(admin: ReturnType<typeof createAdminClient>, shopId: string, f: { reason: CancelReason; comment?: string; detail?: string; offer: OfferKind; outcome: string }) {
  await admin.from("cancellation_feedback").insert({ shop_id: shopId, reason: f.reason, comment: f.comment || null, detail: f.detail || null, offer: f.offer, outcome: f.outcome });
}

/** Screen 3: accept the reason-matched offer. Applied instantly, no codes. */
export async function acceptOffer(input: { reason: CancelReason; comment?: string; detail?: string; offer: OfferKind; pauseMonths?: number }): Promise<{ message?: string; error?: string }> {
  const l = await load();
  if (!l) return { error: "Only the owner can do this" };
  const { admin, shop } = l;
  const ctx = await getCancelContext();
  if (!ctx) return { error: "No subscription found" };
  if (input.offer !== "pause" && ctx.offerUsed) return { error: "You've already used a save offer this year" };
  // Founders keep their schedule (40% then 25%); only pause is offered to them.
  if (shop.is_founder && input.offer !== "pause") return { error: "This offer isn't available on Founders pricing" };

  try {
    const { sub } = await liveSub(shop.subscription_id as string);
    let message = "";
    if (input.offer === "half_off_2m") {
      await ensureCoupon("flow-save-50-2m", { percent_off: 50, duration: "repeating", duration_in_months: 2, name: "50% off 2 months" });
      await stripe().subscriptions.update(sub.id, { discounts: [{ coupon: "flow-save-50-2m" }] });
      message = "50% off your next 2 months";
    } else if (input.offer === "free_month") {
      await ensureCoupon("flow-save-free-month", { percent_off: 100, duration: "once", name: "1 free month" });
      await stripe().subscriptions.update(sub.id, { discounts: [{ coupon: "flow-save-free-month" }] });
      message = "1 free month";
    } else if (input.offer === "downgrade_starter") {
      const interval = (shop.billing_interval as BillingInterval | null) ?? "monthly";
      // New price from the next billing date, no proration.
      await stripe().subscriptions.update(sub.id, { items: [{ id: sub.items.data[0].id, price: getStripePriceId("starter", interval) }], proration_behavior: "none" });
      await admin.from("shops").update({ plan: "starter" }).eq("id", shop.id);
      message = "Your plan moves to Starter on your next billing date";
    } else if (input.offer === "pause") {
      const r = await pausePlan(input.pauseMonths ?? 1);
      if (r.error) return r;
      message = r.message ?? "Plan paused";
    }
    if (input.offer !== "pause") await admin.from("shops").update({ save_offer_at: new Date().toISOString() }).eq("id", shop.id);
    await logFeedback(admin, shop.id, { ...input, outcome: input.offer === "pause" ? "paused" : input.offer === "downgrade_starter" ? "downgraded" : "accepted" });
    revalidatePath("/dashboard", "layout");
    return { message: `Done! ${message} applied.` };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Couldn't apply the offer" };
  }
}

/** Pause 1-3 months at no charge (max 3 per 12 months). */
export async function pausePlan(months: number): Promise<{ message?: string; error?: string }> {
  const l = await load();
  if (!l) return { error: "Only the owner can do this" };
  await logShopAction("plan_pause", { months });
  const { admin, shop } = l;
  const used = pauseMonthsUsed(shop.pause_history);
  months = Math.round(months);
  if (months < 1 || months + used > 3) return { error: `You can pause for up to ${3 - used} more month(s) this year` };

  const from = new Date();
  const until = new Date(from);
  until.setMonth(until.getMonth() + months);
  const { sub } = await liveSub(shop.subscription_id as string);
  await stripe().subscriptions.update(sub.id, { pause_collection: { behavior: "void", resumes_at: Math.floor(until.getTime() / 1000) } });
  const history = [...((shop.pause_history as unknown[]) ?? []), { from: from.toISOString(), until: until.toISOString(), months }];
  await admin.from("shops").update({ paused_until: until.toISOString(), pause_history: history }).eq("id", shop.id);

  const { email, firstName } = await ownerContact(admin, shop.owner_id);
  if (email) {
    await sendBillingEmail(email, {
      subject: `Your Flow plan is paused until ${fmtDate(until)}`,
      heading: `Paused until ${fmtDate(until)}`,
      body: `Hi ${firstName},\n\nYour plan is paused and you won't be charged until ${fmtDate(until)}.\n\nWhile paused, your booking page shows "Not taking online bookings right now" with your phone number, and AutoPilot and client reminders stop.\n\nEverything is kept: your data, your settings${shop.is_founder ? " and your Founders price" : ""}. You can still log in and see it all.\n\nGeorge`,
      ctaLabel: "Resume now",
      ctaUrl: BILLING_URL,
    });
  }
  revalidatePath("/dashboard", "layout");
  return { message: `Paused until ${fmtDate(until)}` };
}

export async function resumePlan(): Promise<{ error?: string }> {
  const l = await load();
  if (!l) return { error: "Only the owner can do this" };
  const { sub } = await liveSub(l.shop.subscription_id as string);
  await stripe().subscriptions.update(sub.id, { pause_collection: null });
  await l.admin.from("shops").update({ paused_until: null }).eq("id", l.shop.id);
  revalidatePath("/dashboard", "layout");
  return {};
}

/** Screen 4: cancel. Trial cancels now with no charge; paid plans end at period end. */
export async function cancelPlan(input: { reason: CancelReason; comment?: string; detail?: string; offerShown: OfferKind }): Promise<{ periodEnd?: string; error?: string }> {
  const l = await load();
  if (!l) return { error: "Only the owner can do this" };
  await logShopAction("plan_cancel", { reason: input.reason });
  const { admin, shop } = l;
  try {
    const { sub, scheduleId } = await liveSub(shop.subscription_id as string);
    const end = periodEndOf(sub);
    if (sub.status === "trialing") {
      await stripe().subscriptions.cancel(sub.id, { prorate: false });
    } else {
      // A schedule blocks cancel_at_period_end; cancelling ends Founders pricing anyway.
      if (scheduleId) await stripe().subscriptionSchedules.release(scheduleId);
      await stripe().subscriptions.update(sub.id, { cancel_at_period_end: true });
      await admin.from("shops").update({ cancel_at: end.toISOString(), subscription_id: sub.id }).eq("id", shop.id);
    }
    await logFeedback(admin, shop.id, { reason: input.reason, comment: input.comment, detail: input.detail, offer: input.offerShown, outcome: "cancelled" });

    const { email, firstName } = await ownerContact(admin, shop.owner_id);
    if (email) {
      await sendBillingEmail(email, {
        subject: "Your Flow plan is cancelled",
        heading: "Your cancellation is confirmed",
        body: `Hi ${firstName},\n\nYour cancellation is confirmed. Your ${getPlan(shop.plan).label} plan stays active until ${fmtDate(end)}. You won't be charged again.\n\nAfter that date, your booking page stops taking bookings and AutoPilot stops. Your clients won't be notified by us. Your data is kept for 90 days in case you come back.${sub.status === "trialing" ? "" : `\n\nChanged your mind? Keep your plan with one click before ${fmtDate(end)}.`}\n\nGeorge`,
        ctaLabel: sub.status === "trialing" ? undefined : "Keep my plan",
        ctaUrl: BILLING_URL,
      });
    }
    revalidatePath("/dashboard", "layout");
    return { periodEnd: fmtDate(end) };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Couldn't cancel" };
  }
}

/** One tap undo from the banner, any time before the end date. */
export async function keepPlan(): Promise<{ error?: string }> {
  const l = await load();
  if (!l) return { error: "Only the owner can do this" };
  const { sub } = await liveSub(l.shop.subscription_id as string);
  await stripe().subscriptions.update(sub.id, { cancel_at_period_end: false });
  await l.admin.from("shops").update({ cancel_at: null }).eq("id", l.shop.id);
  await l.admin.from("cancellation_feedback").insert({ shop_id: l.shop.id, reason: "other", offer: "none", outcome: "kept", comment: "Undid cancellation" });
  revalidatePath("/dashboard", "layout");
  return {};
}

export async function logKept(reason: CancelReason | null): Promise<void> {
  const l = await load();
  if (l && reason) await l.admin.from("cancellation_feedback").insert({ shop_id: l.shop.id, reason, offer: "none", outcome: "kept" });
}
