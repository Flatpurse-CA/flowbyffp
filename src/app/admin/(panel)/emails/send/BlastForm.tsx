"use client";

import { useState } from "react";
import { sendBlast } from "../actions";

const T = {
  bg:     "var(--am1)",
  border: "var(--aw09)",
  text:   "var(--atext2)",
  muted:  "var(--aw35)",
  dim:    "var(--aw18)",
  purple: "rgb(139,92,246)",
  input:  "var(--aw05)",
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

type Sequence = { id: string; name: string; subject: string; body: string };

export function BlastForm({ sequences, totalSubs }: { sequences: Sequence[]; totalSubs: number }) {
  const [mode,       setMode]       = useState<"sequence" | "oneoff">("sequence");
  const [seqId,      setSeqId]      = useState(sequences[0]?.id ?? "");
  const [subject,    setSubject]    = useState("");
  const [body,       setBody]       = useState("<p>Hi [First Name],</p><p></p>");
  const [audience,   setAudience]   = useState<"all" | "pending">("all");
  const [confirmed,  setConfirmed]  = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [result,     setResult]     = useState<{ sent: number; errors: number } | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const selectedSeq = sequences.find(s => s.id === seqId);

  const resolvedSubject = mode === "sequence" ? (selectedSeq?.subject ?? "") : subject;
  const resolvedBody    = mode === "sequence" ? (selectedSeq?.body    ?? "") : body;

  async function handleSend() {
    setLoading(true);
    const res = await sendBlast({
      subject:    resolvedSubject,
      html:       resolvedBody,
      audience,
      sequenceId: mode === "sequence" ? seqId : undefined,
    });
    setResult(res);
    setLoading(false);
    setConfirmed(false);
  }

  if (result) {
    return (
      <div style={{
        background: T.bg, border: `1px solid ${T.border}`, borderRadius: 16,
        padding: 48, textAlign: "center",
      }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>✅</div>
        <p style={{ color: T.text, fontSize: 18, fontWeight: 800, margin: "0 0 8px" }}>Blast sent!</p>
        <p style={{ color: T.muted, fontSize: 14, margin: "0 0 24px" }}>
          {result.sent} sent · {result.errors} failed
        </p>
        <button onClick={() => setResult(null)} style={{
          padding: "10px 20px", borderRadius: 10,
          background: T.purple, border: "none",
          color: "#fff", fontSize: 14, fontWeight: 700,
          cursor: "pointer", fontFamily: "inherit",
        }}>Send another</button>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

      {/* Left — config */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Mode toggle */}
        <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 16, padding: 24 }}>
          <label style={labelStyle}>Email source</label>
          <div style={{ display: "flex", gap: 8 }}>
            {(["sequence", "oneoff"] as const).map((m) => (
              <button key={m} type="button" onClick={() => setMode(m)} style={{
                flex: 1, padding: "10px 0", borderRadius: 10, fontSize: 13, fontWeight: 600,
                border: `1px solid ${mode === m ? T.purple : T.border}`,
                background: mode === m ? "rgba(139,92,246,0.12)" : T.input,
                color: mode === m ? T.purple : T.muted,
                cursor: "pointer", fontFamily: "inherit",
              }}>
                {m === "sequence" ? "From sequence" : "One-off"}
              </button>
            ))}
          </div>
        </div>

        {/* Email config */}
        <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 16, padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          {mode === "sequence" ? (
            <div>
              <label style={labelStyle}>Select email</label>
              <select value={seqId} onChange={e => setSeqId(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                {sequences.map(s => (
                  <option key={s.id} value={s.id} style={{ background: "#111" }}>{s.name}</option>
                ))}
              </select>
            </div>
          ) : (
            <>
              <div>
                <label style={labelStyle}>Subject</label>
                <input value={subject} onChange={e => setSubject(e.target.value)} style={inputStyle} placeholder="Subject line…" />
              </div>
              <div>
                <label style={labelStyle}>Body (HTML)</label>
                <textarea value={body} onChange={e => setBody(e.target.value)} rows={8} style={{ ...inputStyle, resize: "vertical", fontFamily: "monospace", fontSize: 13 }} />
              </div>
            </>
          )}
        </div>

        {/* Audience */}
        <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 16, padding: 24 }}>
          <label style={labelStyle}>Audience</label>
          <div style={{ display: "flex", gap: 8 }}>
            {([
              { val: "all",     label: `All waitlist (${totalSubs})` },
              { val: "pending", label: "Unsent only" },
            ] as const).map(({ val, label }) => (
              <button key={val} type="button" onClick={() => setAudience(val)} style={{
                flex: 1, padding: "10px 0", borderRadius: 10, fontSize: 13, fontWeight: 600,
                border: `1px solid ${audience === val ? T.purple : T.border}`,
                background: audience === val ? "rgba(139,92,246,0.12)" : T.input,
                color: audience === val ? T.purple : T.muted,
                cursor: "pointer", fontFamily: "inherit",
              }}>{label}</button>
            ))}
          </div>
        </div>

        {/* Confirm + Send */}
        <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 16, padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={confirmed}
              onChange={e => setConfirmed(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: T.purple }}
            />
            <span style={{ fontSize: 13, color: T.muted }}>
              I have reviewed the preview and I'm ready to send this email.
            </span>
          </label>
          <button
            onClick={handleSend}
            disabled={!confirmed || loading || !resolvedSubject || !resolvedBody}
            style={{
              width: "100%", padding: "12px 0", borderRadius: 10,
              background: T.purple, border: "none",
              color: "#fff", fontSize: 14, fontWeight: 700,
              cursor: confirmed && !loading ? "pointer" : "not-allowed",
              opacity: confirmed && !loading ? 1 : 0.5,
              fontFamily: "inherit",
            }}
          >
            {loading ? "Sending…" : "Send blast"}
          </button>
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
          <p style={{ fontSize: 11, color: T.dim, margin: "0 0 16px" }}>Subject: {resolvedSubject || "-"}</p>
          <div style={{
            background: "#fff", borderRadius: 10, padding: 24,
            color: "#111", fontSize: 14, lineHeight: 1.7,
            minHeight: 200,
          }}
            dangerouslySetInnerHTML={{
              __html: resolvedBody.replace(/\[First Name\]/g, "Alex") || "<p style='color:#999'>Select an email or write one to preview…</p>"
            }}
          />
        </div>
      </div>
    </div>
  );
}
