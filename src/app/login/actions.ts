"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRequestOrigin } from "@/lib/requestOrigin";
import { sendPasswordResetEmail } from "@/lib/resend";

export async function loginWithPassword(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/dashboard");
}

export async function requestPasswordReset(email: string): Promise<{ error?: string }> {
  const origin = await getRequestOrigin();
  const admin = createAdminClient();

  // Same pattern as staff invites and customer password resets: generate the link
  // ourselves and send it through Resend, rather than Supabase's own mailer (no
  // custom SMTP configured for this project, capped at 2 emails/hour).
  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "recovery",
    email: email.trim(),
  });
  if (linkError || !linkData) {
    // Don't leak whether the email exists — report success either way.
    return {};
  }

  const resetUrl = `${origin}/auth/confirm?token_hash=${linkData.properties.hashed_token}&type=recovery&next=${encodeURIComponent("/reset-password")}`;

  try {
    await sendPasswordResetEmail(email.trim(), { resetUrl });
  } catch {
    // Swallow — same reasoning as above, don't leak account existence via error state.
  }

  return {};
}

export async function setNewPassword(password: string): Promise<{ error?: string }> {
  if (password.length < 8) return { error: "Password must be at least 8 characters" };

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { error: "Your reset link has expired, request a new one" };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };
  return {};
}
