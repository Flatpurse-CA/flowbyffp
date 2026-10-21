import { randomBytes } from "node:crypto";
import type { createAdminClient } from "@/lib/supabase/admin";

// Client-to-client referrals inside one shop (migration 0049). A new client
// booking through a client's link gets the shop's reward off that booking;
// once that visit is completed, the referrer gets the same off their next one.

type Admin = ReturnType<typeof createAdminClient>;

export type BookingDiscount = {
  amount: number;
  reason: string;
  /** Undo the claim if the booking insert then fails. */
  release: () => Promise<void>;
};

/** Never discount more than half the service, so a booking can't reach $0. */
const cap = (reward: number, price: number) => Math.round(Math.min(reward, price / 2) * 100) / 100;

export async function getOrCreateReferralCode(admin: Admin, shopId: string, customerId: string): Promise<string> {
  const { data: existing } = await admin.from("client_referral_codes").select("code").eq("shop_id", shopId).eq("customer_id", customerId).maybeSingle();
  if (existing) return existing.code as string;
  for (let i = 0; i < 3; i++) {
    const code = randomBytes(5).toString("hex").toUpperCase();
    const { error } = await admin.from("client_referral_codes").insert({ shop_id: shopId, customer_id: customerId, code });
    if (!error) return code;
    // Lost a race with another tab: the row now exists.
    const { data: again } = await admin.from("client_referral_codes").select("code").eq("shop_id", shopId).eq("customer_id", customerId).maybeSingle();
    if (again) return again.code as string;
  }
  throw new Error("Couldn't create a referral code");
}

/**
 * Works out (and claims) any referral discount for a booking about to be
 * inserted with id `appointmentId`. Returns null when none applies.
 */
export async function claimBookingDiscount(admin: Admin, input: {
  shop: { id: string; client_referrals_enabled: boolean; client_referral_reward: number | string };
  customerId: string;
  appointmentId: string;
  price: number;
  refCode?: string | null;
}): Promise<BookingDiscount | null> {
  const { shop, customerId, appointmentId, price } = input;
  if (!shop.client_referrals_enabled || price <= 0) return null;

  // 1. This client earned a reward: a friend they referred has completed a visit.
  const { data: earned } = await admin
    .from("client_referrals")
    .select("id, reward, referred_appointment_id")
    .eq("shop_id", shop.id)
    .eq("referrer_customer_id", customerId)
    .is("referrer_reward_appointment_id", null)
    .order("created_at", { ascending: true });
  if (earned?.length) {
    const apptIds = earned.map(e => e.referred_appointment_id).filter((x): x is string => !!x);
    const { data: done } = apptIds.length
      ? await admin.from("appointments").select("id").in("id", apptIds).eq("status", "completed")
      : { data: [] as { id: string }[] };
    const doneIds = new Set((done ?? []).map(d => d.id as string));
    const ready = earned.find(e => e.referred_appointment_id && doneIds.has(e.referred_appointment_id as string));
    if (ready) {
      // Conditional update = atomic claim; a parallel booking can't spend it twice.
      const { data: claimed } = await admin
        .from("client_referrals")
        .update({ referrer_reward_appointment_id: appointmentId })
        .eq("id", ready.id)
        .is("referrer_reward_appointment_id", null)
        .select("id");
      if (claimed?.length) {
        return {
          amount: cap(Number(ready.reward), price),
          reason: "Referral reward: a friend you referred visited",
          release: async () => { await admin.from("client_referrals").update({ referrer_reward_appointment_id: null }).eq("id", ready.id); },
        };
      }
    }
  }

  // 2. A new client arriving through someone's link.
  if (!input.refCode) return null;
  const { data: owner } = await admin.from("client_referral_codes").select("customer_id").eq("shop_id", shop.id).eq("code", input.refCode.toUpperCase()).maybeSingle();
  if (!owner || owner.customer_id === customerId) return null;

  const { count } = await admin
    .from("appointments")
    .select("id", { count: "exact", head: true })
    .eq("shop_id", shop.id)
    .eq("customer_id", customerId)
    .neq("status", "cancelled");
  if ((count ?? 0) > 0) return null; // not a new client

  const reward = Number(shop.client_referral_reward);
  // unique (shop_id, referred_customer_id) makes this the one-per-friend guard.
  const { data: row, error } = await admin
    .from("client_referrals")
    .insert({ shop_id: shop.id, referrer_customer_id: owner.customer_id, referred_customer_id: customerId, referred_appointment_id: appointmentId, reward })
    .select("id")
    .single();
  if (error || !row) return null;

  return {
    amount: cap(reward, price),
    reason: "Referral discount: first visit",
    release: async () => { await admin.from("client_referrals").delete().eq("id", row.id); },
  };
}
