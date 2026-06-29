"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  CalendarDays, AlertTriangle, Heart,
  BarChart2, ChevronRight, Plus, Users2, Clock,
} from "lucide-react";

// ─── Animated counter ─────────────────────────────────────────────────────────
function AnimCount({ target, prefix = "", suffix = "", duration = 1800 }: {
  target: number; prefix?: string; suffix?: string; duration?: number;
}) {
  const [val, setVal] = useState(0);
  const raf = useRef<number | null>(null);
  const start = useRef<number | null>(null);

  useEffect(() => {
    start.current = null;
    const step = (ts: number) => {
      if (!start.current) start.current = ts;
      const progress = Math.min((ts - start.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(eased * target));
      if (progress < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [target, duration]);

  return <>{prefix}{val.toLocaleString()}{suffix}</>;
}

// ─── Pulse ring ───────────────────────────────────────────────────────────────
function PulseRing({ color = "rgb(52,211,153)", size = 10 }: { color?: string; size?: number }) {
  return (
    <span style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", width: size, height: size }}>
      <span style={{
        position: "absolute",
        width: size, height: size,
        borderRadius: "50%",
        background: color,
        opacity: 0.35,
        animation: "ping 1.8s cubic-bezier(0,0,0.2,1) infinite",
      }} />
      <span style={{ width: size * 0.6, height: size * 0.6, borderRadius: "50%", background: color, flexShrink: 0 }} />
    </span>
  );
}

// ─── Schedule rows ─────────────────────────────────────────────────────────────
const SCHEDULE = [
  { time: "9:00",  initials: "SJ", color: "rgb(52,211,153)",  name: "Sarah Johnson",  service: "Color + Cut",   stylist: "Emma",  status: "done",      price: "C$185" },
  { time: "10:30", initials: "MC", color: "rgb(248,113,113)", name: "Michael Chen",   service: "Beard Trim",    stylist: "James", status: "done",      price: "C$35"  },
  { time: "11:15", initials: "JL", color: "rgb(139,92,246)",  name: "Jamie Lee",      service: "Balayage",      stylist: "Emma",  status: "upnext",    price: "C$220" },
  { time: "12:30", initials: "DK", color: "rgb(251,146,60)",  name: "Daniel King",    service: "Skin Fade",     stylist: "James", status: "deposit",   price: "C$50"  },
  { time: "14:00", initials: "EM", color: "rgb(167,139,250)", name: "Emma Mitchell",  service: "Highlight",     stylist: "James", status: "confirmed", price: "C$240" },
];

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  done:      { label: "Done",      color: "rgba(255,255,255,0.35)", bg: "rgba(255,255,255,0.05)" },
  upnext:    { label: "Up next",   color: "rgb(139,92,246)",        bg: "rgba(109,40,217,0.14)"  },
  deposit:   { label: "⚠ Deposit", color: "rgb(251,191,36)",        bg: "rgba(245,158,11,0.1)"   },
  confirmed: { label: "Confirmed", color: "rgb(52,211,153)",        bg: "rgba(16,185,129,0.1)"   },
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [live, setLive] = useState(true);

  const dateStr = new Date().toLocaleDateString("en-CA", {
    weekday: "long", month: "long", day: "numeric",
  });

  const card: React.CSSProperties = {
    background: "rgba(255,255,255,0.025)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 18,
    overflow: "hidden",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Row 2 header: date + toggle ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, margin: 0 }}>{dateStr}</p>

        {/* Empty / Live toggle */}
        <div style={{
          display: "flex", alignItems: "center",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.09)",
          borderRadius: 30, padding: 3,
        }}>
          <button onClick={() => setLive(false)} style={{
            padding: "5px 14px", borderRadius: 24, border: "none", cursor: "pointer", fontSize: 12, fontWeight: live ? 500 : 700,
            background: !live ? "rgba(255,255,255,0.1)" : "transparent",
            color: !live ? "rgb(250,250,250)" : "rgba(255,255,255,0.35)",
            transition: "all 0.15s",
          }}>
            Empty
          </button>
          <button onClick={() => setLive(true)} style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "5px 14px", borderRadius: 24, border: "none", cursor: "pointer", fontSize: 12, fontWeight: live ? 700 : 500,
            background: live ? "rgba(52,211,153,0.15)" : "transparent",
            color: live ? "rgb(52,211,153)" : "rgba(255,255,255,0.35)",
            transition: "all 0.15s",
          }}>
            <PulseRing size={7} />
            Live
          </button>
        </div>
      </div>

      {live ? <PopulatedState card={card} /> : <EmptyState card={card} />}
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ card }: { card: React.CSSProperties }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Hero */}
      <div style={{
        ...card,
        background: "linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(52,211,153,0.04) 100%)",
        border: "1px solid rgba(52,211,153,0.2)",
        padding: "32px 28px",
        textAlign: "center",
      }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
          <div style={{
            width: 56, height: 56, borderRadius: "50%",
            background: "rgba(52,211,153,0.1)",
            border: "1px solid rgba(52,211,153,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <PulseRing size={14} />
          </div>
        </div>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 8px" }}>
          AUTOPILOT IS WATCHING
        </p>
        <h1 style={{ color: "rgb(250,250,250)", fontSize: 30, fontWeight: 800, margin: "0 0 10px", letterSpacing: "-0.03em" }}>
          Ready to earn for you
        </h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, margin: 0, lineHeight: 1.6, maxWidth: 400, marginInline: "auto" }}>
          Complete your setup and AutoPilot starts recovering revenue the moment your first booking comes in.
        </p>
      </div>

      {/* Setup rows */}
      {[
        {
          icon: CalendarDays,
          iconColor: "rgb(167,139,250)", iconBg: "rgba(139,92,246,0.12)",
          title: "Add today's bookings",
          sub: "Enter your first appointment to see the schedule come alive.",
          cta: "Add booking", href: "/dashboard/appointments",
          done: false,
        },
        {
          icon: Users2,
          iconColor: "rgb(96,165,250)", iconBg: "rgba(59,130,246,0.12)",
          title: "Add your team",
          sub: "Each staff member gets their own calendar column.",
          cta: "Add team member", href: "/dashboard/team",
          done: false,
        },
        {
          icon: Heart,
          iconColor: "rgb(248,113,113)", iconBg: "rgba(239,68,68,0.1)",
          title: "Set Family Hours",
          sub: "Protect your personal time. AutoPilot respects it.",
          cta: "Set hours", href: "/dashboard/settings",
          done: false,
        },
      ].map(row => {
        const Icon = row.icon;
        return (
          <div key={row.title} style={{
            ...card,
            padding: "18px 20px",
            display: "flex", alignItems: "center", gap: 16,
          }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12, flexShrink: 0,
              background: row.iconBg,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Icon size={20} color={row.iconColor} strokeWidth={1.7} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ color: "rgb(250,250,250)", fontSize: 14, fontWeight: 700, margin: "0 0 2px" }}>{row.title}</p>
              <p style={{ color: "rgba(255,255,255,0.38)", fontSize: 12.5, margin: 0 }}>{row.sub}</p>
            </div>
            <Link href={row.href} style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "9px 16px", borderRadius: 10,
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
              color: "rgb(250,250,250)", fontSize: 12.5, fontWeight: 700,
              textDecoration: "none", whiteSpace: "nowrap",
            }}>
              <Plus size={13} strokeWidth={2.5} /> {row.cta}
            </Link>
          </div>
        );
      })}
    </div>
  );
}

// ─── Populated state ──────────────────────────────────────────────────────────
function PopulatedState({ card }: { card: React.CSSProperties }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

      {/* Hero: AutoPilot */}
      <div style={{
        background: "linear-gradient(135deg, rgba(88,28,218,0.4) 0%, rgba(109,40,217,0.18) 50%, rgba(16,185,129,0.08) 100%)",
        border: "1px solid rgba(139,92,246,0.3)",
        borderRadius: 20, padding: "28px 32px",
        position: "relative", overflow: "hidden",
      }}>
        {/* Glow blob */}
        <div style={{
          position: "absolute", top: -40, right: -40,
          width: 200, height: 200, borderRadius: "50%",
          background: "rgba(139,92,246,0.15)",
          filter: "blur(50px)", pointerEvents: "none",
        }} />

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", position: "relative" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <PulseRing size={8} />
              <span style={{ color: "rgb(52,211,153)", fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                AUTOPILOT IS ON
              </span>
            </div>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 600, margin: "0 0 4px", letterSpacing: "0.03em" }}>
              RECOVERED THIS MONTH WHILE YOU WERE OFF
            </p>
            <p style={{ color: "rgb(250,250,250)", fontSize: 46, fontWeight: 800, margin: "0 0 20px", letterSpacing: "-0.04em", lineHeight: 1 }}>
              C$<AnimCount target={8240} duration={1800} />
            </p>

            {/* 3-stat strip */}
            <div style={{ display: "flex", gap: 24 }}>
              {[
                { label: "Today", value: "+C$340" },
                { label: "Slots filled", value: "3" },
                { label: "No-shows saved", value: "2" },
              ].map(s => (
                <div key={s.label}>
                  <p style={{ color: "rgb(250,250,250)", fontSize: 18, fontWeight: 800, margin: "0 0 2px", letterSpacing: "-0.03em" }}>{s.value}</p>
                  <p style={{ color: "rgba(255,255,255,0.38)", fontSize: 11, margin: 0 }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Fill slots CTA */}
          <button style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "12px 20px", borderRadius: 12, flexShrink: 0,
            background: "rgb(52,211,153)", border: "none",
            color: "rgb(5,40,20)", fontSize: 13, fontWeight: 800,
            cursor: "pointer", letterSpacing: "-0.01em",
            boxShadow: "0 4px 20px rgba(52,211,153,0.3)",
          }}>
            Fill 4 empty slots now
            <span style={{ background: "rgba(0,0,0,0.15)", borderRadius: 8, padding: "2px 8px", fontSize: 12 }}>
              +C$280
            </span>
          </button>
        </div>
      </div>

      {/* 4 nav cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>

        {/* Today's bookings */}
        <Link href="/dashboard/appointments" style={{ textDecoration: "none" }}>
          <div style={{
            ...card, padding: "20px 20px 18px", cursor: "pointer",
            transition: "border-color 0.15s",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(139,92,246,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CalendarDays size={17} color="rgb(167,139,250)" strokeWidth={1.8} />
              </div>
              <ChevronRight size={15} color="rgba(255,255,255,0.2)" />
            </div>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 6px" }}>
              TODAY&apos;S BOOKINGS
            </p>
            <p style={{ color: "rgb(250,250,250)", fontSize: 28, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.04em" }}>14 / 18</p>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, margin: 0 }}>4 slots still open</p>
          </div>
        </Link>

        {/* Needs your eyes */}
        <Link href="/dashboard" style={{ textDecoration: "none" }}>
          <div style={{
            ...card, padding: "20px 20px 18px", cursor: "pointer",
            border: "1px solid rgba(248,113,113,0.22)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                <AlertTriangle size={17} color="rgb(248,113,113)" strokeWidth={1.8} />
                <span style={{
                  position: "absolute", top: -4, right: -4,
                  minWidth: 16, height: 16, borderRadius: 8,
                  background: "rgb(239,68,68)", color: "white",
                  fontSize: 9, fontWeight: 800,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>2</span>
              </div>
              <ChevronRight size={15} color="rgba(255,255,255,0.2)" />
            </div>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 6px" }}>
              NEEDS YOUR EYES
            </p>
            <p style={{ color: "rgb(248,113,113)", fontSize: 28, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.04em" }}>2</p>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, margin: 0 }}>Escalations waiting</p>
          </div>
        </Link>

        {/* Family Hours */}
        <Link href="/dashboard/settings" style={{ textDecoration: "none" }}>
          <div style={{
            ...card, padding: "20px 20px 18px", cursor: "pointer",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Heart size={17} color="rgb(248,113,113)" strokeWidth={1.8} />
              </div>
              <ChevronRight size={15} color="rgba(255,255,255,0.2)" />
            </div>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 6px" }}>
              FAMILY HOURS
            </p>
            <p style={{ color: "rgb(250,250,250)", fontSize: 28, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.04em" }}>
              12 <span style={{ fontSize: 16, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>day streak</span>
            </p>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, margin: 0 }}>Active 6–8 PM daily</p>
          </div>
        </Link>

        {/* This month */}
        <Link href="/dashboard/operations" style={{ textDecoration: "none" }}>
          <div style={{
            ...card, padding: "20px 20px 18px", cursor: "pointer",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(59,130,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <BarChart2 size={17} color="rgb(96,165,250)" strokeWidth={1.8} />
              </div>
              <ChevronRight size={15} color="rgba(255,255,255,0.2)" />
            </div>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 6px" }}>
              THIS MONTH
            </p>
            <p style={{ color: "rgb(250,250,250)", fontSize: 28, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.04em" }}>C$12,458</p>
            <p style={{ color: "rgb(52,211,153)", fontSize: 12, margin: 0, display: "flex", alignItems: "center", gap: 3 }}>
              +8.2% vs last month
            </p>
          </div>
        </Link>
      </div>

      {/* Today's schedule preview */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16 }}>

        <div style={{ ...card }}>
          <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ color: "rgb(250,250,250)", fontSize: 15, fontWeight: 700, margin: 0 }}>Today&apos;s Schedule</p>
            <Link href="/dashboard/appointments" style={{
              display: "flex", alignItems: "center", gap: 4,
              color: "rgb(167,139,250)", fontSize: 12, fontWeight: 600, textDecoration: "none",
            }}>
              View all <ChevronRight size={13} />
            </Link>
          </div>

          {/* No-show risk alert */}
          <div style={{
            margin: "12px 16px 0",
            padding: "11px 14px",
            background: "rgba(245,158,11,0.07)",
            border: "1px solid rgba(245,158,11,0.2)",
            borderRadius: 12,
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
              <AlertTriangle size={14} color="rgb(251,191,36)" strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} />
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 12.5, margin: 0, lineHeight: 1.5 }}>
                2 high-risk bookings — <strong style={{ color: "rgb(250,250,250)" }}>Marcus T.</strong> and <strong style={{ color: "rgb(250,250,250)" }}>Daniel K.</strong> Deposits required.
              </p>
            </div>
            <button style={{
              padding: "7px 13px", borderRadius: 9, flexShrink: 0,
              background: "rgb(245,158,11)", border: "none",
              color: "rgb(10,8,0)", fontSize: 12, fontWeight: 700,
              cursor: "pointer", whiteSpace: "nowrap",
            }}>
              Require deposits
            </button>
          </div>

          <div style={{ padding: "8px 0" }}>
            {SCHEDULE.map((row, i) => {
              const s = STATUS_MAP[row.status];
              return (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "12px 20px",
                  borderBottom: i < SCHEDULE.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, width: 44, flexShrink: 0 }}>
                    <Clock size={11} color="rgba(255,255,255,0.2)" />
                    <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 11.5, fontWeight: 600 }}>{row.time}</span>
                  </div>
                  <div style={{
                    width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                    background: row.color + "22", border: `1.5px solid ${row.color}44`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 800, color: row.color,
                  }}>
                    {row.initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: "rgb(250,250,250)", fontSize: 13, fontWeight: 700, margin: "0 0 1px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{row.name}</p>
                    <p style={{ color: "rgba(255,255,255,0.32)", fontSize: 11.5, margin: 0 }}>{row.service} · {row.stylist}</p>
                  </div>
                  <span style={{ fontSize: 10.5, fontWeight: 700, padding: "3px 9px", borderRadius: 20, color: s.color, background: s.bg, whiteSpace: "nowrap", flexShrink: 0 }}>
                    {s.label}
                  </span>
                  <span style={{ color: "rgb(52,211,153)", fontSize: 13, fontWeight: 700, flexShrink: 0, minWidth: 46, textAlign: "right" }}>
                    {row.price}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          <div style={{ ...card, padding: "18px 20px" }}>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 14px" }}>Quick actions</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label: "+ New booking",    href: "/dashboard/appointments", color: "rgb(109,40,217)", text: "white" },
                { label: "View open slots",  href: "/dashboard/appointments", color: "rgba(255,255,255,0.05)", text: "rgba(255,255,255,0.7)" },
                { label: "Go to Clients",    href: "/dashboard/clients",      color: "rgba(255,255,255,0.05)", text: "rgba(255,255,255,0.7)" },
                { label: "View AutoPilot",   href: "/dashboard/autopilot",    color: "rgba(255,255,255,0.05)", text: "rgba(255,255,255,0.7)" },
              ].map(a => (
                <Link key={a.label} href={a.href} style={{
                  display: "block", padding: "10px 14px", borderRadius: 10,
                  background: a.color, border: "1px solid rgba(255,255,255,0.07)",
                  color: a.text, fontSize: 13, fontWeight: 700,
                  textDecoration: "none", textAlign: "center",
                }}>
                  {a.label}
                </Link>
              ))}
            </div>
          </div>

          {/* AI daily insight */}
          <div style={{
            background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.2)",
            borderRadius: 14, padding: "16px 18px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <PulseRing size={6} color="rgb(167,139,250)" />
              <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" }}>AI Insight</span>
            </div>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 12.5, margin: "0 0 10px", lineHeight: 1.55 }}>
              Thu 2–5 PM has been empty 3 weeks in a row. A flash deal could recover <strong style={{ color: "rgb(250,250,250)" }}>+C$320/mo</strong>.
            </p>
            <button style={{
              padding: "7px 14px", borderRadius: 9, border: "1px solid rgba(139,92,246,0.3)",
              background: "rgba(139,92,246,0.1)", color: "rgb(167,139,250)",
              fontSize: 12, fontWeight: 700, cursor: "pointer",
            }}>
              Create flash deal →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
