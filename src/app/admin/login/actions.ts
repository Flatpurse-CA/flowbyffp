"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin-guard";

export async function adminLogin(formData: FormData) {
  const email    = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/admin/login?error=${encodeURIComponent(error.message)}`);
  }

  const { data } = await supabase.auth.getUser();
  if (!(await isAdmin(data.user?.email))) {
    await supabase.auth.signOut();
    redirect("/admin/login?error=Access+denied");
  }

  redirect("/admin");
}
