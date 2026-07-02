import { createAdminClient } from "@/lib/supabase/admin";

// Root admin — always has access, cannot be removed via /admin/settings.
export const ROOT_ADMIN_EMAIL = "nnamdikbobi@gmail.com";

export async function isAdmin(email: string | undefined): Promise<boolean> {
  if (!email) return false;
  if (email === ROOT_ADMIN_EMAIL) return true;

  const admin = createAdminClient();
  const { data } = await admin
    .from("admin_users")
    .select("email")
    .eq("email", email)
    .maybeSingle();

  return !!data;
}
