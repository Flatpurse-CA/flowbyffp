import { createClient } from "@supabase/supabase-js";

// Service-role client — bypasses RLS. Server-only, never import from a Client Component.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}

// supabase-js's typed admin.listUsers() has no email filter, but the underlying
// Admin REST API does — used to guard against re-running generateLink({type:
// "signup"}) against an email that already has a *confirmed* account. Verified
// directly against this project: calling generateLink({type:"signup"}) on an
// already-confirmed user doesn't update that user, it deletes the row (cascading
// to profiles/shops/everything owned by it) and creates a brand-new unconfirmed
// one with a different id — silent, total, unrecoverable data loss. Every caller
// of generateLink({type:"signup"}) (createAccount, resendCode, choosePlan) must
// check this first and refuse instead of proceeding.
export async function isEmailAlreadyConfirmed(email: string): Promise<boolean> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/users?email=${encodeURIComponent(email)}`,
    {
      headers: {
        apikey: process.env.SUPABASE_SECRET_KEY!,
        Authorization: `Bearer ${process.env.SUPABASE_SECRET_KEY}`,
      },
    },
  );
  if (!res.ok) return false;
  const data = await res.json();
  const users = (data.users ?? []) as Array<{ email?: string; email_confirmed_at?: string | null }>;
  return users.some(u => u.email === email && Boolean(u.email_confirmed_at));
}
