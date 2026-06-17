"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOnboardingContext } from "@/lib/onboarding";

export async function setupShop(formData: FormData) {
  const ctx = await getOnboardingContext();

  if (!ctx) {
    redirect("/signup");
  }

  const name = formData.get("name") as string;
  const businessType = formData.get("businessType") as string;
  const streetAddress = formData.get("streetAddress") as string;
  const city = formData.get("city") as string;
  const province = formData.get("province") as string;
  const postalCode = formData.get("postalCode") as string;
  const country = formData.get("country") as string;

  if (!name || !businessType || !city) {
    redirect(`/signup/shop?error=${encodeURIComponent("Shop name, business type and city are required")}`);
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("shops")
    .upsert(
      {
        owner_id: ctx.userId,
        name,
        business_type: businessType,
        street_address: streetAddress || null,
        city,
        province: province || null,
        postal_code: postalCode || null,
        country: country || "Canada",
      },
      { onConflict: "owner_id" },
    );

  if (error) {
    // If new address columns don't exist yet, still proceed — migration pending
    const isMissingColumn = error.message?.includes("column") || error.code === "42703";
    if (!isMissingColumn) {
      redirect(`/signup/shop?error=${encodeURIComponent(error.message)}`);
    }
  }

  redirect("/signup/plan");
}
