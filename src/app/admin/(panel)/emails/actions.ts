"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { sendSequenceEmail } from "@/lib/email-sequence";
import { sendEmail } from "@/lib/resend";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const EMAILS_PATH = "/admin/emails";

export async function createSequenceEmail(formData: FormData) {
  const admin = createAdminClient();

  const { data: last } = await admin
    .from("email_sequences")
    .select("position")
    .order("position", { ascending: false })
    .limit(1)
    .single();

  await admin.from("email_sequences").insert({
    name:       formData.get("name") as string,
    subject:    formData.get("subject") as string,
    body:       formData.get("body") as string,
    delay_days: Number(formData.get("delay_days") ?? 0),
    position:   (last?.position ?? 0) + 1,
    is_active:  formData.get("is_active") === "true",
    updated_at: new Date().toISOString(),
  });

  revalidatePath(EMAILS_PATH);
  redirect(EMAILS_PATH);
}

export async function updateSequenceEmail(id: string, formData: FormData) {
  const admin = createAdminClient();

  await admin.from("email_sequences").update({
    name:       formData.get("name") as string,
    subject:    formData.get("subject") as string,
    body:       formData.get("body") as string,
    delay_days: Number(formData.get("delay_days") ?? 0),
    is_active:  formData.get("is_active") === "true",
    updated_at: new Date().toISOString(),
  }).eq("id", id);

  revalidatePath(EMAILS_PATH);
  redirect(EMAILS_PATH);
}

export async function toggleSequenceEmail(id: string, isActive: boolean) {
  const admin = createAdminClient();
  await admin.from("email_sequences").update({
    is_active: isActive,
    updated_at: new Date().toISOString(),
  }).eq("id", id);
  revalidatePath(EMAILS_PATH);
}

export async function deleteSequenceEmail(id: string) {
  const admin = createAdminClient();
  await admin.from("email_sequences").delete().eq("id", id);
  revalidatePath(EMAILS_PATH);
}

export async function triggerSendNow(sendId: string) {
  const { error } = await sendSequenceEmail(sendId);
  revalidatePath("/admin/emails/subscribers");
  return { error };
}

export async function sendBlast({
  subject,
  html,
  audience,
  sequenceId,
}: {
  subject: string;
  html: string;
  audience: "all" | "pending";
  sequenceId?: string;
}) {
  const admin = createAdminClient();

  let query = admin.from("waitlist").select("id, email, name").eq("status", "pending");

  if (audience === "pending" && sequenceId) {
    const { data: sent } = await admin
      .from("email_sends")
      .select("subscriber_id")
      .eq("sequence_id", sequenceId)
      .eq("status", "sent");

    const sentIds = (sent ?? []).map((r) => r.subscriber_id);
    if (sentIds.length) {
      query = query.not("id", "in", `(${sentIds.join(",")})`);
    }
  }

  const { data: subscribers } = await query;
  if (!subscribers?.length) return { sent: 0, errors: 0 };

  let sent = 0;
  let errors = 0;

  await Promise.all(
    subscribers.map(async (sub) => {
      const firstName = sub.name?.split(" ")[0] ?? "there";
      const personalised = html.replace(/\[First Name\]/g, firstName);
      try {
        await sendEmail({ to: sub.email, subject, html: personalised });
        sent++;
      } catch {
        errors++;
      }
    })
  );

  return { sent, errors };
}
