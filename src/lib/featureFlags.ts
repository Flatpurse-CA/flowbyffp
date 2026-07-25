import { createAdminClient } from "@/lib/supabase/admin";

// Deterministic so the same subject (e.g. shopId) always lands on the same
// side of a percentage rollout instead of flapping between requests.
function hashToPct(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % 100;
}

/**
 * Real feature-flag check, not wired to gate anything yet — call this from
 * wherever a staged rollout is needed (e.g. `if (await isFeatureEnabled("new_thing", shopId))`).
 */
export async function isFeatureEnabled(key: string, subjectId?: string): Promise<boolean> {
  const admin = createAdminClient();
  const { data } = await admin.from("feature_flags").select("enabled, rollout_pct").eq("key", key).maybeSingle();
  if (!data || !data.enabled) return false;
  if (data.rollout_pct >= 100) return true;
  if (data.rollout_pct <= 0) return false;
  if (!subjectId) return false;
  return hashToPct(subjectId + key) < data.rollout_pct;
}
