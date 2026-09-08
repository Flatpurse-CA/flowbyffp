"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createAdminClient, isEmailAlreadyConfirmed } from "@/lib/supabase/admin";
import { validatePassword } from "@/lib/passwordPolicy";

const ONBOARDING_COOKIE_MAX_AGE = 60 * 30;

export async function createAccount(formData: FormData) {
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!firstName || !lastName || !email || !password) {
    redirect(`/signup?error=${encodeURIComponent("All fields are required")}`);
  }
  const passwordError = validatePassword(password);
  if (passwordError) {
    redirect(`/signup?error=${encodeURIComponent(passwordError)}`);
  }

  // generateLink({type:"signup"}) against an email that already has a confirmed
  // account doesn't update it — it deletes the account (and everything owned by
  // it: profile, shop, staff, appointments, all of it) and replaces it with a
  // blank unconfirmed one. Someone re-submitting this form for an email they
  // already have a real account under — most likely because they forgot and
  // meant to log in — must never be allowed to hit that path.
  if (await isEmailAlreadyConfirmed(email)) {
    redirect(`/login?error=${encodeURIComponent("You already have an account with this email — log in instead.")}`);
  }

  const admin = createAdminClient();

  // Create the user unconfirmed here; the OTP itself isn't sent until the end of
  // the wizard (signup/plan/actions.ts, after shop + plan) — verification is the
  // last step right before onboarding, not the first thing after this form.
  const { data: linkData, error } = await admin.auth.admin.generateLink({
    type: "signup",
    email,
    password,
    options: { data: { first_name: firstName, last_name: lastName } },
  });

  if (error || !linkData?.user) {
    redirect(`/signup?error=${encodeURIComponent(error?.message ?? "Could not create account")}`);
  }

  const userId = linkData.user.id;

  await admin
    .from("profiles")
    .upsert({ id: userId, first_name: firstName, last_name: lastName });

  // Pending (pre-verification) identity — shop/plan/verify steps read this via
  // getOnboardingContext() until the real session takes over after OTP verification.
  const cookieStore = await cookies();
  cookieStore.set("onboarding_user_id", userId, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: ONBOARDING_COOKIE_MAX_AGE,
  });
  cookieStore.set("onboarding_email", email, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: ONBOARDING_COOKIE_MAX_AGE,
  });

  redirect("/signup/shop");
}
