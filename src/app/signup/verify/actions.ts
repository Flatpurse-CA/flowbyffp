"use server";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function verifyCode(email: string, token: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ email, token, type: "signup" });
  if (error) return { error: error.message };
  const cookieStore = await cookies();
  cookieStore.delete("onboarding_user_id");
  cookieStore.delete("onboarding_email");
  return {};
}

export async function resendCode(email: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.auth.resend({ type: "signup", email });
  if (error) return { error: error.message };
  return {};
}
