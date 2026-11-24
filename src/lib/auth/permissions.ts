import { createAdminClient } from "@/lib/supabase/admin";
import type { ShopContext } from "@/lib/dashboard/shop";

/** Refunds: always the owner; staff only when the owner granted can_refund. */
export async function canRefund(ctx: ShopContext | null): Promise<boolean> {
  if (!ctx) return false;
  if (ctx.role === "owner") return true;
  if (!ctx.staffId) return false;
  const { data } = await createAdminClient().from("staff").select("can_refund").eq("id", ctx.staffId).eq("shop_id", ctx.shopId).maybeSingle();
  return Boolean(data?.can_refund);
}
