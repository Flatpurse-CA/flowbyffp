import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function getOnboardingContext() {
  const cookieStore = await cookies();
  const pendingUserId = cookieStore.get("onboarding_user_id")?.value;
  if (pendingUserId) {
    return { userId: pendingUserId, verified: false as const };
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (data.user) {
    return { userId: data.user.id, verified: true as const };
  }

  return null;
}
