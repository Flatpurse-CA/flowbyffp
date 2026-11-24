"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin, logAdminAction } from "@/lib/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * FL-079 "View as owner" (Spec 17): read-only, only with a support reason,
 * every use logged in the admin audit log AND the owner's own activity log.
 */
export async function startViewAsOwner(formData: FormData) {
  const { email } = await requireAdmin();
  const shopId = String(formData.get("shopId") ?? "");
  const userId = String(formData.get("userId") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  if (reason.length < 8) redirect(`/admin/users/${userId}?viewas=reason`);

  const admin = createAdminClient();
  const { data: log } = await admin.from("admin_audit_log")
    .insert({ admin_email: email, action: "view_as_owner", target_type: "shop", target_id: shopId, details: { reason } })
    .select("id").single();
  await admin.from("shop_audit_log").insert({ shop_id: shopId, actor_id: null, actor_role: "FlatPurse support", action: "support_view", detail: { reason } });
  if (!log) redirect(`/admin/users/${userId}?viewas=failed`);
  redirect(`/admin/view/${shopId}?s=${log.id}`);
}

/** Founders: hold a spot for an in-person tester from the day their test starts. */
export async function holdFounderSpot(formData: FormData) {
  const { email } = await requireAdmin();
  const shopId = String(formData.get("shopId") ?? "");
  const userId = String(formData.get("userId") ?? "");
  const { data, error } = await createAdminClient().rpc("hold_founder_spot", { p_shop: shopId });
  await logAdminAction(email, "hold_founder_spot", "shop", shopId, { ok: Boolean(data), error: error?.message ?? null });
  revalidatePath(`/admin/users/${userId}`);
  redirect(`/admin/users/${userId}?founders=${data ? "held" : "full"}`);
}
