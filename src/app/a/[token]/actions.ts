"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit } from "@/lib/rateLimit";
import { getAvailableSlots } from "@/app/book/[handle]/actions";
import { POLICY_COLUMNS, amountFor, insideWindow, type Policy } from "@/lib/booking/policy";
import { chargeSavedCard } from "@/lib/booking/chargeFee";

const TZ = "America/Edmonton";
const DAY = 86_400_000;
const valid = (t: string) => /^[a-f0-9]{24}$/.test(t);

async function load(token: string) {
  const admin = createAdminClient();
  const { data: a } = await admin.from("appointments")
    .select("id, shop_id, customer_id, staff_id, service_name, starts_at, duration_minutes, price, status")
    .eq("manage_token", token).maybeSingle();
  if (!a) return null;
  const { data: shop } = await admin.from("shops").select(`stripe_account_id, stripe_connected, ${POLICY_COLUMNS}`).eq("id", a.shop_id).maybeSingle();
  return { admin, a, shop: shop as unknown as (Policy & { stripe_account_id: string | null; stripe_connected: boolean }) | null };
}

/** Client cancels from their link (FL-041). Inside the window the fee is charged to the saved card. */
export async function cancelByLink(token: string, acceptFee: boolean): Promise<{ error?: string; fee?: number; needsConsent?: boolean }> {
  if (!valid(token) || !await checkRateLimit(`manage:${token}`, 10, 10 * 60_000)) return { error: "Please try again later" };
  const r = await load(token);
  if (!r?.shop) return { error: "Booking not found" };
  const { admin, a, shop } = r;
  if (!["confirmed", "deposit", "pending"].includes(a.status as string)) return { error: "This booking can't be changed" };
  if (new Date(a.starts_at as string).getTime() < Date.now()) return { error: "This booking has already started" };
  const fee = insideWindow(a.starts_at as string, shop.cancel_window_hours) ? amountFor(shop.late_cancel_fee_mode, shop.late_cancel_fee_value, Number(a.price)) : 0;
  if (fee > 0 && !acceptFee) return { fee, needsConsent: true };
  if (fee > 0 && a.customer_id && shop.stripe_connected && shop.stripe_account_id) {
    const c = await chargeSavedCard(admin, { appointmentId: a.id as string, customerId: a.customer_id as string, stripeAccountId: shop.stripe_account_id, amount: fee, kind: "late_cancel", shopId: a.shop_id as string });
    if (c.error) return { error: `We couldn't charge the late-cancel fee: ${c.error}. Please contact the business.` };
  }
  await admin.from("appointments").update({ status: "cancelled", updated_at: new Date().toISOString() }).eq("id", a.id);
  return { fee };
}

export async function openTimesForLink(token: string): Promise<string[]> {
  if (!valid(token)) return [];
  const r = await load(token);
  if (!r) return [];
  const { data: svc } = await r.admin.from("services").select("id").eq("shop_id", r.a.shop_id).eq("name", r.a.service_name).maybeSingle();
  if (!svc) return [];
  const out: string[] = [];
  for (let d = 0; d < 14 && out.length < 12; d++) {
    const date = new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date(Date.now() + d * DAY));
    const s = await getAvailableSlots({ shopId: r.a.shop_id as string, serviceId: svc.id as string, staffId: (r.a.staff_id as string | null) ?? "any", date });
    out.push(...s.filter((x) => new Date(x).getTime() > Date.now() + 2 * 3_600_000).filter((_, i) => i % 2 === 0).slice(0, 2));
  }
  return out;
}

/** Move to a new time; only outside the window (inside it, the client must cancel or call). */
export async function rescheduleByLink(token: string, startsAt: string): Promise<{ error?: string }> {
  if (!valid(token) || !await checkRateLimit(`manage:${token}`, 10, 10 * 60_000)) return { error: "Please try again later" };
  const r = await load(token);
  if (!r?.shop) return { error: "Booking not found" };
  if (!["confirmed", "deposit", "pending"].includes(r.a.status as string)) return { error: "This booking can't be changed" };
  if (insideWindow(r.a.starts_at as string, r.shop.cancel_window_hours)) return { error: `Changes inside ${r.shop.cancel_window_hours} hours need a call to the business.` };
  const open = await openTimesForLink(token);
  if (!open.includes(startsAt)) return { error: "That time was just taken. Pick another." };
  await r.admin.from("appointments").update({ starts_at: startsAt, updated_at: new Date().toISOString() }).eq("id", r.a.id);
  return {};
}
