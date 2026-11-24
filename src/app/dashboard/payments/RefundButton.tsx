"use client";

import { useState, useTransition } from "react";
import { refundPayment } from "./refundActions";

const field: React.CSSProperties = { background: "var(--dsurface1)", border: "1px solid var(--dsurface3)", borderRadius: 8, padding: "6px 8px", color: "var(--dtext)", fontSize: 12.5, fontFamily: "inherit" };

/** Inline refund form: amount + required reason (FL-038). */
export function RefundButton({ appointmentId, max }: { appointmentId: string; max: number }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(max);
  const [reason, setReason] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();
  if (max <= 0) return <span style={{ color: "var(--dw35)", fontSize: 12 }}>Refunded</span>;
  if (!open) return <button type="button" onClick={() => setOpen(true)} style={{ ...field, cursor: "pointer", fontWeight: 600 }}>Refund</button>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 180 }}>
      <input type="number" min={0.01} max={max} step="0.01" value={amount} onChange={(e) => setAmount(Number(e.target.value))} style={field} aria-label="Refund amount" />
      <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (required)" style={field} />
      <div style={{ display: "flex", gap: 6 }}>
        <button type="button" disabled={pending || reason.trim().length < 3} onClick={() => start(async () => { const r = await refundPayment({ appointmentId, amount, reason }); setMsg(r.error ?? "Refunded."); if (!r.error) setOpen(false); })}
          style={{ ...field, background: "rgb(220,38,38)", color: "#fff", border: "none", cursor: "pointer", fontWeight: 700 }}>{pending ? "..." : `Refund $${amount.toFixed(2)}`}</button>
        <button type="button" onClick={() => setOpen(false)} style={{ ...field, cursor: "pointer" }}>Cancel</button>
      </div>
      {msg && <span style={{ fontSize: 12, color: "var(--dtext)" }}>{msg}</span>}
    </div>
  );
}
