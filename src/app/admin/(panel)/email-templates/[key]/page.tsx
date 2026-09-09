import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { EMAIL_TEMPLATE_INFO, type EmailTemplateKey } from "@/lib/resend";
import { getEmailTemplateForEdit } from "../actions";
import { EmailTemplateEditForm } from "./EmailTemplateEditForm";

function isTemplateKey(key: string): key is EmailTemplateKey {
  return key in EMAIL_TEMPLATE_INFO;
}

export default async function EditEmailTemplatePage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  if (!isTemplateKey(key)) notFound();

  const info = EMAIL_TEMPLATE_INFO[key];
  const { content, isDefault } = await getEmailTemplateForEdit(key);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 640 }}>
      <div>
        <Link href="/admin/email-templates" style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "var(--aw35)", fontSize: 12.5, textDecoration: "none", marginBottom: 10 }}>
          <ChevronLeft size={14} /> Email Templates
        </Link>
        <h1 style={{ color: "var(--atext2)", fontSize: 22, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.03em" }}>
          {info.label}
        </h1>
        <p style={{ color: "var(--aw35)", fontSize: 13, margin: 0 }}>{info.description}</p>
      </div>

      <EmailTemplateEditForm
        templateKey={key}
        info={info}
        initialContent={content}
        defaultContent={isDefault}
      />
    </div>
  );
}
