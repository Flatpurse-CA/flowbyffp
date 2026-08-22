"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin, logAdminAction } from "@/lib/admin-guard";
import { validatePassword } from "@/lib/passwordPolicy";

const PROFILE_PATH = "/admin/profile";

export async function updateAdminPassword(formData: FormData) {
  const { email } = await requireAdmin();
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirm  = formData.get("confirm") as string;

  const passwordError = !password ? "Password is required" : validatePassword(password);
  if (passwordError) {
    redirect(`${PROFILE_PATH}?error=${encodeURIComponent(passwordError)}`);
  }
  if (password !== confirm) {
    redirect(`${PROFILE_PATH}?error=${encodeURIComponent("Passwords don't match")}`);
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    redirect(`${PROFILE_PATH}?error=${encodeURIComponent(error.message)}`);
  }

  await logAdminAction(email, "update_own_password", "admin_user", email);
  redirect(`${PROFILE_PATH}?success=1`);
}
