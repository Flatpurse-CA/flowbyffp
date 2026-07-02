"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin-guard";

const PROFILE_PATH = "/admin/profile";

export async function updateAdminPassword(formData: FormData) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!(await isAdmin(data.user?.email))) redirect("/admin/login");

  const password = formData.get("password") as string;
  const confirm  = formData.get("confirm") as string;

  if (!password || password.length < 8) {
    redirect(`${PROFILE_PATH}?error=${encodeURIComponent("Password must be at least 8 characters")}`);
  }
  if (password !== confirm) {
    redirect(`${PROFILE_PATH}?error=${encodeURIComponent("Passwords don't match")}`);
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    redirect(`${PROFILE_PATH}?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`${PROFILE_PATH}?success=1`);
}
