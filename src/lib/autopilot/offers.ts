import { randomBytes } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

const DAY = 24 * 60 * 60 * 1000;
const digits = (p: string | null | undefined) => (p ?? "").replace(/\D/g, "").slice(-10);

export const OFFER_DAYS = { winback: 14, birthday: 30 } as const;

export async function createOffer(admin: SupabaseClient, input: {
  shopId: string; flow: "winback" | "birthday"; percentOff: number; email: string | null; phone: string | null;
}): Promise<string> {
  const token = randomBytes(9).toString("base64url");
  await admin.from("client_offers").insert({
    shop_id: input.shopId, token, flow_key: input.flow, percent_off: input.percentOff,
    client_email: input.email?.trim().toLowerCase() || null, client_phone: input.phone || null,
    expires_at: new Date(Date.now() + OFFER_DAYS[input.flow] * DAY).toISOString(),
  });
  return token;
}

/**
 * Claims an offer for a booking about to be inserted. Only the client it was
 * sent to can use it (email or phone must match), once, before it expires.
 * Same shape as the referral discount so the booking code treats them alike.
 */
export async function claimOffer(admin: SupabaseClient, input: {
  shopId: string; token: string; email: string | null; phone: string | null; appointmentId: string; price: number;
}): Promise<{ amount: number; reason: string; release: () => Promise<void> } | null> {
  if (!/^[A-Za-z0-9_-]{8,32}$/.test(input.token) || input.price <= 0) return null;
  const { data: offer } = await admin.from("client_offers")
    .select("id, percent_off, client_email, client_phone, expires_at, used_at, flow_key")
    .eq("token", input.token).eq("shop_id", input.shopId).maybeSingle();
  if (!offer || offer.used_at || new Date(offer.expires_at as string).getTime() < Date.now()) return null;

  const emailOk = offer.client_email && input.email && offer.client_email === input.email.trim().toLowerCase();
  const phoneOk = offer.client_phone && input.phone && digits(offer.client_phone as string) === digits(input.phone);
  if (!emailOk && !phoneOk) return null;

  const { data: claimed } = await admin.from("client_offers")
    .update({ used_at: new Date().toISOString(), appointment_id: input.appointmentId })
    .eq("id", offer.id).is("used_at", null).select("id").maybeSingle();
  if (!claimed) return null;

  const amount = Math.round(input.price * Number(offer.percent_off)) / 100;
  return {
    amount,
    reason: `${offer.flow_key === "winback" ? "Win-back" : "Birthday"} offer ${Number(offer.percent_off)}% off`,
    release: async () => { await admin.from("client_offers").update({ used_at: null, appointment_id: null }).eq("id", offer.id); },
  };
}
