"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOnboardingContext } from "@/lib/onboarding";
import { requireShop } from "@/lib/dashboard/shop";

const HANDLE_PATTERN = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

export async function checkHandleAvailability(
  handle: string,
): Promise<{ available: boolean; reason?: string }> {
  if (handle.length < 3) {
    return { available: false, reason: "Too short, use at least 3 characters." };
  }
  if (!HANDLE_PATTERN.test(handle) || handle.includes("--")) {
    return { available: false, reason: "Can't start, end with, or double up on a dash." };
  }

  const ctx = await getOnboardingContext();
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("shops")
    .select("owner_id")
    .eq("handle", handle)
    .maybeSingle();

  if (error) {
    // Migration adding the `handle` column hasn't been applied to this
    // Supabase project yet — fall back to format-only validation so the
    // step still works, same pattern as src/app/signup/shop/actions.ts.
    const isMissingColumn = error.message?.includes("column") || error.code === "42703";
    if (isMissingColumn) {
      return { available: true };
    }
    return { available: false, reason: "Couldn't check right now, try again." };
  }

  if (!data || data.owner_id === ctx?.userId) {
    return { available: true };
  }

  return { available: false, reason: "That handle is taken. Try another." };
}

export async function claimHandle(handle: string): Promise<{ error?: string }> {
  const check = await checkHandleAvailability(handle);
  if (!check.available) return { error: check.reason ?? "That handle isn't available" };

  const { supabase, shopId } = await requireShop();
  const { error } = await supabase.from("shops").update({ handle }).eq("id", shopId);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/settings");
  return {};
}

export async function saveOnboardingServices(items: { name: string; price: number }[]): Promise<{ error?: string }> {
  if (items.length === 0) return {};
  const { supabase, shopId } = await requireShop();
  const rows = items.map(s => ({ shop_id: shopId, name: s.name, price: s.price, duration_minutes: 30, category: null }));
  const { error } = await supabase.from("services").insert(rows);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/services");
  return {};
}

export async function saveOnboardingTeam(members: { name: string; role: string }[]): Promise<{ error?: string }> {
  const extra = members.filter(m => m.role !== "Owner");
  if (extra.length === 0) return {};

  const { supabase, shopId } = await requireShop();
  const PALETTE = ["rgb(139,92,246)", "rgb(239,68,68)", "rgb(16,185,129)", "rgb(251,191,36)", "rgb(96,165,250)", "rgb(251,146,60)"];
  const rows = extra.map((m, i) => ({ shop_id: shopId, full_name: m.name, role: null, color: PALETTE[i % PALETTE.length] }));
  const { error } = await supabase.from("staff").insert(rows);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/team");
  return {};
}

// Same flow-id -> column mapping as FLOW_COLUMN in dashboard/settings/actions.ts.
// Onboarding's "react" (30-day reactivation) is that screen's "winback".
const ONBOARDING_FLOW_COLUMN: Record<string, string> = {
  noshow: "noshow_recovery_enabled",
  react: "winback_enabled",
  filler: "filler_enabled",
  frontdesk: "frontdesk_enabled",
  birthday: "birthday_enabled",
};

export async function saveOnboardingFlows(flows: { id: string; on: boolean }[]): Promise<{ error?: string }> {
  const { supabase, shopId } = await requireShop();
  const update: Record<string, boolean> = {};
  for (const f of flows) {
    const column = ONBOARDING_FLOW_COLUMN[f.id];
    if (column) update[column] = f.on;
  }
  if (Object.keys(update).length === 0) return {};

  const { error } = await supabase.from("shops").update(update).eq("id", shopId);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/autopilot");
  return {};
}
