"use client";

import { useState } from "react";
import { Zap, MessageSquare, RotateCcw, Calendar, Clock, Gift, ChevronRight } from "lucide-react";

const FLOWS = [
  {
    id: "noshow",
    icon: RotateCcw,
    color: "rgb(248,113,113)",
    bg: "rgba(239,68,68,0.1)",
    name: "No-show Recovery",
    desc: "Rebooks cancelled slots automatically within 30 min of a no-show.",
    contribution: "C$1,840",
    recoveries: 14,
  },
  {
    id: "filler",
    icon: Calendar,
    color: "rgb(251,191,36)",
    bg: "rgba(245,158,11,0.1)",
    name: "Last-Minute Slot Filler",
    desc: "Sends payment links to your waitlist when a gap opens up.",
    contribution: "C$2,100",
    recoveries: 18,
  },
  {
    id: "winback",
    icon: Zap,
    color: "rgb(167,139,250)",
    bg: "rgba(139,92,246,0.1)",
    name: "30-Day Win-Back",
    desc: "Brings back lapsed clients who haven't booked in 30 days.",
    contribution: "C$2,680",
    recoveries: 22,
  },
  {
    id: "frontdesk",
    icon: MessageSquare,
    color: "rgb(96,165,250)",
    bg: "rgba(59,130,246,0.1)",
    name: "AI Front Desk",
    desc: "Answers DMs and books 24/7. Escalates when human touch is needed.",
    contribution: "C$920",
    recoveries: 9,
  },
  {
    id: "reminders",
    icon: Clock,
    color: "rgb(52,211,153)",
    bg: "rgba(16,185,129,0.1)",
    name: "Rebooking Reminders",
    desc: "Nudges clients at their usual rebook interval — before they go elsewhere.",
    contribution: "C$540",
    recoveries: 7,
  },
  {
    id: "birthday",
    icon: Gift,
    color: "rgb(251,146,60)",
    bg: "rgba(249,115,22,0.1)",
    name: "Birthday & Occasion Offers",
    desc: "Per-client automated offers on birthdays and anniversaries.",
    contribution: "C$160",
    recoveries: 3,
  },
];

const LIVE_FEED = [
  { id: 1, time: "2m ago",  color: "rgb(52,211,153)",  text: "Win-back sent to Amara Obi — booked Silk Press for Thu",      amount: "+C$85"  },
  { id: 2, time: "14m ago", color: "rgb(96,165,250)",  text: "AI Front Desk handled Lola's DM — appointment confirmed",      amount: "+C$180" },
  { id: 3, time: "31m ago", color: "rgb(248,113,113)", text: "No-show slot filled — Temi Bello rebooking at 3:00 PM",        amount: "+C$85"  },
  { id: 4, time: "1h ago",  color: "rgb(251,191,36)",  text: "Last-minute slot sent to waitlist — Zara Johnson claimed it",  amount: "+C$160" },
  { id: 5, time: "2h ago",  color: "rgb(167,139,250)", text: "30-day win-back: Chisom Eze returned after 38 days",           amount: "+C$65"  },
];

export default function AutoPilotPage() {
  const [active] = useState(false); // flip to true when Stripe connected

  if (!active) {
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
          <button style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "14px 28px", borderRadius: 13,
            background: "rgb(109,40,217)", border: "none",
            color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer",
            letterSpacing: "-0.01em",
          }}>
            Connect Stripe to activate
            <ChevronRight size={16} strokeWidth={2.5} />
          </button>
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

  // Active state (shown when Stripe is connected)
  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", flexDirection: "column", gap: 22 }}>

      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, rgba(109,40,217,0.3) 0%, rgba(88,28,218,0.12) 100%)",
        border: "1px solid rgba(139,92,246,0.25)", borderRadius: 20, padding: "28px 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
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
            C$8,240
          </p>
        </div>
        <div style={{ display: "flex", gap: 20 }}>
          {[{ label: "Actions", value: "487" }, { label: "Customers", value: "312" }, { label: "Conversion", value: "39%" }].map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <p style={{ color: "rgb(250,250,250)", fontSize: 24, fontWeight: 800, margin: "0 0 2px", letterSpacing: "-0.03em" }}>{s.value}</p>
              <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, margin: 0 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>

        {/* Active flows */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <h2 style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", margin: 0 }}>Active flows</h2>
          {FLOWS.map(flow => {
            const Icon = flow.icon;
            return (
              <div key={flow.id} style={{
                display: "flex", alignItems: "center", gap: 14,
                background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 14, padding: "16px 18px", cursor: "pointer",
              }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: flow.bg, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={18} color={flow.color} strokeWidth={1.8} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ color: "rgb(250,250,250)", fontSize: 13.5, fontWeight: 700, margin: "0 0 2px" }}>{flow.name}</p>
                  <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, margin: 0 }}>
                    {flow.recoveries} actions · {flow.contribution} contributed
                  </p>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, color: "rgb(52,211,153)", background: "rgba(16,185,129,0.1)", padding: "4px 10px", borderRadius: 20 }}>
                  Running
                </span>
              </div>
            );
          })}
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
          {LIVE_FEED.map(ev => (
            <div key={ev.id} style={{ display: "flex", gap: 10, paddingBottom: 14, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: ev.color, marginTop: 5, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, margin: "0 0 3px", lineHeight: 1.4 }}>{ev.text}</p>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 11 }}>{ev.time}</span>
                  <span style={{ color: "rgb(52,211,153)", fontSize: 11, fontWeight: 700 }}>{ev.amount}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
