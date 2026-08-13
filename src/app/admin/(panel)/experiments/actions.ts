"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin, logAdminAction } from "@/lib/admin-guard";

export async function createExperiment(formData: FormData) {
  const { email } = await requireAdmin();
  const key = (formData.get("key") as string)?.trim();
  const name = (formData.get("name") as string)?.trim();
  const hypothesis = (formData.get("hypothesis") as string)?.trim() || null;
  const variantALabel = (formData.get("variant_a_label") as string)?.trim() || "Control";
  const variantBLabel = (formData.get("variant_b_label") as string)?.trim() || "Variant B";
  if (!key || !name) return;

  const admin = createAdminClient();

  // Every experiment is backed by a feature flag — created here so the admin
  // doesn't have to set one up separately first. Starts disabled/0% until the
  // experiment is actually started.
  await admin.from("feature_flags").upsert(
    { key, name: `Experiment: ${name}`, description: hypothesis, enabled: false, rollout_pct: 50 },
    { onConflict: "key" },
  );

  await admin.from("experiments").insert({
    key, name, hypothesis,
    variant_a_label: variantALabel, variant_b_label: variantBLabel,
    feature_flag_key: key,
    status: "draft",
  });

  await logAdminAction(email, "create_experiment", "experiment", key, { name });
  revalidatePath("/admin/experiments");
}

export async function startExperiment(formData: FormData) {
  const { email } = await requireAdmin();
  const id = formData.get("id") as string;
  const flagKey = formData.get("flagKey") as string;
  const admin = createAdminClient();

  await admin.from("experiments").update({ status: "running", started_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", id);
  await admin.from("feature_flags").update({ enabled: true }).eq("key", flagKey);
  await logAdminAction(email, "start_experiment", "experiment", id);
  revalidatePath("/admin/experiments");
}

export async function pauseExperiment(formData: FormData) {
  const { email } = await requireAdmin();
  const id = formData.get("id") as string;
  const flagKey = formData.get("flagKey") as string;
  const admin = createAdminClient();

  await admin.from("experiments").update({ status: "paused", updated_at: new Date().toISOString() }).eq("id", id);
  await admin.from("feature_flags").update({ enabled: false }).eq("key", flagKey);
  await logAdminAction(email, "pause_experiment", "experiment", id);
  revalidatePath("/admin/experiments");
}

export async function rolloutWinner(formData: FormData) {
  const { email } = await requireAdmin();
  const id = formData.get("id") as string;
  const flagKey = formData.get("flagKey") as string;
  const winner = formData.get("winner") as "a" | "b";
  const admin = createAdminClient();

  await admin.from("experiments").update({
    status: "completed", winner, ended_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  }).eq("id", id);

  // Roll the winning variant out to everyone: b wins -> 100% rollout, a wins -> 0% (flag stays enabled but nobody gets b).
  await admin.from("feature_flags").update({ rollout_pct: winner === "b" ? 100 : 0 }).eq("key", flagKey);
  await logAdminAction(email, "rollout_experiment_winner", "experiment", id, { winner });
  revalidatePath("/admin/experiments");
}

export async function archiveExperiment(formData: FormData) {
  const { email } = await requireAdmin();
  const id = formData.get("id") as string;
  const admin = createAdminClient();
  await admin.from("experiments").update({ status: "archived", updated_at: new Date().toISOString() }).eq("id", id);
  await logAdminAction(email, "archive_experiment", "experiment", id);
  revalidatePath("/admin/experiments");
}

export async function updateGuardrailThreshold(formData: FormData) {
  const { email } = await requireAdmin();
  const id = formData.get("id") as string;
  const threshold = Number(formData.get("threshold"));
  const admin = createAdminClient();
  await admin.from("guardrail_metrics").update({ threshold, updated_at: new Date().toISOString() }).eq("id", id);
  await logAdminAction(email, "update_guardrail_threshold", "guardrail_metric", id, { threshold });
  revalidatePath("/admin/experiments");
}
