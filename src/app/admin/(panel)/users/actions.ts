"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin, logAdminAction } from "@/lib/admin-guard";

export async function banUser(formData: FormData) {
  const { email } = await requireAdmin();
  const userId = formData.get("userId") as string;
  const admin = createAdminClient();
  await admin.auth.admin.updateUserById(userId, { ban_duration: "876600h" });
  await logAdminAction(email, "ban_user", "user", userId);
  revalidatePath("/admin/users", "page");
}

export async function unbanUser(formData: FormData) {
  const { email } = await requireAdmin();
  const userId = formData.get("userId") as string;
  const admin = createAdminClient();
  await admin.auth.admin.updateUserById(userId, { ban_duration: "none" });
  await logAdminAction(email, "unban_user", "user", userId);
  revalidatePath("/admin/users", "page");
}

export async function deleteUser(formData: FormData) {
  const { email } = await requireAdmin();
  const userId = formData.get("userId") as string;
  const admin = createAdminClient();
  await admin.auth.admin.deleteUser(userId);
  await logAdminAction(email, "delete_user", "user", userId);
  revalidatePath("/admin/users", "page");
}

export async function changeUserPlan(formData: FormData) {
  const { email } = await requireAdmin();
  const userId = formData.get("userId") as string;
  const plan   = formData.get("plan") as string;
  const admin = createAdminClient();
  await admin.from("shops").update({ plan }).eq("owner_id", userId);
  await logAdminAction(email, "change_user_plan", "user", userId, { plan });
  revalidatePath("/admin/users", "page");
}

// Resets the 7-day-trial + 7-day-grace clock to start now. Does not touch
// created_at (the real signup date, used for cohorts/joined-date display) —
// trial_started_at is a separate field precisely so this action doesn't
// distort that history.
export async function resetShopTrial(formData: FormData) {
  const { email } = await requireAdmin();
  const userId = formData.get("userId") as string;
  const admin = createAdminClient();
  await admin.from("shops").update({ trial_started_at: new Date().toISOString() }).eq("owner_id", userId);
  await logAdminAction(email, "reset_shop_trial", "user", userId);
  revalidatePath("/admin/users", "page");
}

// Permanently bypasses trial/grace gating for a shop (computeAccessStatus
// treats trial_override the same as an active paid subscription) — for
// comping an account, a VIP, or unblocking someone while a billing issue
// gets sorted out manually.
export async function setTrialOverride(formData: FormData) {
  const { email } = await requireAdmin();
  const userId = formData.get("userId") as string;
  const enabled = formData.get("enabled") === "true";
  const admin = createAdminClient();
  await admin.from("shops").update({ trial_override: enabled }).eq("owner_id", userId);
  await logAdminAction(email, enabled ? "enable_trial_override" : "disable_trial_override", "user", userId);
  revalidatePath("/admin/users", "page");
}
