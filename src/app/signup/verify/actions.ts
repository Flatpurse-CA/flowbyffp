"use server";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendOtpEmail } from "@/lib/resend";
import { checkRateLimit } from "@/lib/rateLimit";

export async function verifyCode(email: string, token: string): Promise<{ error?: string }> {
  if (!checkRateLimit(`verify-otp:${email.toLowerCase()}`, 8, 10 * 60 * 1000)) {
    return { error: "Too many attempts — wait a few minutes and try again" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ email, token, type: "signup" });
  if (error) return { error: error.message };
  const cookieStore = await cookies();
  cookieStore.delete("onboarding_user_id");
  cookieStore.delete("onboarding_email");
  return {};
}

export async function resendCode(email: string): Promise<{ error?: string }> {
  if (!checkRateLimit(`resend-otp:${email.toLowerCase()}`, 3, 10 * 60 * 1000)) {
    return { error: "Too many resend attempts — wait a few minutes and try again" };
  }

  // Regenerate via the admin API + send through Resend, same as the initial send in
  // signup/actions.ts — supabase.auth.resend() relies on Supabase's own mailer, which
  // has no custom SMTP configured for this project and is capped at 2 emails/hour.
  // The password param is required by generateLink's signup type but is only used at
  // initial account creation — passing a throwaway value here does not touch the
  // user's real password (verified directly against the Supabase auth API).
  const admin = createAdminClient();

  const { data: linkData, error } = await admin.auth.admin.generateLink({
    type: "signup",
    email,
    password: crypto.randomUUID(),
  });

  if (error || !linkData?.properties?.email_otp) {
    return { error: error?.message ?? "Couldn't resend the code" };
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("first_name")
    .eq("id", linkData.user.id)
    .maybeSingle();

  try {
    const { error: emailError } = await sendOtpEmail(email, linkData.properties.email_otp, (profile?.first_name as string | undefined) ?? "there");
    if (emailError) return { error: "Couldn't send the email, try again" };
  } catch {
    return { error: "Couldn't send the email, try again" };
  }
  return {};
}
