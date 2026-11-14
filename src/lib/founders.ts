import { createAdminClient } from "@/lib/supabase/admin";

export const FOUNDERS_TOTAL = 40;

/** Live Founders Beta spots left (founders_program.spots_remaining), or null if it cannot be read. */
export async function getFoundersSpotsLeft(): Promise<number | null> {
  try {
    const { data } = await createAdminClient().from("founders_program").select("spots_remaining").eq("id", true).maybeSingle();
    const n = (data as { spots_remaining?: number } | null)?.spots_remaining;
    return typeof n === "number" ? Math.max(0, Math.min(FOUNDERS_TOTAL, n)) : null;
  } catch {
    return null;
  }
}
