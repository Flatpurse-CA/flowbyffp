import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

export const FOUNDERS_TOTAL = 40;

/** Live Founders spots left (0 after the deadline), or null if it cannot be read. */
export async function getFoundersSpotsLeft(admin?: SupabaseClient): Promise<number | null> {
  try {
    const { data } = await (admin ?? createAdminClient()).from("founders_program").select("spots_remaining, deadline").eq("id", true).maybeSingle();
    const row = data as { spots_remaining?: number; deadline?: string } | null;
    if (typeof row?.spots_remaining !== "number") return null;
    if (row.deadline && new Date(row.deadline).getTime() < Date.now()) return 0;
    return Math.max(0, Math.min(FOUNDERS_TOTAL, row.spots_remaining));
  } catch {
    return null;
  }
}

/** A shop gets Founders prices if it already holds or claimed a spot, or spots are open. */
export async function foundersEligible(admin: SupabaseClient, shop: { is_founder?: boolean | null; founder_status?: string | null }): Promise<boolean> {
  if (shop.is_founder || shop.founder_status) return true;
  return ((await getFoundersSpotsLeft(admin)) ?? 0) > 0;
}
