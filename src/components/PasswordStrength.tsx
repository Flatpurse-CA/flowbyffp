"use client";

// Live strength bar + checklist under a "create password" field. The three
// checklist rules mirror validatePassword() in src/lib/passwordPolicy.ts (the
// server-side gate); the extra "strong" points are guidance only.

import { Check, Circle } from "lucide-react";

const RULES = [
  { label: "At least 10 characters", test: (p: string) => p.length >= 10 },
  { label: "A letter", test: (p: string) => /[a-zA-Z]/.test(p) },
  { label: "A number", test: (p: string) => /[0-9]/.test(p) },
];

const LEVELS = [
  { label: "Too weak", color: "rgb(220,38,38)" },
  { label: "Weak", color: "rgb(234,88,12)" },
  { label: "Fair", color: "rgb(202,138,4)" },
  { label: "Good", color: "rgb(22,163,74)" },
  { label: "Strong", color: "rgb(21,128,61)" },
];

function score(p: string) {
  const met = RULES.filter(r => r.test(p)).length;
  if (met < RULES.length) return Math.min(met, 2);          // 0..2 until the minimum is met
  let s = 3;                                                 // meets the policy
  const extras = [p.length >= 14, /[A-Z]/.test(p) && /[a-z]/.test(p), /[^A-Za-z0-9]/.test(p)].filter(Boolean).length;
  if (extras >= 2) s = 4;
  return s;
}

export default function PasswordStrength({ password }: { password: string }) {
  const s = score(password);
  const level = LEVELS[s];
  const filled = password ? s + 1 : 0; // 5 segments

  return (
    <div style={{ marginTop: 10 }}>
      <div aria-hidden="true" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 5 }}>
        {[0, 1, 2, 3, 4].map(i => (
          <span key={i} style={{ height: 4, borderRadius: 4, background: i < filled ? level.color : "var(--auth-input-border)", transition: "background 0.2s" }} />
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginTop: 10 }}>
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexWrap: "wrap", gap: "6px 14px" }}>
          {RULES.map(r => {
            const ok = r.test(password);
            return (
              <li key={r.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: ok ? "var(--auth-text)" : "var(--auth-text-sub)", transition: "color 0.2s" }}>
                {ok
                  ? <span style={{ width: 14, height: 14, borderRadius: "50%", background: "rgb(22,163,74)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Check size={10} strokeWidth={3.2} color="#fff" /></span>
                  : <Circle size={14} strokeWidth={1.8} />}
                <span>{r.label}<span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)" }}>{ok ? " (done)" : " (not yet)"}</span></span>
              </li>
            );
          })}
        </ul>
        {password && (
          <span aria-live="polite" style={{ fontSize: 12, fontWeight: 600, color: level.color, whiteSpace: "nowrap" }}>{level.label}</span>
        )}
      </div>
    </div>
  );
}
