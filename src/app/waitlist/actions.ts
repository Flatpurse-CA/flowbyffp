"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function joinWaitlist(
  email: string,
  shopType: string,
  name?: string,
): Promise<{ error: string | null }> {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Please enter a valid email address." };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("waitlist").insert({
    email: email.trim().toLowerCase(),
    shop_type: shopType === "I run a..." ? null : shopType || null,
    name: name?.trim() || null,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "You're already on the waitlist." };
    }
    return { error: "Something went wrong. Please try again." };
  }

  return { error: null };
}
