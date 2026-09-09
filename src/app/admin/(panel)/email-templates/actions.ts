"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin, logAdminAction } from "@/lib/admin-guard";
import {
  EMAIL_TEMPLATE_INFO,
  getDefaultEmailTemplate,
  previewEmailTemplate,
  sendTestEmailTemplate,
  type EmailTemplateKey,
  type EmailTemplateContent,
} from "@/lib/resend";

const BASE_PATH = "/admin/email-templates";

export type EmailTemplateListItem = {
  key: EmailTemplateKey;
  label: string;
  description: string;
  subject: string;
  isCustomized: boolean;
  updatedAt: string | null;
};

export async function listEmailTemplates(): Promise<EmailTemplateListItem[]> {
  await requireAdmin();
  const admin = createAdminClient();
  const { data } = await admin.from("email_templates").select("key, subject, updated_at");
  const rows = new Map((data ?? []).map(r => [r.key as string, r]));

  return (Object.keys(EMAIL_TEMPLATE_INFO) as EmailTemplateKey[]).map(key => {
    const info = EMAIL_TEMPLATE_INFO[key];
    const row = rows.get(key);
    const def = getDefaultEmailTemplate(key);
    return {
      key,
      label: info.label,
      description: info.description,
      subject: (row?.subject as string | undefined) ?? def.subject,
      isCustomized: !!row && row.subject !== def.subject, // cheap heuristic for the list badge; the edit page compares every field
      updatedAt: (row?.updated_at as string | undefined) ?? null,
    };
  });
}

export async function getEmailTemplateForEdit(key: EmailTemplateKey): Promise<{ content: EmailTemplateContent; isDefault: EmailTemplateContent }> {
  await requireAdmin();
  const admin = createAdminClient();
  const { data } = await admin.from("email_templates").select("subject, heading, body, cta_label").eq("key", key).maybeSingle();
  const def = getDefaultEmailTemplate(key);
  return { content: (data as EmailTemplateContent | null) ?? def, isDefault: def };
}

export async function saveEmailTemplate(key: EmailTemplateKey, input: { subject: string; heading: string; body: string; ctaLabel: string }): Promise<{ error?: string }> {
  const { email } = await requireAdmin();
  if (!input.subject.trim() || !input.heading.trim() || !input.body.trim()) {
    return { error: "Subject, heading, and body can't be empty" };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("email_templates").upsert({
    key,
    subject: input.subject.trim(),
    heading: input.heading.trim(),
    body: input.body.trim(),
    cta_label: input.ctaLabel.trim() || null,
    updated_at: new Date().toISOString(),
  });
  if (error) return { error: error.message };

  await logAdminAction(email, "update_email_template", "email_template", key, { subject: input.subject.trim() });
  revalidatePath(BASE_PATH);
  revalidatePath(`${BASE_PATH}/${key}`);
  return {};
}

export async function resetEmailTemplate(key: EmailTemplateKey): Promise<{ error?: string }> {
  const { email } = await requireAdmin();
  const def = getDefaultEmailTemplate(key);

  const admin = createAdminClient();
  const { error } = await admin.from("email_templates").upsert({
    key,
    subject: def.subject,
    heading: def.heading,
    body: def.body,
    cta_label: def.cta_label,
    updated_at: new Date().toISOString(),
  });
  if (error) return { error: error.message };

  await logAdminAction(email, "reset_email_template", "email_template", key, {});
  revalidatePath(BASE_PATH);
  revalidatePath(`${BASE_PATH}/${key}`);
  return {};
}

export async function previewEmailTemplateAction(key: EmailTemplateKey): Promise<{ subject: string; html: string }> {
  await requireAdmin();
  return previewEmailTemplate(key);
}

export async function sendEmailTemplateTest(key: EmailTemplateKey, to: string): Promise<{ error?: string }> {
  const { email } = await requireAdmin();
  const trimmed = to.trim();
  if (!trimmed) return { error: "Enter an email address" };

  const { error } = await sendTestEmailTemplate(key, trimmed);
  if (error) return { error: error.message };

  await logAdminAction(email, "send_test_email", "email_template", key, { to: trimmed });
  return {};
}
