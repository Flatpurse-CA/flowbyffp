"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin, logAdminAction } from "@/lib/admin-guard";

export async function createFlag(formData: FormData) {
  const { email } = await requireAdmin();
  const key = (formData.get("key") as string)?.trim();
  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  if (!key || !name) return;

  const admin = createAdminClient();
  await admin.from("feature_flags").insert({ key, name, description, enabled: false, rollout_pct: 100 });
  await logAdminAction(email, "create_feature_flag", "feature_flag", key, { name });
  revalidatePath("/admin/feature-flags");
}

export async function toggleFlag(formData: FormData) {
  const { email } = await requireAdmin();
  const id = formData.get("id") as string;
  const enabled = formData.get("enabled") === "true";
  const admin = createAdminClient();
  await admin.from("feature_flags").update({ enabled: !enabled, updated_at: new Date().toISOString() }).eq("id", id);
  await logAdminAction(email, "toggle_feature_flag", "feature_flag", id, { enabled: !enabled });
  revalidatePath("/admin/feature-flags");
}

export async function updateRollout(formData: FormData) {
  const { email } = await requireAdmin();
  const id = formData.get("id") as string;
  const rolloutPct = Math.max(0, Math.min(100, Number(formData.get("rollout_pct"))));
  const admin = createAdminClient();
  await admin.from("feature_flags").update({ rollout_pct: rolloutPct, updated_at: new Date().toISOString() }).eq("id", id);
  await logAdminAction(email, "update_feature_flag_rollout", "feature_flag", id, { rollout_pct: rolloutPct });
  revalidatePath("/admin/feature-flags");
}

export async function deleteFlag(formData: FormData) {
  const { email } = await requireAdmin();
  const id = formData.get("id") as string;
  const admin = createAdminClient();
  await admin.from("feature_flags").delete().eq("id", id);
  await logAdminAction(email, "delete_feature_flag", "feature_flag", id);
  revalidatePath("/admin/feature-flags");
}
