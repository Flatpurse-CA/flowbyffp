import { getAuthUser, getShopContext } from "@/lib/dashboard/shop";
import { createAdminClient } from "@/lib/supabase/admin";

/** FL-013: record a sensitive action for the current shop. Never throws. */
export async function logShopAction(action: string, detail: Record<string, unknown> = {}): Promise<void> {
  try {
    const ctx = await getShopContext();
    if (!ctx) return;
    const user = await getAuthUser();
    await createAdminClient().from("shop_audit_log").insert({ shop_id: ctx.shopId, actor_id: user?.id ?? null, actor_role: ctx.role, action, detail });
  } catch { /* audit must not break the action */ }
}
