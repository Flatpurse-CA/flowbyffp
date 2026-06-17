"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const ONBOARDING_COOKIE_MAX_AGE = 60 * 30;

export async function createAccount(formData: FormData) {
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!firstName || !lastName || !email || !password) {
    redirect(`/signup?error=${encodeURIComponent("All fields are required")}`);
  }
  if (password.length < 8) {
    redirect(`/signup?error=${encodeURIComponent("Password must be at least 8 characters")}`);
  }

  const admin = createAdminClient();

  // Create user as already confirmed — no email required
  const { data: created, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { first_name: firstName, last_name: lastName },
  });

  if (error || !created.user) {
    redirect(`/signup?error=${encodeURIComponent(error?.message ?? "Could not create account")}`);
  }

  await admin
    .from("profiles")
    .upsert({ id: created.user.id, first_name: firstName, last_name: lastName });

  // Sign in immediately so the session is active for the rest of onboarding
  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

  if (signInError) {
    redirect(`/signup?error=${encodeURIComponent(signInError.message)}`);
  }

  // Keep a lightweight cookie so shop/plan steps can identify the user
  // even before the session is fully propagated
  const cookieStore = await cookies();
  cookieStore.set("onboarding_user_id", created.user.id, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: ONBOARDING_COOKIE_MAX_AGE,
  });

  redirect("/signup/shop");
}
