"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRequestOrigin } from "@/lib/requestOrigin";
import { sendPasswordResetEmail } from "@/lib/resend";
import { checkRateLimit } from "@/lib/rateLimit";
import { validatePassword } from "@/lib/passwordPolicy";

export async function loginWithPassword(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!checkRateLimit(`login:${email.toLowerCase()}`, 10, 10 * 60 * 1000)) {
    redirect(`/login?error=${encodeURIComponent("Too many attempts — wait a few minutes and try again")}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/dashboard");
}

export async function requestPasswordReset(email: string): Promise<{ error?: string }> {
  if (!checkRateLimit(`reset-request:${email.trim().toLowerCase()}`, 3, 10 * 60 * 1000)) {
    // Same "don't leak account state" reasoning as below — report success either way.
    return {};
  }

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
  const passwordError = validatePassword(password);
  if (passwordError) return { error: passwordError };

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { error: "Your reset link has expired, request a new one" };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };
  return {};
}
