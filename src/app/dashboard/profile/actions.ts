"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/dashboard/shop";

const PROFILE_PATH = "/dashboard/profile";

export async function updateOwnPassword(formData: FormData) {
  const user = await getAuthUser();
  if (!user) redirect("/login");

  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirm = formData.get("confirm") as string;

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
