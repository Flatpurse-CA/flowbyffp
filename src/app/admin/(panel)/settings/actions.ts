"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { isAdmin, ROOT_ADMIN_EMAIL } from "@/lib/admin-guard";

const SETTINGS_PATH = "/admin/settings";

async function requireAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!(await isAdmin(data.user?.email))) redirect("/admin/login");
  return data.user!;
}

export async function addAdmin(formData: FormData) {
  const actingUser = await requireAdmin();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  if (!email) return;

  const admin = createAdminClient();
  await admin.from("admin_users").insert({ email, added_by: actingUser.email }).select();
  revalidatePath(SETTINGS_PATH);
}

export async function removeAdmin(formData: FormData) {
  await requireAdmin();
  const email = formData.get("email") as string;
  if (!email || email === ROOT_ADMIN_EMAIL) return;

  const admin = createAdminClient();
  await admin.from("admin_users").delete().eq("email", email);
  revalidatePath(SETTINGS_PATH);
}
