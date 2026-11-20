"use client";

import { useState, useTransition } from "react";
import { decideMessage, switchToAutomatic, type ApprovalState } from "./approvalActions";

const FLOW_LABEL: Record<string, string> = { noshow: "No-show recovery", filler: "Slot filler", winback: "Win-back", reminders: "Rebooking", birthday: "Birthday" };

/** "Ask me first" approval queue (FL-049). */
export function ApprovalQueue({ state }: { state: ApprovalState }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  if (!state.askFirst && state.pending.length === 0) return null;

  const act = (fn: () => Promise<{ error?: string }>) => start(async () => { const r = await fn(); setError(r.error ?? null); });
  const until = new Date(state.until).toLocaleDateString("en-CA", { month: "long", day: "numeric" });
  const btn = (bg: string, fg: string): React.CSSProperties => ({ background: bg, color: fg, border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer" });

  return (
    <section style={{ background: "var(--dsurface1)", border: "1px solid var(--dsurface3)", borderRadius: 14, padding: 16, marginBottom: 16, display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ color: "var(--dtext)", fontSize: 16, fontWeight: 800, margin: 0 }}>Ask me first</h2>
          <p style={{ color: "var(--dw45)", fontSize: 12.5, margin: "2px 0 0" }}>
            {state.askFirst ? `AutoPilot waits for your OK on each message until ${until}.` : "AutoPilot now sends on its own. These were queued earlier."}
          </p>
        </div>
        {state.askFirst && (
          <button type="button" disabled={pending} onClick={() => act(switchToAutomatic)} style={btn("var(--dsurface2)", "var(--dtext)")}>Switch to automatic</button>
        )}
      </div>
      {state.pending.length === 0 ? (
        <p style={{ color: "var(--dw45)", fontSize: 13, margin: 0 }}>Nothing waiting right now.</p>
      ) : state.pending.map((m) => (
        <div key={m.id} style={{ borderTop: "1px solid var(--dsurface3)", paddingTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          <p style={{ color: "var(--dw45)", fontSize: 11.5, fontWeight: 700, margin: 0, textTransform: "uppercase", letterSpacing: 0.5 }}>
            {FLOW_LABEL[m.flow_key] ?? m.flow_key} · {m.client_name ?? "Client"} · {m.channel === "sms" ? "Text" : "Email"}
          </p>
          <p style={{ color: "var(--dtext)", fontSize: 13.5, margin: 0, lineHeight: 1.5 }}>{m.message_body}</p>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" disabled={pending} onClick={() => act(() => decideMessage(m.id, true))} style={btn("rgb(109,40,217)", "#fff")}>Approve</button>
            <button type="button" disabled={pending} onClick={() => act(() => decideMessage(m.id, false))} style={btn("var(--dsurface2)", "var(--dtext)")}>Skip</button>
          </div>
        </div>
      ))}
      {error && <p style={{ color: "rgb(220,38,38)", fontSize: 12.5, margin: 0 }}>{error}</p>}
    </section>
  );
}
