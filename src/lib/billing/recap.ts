import type { SupabaseClient } from "@supabase/supabase-js";
import { sendBillingEmail } from "@/lib/resend";
import { ownerContact, trialStats } from "@/lib/billing/notices";

const DAY = 86_400_000;
const money = (n: number) => `C$${n.toFixed(2)}`;

/**
 * FL-091: weekly recap every Monday, monthly recap on the 1st (owner's
 * timezone assumed America/Edmonton). Runs from the daily billing cron; the
 * billing_notices jsonb keys stop double sends.
 */
export async function runRecapJob(admin: SupabaseClient) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Edmonton", weekday: "short", day: "numeric", month: "2-digit", year: "numeric" }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const weekly = get("weekday") === "Mon";
  const monthly = get("day") === "1";
  if (!weekly && !monthly) return { sent: 0 };
  const { data: shops } = await admin.from("shops").select("id, name, owner_id, billing_notices, subscription_status")
    .in("subscription_status", ["active", "trialing", "past_due"]).limit(2000);
  let sent = 0;
  for (const shop of shops ?? []) {
    const notices = (shop.billing_notices as Record<string, string> | null) ?? {};
    for (const kind of [weekly ? "weekly" : null, monthly ? "monthly" : null].filter(Boolean) as ("weekly" | "monthly")[]) {
      const key = `recap_${kind}_${get("year")}-${get("month")}-${get("day")}`;
      if (notices[key]) continue;
      const days = kind === "weekly" ? 7 : 30;
      const since = new Date(Date.now() - days * DAY).toISOString();
      const [{ data: paid }, stats, { count: newClients }] = await Promise.all([
        admin.from("appointments").select("paid_amount, tip_amount").eq("shop_id", shop.id).gte("completed_at", since),
        trialStats(admin, shop.id as string, since),
        admin.from("clients").select("id", { count: "exact", head: true }).eq("shop_id", shop.id).gte("created_at", since),
      ]);
      const revenue = (paid ?? []).reduce((s, a) => s + Number(a.paid_amount ?? 0) - Number(a.tip_amount ?? 0), 0);
      const owner = await ownerContact(admin, shop.owner_id as string);
      if (!owner.email) continue;
      const lines = [
        `Revenue: ${money(revenue)} (excluding tips)`,
        `Bookings made: ${stats.bookings}`,
        `New clients: ${newClients ?? 0}`,
        `Recovered by AutoPilot: ${money(stats.recovered)}`,
      ];
      const r = await sendBillingEmail(owner.email, {
        subject: `${shop.name}: your ${kind === "weekly" ? "week" : "month"} in Flow`,
        heading: kind === "weekly" ? "Your week in Flow" : "Your month in Flow",
        body: `Here's the last ${days} days at ${shop.name}. ${lines.join(". ")}.`,
        ctaLabel: "Open your dashboard", ctaUrl: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://flow.flatpurse.com"}/dashboard`,
      }).catch(() => ({ error: "send failed" }));
      if (!(r as { error?: string })?.error) {
        notices[key] = new Date().toISOString();
        sent++;
      }
    }
    await admin.from("shops").update({ billing_notices: notices }).eq("id", shop.id);
  }
  return { sent };
}
