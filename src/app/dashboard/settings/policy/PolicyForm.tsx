"use client";

import { useState, useTransition } from "react";
import { policyText, type FeeMode, type Policy } from "@/lib/booking/policy";
import { savePolicy } from "./actions";

const field: React.CSSProperties = { background: "var(--dsurface1)", border: "1px solid var(--dsurface3)", borderRadius: 10, padding: "9px 11px", color: "var(--dtext)", fontSize: 14, fontFamily: "inherit" };
const label: React.CSSProperties = { color: "var(--dw45)", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, margin: "0 0 6px" };

function FeeRow({ title, mode, value, onChange, allowNone = true }: { title: string; mode: FeeMode; value: number; onChange: (m: FeeMode, v: number) => void; allowNone?: boolean }) {
  return (
    <section>
      <p style={label}>{title}</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <select value={mode} onChange={(e) => onChange(e.target.value as FeeMode, value)} style={field}>
          {allowNone && <option value="none">None</option>}
          <option value="fixed">Fixed $</option>
          <option value="percent">% of price</option>
        </select>
        {mode !== "none" && <input type="number" min={0} step="0.01" value={value} onChange={(e) => onChange(mode, Number(e.target.value))} style={{ ...field, width: 110 }} aria-label={`${title} amount`} />}
      </div>
    </section>
  );
}

/** Booking policy (FL-037): deposit, cancellation window, late-cancel and no-show fees. */
export function PolicyForm({ initial }: { initial: Policy }) {
  const [p, setP] = useState<Policy>(initial);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const set = (patch: Partial<Policy>) => { setP({ ...p, ...patch }); setMsg(null); };

  return (
    <div style={{ padding: "24px 16px", display: "flex", flexDirection: "column", gap: 18 }}>
      <div>
        <h1 style={{ color: "var(--dtext)", fontSize: 22, fontWeight: 800, margin: 0 }}>Booking policy</h1>
        <p style={{ color: "var(--dw45)", fontSize: 13.5, margin: "4px 0 0" }}>Clients see this before they book and on their booking link.</p>
      </div>
      <FeeRow title="Deposit at booking" mode={p.deposit_mode} value={p.deposit_value} onChange={(m, v) => set({ deposit_mode: m, deposit_value: v })} />
      <section>
        <p style={label}>Free cancellation up to (hours before)</p>
        <input type="number" min={0} max={168} value={p.cancel_window_hours} onChange={(e) => set({ cancel_window_hours: Number(e.target.value) })} style={{ ...field, width: 110 }} />
      </section>
      <FeeRow title="Late-cancel fee" mode={p.late_cancel_fee_mode} value={p.late_cancel_fee_value} onChange={(m, v) => set({ late_cancel_fee_mode: m, late_cancel_fee_value: v })} />
      <FeeRow title="No-show fee (charged only after staff confirm)" mode={p.no_show_fee_mode} value={p.no_show_fee_value} onChange={(m, v) => set({ no_show_fee_mode: m, no_show_fee_value: v })} />
      <p style={{ color: "var(--dtext)", fontSize: 13.5, margin: 0, background: "var(--dsurface1)", border: "1px solid var(--dsurface3)", borderRadius: 10, padding: 12 }}>
        Example on a $100 service: {policyText(p, 100)}
      </p>
      <button type="button" disabled={pending} onClick={() => start(async () => { const r = await savePolicy(p); setMsg(r.error ?? "Saved."); })}
        style={{ background: "rgb(109,40,217)", color: "#fff", border: "none", borderRadius: 10, padding: "12px 0", fontSize: 15, fontWeight: 700, cursor: "pointer", maxWidth: 260 }}>
        {pending ? "Saving..." : "Save policy"}
      </button>
      {msg && <p style={{ color: "var(--dtext)", margin: 0, fontSize: 14 }}>{msg}</p>}
    </div>
  );
}
