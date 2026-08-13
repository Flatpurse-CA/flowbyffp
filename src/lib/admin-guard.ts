import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

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

// Shared guard for every admin server action — was previously duplicated
// locally in each admin/*/actions.ts file, which meant the calling admin's
// identity was checked but then discarded, so mutations couldn't be
// attributed to anyone. Returning the email lets every action log itself
// via logAdminAction() below.
export async function requireAdmin(): Promise<{ email: string }> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const email = data.user?.email;
  if (!(await isAdmin(email))) redirect("/admin/login");
  return { email: email! };
}

// Records a mutating admin action for the audit log (see
// 0035_admin_audit_log.sql). Fire-and-forget by design: a logging failure
// must never block the actual admin action from completing.
export async function logAdminAction(
  adminEmail: string,
  action: string,
  targetType: string,
  targetId?: string | null,
  details?: Record<string, unknown>,
): Promise<void> {
  try {
    const admin = createAdminClient();
    await admin.from("admin_audit_log").insert({
      admin_email: adminEmail,
      action,
      target_type: targetType,
      target_id: targetId ?? null,
      details: details ?? null,
    });
  } catch {
    // Never let audit logging break the actual admin action.
  }
}
