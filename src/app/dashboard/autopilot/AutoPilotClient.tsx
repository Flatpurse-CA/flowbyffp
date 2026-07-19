"use client";

import Link from "next/link";
import { Zap, MessageSquare, RotateCcw, Calendar, Clock, Gift, ChevronRight } from "lucide-react";
import type { AutopilotState, FlowKey } from "./actions";

const FLOWS: { id: FlowKey; icon: typeof Zap; color: string; bg: string; name: string; desc: string }[] = [
  {
    id: "noshow", icon: RotateCcw, color: "rgb(248,113,113)", bg: "rgba(239,68,68,0.1)",
    name: "No-show Recovery", desc: "Rebooks cancelled slots automatically within 30 min of a no-show.",
  },
  {
    id: "filler", icon: Calendar, color: "rgb(251,191,36)", bg: "rgba(245,158,11,0.1)",
    name: "Last-Minute Slot Filler", desc: "Sends payment links to your waitlist when a gap opens up.",
  },
  {
    id: "winback", icon: Zap, color: "rgb(167,139,250)", bg: "rgba(139,92,246,0.1)",
    name: "30-Day Win-Back", desc: "Brings back lapsed clients who haven't booked in 30 days.",
  },
  {
    id: "frontdesk", icon: MessageSquare, color: "rgb(96,165,250)", bg: "rgba(59,130,246,0.1)",
    name: "AI Front Desk", desc: "Answers DMs and books 24/7. Escalates when human touch is needed.",
  },
  {
    id: "reminders", icon: Clock, color: "rgb(52,211,153)", bg: "rgba(16,185,129,0.1)",
    name: "Rebooking Reminders", desc: "Nudges clients at their usual rebook interval — before they go elsewhere.",
  },
  {
    id: "birthday", icon: Gift, color: "rgb(251,146,60)", bg: "rgba(249,115,22,0.1)",
    name: "Birthday & Occasion Offers", desc: "Per-client automated offers on birthdays and anniversaries.",
  },
];

function fmtPrice(n: number) {
  return Number.isInteger(n) ? `C$${n}` : `C$${n.toFixed(2)}`;
}
function timeAgo(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.floor(ms / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
}

export function AutoPilotClient({ state }: { state: AutopilotState }) {
  if (!state.stripeConnected) {
    return (
      <div style={{ maxWidth: 700, margin: "0 auto" }}>

        {/* Waiting hero */}
        <div style={{
          background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.18)",
          borderRadius: 20, padding: "40px 36px", textAlign: "center", marginBottom: 32,
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: 20,
            background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 20px",
          }}>
            <Zap size={28} color="rgb(167,139,250)" strokeWidth={2} />
          </div>
          <h1 style={{ color: "rgb(250,250,250)", fontSize: 26, fontWeight: 800, margin: "0 0 10px", letterSpacing: "-0.03em" }}>
            Your AI team is ready to work
          </h1>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 15, margin: "0 0 28px", lineHeight: 1.6 }}>
            Connect Stripe to activate AutoPilot. Once live, the AI runs all 6 revenue flows — 24 hours a day, without you lifting a finger.
          </p>
          <Link href="/dashboard/settings?tab=Payments" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "14px 28px", borderRadius: 13,
            background: "rgb(109,40,217)", border: "none", textDecoration: "none",
            color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer",
            letterSpacing: "-0.01em",
          }}>
            Connect Stripe to activate
            <ChevronRight size={16} strokeWidth={2.5} />
          </Link>
        </div>

        {/* Flows preview */}
        <h2 style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 14px" }}>
          6 flows ready
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {FLOWS.map(flow => {
            const Icon = flow.icon;
            return (
              <div key={flow.id} style={{
                display: "flex", alignItems: "center", gap: 14,
                background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 14, padding: "16px 18px",
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: flow.bg, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon size={18} color={flow.color} strokeWidth={1.8} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ color: "rgb(250,250,250)", fontSize: 13.5, fontWeight: 700, margin: "0 0 2px" }}>{flow.name}</p>
                  <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, margin: 0 }}>{flow.desc}</p>
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.25)",
                  background: "rgba(255,255,255,0.05)", padding: "4px 10px", borderRadius: 20,
                  border: "1px solid rgba(255,255,255,0.08)",
                }}>
                  Paused
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Active state (shown once Stripe is connected)
  const avgPerAction = state.totals.actions > 0 ? state.totals.revenue / state.totals.actions : 0;

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", flexDirection: "column", gap: 22 }}>

      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, rgba(109,40,217,0.3) 0%, rgba(88,28,218,0.12) 100%)",
        border: "1px solid rgba(139,92,246,0.25)", borderRadius: 20, padding: "28px 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20,
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "rgb(52,211,153)", boxShadow: "0 0 0 4px rgba(16,185,129,0.2)" }} />
            <span style={{ color: "rgb(52,211,153)", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              AutoPilot live
            </span>
          </div>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
            Recovered this month
          </p>
          <p style={{ color: "rgb(250,250,250)", fontSize: 44, fontWeight: 800, margin: 0, letterSpacing: "-0.04em" }}>
            {fmtPrice(state.totals.revenue)}
          </p>
        </div>
        <div style={{ display: "flex", gap: 20 }}>
          {[
            { label: "Actions", value: String(state.totals.actions) },
            { label: "Customers", value: String(state.totals.customers) },
            { label: "Avg per action", value: avgPerAction > 0 ? fmtPrice(avgPerAction) : "—" },
          ].map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <p style={{ color: "rgb(250,250,250)", fontSize: 24, fontWeight: 800, margin: "0 0 2px", letterSpacing: "-0.03em" }}>{s.value}</p>
              <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, margin: 0 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="autopilot-sidebar-grid" style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>

        {/* Active flows */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <h2 style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", margin: 0 }}>Active flows</h2>
          {FLOWS.map(flow => {
            const Icon = flow.icon;
            const stats = state.flowStats[flow.id];
            return (
              <div key={flow.id} style={{
                display: "flex", alignItems: "center", gap: 14,
                background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 14, padding: "16px 18px",
              }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: flow.bg, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={18} color={flow.color} strokeWidth={1.8} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ color: "rgb(250,250,250)", fontSize: 13.5, fontWeight: 700, margin: "0 0 2px" }}>{flow.name}</p>
                  <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, margin: 0 }}>
                    {stats.count} action{stats.count === 1 ? "" : "s"} · {fmtPrice(stats.revenue)} contributed
                  </p>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, color: "rgb(52,211,153)", background: "rgba(16,185,129,0.1)", padding: "4px 10px", borderRadius: 20 }}>
                  Running
                </span>
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* AI Front Desk today */}
        <div style={{
          background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 16, padding: 18, display: "flex", flexDirection: "column", gap: 12,
        }}>
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>AI Front Desk today</span>
          <div style={{ display: "flex", gap: 20 }}>
            <div>
              <p style={{ color: "rgb(96,165,250)", fontSize: 22, fontWeight: 800, margin: "0 0 2px" }}>{state.frontDeskToday.handled}</p>
              <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, margin: 0 }}>Handled</p>
            </div>
            <div>
              <p style={{ color: "rgb(251,191,36)", fontSize: 22, fontWeight: 800, margin: "0 0 2px" }}>{state.frontDeskToday.escalated}</p>
              <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, margin: 0 }}>Escalated to you</p>
            </div>
          </div>
        </div>

        {/* Live feed */}
        <div style={{
          background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 16, padding: 20, display: "flex", flexDirection: "column", gap: 14,
          height: "fit-content",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "rgb(52,211,153)", animation: "pulse 2s infinite" }} />
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Live feed</span>
          </div>
          {state.events.length === 0 ? (
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12.5, margin: 0, lineHeight: 1.6 }}>
              No AutoPilot activity yet. Once a flow fires, it&apos;ll show up here in real time.
            </p>
          ) : state.events.map(ev => {
            const flow = FLOWS.find(f => f.id === ev.flow_key);
            return (
              <div key={ev.id} style={{ display: "flex", gap: 10, paddingBottom: 14, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: flow?.color ?? "rgb(255,255,255)", marginTop: 5, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, margin: "0 0 3px", lineHeight: 1.4 }}>{ev.event_text}</p>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 11 }}>{timeAgo(ev.created_at)}</span>
                    {ev.amount != null && <span style={{ color: "rgb(52,211,153)", fontSize: 11, fontWeight: 700 }}>+{fmtPrice(Number(ev.amount))}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        </div>
      </div>
    </div>
  );
}
