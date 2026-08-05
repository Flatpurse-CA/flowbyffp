"use client";

import Link from "next/link";
import { Heart, Zap, MessageSquare, CreditCard, AlertTriangle } from "lucide-react";
import type { DailyBriefData, NeedsYouCard } from "./actions";

function fmtPrice(n: number) {
  return Number.isInteger(n) ? `C$${n}` : `C$${n.toFixed(2)}`;
}

const card: React.CSSProperties = {
  background: "var(--dw025)",
  border: "1px solid var(--dw07)",
  borderRadius: 16,
  padding: 20,
};

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: "var(--dw03)", border: "1px solid var(--dw07)", borderRadius: 12, padding: "12px 14px" }}>
      <p style={{ color: "var(--dw35)", fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 4px" }}>{label}</p>
      <p style={{ color: "var(--dtext)", fontSize: 18, fontWeight: 800, margin: 0, letterSpacing: "-0.03em" }}>{value}</p>
    </div>
  );
}

const KIND_ICON: Record<NeedsYouCard["kind"], typeof Zap> = {
  winback: Zap,
  staff: AlertTriangle,
  payment: CreditCard,
};
const KIND_HREF: Record<NeedsYouCard["kind"], string> = {
  winback: "/dashboard/clients",
  staff: "/dashboard/team",
  payment: "/dashboard/appointments",
};

export function DailyBriefClient({ data }: { data: DailyBriefData }) {
  const greeting = (() => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  })();

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 }}>
      <div>
        <h1 style={{ color: "var(--dtext)", fontSize: 22, fontWeight: 800, margin: "0 0 6px", letterSpacing: "-0.03em" }}>
          {greeting}
        </h1>
        <p style={{ color: "var(--dw5)", fontSize: 14, margin: 0, lineHeight: 1.6 }}>{data.summary}</p>
      </div>

      {/* Needs you */}
      {data.needsYou.length > 0 && (
        <div>
          <p style={{ color: "var(--dw4)", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 10px" }}>Needs you</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {data.needsYou.map(item => {
              const Icon = KIND_ICON[item.kind];
              return (
                <Link key={item.id} href={KIND_HREF[item.kind]} style={{
                  display: "flex", alignItems: "center", gap: 12, textDecoration: "none",
                  background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.18)",
                  borderRadius: 14, padding: "14px 16px",
                }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(239,68,68,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={16} color="rgb(248,113,113)" strokeWidth={2} />
                  </div>
                  <span style={{ color: "var(--dw75)", fontSize: 13.5, flex: 1 }}>{item.text}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Yesterday */}
      <div style={card}>
        <p style={{ color: "var(--dw4)", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 14px" }}>Yesterday</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Metric label="Revenue" value={fmtPrice(data.yesterday.revenue)} />
          <Metric label="Bookings" value={String(data.yesterday.bookings)} />
          <Metric label="Cancellations" value={String(data.yesterday.cancellations)} />
          <Metric label="New clients" value={String(data.yesterday.newClients)} />
        </div>
      </div>

      {/* Today */}
      <div style={card}>
        <p style={{ color: "var(--dw4)", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 14px" }}>Today</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Metric label="Bookings" value={String(data.today.bookingsCount)} />
          <Metric label="Revenue scheduled" value={fmtPrice(data.today.revenueScheduled)} />
          <Metric label="Next appointment" value={data.today.nextAppointmentTime ?? "—"} />
          <Metric label="Staff working" value={String(data.today.staffWorking)} />
        </div>
      </div>

      {/* Family Hours streak */}
      <div style={{
        background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.18)",
        borderRadius: 16, padding: "18px 20px", display: "flex", alignItems: "center", gap: 14,
      }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(139,92,246,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Heart size={18} color="rgb(167,139,250)" strokeWidth={2} />
        </div>
        <div>
          <p style={{ color: "var(--dpurple-text)", fontSize: 14, fontWeight: 700, margin: "0 0 2px" }}>
            {data.familyHoursEnabled
              ? `Family Hours — ${data.familyHoursStreak}-day streak`
              : "Family Hours is off"}
          </p>
          <p style={{ color: "var(--dw4)", fontSize: 12, margin: 0 }}>
            {data.familyHoursEnabled
              ? "No bookings landed in your protected window yesterday. Keep it up."
              : "Turn it on in Settings → Hours to protect your evenings."}
          </p>
        </div>
      </div>

      {data.needsYou.length === 0 && (
        <p style={{ color: "var(--dw25)", fontSize: 12.5, textAlign: "center", margin: 0 }}>
          <MessageSquare size={12} style={{ verticalAlign: "-2px", marginRight: 4 }} />
          Nothing needs your attention right now.
        </p>
      )}
    </div>
  );
}
