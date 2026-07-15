"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOnboardingContext } from "@/lib/onboarding";

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

  redirect("/onboarding");
}
