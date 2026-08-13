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
