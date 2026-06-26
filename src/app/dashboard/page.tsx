"use client";

import { useState } from "react";
import {
  DollarSign, CalendarDays, AlertTriangle, Users2,
  TrendingUp, Clock, Zap, Shield,
} from "lucide-react";

// ─── Stat cards ───────────────────────────────────────────────────────────────

const STATS = [
  {
    label: "TODAY'S REVENUE",
    value: "C$2,847",
    sub: "+18% vs. last Tue",
    subColor: "rgb(52,211,153)",
    Icon: DollarSign,
    iconBg: "rgba(16,185,129,0.12)",
    iconColor: "rgb(52,211,153)",
    positive: true,
  },
  {
    label: "BOOKINGS",
    value: "23",
    sub: "+4 vs. forecast",
    subColor: "rgb(52,211,153)",
    Icon: CalendarDays,
    iconBg: "rgba(139,92,246,0.14)",
    iconColor: "rgb(167,139,250)",
    positive: true,
  },
  {
    label: "NO-SHOW RISK",
    value: "2",
    sub: "Deposits required",
    subColor: "rgb(251,191,36)",
    Icon: AlertTriangle,
    iconBg: "rgba(245,158,11,0.12)",
    iconColor: "rgb(251,191,36)",
    positive: false,
  },
  {
    label: "WIN-BACK WINS",
    value: "7",
    sub: "+C$840 recovered",
    subColor: "rgb(52,211,153)",
    Icon: Users2,
    iconBg: "rgba(96,165,250,0.12)",
    iconColor: "rgb(96,165,250)",
    positive: true,
  },
];

// ─── Schedule ─────────────────────────────────────────────────────────────────

const SCHEDULE = [
  { time: "9:00",  initials: "SJ", color: "rgb(52,211,153)",   name: "Sarah Johnson",  service: "Color + Cut",      stylist: "Emma",  status: "done",      price: "C$185" },
  { time: "10:30", initials: "MC", color: "rgb(248,113,113)",   name: "Michael Chen",   service: "Beard Trim",       stylist: "James", status: "done",      price: "C$35"  },
  { time: "11:15", initials: "JL", color: "rgb(139,92,246)",    name: "Jamie Lee",      service: "Balayage",         stylist: "Emma",  status: "upnext",    price: "C$220" },
  { time: "12:30", initials: "DK", color: "rgb(251,146,60)",    name: "Daniel King",    service: "Skin Fade",        stylist: "James", status: "deposit",   price: "C$50"  },
  { time: "14:00", initials: "EM", color: "rgb(167,139,250)",   name: "Emma Mitchell",  service: "Highlight",        stylist: "James", status: "confirmed", price: "C$240" },
];

// ─── Team ─────────────────────────────────────────────────────────────────────

const TEAM = [
  { initials: "EW", color: "rgb(30,30,40)",    name: "Emma Watson",  role: "Senior Stylist", mtgs: 6,  max: 8 },
  { initials: "JM", color: "rgb(180,30,50)",   name: "James Miller", role: "Barber",         mtgs: 7,  max: 8 },
  { initials: "ZA", color: "rgb(30,130,80)",   name: "Zara Ahmed",   role: "Colorist",       mtgs: 4,  max: 8 },
];

// ─── Status pill ──────────────────────────────────────────────────────────────

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    done:      { label: "Done",      color: "rgba(255,255,255,0.4)",  bg: "rgba(255,255,255,0.06)"  },
    upnext:    { label: "Up next",   color: "rgb(139,92,246)",        bg: "rgba(109,40,217,0.14)"   },
    deposit:   { label: "⚠ Deposit", color: "rgb(251,191,36)",        bg: "rgba(245,158,11,0.1)"    },
    confirmed: { label: "Confirmed", color: "rgb(52,211,153)",        bg: "rgba(16,185,129,0.1)"    },
  };
  const s = map[status] ?? map.confirmed;
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
      color: s.color, background: s.bg,
      whiteSpace: "nowrap",
    }}>
      {s.label}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const SCHEDULE_TABS = ["Day", "Week", "List"];

export default function DashboardPage() {
  const [tab, setTab] = useState("Day");

  const card: React.CSSProperties = {
    background: "rgb(10,10,12)",
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: 18,
    overflow: "hidden",
  };

  const dateStr = new Date().toLocaleDateString("en-CA", {
    weekday: "long", month: "long", day: "numeric",
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Page header ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ color: "rgb(245,245,252)", fontSize: 22, fontWeight: 800, margin: "0 0 3px", letterSpacing: "-0.03em" }}>
            Dashboard
          </h1>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, margin: 0 }}>{dateStr}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "8px 14px",
            background: "rgba(16,185,129,0.08)",
            border: "1px solid rgba(52,211,153,0.2)",
            borderRadius: 10,
          }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "rgb(52,211,153)", boxShadow: "0 0 6px rgb(52,211,153)" }} />
            <span style={{ color: "rgb(52,211,153)", fontSize: 12.5, fontWeight: 700 }}>AutoPilot ON</span>
          </div>
          <button style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "9px 18px", borderRadius: 11,
            background: "rgb(109,40,217)", border: "none",
            color: "white", fontSize: 13, fontWeight: 700,
            cursor: "pointer", letterSpacing: "-0.01em",
          }}>
            + New booking
          </button>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {STATS.map(({ label, value, sub, subColor, Icon, iconBg, iconColor }) => (
          <div key={label} style={{ ...card, padding: "20px 22px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: iconBg,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <Icon size={17} color={iconColor} strokeWidth={1.8} />
              </div>
              <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                {label}
              </span>
            </div>
            <p style={{ color: "rgb(245,245,252)", fontSize: 34, fontWeight: 800, letterSpacing: "-0.04em", margin: "0 0 8px", lineHeight: 1 }}>
              {value}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <TrendingUp size={12} color={subColor} strokeWidth={2} />
              <span style={{ color: subColor, fontSize: 12.5, fontWeight: 600 }}>{sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Row: Schedule + AutoPilot / Team ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 14, alignItems: "start" }}>

        {/* Today's Schedule */}
        <div style={card}>
          {/* Card header */}
          <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p style={{ color: "rgb(240,240,248)", fontSize: 15, fontWeight: 700, margin: 0 }}>Today&apos;s Schedule</p>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                background: "rgba(139,92,246,0.14)", color: "rgb(167,139,250)",
              }}>
                {SCHEDULE.length * 4 + 3} BOOKED
              </span>
            </div>
            {/* Tabs */}
            <div style={{ display: "flex", gap: 2, marginTop: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 9, padding: 3, width: "fit-content" }}>
              {SCHEDULE_TABS.map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  style={{
                    padding: "5px 14px", borderRadius: 7, border: "none",
                    cursor: "pointer", fontSize: 12.5, fontWeight: tab === t ? 700 : 400,
                    background: tab === t ? "rgba(109,40,217,0.4)" : "transparent",
                    color: tab === t ? "rgb(210,196,254)" : "rgba(255,255,255,0.4)",
                    transition: "all 0.15s",
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Risk alert */}
          <div style={{
            margin: "14px 16px 0",
            padding: "11px 14px",
            background: "rgba(245,158,11,0.07)",
            border: "1px solid rgba(245,158,11,0.2)",
            borderRadius: 12,
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
              <AlertTriangle size={15} color="rgb(251,191,36)" strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} />
              <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 12.5, margin: 0, lineHeight: 1.5 }}>
                2 high-risk bookings today — <strong style={{ color: "rgb(240,240,248)" }}>Marcus T.</strong> (2 no-shows) and <strong style={{ color: "rgb(240,240,248)" }}>Daniel K.</strong> (new client). Deposits required.
              </p>
            </div>
            <button style={{
              padding: "7px 13px", borderRadius: 9, flexShrink: 0,
              background: "rgb(245,158,11)", border: "none",
              color: "rgb(12,10,0)", fontSize: 12, fontWeight: 700,
              cursor: "pointer", whiteSpace: "nowrap",
            }}>
              Require deposits
            </button>
          </div>

          {/* Schedule rows */}
          <div style={{ padding: "8px 0 8px" }}>
            {SCHEDULE.map((row, i) => (
              <div
                key={i}
                style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "12px 20px",
                  borderBottom: i < SCHEDULE.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                }}
              >
                {/* Time */}
                <div style={{ display: "flex", alignItems: "center", gap: 4, width: 42, flexShrink: 0 }}>
                  <Clock size={11} color="rgba(255,255,255,0.22)" strokeWidth={1.8} />
                  <span style={{ color: "rgba(255,255,255,0.32)", fontSize: 12, fontWeight: 600 }}>{row.time}</span>
                </div>

                {/* Avatar */}
                <div style={{
                  width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                  background: row.color + "33",
                  border: `1.5px solid ${row.color}55`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 800, color: row.color,
                }}>
                  {row.initials}
                </div>

                {/* Name + service */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: "rgb(240,240,248)", fontSize: 13.5, fontWeight: 700, margin: "0 0 2px" }}>{row.name}</p>
                  <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, margin: 0 }}>
                    {row.service} <span style={{ color: "rgba(255,255,255,0.2)" }}>•</span> {row.stylist}
                  </p>
                </div>

                {/* Status */}
                <StatusPill status={row.status} />

                {/* Price */}
                <span style={{ color: "rgb(52,211,153)", fontSize: 13, fontWeight: 700, flexShrink: 0, minWidth: 48, textAlign: "right" }}>
                  {row.price}
                </span>

                {/* Action */}
                {(row.status === "upnext" || row.status === "deposit" || row.status === "confirmed") && (
                  <button style={{
                    padding: "7px 13px", borderRadius: 9, flexShrink: 0,
                    background: "rgb(240,240,248)", border: "none",
                    color: "rgb(10,10,12)", fontSize: 12, fontWeight: 700,
                    cursor: "pointer",
                  }}>
                    Check out
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right column: AutoPilot + Team Today */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* AutoPilot panel */}
          <div style={{ ...card, padding: "18px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Zap size={15} color="rgb(167,139,250)" strokeWidth={1.8} />
                <p style={{ color: "rgb(240,240,248)", fontSize: 14, fontWeight: 700, margin: 0 }}>AutoPilot</p>
              </div>
              <span style={{
                fontSize: 10, fontWeight: 800, padding: "3px 9px", borderRadius: 20, letterSpacing: "0.05em",
                background: "rgba(52,211,153,0.1)", color: "rgb(52,211,153)",
                border: "1px solid rgba(52,211,153,0.2)",
              }}>
                6 FLOWS RUNNING
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { icon: DollarSign, label: "RECOVERED",      value: "C$8,240", sub: "this month",      iconColor: "rgb(52,211,153)",  iconBg: "rgba(16,185,129,0.12)"  },
                { icon: CalendarDays, label: "SLOTS FILLED", value: "34",      sub: "this month",      iconColor: "rgb(96,165,250)",  iconBg: "rgba(59,130,246,0.12)"  },
                { icon: Shield, label: "NO-SHOWS SAVED",     value: "12",      sub: "deposits taken",  iconColor: "rgb(167,139,250)", iconBg: "rgba(109,40,217,0.12)"  },
                { icon: Users2, label: "WIN-BACKS",           value: "47",      sub: "7 converted",     iconColor: "rgb(251,191,36)",  iconBg: "rgba(245,158,11,0.12)"  },
              ].map(({ icon: Icon, label, value, sub, iconColor, iconBg }) => (
                <div key={label} style={{
                  padding: "12px 14px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 12,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                    <div style={{ width: 26, height: 26, borderRadius: 7, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon size={13} color={iconColor} strokeWidth={1.8} />
                    </div>
                    <span style={{ color: "rgba(255,255,255,0.28)", fontSize: 9.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</span>
                  </div>
                  <p style={{ color: "rgb(240,240,248)", fontSize: 20, fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 2px", lineHeight: 1 }}>{value}</p>
                  <p style={{ color: "rgba(255,255,255,0.28)", fontSize: 11, margin: 0 }}>{sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Team Today */}
          <div style={{ ...card, padding: "18px 20px" }}>
            <p style={{ color: "rgb(240,240,248)", fontSize: 14, fontWeight: 700, margin: "0 0 16px" }}>Team Today</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {TEAM.map((member, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 11 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                    background: `hsl(${(i * 73 + 200) % 360}, 45%, 25%)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,0.85)",
                  }}>
                    {member.initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                      <div>
                        <p style={{ color: "rgb(240,240,248)", fontSize: 12.5, fontWeight: 700, margin: 0 }}>{member.name}</p>
                        <p style={{ color: "rgba(255,255,255,0.28)", fontSize: 11, margin: 0 }}>{member.role}</p>
                      </div>
                      <span style={{ color: "rgba(255,255,255,0.38)", fontSize: 11.5, fontWeight: 600, flexShrink: 0 }}>{member.mtgs} mtgs</span>
                    </div>
                    <div style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,0.07)" }}>
                      <div style={{
                        height: "100%", borderRadius: 2,
                        width: `${(member.mtgs / member.max) * 100}%`,
                        background: "rgb(139,92,246)",
                        transition: "width 0.4s ease",
                      }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
