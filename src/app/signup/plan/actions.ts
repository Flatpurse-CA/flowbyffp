"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOnboardingContext } from "@/lib/onboarding";
import { sendOtpEmail } from "@/lib/resend";

export async function choosePlan(formData: FormData) {
  const ctx = await getOnboardingContext();

  if (!ctx) {
    redirect("/signup");
  }

  const plan = formData.get("plan") as string;
  if (!plan) {
    redirect(`/signup/plan?error=${encodeURIComponent("Select a plan to continue")}`);
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("shops")
    .update({ plan })
    .eq("owner_id", ctx.userId);

  if (error) {
    redirect(`/signup/plan?error=${encodeURIComponent(error.message)}`);
  }

  // Verification is the last step of the wizard — send the OTP now, right before
  // handing off to /signup/verify, rather than back at account creation.
  const cookieStore = await cookies();
  const email = cookieStore.get("onboarding_email")?.value;

  if (email) {
    const { data: profile } = await admin
      .from("profiles")
      .select("first_name")
      .eq("id", ctx.userId)
      .maybeSingle();

    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: "signup",
      email,
      password: crypto.randomUUID(),
    });

    if (!linkError && linkData?.properties?.email_otp) {
      try {
        await sendOtpEmail(email, linkData.properties.email_otp, (profile?.first_name as string | undefined) ?? "there");
      } catch {
        // Non-fatal — the verify page's "Resend code" button can retry.
      }
    }
  }

  redirect("/signup/verify");
}
