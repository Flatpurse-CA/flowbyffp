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

// Freezes the trial/grace clock — computeAccessStatus returns "paused" (full
// access, same as trialing) for as long as trial_paused_at is set. Unlike
// setTrialOverride this isn't permanent: resumeShopTrial below un-freezes it
// and preserves whatever time was left.
export async function pauseShopTrial(formData: FormData) {
  const { email } = await requireAdmin();
  const userId = formData.get("userId") as string;
  const admin = createAdminClient();
  await admin.from("shops").update({ trial_paused_at: new Date().toISOString() }).eq("owner_id", userId).is("trial_paused_at", null);
  await logAdminAction(email, "pause_shop_trial", "user", userId);
  revalidatePath("/admin/users", "page");
}

// Un-freezes a paused trial by shifting trial_started_at forward by exactly
// how long it was paused, so the shop resumes with the same remaining time
// it had at the moment it was paused — not reset to zero, not shortened.
export async function resumeShopTrial(formData: FormData) {
  const { email } = await requireAdmin();
  const userId = formData.get("userId") as string;
  const admin = createAdminClient();

  const { data: shop } = await admin.from("shops").select("trial_started_at, trial_paused_at").eq("owner_id", userId).maybeSingle();
  if (!shop?.trial_paused_at) return;

  const pausedMs = Date.now() - new Date(shop.trial_paused_at).getTime();
  const newStartedAt = new Date(new Date(shop.trial_started_at).getTime() + pausedMs);

  await admin.from("shops").update({ trial_started_at: newStartedAt.toISOString(), trial_paused_at: null }).eq("owner_id", userId);
  await logAdminAction(email, "resume_shop_trial", "user", userId);
  revalidatePath("/admin/users", "page");
}

// Adds (or removes, via a negative value) days to a shop's remaining
// trial+grace window by shifting trial_started_at — works whether the trial
// is currently running or paused, since the whole window (trial + grace) is
// always computed relative to this one anchor field.
export async function addTrialDays(formData: FormData) {
  const { email } = await requireAdmin();
  const userId = formData.get("userId") as string;
  const days = Number(formData.get("days"));
  if (!Number.isFinite(days) || days === 0) return;

  const admin = createAdminClient();
  const { data: shop } = await admin.from("shops").select("trial_started_at").eq("owner_id", userId).maybeSingle();
  if (!shop) return;

  const newStartedAt = new Date(new Date(shop.trial_started_at).getTime() + days * 24 * 60 * 60 * 1000);
  await admin.from("shops").update({ trial_started_at: newStartedAt.toISOString() }).eq("owner_id", userId);
  await logAdminAction(email, "add_trial_days", "user", userId, { days });
  revalidatePath("/admin/users", "page");
}

// Bulk action — restarts the trial+grace clock to start now for every shop
// on the platform (a currently-paused shop is left paused; an
// override/active-subscription shop is untouched behaviorally since
// computeAccessStatus ignores trial_started_at for those, but the field is
// still reset so it starts clean if the override/subscription is later
// removed).
export async function restartAllTrials() {
  const { email } = await requireAdmin();
  const admin = createAdminClient();
  const { data } = await admin.from("shops").update({ trial_started_at: new Date().toISOString() }).not("id", "is", null).select("id");
  await logAdminAction(email, "restart_all_trials", "shop", null, { count: data?.length ?? 0 });
  revalidatePath("/admin/users", "page");
}
