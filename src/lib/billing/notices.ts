import type { SupabaseClient } from "@supabase/supabase-js";
import { sendBillingEmail } from "@/lib/resend";
import { sendSms, twilioConfigured } from "@/lib/twilio";
import { getPlan } from "@/lib/plans";
import { TRIAL_DAYS } from "@/lib/dashboard/accessStatus";

const DAY_MS = 24 * 60 * 60 * 1000;
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://flow.flatpurse.com";
const BILLING_URL = `${SITE}/dashboard/settings?tab=billing`;

type Shop = {
  id: string;
  name: string;
  owner_id: string;
  phone: string | null;
  plan: string;
  billing_interval: string | null;
  is_founder: boolean | null;
  founder_discount_claimed_at: string | null;
  trial_started_at: string;
  subscription_status: string | null;
  payment_failed_at: string | null;
  dunning_step: number;
  billing_notices: Record<string, string> | null;
  notification_prefs: Record<string, boolean> | null;
};

export const SHOP_BILLING_COLUMNS =
  "id, name, owner_id, phone, plan, billing_interval, is_founder, founder_discount_claimed_at, trial_started_at, subscription_status, payment_failed_at, dunning_step, billing_notices, notification_prefs";

export const fmtDate = (d: Date) => d.toLocaleDateString("en-CA", { month: "long", day: "numeric", year: "numeric", timeZone: "America/Toronto" });
const money = (n: number) => `C$${n.toFixed(2)}`;

/** Monthly price the shop pays at its next charge, Founders discount included. */
export function nextChargeAmount(shop: Pick<Shop, "plan" | "billing_interval" | "is_founder">, monthIndex = 1): number {
  const p = getPlan(shop.plan);
  const annual = shop.billing_interval === "annual";
  const base = (annual ? p.annualPrice : p.monthlyPrice) ?? 0;
  if (!shop.is_founder || annual) return base;
  return Math.round(base * (monthIndex <= 12 ? 60 : 75)) / 100;
}

export async function ownerContact(admin: SupabaseClient, ownerId: string) {
  const { data } = await admin.auth.admin.getUserById(ownerId);
  const u = data?.user;
  const meta = (u?.user_metadata ?? {}) as Record<string, string>;
  return { email: u?.email ?? null, firstName: meta.first_name || meta.full_name?.split(" ")[0] || "there" };
}

async function markNotice(admin: SupabaseClient, shop: Shop, key: string) {
  const notices = { ...(shop.billing_notices ?? {}), [key]: new Date().toISOString() };
  shop.billing_notices = notices;
  await admin.from("shops").update({ billing_notices: notices }).eq("id", shop.id);
}

// ---------------------------------------------------------------- Dunning (FL-024)

const DUNNING: Record<number, { subject: string; body: string }> = {
  0: { subject: "Your Flow payment didn't go through", body: "We couldn't charge your card for {business}'s Flow plan. We'll try again automatically over the next few days.\n\nTo avoid any interruption, update your card in Settings, Billing." },
  3: { subject: "Action needed: update your card", body: "Your Flow payment for {business} is still failing. Please update your card so bookings and AutoPilot keep running." },
  5: { subject: "Your AutoPilot will pause in 2 days", body: "We still can't charge your card. In 2 days AutoPilot pauses and {business} stops taking new online bookings.\n\nUpdate your card now and nothing changes." },
  7: { subject: "Final notice before your account pauses", body: "This is our last try. If the payment fails again, {business}'s Flow account pauses. Your data is safe and nothing is deleted, but bookings and AutoPilot stop until you update your card." },
};

export async function sendDunningEmail(admin: SupabaseClient, shop: Shop, step: 0 | 3 | 5 | 7) {
  const { email, firstName } = await ownerContact(admin, shop.owner_id);
  if (!email) return;
  const t = DUNNING[step];
  await sendBillingEmail(email, {
    subject: t.subject,
    heading: t.subject,
    body: `Hi ${firstName},\n\n${t.body.replaceAll("{business}", shop.name)}\n\nGeorge`,
    ctaLabel: "Update my card",
    ctaUrl: BILLING_URL,
  });
}

export async function sendPausedEmail(admin: SupabaseClient, shop: Pick<Shop, "owner_id" | "name">) {
  const { email, firstName } = await ownerContact(admin, shop.owner_id);
  if (!email) return;
  await sendBillingEmail(email, {
    subject: "Your account is paused (your data is safe)",
    heading: "Your account is paused",
    body: `Hi ${firstName},\n\nWe couldn't collect payment for ${shop.name}, so your Flow account is now paused. Nothing has been deleted: your clients, bookings and history are all kept.\n\nUpdate your card and choose a plan to switch everything back on.\n\nGeorge`,
    ctaLabel: "Reactivate Flow",
    ctaUrl: BILLING_URL,
  });
}

// ---------------------------------------------------------------- Renewal reminders (FL-116/117)

/** Called from Stripe's invoice.upcoming event. */
export async function sendRenewalReminder(admin: SupabaseClient, shop: Shop, invoice: { amount_due: number; period_end: number; next_payment_attempt: number | null }) {
  // E11 already covers the first charge after a trial.
  if (shop.subscription_status !== "active") return;
  const chargeAt = new Date((invoice.next_payment_attempt ?? invoice.period_end) * 1000);
  const days = Math.round((chargeAt.getTime() - Date.now()) / DAY_MS);
  const annual = shop.billing_interval === "annual";
  if (!annual && shop.notification_prefs?.renewal_reminder === false) return;
  const slot = annual ? (days > 14 ? "30" : "7") : "3";
  const key = `renewal_${chargeAt.toISOString().slice(0, 10)}_${slot}`;
  if (shop.billing_notices?.[key]) return;

  const { email, firstName } = await ownerContact(admin, shop.owner_id);
  if (!email) return;
  const plan = getPlan(shop.plan).label;
  const amount = money(invoice.amount_due / 100);
  await sendBillingEmail(email, {
    subject: `Your Flow plan renews on ${fmtDate(chargeAt)}`,
    heading: `Your Flow plan renews on ${fmtDate(chargeAt)}`,
    body: `Hi ${firstName},\n\nOn ${fmtDate(chargeAt)}, ${shop.name}'s ${plan} plan renews at ${amount} (${annual ? "yearly" : "monthly"}, tax included). There's nothing you need to do.\n\nTo change plan or cancel, go to Settings, Billing before that date.${annual ? "" : "\n\nYou can turn these reminders off in Settings, Notifications."}\n\nGeorge`,
    ctaLabel: "Manage billing",
    ctaUrl: BILLING_URL,
  });
  await markNotice(admin, shop, key);
}

// ---------------------------------------------------------------- Daily job

/**
 * Daily billing job: dunning follow-ups (days 3/5/7), the Day 11 trial
 * reminder (E11, email + text) and the Founders month-13 notice (R3).
 */
export async function runBillingJob(admin: SupabaseClient) {
  const now = Date.now();
  const out = { dunning: 0, e11: 0, r3: 0 };

  const { data: failing } = await admin.from("shops").select(SHOP_BILLING_COLUMNS).not("payment_failed_at", "is", null).eq("subscription_status", "past_due");
  for (const shop of (failing ?? []) as Shop[]) {
    const day = Math.floor((now - new Date(shop.payment_failed_at!).getTime()) / DAY_MS);
    const step = ([7, 5, 3] as const).find((s) => day >= s && shop.dunning_step < s);
    if (!step) continue;
    await admin.from("shops").update({ dunning_step: step }).eq("id", shop.id);
    await sendDunningEmail(admin, shop, step);
    out.dunning++;
  }

  // Day 11 of 14: trial started 10-12 days ago (one-day window, deduped).
  const from = new Date(now - 12 * DAY_MS).toISOString();
  const to = new Date(now - 10 * DAY_MS).toISOString();
  const { data: trialing } = await admin.from("shops").select(SHOP_BILLING_COLUMNS).eq("subscription_status", "trialing").gte("trial_started_at", from).lte("trial_started_at", to);
  for (const shop of (trialing ?? []) as Shop[]) {
    if (shop.billing_notices?.e11) continue;
    const chargeAt = new Date(new Date(shop.trial_started_at).getTime() + TRIAL_DAYS * DAY_MS);
    if (chargeAt.getTime() - now > 4 * DAY_MS) continue;
    await markNotice(admin, shop, "e11");
    const stats = await trialStats(admin, shop.id, shop.trial_started_at);
    const plan = getPlan(shop.plan).label;
    const price = money(nextChargeAmount(shop));
    const per = shop.billing_interval === "annual" ? "year" : "month";
    const { email, firstName } = await ownerContact(admin, shop.owner_id);
    if (email) {
      const results = stats.recovered > 0
        ? `So far Flow has handled ${stats.bookings} bookings and recovered ${money(stats.recovered)} for you.`
        : stats.bookings > 0 ? `So far Flow has handled ${stats.bookings} bookings for you.` : "";
      await sendBillingEmail(email, {
        subject: "Your trial ends in 3 days",
        heading: "Your trial ends in 3 days",
        body: `Hi ${firstName},\n\nOn ${fmtDate(chargeAt)}, your ${plan} plan starts at ${price}/${per} plus tax. There's nothing you need to do; everything keeps running.\n\n${results}\n\nTo change plan or cancel before then (you won't be charged), go to Settings, Billing.\n\nGeorge`,
        ctaLabel: "Change my plan",
        ctaUrl: BILLING_URL,
      });
    }
    if (shop.phone && twilioConfigured()) {
      await sendSms(shop.phone, `Flow: your trial ends ${fmtDate(chargeAt)}. Your ${plan} plan then starts at ${price}/${per} + tax on your card on file. To change or cancel: ${BILLING_URL}`);
    }
    out.e11++;
  }

  // R3: 30 days before month 13 of a Founders subscription (40% -> 25% off).
  // Month 1 starts when the trial ends, so month 13 starts ~12 months + 14 days after claiming.
  const { data: founders } = await admin.from("shops").select(SHOP_BILLING_COLUMNS).eq("is_founder", true).eq("subscription_status", "active").not("founder_discount_claimed_at", "is", null);
  for (const shop of (founders ?? []) as Shop[]) {
    if (shop.billing_notices?.r3 || shop.billing_interval === "annual") continue;
    const claimed = new Date(shop.founder_discount_claimed_at!);
    const month13 = new Date(claimed.getTime() + TRIAL_DAYS * DAY_MS);
    month13.setMonth(month13.getMonth() + 12);
    const daysLeft = (month13.getTime() - now) / DAY_MS;
    if (daysLeft > 30 || daysLeft < 0) continue;
    await markNotice(admin, shop, "r3");
    const { email, firstName } = await ownerContact(admin, shop.owner_id);
    if (!email) continue;
    const oldP = money(nextChargeAmount(shop, 1));
    const newP = money(nextChargeAmount(shop, 13));
    await sendBillingEmail(email, {
      subject: "Your Founders price changes next month",
      heading: "Your Founders year is almost up",
      body: `Hi ${firstName},\n\nThank you for being one of Flow's first 40 Founders. Your first year at 40% off ends on ${fmtDate(month13)}.\n\nFrom then on you keep 25% off for life: your ${getPlan(shop.plan).label} plan goes from ${oldP}/month to ${newP}/month, plus tax.\n\nYou can change plan or cancel anytime in Settings, Billing.\n\nGeorge`,
      ctaLabel: "Manage billing",
      ctaUrl: BILLING_URL,
    });
    out.r3++;
  }

  return out;
}

/** Trial results for the Day 11 email and screen. Never invents numbers. */
export async function trialStats(admin: SupabaseClient, shopId: string, since: string) {
  const [{ data: wins }, { count }] = await Promise.all([
    admin.from("autopilot_events").select("flow_key, amount").eq("shop_id", shopId).eq("outcome", "booked").gte("created_at", since),
    admin.from("appointments").select("id", { count: "exact", head: true }).eq("shop_id", shopId).gte("created_at", since),
  ]);
  const by = { noshow: 0, filler: 0, winback: 0 } as Record<string, number>;
  for (const w of wins ?? []) if (w.flow_key in by) by[w.flow_key] += Number(w.amount ?? 0);
  return { recovered: by.noshow + by.filler + by.winback, byFlow: by, bookings: count ?? 0 };
}
