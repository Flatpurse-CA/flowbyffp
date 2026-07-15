"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendOtpEmail } from "@/lib/resend";

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

  // Create the user unconfirmed and get a numeric email OTP back in the same call,
  // rather than admin.createUser + Supabase's own mailer — that mailer has no custom
  // SMTP configured for this project and is capped at 2 emails/hour, so OTPs sent
  // through it were never reliably arriving. We send the OTP ourselves via Resend,
  // the same pattern already used for staff invites and password resets.
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
  const otp = linkData.properties?.email_otp;

  await admin
    .from("profiles")
    .upsert({ id: userId, first_name: firstName, last_name: lastName });

  if (otp) {
    const { error: emailError } = await sendOtpEmail(email, otp, firstName);
    if (emailError) {
      redirect(`/signup?error=${encodeURIComponent("Account created but the verification email failed to send — try again")}`);
    }
  }

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

  redirect("/signup/verify");
}
