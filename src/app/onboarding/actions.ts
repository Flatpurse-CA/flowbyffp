"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getOnboardingContext } from "@/lib/onboarding";

const HANDLE_PATTERN = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

export async function checkHandleAvailability(
  handle: string,
): Promise<{ available: boolean; reason?: string }> {
  if (handle.length < 3) {
    return { available: false, reason: "Too short — use at least 3 characters." };
  }
  if (!HANDLE_PATTERN.test(handle) || handle.includes("--")) {
    return { available: false, reason: "Can't start, end with, or double up on a dash." };
  }

  const ctx = await getOnboardingContext();
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("shops")
    .select("owner_id")
    .eq("handle", handle)
    .maybeSingle();

  if (error) {
    // Migration adding the `handle` column hasn't been applied to this
    // Supabase project yet — fall back to format-only validation so the
    // step still works, same pattern as src/app/signup/shop/actions.ts.
    const isMissingColumn = error.message?.includes("column") || error.code === "42703";
    if (isMissingColumn) {
      return { available: true };
    }
    return { available: false, reason: "Couldn't check right now — try again." };
  }

  if (!data || data.owner_id === ctx?.userId) {
    return { available: true };
  }

  return { available: false, reason: "That handle is taken. Try another." };
}
