import Link from "next/link";
import { ChevronRight, Mail } from "lucide-react";
import { listEmailTemplates } from "./actions";

const T = {
  bg:      "var(--am1)",
  border:  "var(--aw09)",
  text:    "var(--atext2)",
  muted:   "var(--aw35)",
  dim:     "var(--aw18)",
  purple:  "rgb(139,92,246)",
};

export default async function EmailTemplatesPage() {
  const templates = await listEmailTemplates();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 style={{ color: T.text, fontSize: 22, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.03em" }}>
          Email Templates
        </h1>
        <p style={{ color: T.muted, fontSize: 13, margin: 0 }}>
          Subject, copy, and CTA button text for every transactional email FlatPurse Flow sends — booking, account, and staff notifications.
        </p>
      </div>

      <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden" }}>
        {templates.map((t, i) => (
          <Link
            key={t.key}
            href={`/admin/email-templates/${t.key}`}
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
              padding: "16px 18px",
              borderTop: i > 0 ? `1px solid ${T.border}` : "none",
              textDecoration: "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(139,92,246,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Mail size={15} color={T.purple} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <p style={{ color: T.text, fontSize: 13.5, fontWeight: 700, margin: 0 }}>{t.label}</p>
                  {t.isCustomized && (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20, color: "white", background: "rgb(124,58,237)" }}>
                      Edited
                    </span>
                  )}
                </div>
                <p style={{ color: T.muted, fontSize: 12, margin: "3px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {t.description}
                </p>
              </div>
            </div>
            <ChevronRight size={16} color={T.dim} style={{ flexShrink: 0 }} />
          </Link>
        ))}
      </div>
    </div>
  );
}
