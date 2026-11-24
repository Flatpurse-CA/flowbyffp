import { createAdminClient } from "@/lib/supabase/admin";
import { sendSms } from "@/lib/twilio";
import { sendBillingEmail } from "@/lib/resend";
import { ownerContact } from "@/lib/billing/notices";
import { logMessage } from "@/lib/messageLog";
import { enqueueJob, inQuietHours, nextSendWindow, shopTimezone } from "@/lib/scheduler";

/**
 * FL-075: monthly SMS allowance per plan. Numbers are placeholders until cost
 * testing (override with SMS_ALLOWANCE="starter,pro,pro_plus"). Booking messages
 * (confirmations, reminders, receipts) keep sending past 100%; marketing SMS
 * stops and those clients get the email only.
 */
function allowances(): Record<string, number> {
  const [s, p, pp] = (process.env.SMS_ALLOWANCE ?? "200,1000,3000").split(",").map(Number);
  return { starter: s || 200, pro: p || 1000, pro_plus: pp || 3000, enterprise: Infinity };
}

export const monthKey = () => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Edmonton", year: "numeric", month: "2-digit" }).format(new Date());

export async function smsUsage(shopId: string): Promise<{ sent: number; allowance: number; plan: string }> {
  const admin = createAdminClient();
  const [{ data: shop }, { data: u }] = await Promise.all([
    admin.from("shops").select("plan").eq("id", shopId).maybeSingle(),
    admin.from("sms_usage").select("sent").eq("shop_id", shopId).eq("month", monthKey()).maybeSingle(),
  ]);
  const plan = (shop?.plan as string) ?? "starter";
  return { sent: Number(u?.sent ?? 0), allowance: allowances()[plan] ?? allowances().starter, plan };
}

/** Send a shop's SMS, counting it against the allowance. */
export async function sendShopSms(shopId: string, to: string, body: string, opts: { marketing: boolean; automated?: boolean; kind?: string }): Promise<{ error?: string; overAllowance?: boolean; queued?: boolean }> {
  // Spec: no automated texts 9pm-8am local time; queue them for 8am instead (FL-004).
  if (opts.automated) {
    const tz = await shopTimezone(shopId);
    if (inQuietHours(tz)) {
      const { error } = await enqueueJob("sms.send", nextSendWindow(tz), { shopId, to, body, marketing: opts.marketing, kind: opts.kind ?? null }, { shopId });
      await logMessage({ shopId, channel: "sms", kind: opts.kind, recipient: to, subject: body.slice(0, 120), status: error ? "failed" : "queued", error });
      return error ? { error } : { queued: true };
    }
  }
  const { sent, allowance } = await smsUsage(shopId);
  if (opts.marketing && sent >= allowance) {
    await logMessage({ shopId, channel: "sms", kind: opts.kind, recipient: to, subject: body.slice(0, 120), status: "skipped", error: "SMS allowance used up" });
    return { error: "SMS allowance used up", overAllowance: true };
  }
  const r = await sendSms(to, body);
  await logMessage({ shopId, channel: "sms", kind: opts.kind ?? (opts.marketing ? "marketing" : "transactional"), recipient: to, subject: body.slice(0, 120), status: r.error ? "failed" : "sent", error: r.error });
  if (r.error) return r;
  const admin = createAdminClient();
  const { data: now } = await admin.rpc("bump_sms_usage", { p_shop: shopId, p_month: monthKey() });
  const count = Number(now ?? sent + 1);
  if (Number.isFinite(allowance) && count >= Math.ceil(allowance * 0.8)) {
    const { data: row } = await admin.from("sms_usage").update({ warned_at: new Date().toISOString() })
      .eq("shop_id", shopId).eq("month", monthKey()).is("warned_at", null).select("shop_id").maybeSingle();
    if (row) {
      const { data: shop } = await admin.from("shops").select("owner_id").eq("id", shopId).maybeSingle();
      const owner = shop?.owner_id ? await ownerContact(admin, shop.owner_id as string) : null;
      if (owner?.email) await sendBillingEmail(owner.email, {
        subject: "You've used 80% of this month's texts",
        heading: "80% of your texts used",
        body: `You've sent ${count} of ${allowance} texts this month. Booking texts (confirmations, reminders, receipts) keep sending. Once you reach ${allowance}, marketing texts pause and those clients get the email instead. Upgrade for more texts.`,
        ctaLabel: "See plans", ctaUrl: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://flow.flatpurse.com"}/dashboard/settings`,
      }).catch(() => {});
    }
  }
  if (Number.isFinite(allowance) && count === allowance * 2) {
    const { data: shop } = await admin.from("shops").select("owner_id").eq("id", shopId).maybeSingle();
    const owner = shop?.owner_id ? await ownerContact(admin, shop.owner_id as string) : null;
    if (owner?.email) await sendBillingEmail(owner.email, {
      subject: "You've sent twice this month's texts",
      heading: "Texts at 2x your allowance",
      body: `You've sent ${count} texts this month, twice your plan's ${allowance}. Booking texts keep sending so clients still get reminders. Upgrade for a bigger allowance.`,
      ctaLabel: "See plans", ctaUrl: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://flow.flatpurse.com"}/dashboard/settings`,
    }).catch(() => {});
  }
  return {};
}
