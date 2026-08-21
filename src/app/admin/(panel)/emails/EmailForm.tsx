"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSequenceEmail, updateSequenceEmail } from "./actions";

const T = {
  bg:      "var(--am1)",
  bg2:     "var(--am2)",
  border:  "var(--aw09)",
  text:    "var(--atext2)",
  muted:   "var(--aw35)",
  dim:     "var(--aw18)",
  purple:  "rgb(139,92,246)",
  input:   "var(--aw05)",
};

const inputStyle: React.CSSProperties = {
  width: "100%", boxSizing: "border-box",
  padding: "11px 14px",
  background: T.input,
  border: `1px solid ${T.border}`,
  borderRadius: 10,
  color: T.text,
  fontSize: 14,
  outline: "none",
  fontFamily: "inherit",
};

const labelStyle: React.CSSProperties = {
  fontSize: 12, fontWeight: 600, color: T.muted,
  letterSpacing: "0.05em", textTransform: "uppercase",
  display: "block", marginBottom: 8,
};

type Props = {
  initial?: {
    id: string;
    name: string;
    subject: string;
    body: string;
    delay_days: number;
    is_active: boolean;
  };
};

export default function EmailForm({ initial }: Props) {
  const router = useRouter();
  const [name,      setName]      = useState(initial?.name      ?? "");
  const [subject,   setSubject]   = useState(initial?.subject   ?? "");
  const [body,      setBody]      = useState(initial?.body      ?? "<p>Hi [First Name],</p><p></p>");
  const [delayDays, setDelayDays] = useState(initial?.delay_days ?? 0);
  const [isActive,  setIsActive]  = useState(initial?.is_active  ?? true);
  const [loading,   setLoading]   = useState(false);
  const [preview,   setPreview]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData();
    fd.set("name",       name);
    fd.set("subject",    subject);
    fd.set("body",       body);
    fd.set("delay_days", String(delayDays));
    fd.set("is_active",  String(isActive));

    if (initial?.id) {
      await updateSequenceEmail(initial.id, fd);
    } else {
      await createSequenceEmail(fd);
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ color: T.text, fontSize: 22, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.03em" }}>
            {initial ? "Edit email" : "New email"}
          </h1>
          <p style={{ color: T.muted, fontSize: 13, margin: 0 }}>
            {initial ? `Editing: ${initial.name}` : "Add a new email to the sequence"}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={() => router.back()} style={{
            padding: "9px 16px", borderRadius: 10,
            background: "var(--aw05)", border: `1px solid ${T.border}`,
            color: T.muted, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
          }}>Cancel</button>
          <button type="button" onClick={() => setPreview(v => !v)} style={{
            padding: "9px 16px", borderRadius: 10,
            background: "var(--aw05)", border: `1px solid ${T.border}`,
            color: T.muted, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
          }}>{preview ? "Edit" : "Preview"}</button>
          <button type="submit" disabled={loading} style={{
            padding: "9px 20px", borderRadius: 10,
            background: T.purple, border: "none",
            color: "#fff", fontSize: 13, fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1, fontFamily: "inherit",
          }}>{loading ? "Saving…" : "Save"}</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

        {/* Left — fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 16, padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>

            <div>
              <label style={labelStyle}>Internal name</label>
              <input value={name} onChange={e => setName(e.target.value)} required style={inputStyle} placeholder="e.g. Day 1: Cost of booking" />
            </div>

            <div>
              <label style={labelStyle}>Subject line</label>
              <input value={subject} onChange={e => setSubject(e.target.value)} required style={inputStyle} placeholder="e.g. The real cost of manual booking" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={labelStyle}>Delay (days after signup)</label>
                <input
                  type="number" min={0} value={delayDays}
                  onChange={e => setDelayDays(Number(e.target.value))}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Status</label>
                <div style={{ display: "flex", gap: 8, marginTop: 2 }}>
                  {[true, false].map((val) => (
                    <button key={String(val)} type="button" onClick={() => setIsActive(val)} style={{
                      flex: 1, padding: "11px 0", borderRadius: 10, fontSize: 13, fontWeight: 600,
                      border: `1px solid ${isActive === val ? (val ? "rgba(16,185,129,0.4)" : "rgba(239,68,68,0.3)") : T.border}`,
                      background: isActive === val ? (val ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.08)") : T.input,
                      color: isActive === val ? (val ? "rgb(52,211,153)" : "rgb(248,113,113)") : T.muted,
                      cursor: "pointer", fontFamily: "inherit",
                    }}>
                      {val ? "Active" : "Inactive"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 16, padding: 24 }}>
            <label style={labelStyle}>Email body (HTML)</label>
            <p style={{ fontSize: 12, color: T.dim, margin: "0 0 12px" }}>
              Use <code style={{ color: T.purple, background: "rgba(139,92,246,0.1)", padding: "1px 5px", borderRadius: 4 }}>[First Name]</code> as a merge tag.
            </p>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              rows={16}
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6, fontFamily: "monospace", fontSize: 13 }}
              placeholder="<p>Hi [First Name],</p><p>...</p>"
            />
          </div>
        </div>

        {/* Right — preview */}
        <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 16, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${T.border}` }}>
            <p style={{ color: T.muted, fontSize: 12, fontWeight: 600, margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Preview
            </p>
          </div>
          <div style={{ padding: 24 }}>
            <p style={{ fontSize: 11, color: T.dim, margin: "0 0 4px" }}>From: FlatPurse Flow &lt;noreply@flatpurse.com&gt;</p>
            <p style={{ fontSize: 11, color: T.dim, margin: "0 0 16px" }}>Subject: {subject || "-"}</p>
            <div style={{
              background: "#fff", borderRadius: 10, padding: 24,
              color: "#111", fontSize: 14, lineHeight: 1.7,
            }}
              dangerouslySetInnerHTML={{ __html: body.replace(/\[First Name\]/g, "Alex") || "<p style='color:#999'>Start writing to see a preview...</p>" }}
            />
          </div>
        </div>
      </div>
    </form>
  );
}
