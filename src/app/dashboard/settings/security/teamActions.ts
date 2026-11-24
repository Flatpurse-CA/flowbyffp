"use server";

import { revalidatePath } from "next/cache";
import { getShopContext } from "@/lib/dashboard/shop";
import { createAdminClient } from "@/lib/supabase/admin";
import { logShopAction } from "@/lib/audit";

/** Owner sets team security: require 2-step for staff, and who may issue refunds. */
export async function saveTeamSecurity(formData: FormData) {
  const ctx = await getShopContext();
  if (!ctx || ctx.role !== "owner") throw new Error("Only the owner can change team security");
  const admin = createAdminClient();
  const require2fa = formData.get("require_team_2fa") === "on";
  await admin.from("shops").update({ require_team_2fa: require2fa }).eq("id", ctx.shopId);
  const refunders = new Set(formData.getAll("can_refund").map(String));
  const ids = formData.getAll("staff_id").map(String);
  for (const id of ids) {
    await admin.from("staff").update({ can_refund: refunders.has(id) }).eq("id", id).eq("shop_id", ctx.shopId);
  }
  await logShopAction("team_security_changed", { require_2fa: require2fa, refund_staff: refunders.size });
  revalidatePath("/dashboard/settings/security");
}
