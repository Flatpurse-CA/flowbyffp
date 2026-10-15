"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export type DemoFunnelInput = {
  name: string;
  email: string;
  business: string;
  phone: string;
  website: string;
  marketing: boolean;
  businessType: string;
  teamSize: string;
  bookingMethod: string;
};

export async function submitDemoFunnel(input: DemoFunnelInput): Promise<{ error: string | null }> {
  // Honeypot field: real visitors never fill this in. Pretend success so bots
  // don't learn it's being screened out.
  if (input.website.trim()) {
    return { error: null };
  }

  if (!input.name.trim() || !input.business.trim()) {
    return { error: "Please fill in your name and business name." };
  }
  if (!input.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    return { error: "Please enter a valid email address." };
  }

  if (!await checkRateLimit(`demo-ip:${await getClientIp()}`, 5, 60 * 60 * 1000)) {
    return { error: "Too many attempts, wait a few minutes and try again." };
  }

  const base = {
    name: input.name.trim().slice(0, 100),
    email: input.email.trim().toLowerCase().slice(0, 254),
    business: input.business.trim().slice(0, 150),
    phone: input.phone.trim().slice(0, 40) || null,
    marketing_opt_in: input.marketing,
  };
  const answers = {
    business_type: input.businessType.slice(0, 60) || null,
    team_size: input.teamSize.slice(0, 60) || null,
    booking_method: input.bookingMethod.slice(0, 60) || null,
  };

  const admin = createAdminClient();
  let { error } = await admin.from("demo_requests").insert({ ...base, ...answers });

  // Until 0044_demo_request_answers.sql is applied the answer columns don't
  // exist. Keep the lead rather than losing it over the extra answers.
  if (error && (error.code === "PGRST204" || error.code === "42703")) {
    ({ error } = await admin.from("demo_requests").insert(base));
  }

  if (error) {
    return { error: "We couldn't save your details. Please try again or email support@flatpurse.com." };
  }

  return { error: null };
}
