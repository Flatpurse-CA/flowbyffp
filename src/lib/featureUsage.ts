import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Fire-and-forget usage log. Call from a page/action right after confirming a
 * shop actually loaded/used a feature (e.g. Flow Coach page view). Never
 * throws — a logging failure shouldn't break the page that triggered it.
 */
export async function logFeatureUsage(featureKey: string, shopId: string): Promise<void> {
  try {
    const admin = createAdminClient();
    await admin.from("feature_usage_events").insert({ feature_key: featureKey, shop_id: shopId });
  } catch {
    // Non-fatal — usage tracking should never block the page it's measuring.
  }
}
