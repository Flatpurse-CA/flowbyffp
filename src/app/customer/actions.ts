"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { sendPasswordResetEmail } from "@/lib/resend";
import { getRequestOrigin } from "@/lib/requestOrigin";

export async function customerSignup(input: { fullName: string; email: string; phone?: string; password: string }): Promise<{ error?: string }> {
  const fullName = input.fullName.trim();
  const email = input.email.trim();

  if (!fullName || !email || !input.password) return { error: "All fields are required" };
  if (input.password.length < 8) return { error: "Password must be at least 8 characters" };

  const admin = createAdminClient();

  // Pre-confirmed, same as owner signup — no verification email required.
  const { data: created, error } = await admin.auth.admin.createUser({
    email,
    password: input.password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (error || !created.user) return { error: error?.message ?? "Could not create account" };

  const phone = input.phone?.trim() || null;
  const { data: customerRow, error: insertError } = await admin
    .from("customers")
    .insert({ user_id: created.user.id, full_name: fullName, email, phone })
    .select("id")
    .single();
  if (insertError || !customerRow) return { error: insertError?.message ?? "Could not create account" };

  // Backfill: link any appointment already on file under this email/phone
  // (e.g. a walk-in a shop entered manually before this person had an
  // account) so it shows up in "My bookings" retroactively, instead of
  // being permanently orphaned from the account that now represents them.
  const orFilters = [`client_email.eq.${email}`, phone ? `client_phone.eq.${phone}` : null].filter(Boolean).join(",");
  await admin.from("appointments").update({ customer_id: customerRow.id }).is("customer_id", null).or(orFilters);

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password: input.password });
  if (signInError) return { error: signInError.message };

  return {};
}

export async function customerLogin(input: { email: string; password: string }): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: input.email, password: input.password });
  if (error) return { error: error.message };
  return {};
}

export async function customerRequestPasswordReset(email: string): Promise<{ error?: string }> {
  const origin = await getRequestOrigin();
  const admin = createAdminClient();

  // Matches the staff-invite pattern exactly (team/actions.ts's sendInvite): generate the
  // link ourselves and email it via Resend, rather than trusting Supabase's default
  // "Reset Password" template/redirect mechanics, which we haven't configured or verified.
  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "recovery",
    email: email.trim(),
  });
  if (linkError || !linkData) {
    // Don't leak whether the email exists — report success either way.
    return {};
  }

  const resetUrl = `${origin}/auth/confirm?token_hash=${linkData.properties.hashed_token}&type=recovery&next=${encodeURIComponent("/customer/reset-password")}`;

  try {
    await sendPasswordResetEmail(email.trim(), { resetUrl });
  } catch {
    // Swallow — same reasoning as booking confirmation: don't fail the caller over email delivery.
  }

  return {};
}

export async function customerSetNewPassword(password: string): Promise<{ error?: string }> {
  if (password.length < 8) return { error: "Password must be at least 8 characters" };

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { error: "Your reset link has expired, request a new one" };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };
  return {};
}

export async function customerLogout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/customer/login");
}
