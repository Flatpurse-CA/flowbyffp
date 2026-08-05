"use client";

import { Compass, Lock } from "lucide-react";
import Link from "next/link";
import type { FlowCoachData, FlowCoachCard } from "@/lib/dashboard/flowCoach";

const card: React.CSSProperties = {
  background: "var(--dsurface1)",
  border: "1px solid var(--dw07)",
  borderRadius: 16,
  padding: 20,
};

function scoreColor(value: number) {
  return value > 80 ? "rgb(52,211,153)" : value > 60 ? "rgb(251,191,36)" : "rgb(248,113,113)";
}

function Card({ c }: { c: FlowCoachCard }) {
  return (
    <div style={{ ...card, display: "flex", flexDirection: "column", gap: 10, opacity: c.available ? 1 : 0.6 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
        <div>
          <p style={{ color: "var(--dw35)", fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 3px" }}>{c.title}</p>
          <p style={{ color: "var(--dw3)", fontSize: 11.5, margin: 0 }}>{c.eyebrow}</p>
        </div>
        {!c.available && (
          <span style={{ fontSize: 9.5, fontWeight: 700, padding: "3px 8px", borderRadius: 20, background: "var(--dsurface3)", color: "var(--dw35)", whiteSpace: "nowrap" }}>
            Coming soon
          </span>
        )}
      </div>

      <p style={{ color: "var(--dtext)", fontSize: 16, fontWeight: 800, margin: 0, letterSpacing: "-0.01em" }}>{c.headline}</p>

      {c.diagnosis && (
        <p style={{ color: "var(--dw5)", fontSize: 12.5, lineHeight: 1.55, margin: 0 }}>{c.diagnosis}</p>
      )}

      {c.recommendation && (
        <div style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.18)", borderRadius: 10, padding: "10px 12px" }}>
          <p style={{ color: "var(--dpurple-text)", fontSize: 12, lineHeight: 1.5, margin: 0 }}>
            <span style={{ fontWeight: 700 }}>Recommendation: </span>{c.recommendation}
          </p>
        </div>
      )}

      {c.impact && (
        <span style={{
          alignSelf: "flex-start", fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 20,
          background: c.impact.startsWith("-") ? "rgba(248,113,113,0.12)" : "rgba(52,211,153,0.12)",
          color: c.impact.startsWith("-") ? "rgb(248,113,113)" : "rgb(52,211,153)",
        }}>
          Expected impact: {c.impact}
        </span>
      )}
    </div>
  );
}

export function FlowCoachClient({ data }: { data: FlowCoachData | null }) {
  if (!data) {
    return (
      <div style={{ maxWidth: 460, margin: "100px auto 0", textAlign: "center" }}>
        <h1 style={{ color: "var(--dtext)", fontSize: 19, fontWeight: 800, margin: "0 0 10px", letterSpacing: "-0.02em" }}>
          Finish setting up your shop
        </h1>
        <p style={{ color: "var(--dw45)", fontSize: 13.5, lineHeight: 1.6, margin: 0 }}>
          We couldn&apos;t find a shop linked to your account yet.
        </p>
      </div>
    );
  }

  const { health, cards } = data;
  const [healthCard, ...restCards] = cards;

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", flexDirection: "column", gap: 22 }}>
      <div>
        <h1 style={{ color: "var(--dtext)", fontSize: 22, fontWeight: 800, margin: "0 0 3px", letterSpacing: "-0.03em", display: "flex", alignItems: "center", gap: 8 }}>
          <Compass size={20} color="rgb(167,139,250)" strokeWidth={2} /> Flow Coach™
        </h1>
        <p style={{ color: "var(--dw35)", fontSize: 13, margin: 0 }}>Your AI business advisor — what changed, why, and what to do about it.</p>
      </div>

      <div className="flow-coach-hero" style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 20 }}>
        <div style={{ ...card, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
          <svg width={120} height={120} viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="50" fill="none" stroke="var(--dw06)" strokeWidth="10" />
            <circle cx="60" cy="60" r="50" fill="none" stroke={scoreColor(health.score)} strokeWidth="10"
              strokeDasharray={`${(health.score / 100) * 314} 314`} strokeLinecap="round"
              transform="rotate(-90 60 60)" />
            <text x="60" y="56" textAnchor="middle" fill="var(--dtext)" fontSize="24" fontWeight="800">{health.score}</text>
            <text x="60" y="72" textAnchor="middle" fill="var(--dw35)" fontSize="10">/100</text>
          </svg>
          <p style={{ color: "var(--dw5)", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>
            Health Score
          </p>
        </div>

        <div style={{ ...card, display: "flex", flexDirection: "column", justifyContent: "center", gap: 10 }}>
          <p style={{ color: "var(--dw35)", fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", margin: 0 }}>{healthCard.eyebrow}</p>
          {healthCard.diagnosis && <p style={{ color: "var(--dw5)", fontSize: 13, lineHeight: 1.6, margin: 0 }}>{healthCard.diagnosis}</p>}
          {healthCard.recommendation && (
            <div style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.18)", borderRadius: 10, padding: "10px 12px" }}>
              <p style={{ color: "var(--dpurple-text)", fontSize: 12.5, lineHeight: 1.5, margin: 0 }}>
                <span style={{ fontWeight: 700 }}>Recommendation: </span>{healthCard.recommendation}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flow-coach-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {restCards.map(c => <Card key={c.key} c={c} />)}
      </div>

      <style>{`
        @media (max-width: 900px) {
          .flow-coach-hero { grid-template-columns: 1fr !important; }
          .flow-coach-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 600px) {
          .flow-coach-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

export function FlowCoachUpsell() {
  return (
    <div style={{ maxWidth: 480, margin: "100px auto 0", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(139,92,246,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Lock size={22} color="rgb(167,139,250)" strokeWidth={1.8} />
      </div>
      <h1 style={{ color: "var(--dtext)", fontSize: 19, fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>
        Flow Coach™ is a Pro+ feature
      </h1>
      <p style={{ color: "var(--dw45)", fontSize: 13.5, lineHeight: 1.6, margin: 0 }}>
        Upgrade to Pro+ to unlock your Business Health Score, revenue forecasting, staffing and retention insights, and more.
      </p>
      <Link href="/dashboard/settings?tab=Billing" style={{
        display: "inline-flex", alignItems: "center", gap: 6, marginTop: 6, padding: "10px 20px",
        borderRadius: 10, background: "rgb(109,40,217)", color: "white", fontSize: 13, fontWeight: 700, textDecoration: "none",
      }}>
        Upgrade to Pro+
      </Link>
    </div>
  );
}
