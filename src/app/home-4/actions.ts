"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function requestDemo(
  name: string,
  email: string,
  business: string,
  phone: string,
  website: string,
  marketing: boolean,
): Promise<{ error: string | null }> {
  // Honeypot field — real visitors never fill this in. Pretend success so bots
  // don't learn it's being screened out.
  if (website.trim()) {
    return { error: null };
  }

  if (!name.trim() || !business.trim()) {
    return { error: "Please fill in your name and business name." };
  }
  if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Please enter a valid email address." };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("demo_requests").insert({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    business: business.trim(),
    phone: phone.trim() || null,
    marketing_opt_in: marketing,
  });

  if (error) {
    return { error: "We couldn't save your request. Please try again or email support@flatpurse.com." };
  }

  return { error: null };
}
