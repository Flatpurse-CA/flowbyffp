import { createClient } from "@/lib/supabase/server";

/**
 * FL-011: 2-step is optional for sign-in but required before exporting client
 * data or changing payout bank details. Returns an error message, or null when
 * the session is verified with a second factor (aal2).
 */
export async function requireTwoStep(): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (data?.currentLevel === "aal2") return null;
  return data?.nextLevel === "aal2"
    ? "Confirm your 2-step code in Settings > Security first."
    : "Turn on 2-step verification in Settings > Security first.";
}
