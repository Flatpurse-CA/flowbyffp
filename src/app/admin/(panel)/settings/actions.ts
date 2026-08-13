"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin, logAdminAction, ROOT_ADMIN_EMAIL } from "@/lib/admin-guard";

const SETTINGS_PATH = "/admin/settings";

export async function addAdmin(formData: FormData) {
  const { email: actingEmail } = await requireAdmin();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  if (!email) return;

  const admin = createAdminClient();
  await admin.from("admin_users").insert({ email, added_by: actingEmail }).select();
  await logAdminAction(actingEmail, "add_admin", "admin_user", email);
  revalidatePath(SETTINGS_PATH);
}

export async function removeAdmin(formData: FormData) {
  const { email: actingEmail } = await requireAdmin();
  const email = formData.get("email") as string;
  if (!email || email === ROOT_ADMIN_EMAIL) return;

  const admin = createAdminClient();
  await admin.from("admin_users").delete().eq("email", email);
  await logAdminAction(actingEmail, "remove_admin", "admin_user", email);
  revalidatePath(SETTINGS_PATH);
}
