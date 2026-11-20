"use server";

import { sendShopSms } from "@/lib/sms/allowance";
import { randomBytes } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthUser, getShopContext } from "@/lib/dashboard/shop";
import { getAvailableSlots } from "@/app/book/[handle]/actions";
import { twilioConfigured } from "@/lib/twilio";
import { sendAutopilotEmail } from "@/lib/resend";
import { toE164 } from "@/lib/phone";
import { SITE_URL } from "@/lib/seo/facts";

const TZ = "America/Edmonton";
const DAY = 24 * 60 * 60 * 1000;
const MAX_RECIPIENTS = 20;

/** Next open times for a service/staff, scanning up to 14 days ahead. */
export async function suggestSlots(input: { serviceId: string; staffId: string | "any"; limit?: number }): Promise<string[]> {
  const ctx = await getShopContext();
  if (!ctx) return [];
  const out: string[] = [];
  const soonest = Date.now() + 60 * 60 * 1000;
  for (let d = 0; d < 14 && out.length < (input.limit ?? 8); d++) {
    const date = new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date(Date.now() + d * DAY));
    const slots = await getAvailableSlots({ shopId: ctx.shopId, serviceId: input.serviceId, staffId: input.staffId, date });
    // Spread choices out: at most 2 per day.
    out.push(...slots.filter((s) => new Date(s).getTime() > soonest).slice(0, 2));
  }
  return out.slice(0, input.limit ?? 8);
}

export type Recipient = { name: string; phone: string | null; email: string | null };

export async function sendTimes(input: {
  recipients: Recipient[]; serviceId: string; staffId: string | "any"; slots: string[]; message: string;
}): Promise<{ sent?: number; skipped?: number; error?: string }> {
  const ctx = await getShopContext();
  if (!ctx) return { error: "Not signed in" };
  if (input.recipients.length === 0 || input.recipients.length > MAX_RECIPIENTS) return { error: `Pick 1 to ${MAX_RECIPIENTS} clients` };
  if (input.slots.length < 1 || input.slots.length > 5) return { error: "Pick 1 to 5 times" };
  if (!input.message.includes("{link}")) return { error: "Keep {link} in the message so clients can tap to book" };

  const admin = createAdminClient();
  const user = await getAuthUser();
  const [{ data: shop }, { data: service }] = await Promise.all([
    admin.from("shops").select("id, name").eq("id", ctx.shopId).maybeSingle(),
    admin.from("services").select("id").eq("id", input.serviceId).eq("shop_id", ctx.shopId).maybeSingle(),
  ]);
  if (!shop || !service) return { error: "Service not found" };
  if (input.staffId !== "any") {
    const { data: st } = await admin.from("staff").select("id").eq("id", input.staffId).eq("shop_id", ctx.shopId).maybeSingle();
    if (!st) return { error: "Staff member not found" };
  }

  const slots = [...input.slots].sort();
  const lastSlot = new Date(slots[slots.length - 1]).getTime();
  const { data: offer, error } = await admin.from("time_offers").insert({
    shop_id: ctx.shopId, sender_id: user?.id ?? null, source: "manual", service_id: input.serviceId,
    staff_id: input.staffId === "any" ? null : input.staffId, slot_times: slots,
    expires_at: new Date(Math.min(lastSlot, Date.now() + 7 * DAY)).toISOString(),
  }).select("id").single();
  if (error || !offer) return { error: error?.message ?? "Couldn't create the offer" };

  // One client who asked = transactional. A group send is marketing (CASL): consent + STOP.
  const group = input.recipients.length > 1;
  const { data: optOuts } = await admin.from("sms_opt_outs").select("phone").in("phone", input.recipients.map((r) => toE164(r.phone)).filter((p): p is string => Boolean(p)));
  const blocked = new Set((optOuts ?? []).map((o) => o.phone as string));
  const consented = group ? await consentedKeys(admin, ctx.shopId) : null;

  let sent = 0, skipped = 0;
  for (const r of input.recipients) {
    const phone = toE164(r.phone);
    const key = (r.email?.trim().toLowerCase()) || (phone?.replace(/\D/g, "")) || r.name.trim().toLowerCase();
    if (consented && !consented.has(key)) { skipped++; continue; }
    const token = randomBytes(9).toString("base64url");
    await admin.from("time_offer_links").insert({ token, offer_id: offer.id, client_name: r.name, client_phone: phone, client_email: r.email?.trim().toLowerCase() || null });
    const link = `${SITE_URL}/t/${token}`;
    const text = input.message.replaceAll("{first_name}", r.name.trim().split(/\s+/)[0] || "there").replaceAll("{link}", link);
    let ok = false;
    if (phone && twilioConfigured() && !blocked.has(phone)) {
      ok = !(await sendShopSms(ctx.shopId, phone, group ? `${text}\nReply STOP to opt out.` : text, { marketing: group })).error;
    }
    if (r.email) {
      const res = await sendAutopilotEmail(r.email, { shopName: shop.name as string, subject: `Open times at ${shop.name}`, text: text.replace(link, "").trim(), ctaLabel: "Pick a time", ctaUrl: link });
      ok = ok || !res.error;
    }
    if (ok) sent++; else skipped++;
  }
  return { sent, skipped };
}

/** Clients with express consent or a visit in the last 2 years (implied consent). */
async function consentedKeys(admin: ReturnType<typeof createAdminClient>, shopId: string) {
  const since = new Date(Date.now() - 730 * DAY).toISOString();
  const [{ data: appts }, { data: express }] = await Promise.all([
    admin.from("appointments").select("client_email, client_phone, client_name").eq("shop_id", shopId).eq("status", "completed").gte("starts_at", since).limit(20000),
    admin.from("clients").select("email, phone, full_name").eq("shop_id", shopId).eq("marketing_consent", "express"),
  ]);
  const keys = new Set<string>();
  const add = (e: string | null, p: string | null, n: string | null) => keys.add((e?.trim().toLowerCase()) || (toE164(p)?.replace(/\D/g, "")) || (n ?? "").trim().toLowerCase());
  for (const a of appts ?? []) add(a.client_email as string | null, a.client_phone as string | null, a.client_name as string | null);
  for (const c of express ?? []) add(c.email as string | null, c.phone as string | null, c.full_name as string | null);
  return keys;
}
