"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { cancelDeletion, scheduleDeletion, sendDeletionCode } from "./actions";

// Plain link (not next/link): it downloads a file.
const EXPORT_HREF = "/api/account/export";

const wrap: React.CSSProperties = { width: "100%", maxWidth: 520, margin: "40px auto", padding: "0 16px", display: "flex", flexDirection: "column", gap: 14 };
const p: React.CSSProperties = { color: "var(--dw45)", fontSize: 14, lineHeight: 1.6, margin: 0 };
const btn: React.CSSProperties = { border: "none", borderRadius: 10, padding: "13px 0", fontSize: 14.5, fontWeight: 700, cursor: "pointer", width: "100%", color: "#fff", background: "rgb(185,28,28)" };
const input: React.CSSProperties = { width: "100%", boxSizing: "border-box", background: "var(--dsurface1)", border: "1px solid var(--dsurface3)", borderRadius: 10, padding: "11px 12px", color: "var(--dtext)", fontSize: 14 };
const fmt = (iso: string) => new Date(iso).toLocaleDateString("en-CA", { month: "long", day: "numeric", year: "numeric" });

/** Account deletion (FL-069): never blocked by offers; type name + emailed code; 30-day grace. */
export function DeleteAccount({ businessName, scheduledAt }: { businessName: string; scheduledAt: string | null }) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [scheduled, setScheduled] = useState<string | null>(scheduledAt ? fmt(scheduledAt) : null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (scheduled) {
    return (
      <div style={wrap}>
        <h1 style={{ color: "var(--dtext)", fontSize: 22, margin: 0 }}>Your account will be deleted on {scheduled}</h1>
        <p style={p}>Your booking page and AutoPilot are off. You can still download your data or cancel the deletion until then.</p>
        <a href={EXPORT_HREF} download style={{ color: "var(--dpurple-text)", fontSize: 14 }}>Download my data (ZIP)</a>
        <button type="button" disabled={pending} style={{ ...btn, background: "rgb(109,40,217)" }} onClick={() => start(async () => { const r = await cancelDeletion(); if (r.error) setError(r.error); else setScheduled(null); })}>Cancel deletion</button>
        {error && <p style={{ ...p, color: "rgb(220,38,38)" }}>{error}</p>}
      </div>
    );
  }

  return (
    <div style={wrap}>
      <h1 style={{ color: "var(--dtext)", fontSize: 22, margin: 0 }}>Delete account</h1>
      <p style={{ ...p, color: "var(--dtext)" }}>This permanently deletes {businessName}&apos;s clients, appointments, staff, messages, AutoPilot and AI logs, and settings, 30 days from now. Your subscription is cancelled right away, so there are no more charges. Tax records are kept for 6 years and signed intake forms for 7 years, as the law requires, then deleted.</p>
      <p style={p}>We keep only what the law requires, such as financial and tax records. Stripe keeps its own payment records.</p>
      <p style={p}>Just need a break? <Link href="/dashboard/settings/cancel" style={{ color: "var(--dpurple-text)" }}>Pause instead.</Link></p>
      <a href={EXPORT_HREF} download style={{ color: "var(--dpurple-text)", fontSize: 14, fontWeight: 600 }}>Download my data first (ZIP of CSVs)</a>

      <label style={p}>Type <strong style={{ color: "var(--dtext)" }}>{businessName}</strong> to confirm
        <input value={name} onChange={(e) => setName(e.target.value)} style={{ ...input, marginTop: 6 }} autoComplete="off" />
      </label>
      {!codeSent ? (
        <button type="button" disabled={pending || name.trim().toLowerCase() !== businessName.trim().toLowerCase()} style={{ ...btn, opacity: name.trim().toLowerCase() === businessName.trim().toLowerCase() ? 1 : 0.5 }}
          onClick={() => start(async () => { const r = await sendDeletionCode(); if (r.error) setError(r.error); else setCodeSent(true); })}>
          {pending ? "Sending..." : "Email me a code"}
        </button>
      ) : (
        <>
          <label style={p}>Enter the 6-digit code we emailed you
            <input value={code} onChange={(e) => setCode(e.target.value)} inputMode="numeric" maxLength={6} style={{ ...input, marginTop: 6 }} />
          </label>
          <button type="button" disabled={pending || code.length !== 6} style={btn}
            onClick={() => start(async () => { const r = await scheduleDeletion({ businessName: name, code }); if (r.error) setError(r.error); else setScheduled(r.date ?? null); })}>
            {pending ? "Deleting..." : "Delete my account"}
          </button>
        </>
      )}
      {error && <p style={{ ...p, color: "rgb(220,38,38)" }}>{error}</p>}
    </div>
  );
}
