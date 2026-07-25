"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin-guard";

async function requireAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!(await isAdmin(data.user?.email))) redirect("/admin/login");
}

export async function createFlag(formData: FormData) {
  await requireAdmin();
  const key = (formData.get("key") as string)?.trim();
  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  if (!key || !name) return;

  const admin = createAdminClient();
  await admin.from("feature_flags").insert({ key, name, description, enabled: false, rollout_pct: 100 });
  revalidatePath("/admin/feature-flags");
}

export async function toggleFlag(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const enabled = formData.get("enabled") === "true";
  const admin = createAdminClient();
  await admin.from("feature_flags").update({ enabled: !enabled, updated_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/admin/feature-flags");
}

export async function updateRollout(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const rolloutPct = Math.max(0, Math.min(100, Number(formData.get("rollout_pct"))));
  const admin = createAdminClient();
  await admin.from("feature_flags").update({ rollout_pct: rolloutPct, updated_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/admin/feature-flags");
}

export async function deleteFlag(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const admin = createAdminClient();
  await admin.from("feature_flags").delete().eq("id", id);
  revalidatePath("/admin/feature-flags");
}
