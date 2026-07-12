"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

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

  const { error: insertError } = await admin.from("customers").insert({
    user_id: created.user.id,
    full_name: fullName,
    email,
    phone: input.phone?.trim() || null,
  });
  if (insertError) return { error: insertError.message };

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

export async function customerLogout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/customer/login");
}
