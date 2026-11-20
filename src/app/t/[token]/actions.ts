"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit } from "@/lib/rateLimit";
import { getAvailableSlots } from "@/app/book/[handle]/actions";
import { sendSms, twilioConfigured } from "@/lib/twilio";

const TZ = "America/Edmonton";
const DAY = 24 * 60 * 60 * 1000;
const fmt = (iso: string) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ, weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(iso));

export type TapResult = { status: "booked" | "taken" | "expired" | "invalid" | "error"; startsAt?: string; mine?: boolean; nextTimes?: string[] };

/** Next open times for the same service/staff, shown when a tapped time is gone. */
export async function nextOpenTimes(token: string): Promise<string[]> {
  const admin = createAdminClient();
  const { data: link } = await admin.from("time_offer_links").select("offer_id").eq("token", token).maybeSingle();
  if (!link) return [];
  const { data: offer } = await admin.from("time_offers").select("shop_id, service_id, staff_id").eq("id", link.offer_id).maybeSingle();
  if (!offer) return [];
  const out: string[] = [];
  for (let d = 0; d < 10 && out.length < 3; d++) {
    const date = new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date(Date.now() + d * DAY));
    const slots = await getAvailableSlots({ shopId: offer.shop_id as string, serviceId: offer.service_id as string, staffId: (offer.staff_id as string | null) ?? "any", date });
    out.push(...slots.filter((s) => new Date(s).getTime() > Date.now() + 60 * 60 * 1000).slice(0, 1));
  }
  return out;
}

/** One tap: live check + lock in the database, then confirm by text. */
export async function tapToBook(token: string, slot: string): Promise<TapResult> {
  if (!/^[A-Za-z0-9_-]{8,32}$/.test(token)) return { status: "invalid" };
  if (!await checkRateLimit(`tap-book:${token}`, 10, 10 * 60 * 1000)) return { status: "error" };
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("book_time_offer", { p_token: token, p_slot: slot });
  if (error || !data) return { status: "error" };
  const r = data as { status: TapResult["status"]; starts_at?: string; mine?: boolean };

  if (r.status === "booked" && r.mine && r.starts_at) {
    const { data: link } = await admin.from("time_offer_links").select("client_phone, offer_id").eq("token", token).maybeSingle();
    const { data: offer } = link ? await admin.from("time_offers").select("shops(name)").eq("id", link.offer_id).maybeSingle() : { data: null };
    const shopName = (offer?.shops as { name?: string } | null)?.name ?? "the salon";
    if (link?.client_phone && twilioConfigured()) await sendSms(link.client_phone as string, `You're booked at ${shopName} for ${fmt(r.starts_at)}. See you then!`);
  }
  const nextTimes = r.status === "taken" || (r.status === "booked" && !r.mine) ? await nextOpenTimes(token) : undefined;
  return { status: r.status, startsAt: r.starts_at, mine: r.mine, nextTimes };
}
