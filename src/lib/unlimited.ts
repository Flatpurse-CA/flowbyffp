import { createAdminClient } from "@/lib/supabase/admin";

// Applies an Unlimited grant an admin made before this user had a shop (see
// setUnlimited in admin/users/actions.ts). Called after the signup wizard
// writes the shop so the grant isn't lost or overwritten by the plan step.
export async function applyPendingUnlimited(userId: string): Promise<boolean> {
  const admin = createAdminClient();
  const { data } = await admin.auth.admin.getUserById(userId);
  if (!data.user?.app_metadata?.unlimited) return false;
  await admin.from("shops").update({ trial_override: true, plan: "enterprise" }).eq("owner_id", userId);
  return true;
}
