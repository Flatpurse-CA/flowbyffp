"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  CalendarDays, AlertTriangle, Heart,
  BarChart2, ChevronRight, Plus, Users2, Clock,
} from "lucide-react";
import type { AppointmentRow, AppointmentStatus } from "./appointments/actions";
import type { AutopilotState } from "./autopilot/actions";
import type { NeedsYouCard } from "./daily-brief/actions";
import { useDashboardTheme } from "./theme-context";

// ─── Animated counter ─────────────────────────────────────────────────────────
function AnimCount({ target, prefix = "", suffix = "", duration = 1400 }: {
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

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtPrice(n: number) {
  return Number.isInteger(n) ? `C$${n.toLocaleString()}` : `C$${n.toFixed(2)}`;
}

function initialsFor(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

const AVATAR_COLORS = ["rgb(52,211,153)", "rgb(248,113,113)", "rgb(139,92,246)", "rgb(251,146,60)", "rgb(167,139,250)", "rgb(96,165,250)"];
function colorFor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function fmtTime(iso: string) {
  return new Intl.DateTimeFormat("en-US", { timeZone: "America/Edmonton", hour: "numeric", minute: "2-digit" }).format(new Date(iso));
}

function statusLabel(dark: boolean): Record<AppointmentStatus, { label: string; color: string; bg: string }> {
  return {
    completed: { label: "Done",      color: dark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.43)", bg: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.07)" },
    confirmed: { label: "Confirmed", color: "rgb(52,211,153)",                                     bg: "rgba(16,185,129,0.1)"   },
    pending:   { label: "Pending",   color: dark ? "rgba(255,255,255,0.5)"  : "rgba(0,0,0,0.55)",  bg: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)" },
    deposit:   { label: "⚠ Deposit", color: "rgb(251,191,36)",                                     bg: "rgba(245,158,11,0.1)"   },
    cancelled: { label: "Cancelled", color: dark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.32)",  bg: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.045)" },
  };
}
const UP_NEXT = { label: "Up next", color: "rgb(139,92,246)", bg: "rgba(109,40,217,0.14)" };

function cardStyle(dark: boolean): React.CSSProperties {
  return {
    background: dark ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.02)",
    border: dark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.09)",
    borderRadius: 18,
    overflow: "hidden",
  };
}

// ─── Props ────────────────────────────────────────────────────────────────────
type OwnerProps = {
  role: "owner";
  everBooked: boolean;
  todaySchedule: AppointmentRow[];
  autopilot: AutopilotState;
  todayAutopilotRevenue: number;
  needsYou: NeedsYouCard[];
  familyHoursStreak: number;
  familyHoursEnabled: boolean;
  todayBookingsCount: number;
  nextAppointmentTime: string | null;
  monthRevenue: number;
  monthRevenueDeltaPct: number | null;
};
type StaffProps = { role: "staff"; todaySchedule: AppointmentRow[] };

export function HomeClient(props: OwnerProps | StaffProps) {
  const { dark } = useDashboardTheme();
  const dateStr = new Date().toLocaleDateString("en-CA", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <p style={{ color: dark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.48)", fontSize: 13, margin: 0 }}>{dateStr}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 30, background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)" }}>
          <PulseRing size={7} />
          <span style={{ fontSize: 11.5, fontWeight: 700, color: "rgb(52,211,153)" }}>Live</span>
        </div>
      </div>

      {props.role === "staff"
        ? <StaffSchedule schedule={props.todaySchedule} />
        : props.everBooked
          ? <OwnerPopulated {...props} />
          : <EmptyState />}
    </div>
  );
}

// ─── Staff: today's schedule only ──────────────────────────────────────────────
function StaffSchedule({ schedule }: { schedule: AppointmentRow[] }) {
  const { dark, T } = useDashboardTheme();
  const now = new Date();
  const nextId = schedule.find(a => a.status !== "completed" && a.status !== "cancelled" && new Date(a.starts_at) >= now)?.id;

  return (
    <div style={cardStyle(dark)}>
      <div style={{ padding: "18px 20px 14px", borderBottom: `1px solid ${T.divider}` }}>
        <p style={{ color: T.text, fontSize: 15, fontWeight: 700, margin: 0 }}>Your schedule today</p>
      </div>
      {schedule.length === 0 ? (
        <div style={{ padding: "40px 20px", textAlign: "center", color: dark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.43)", fontSize: 13 }}>
          No bookings on your calendar today.
        </div>
      ) : (
        <div style={{ padding: "8px 0" }}>
          {schedule.map(row => (
            <ScheduleRow key={row.id} row={row} isUpNext={row.id === nextId} />
          ))}
        </div>
      )}
    </div>
  );
}

function ScheduleRow({ row, isUpNext }: { row: AppointmentRow; isUpNext: boolean }) {
  const { dark, T } = useDashboardTheme();
  const s = isUpNext ? UP_NEXT : statusLabel(dark)[row.status];
  const color = colorFor(row.client_name);
  return (
    <div className="schedule-row" style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 20px" }}>
      <div className="schedule-row-time" style={{ display: "flex", alignItems: "center", gap: 4, width: 60, flexShrink: 0 }}>
        <Clock className="schedule-row-time-icon" size={11} color={T.textFaint} />
        <span style={{ color: dark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.38)", fontSize: 11.5, fontWeight: 600 }}>{fmtTime(row.starts_at)}</span>
      </div>
      <div className="schedule-row-avatar" style={{
        width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
        background: color + "22", border: `1.5px solid ${color}44`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11, fontWeight: 800, color,
      }}>
        {initialsFor(row.client_name)}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ color: T.text, fontSize: 13, fontWeight: 700, margin: "0 0 1px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{row.client_name}</p>
        <p style={{ color: dark ? "rgba(255,255,255,0.32)" : "rgba(0,0,0,0.4)", fontSize: 11.5, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{row.service_name}{row.stylist_name ? ` · ${row.stylist_name}` : ""}</p>
      </div>
      <span className="schedule-row-badge" style={{ fontSize: 10.5, fontWeight: 700, padding: "3px 9px", borderRadius: 20, color: s.color, background: s.bg, whiteSpace: "nowrap", flexShrink: 0 }}>
        {s.label}
      </span>
      <span style={{ color: "rgb(52,211,153)", fontSize: 13, fontWeight: 700, flexShrink: 0, minWidth: 46, textAlign: "right" }}>
        {fmtPrice(Number(row.price))}
      </span>
    </div>
  );
}

// ─── Owner: onboarding empty state ─────────────────────────────────────────────
function EmptyState() {
  const { dark } = useDashboardTheme();
  const card = cardStyle(dark);
  const primaryText = dark ? "rgb(250,250,250)" : "rgb(12,12,20)";
  const labelColor = dark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.43)";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Compact AutoPilot balance card — same visual language as the populated
          hero (OwnerPopulated below), just zeroed out until the first booking */}
      <div style={{
        background: dark
          ? "linear-gradient(135deg, rgba(88,28,218,0.4) 0%, rgba(109,40,217,0.18) 50%, rgba(16,185,129,0.08) 100%)"
          : "linear-gradient(135deg, rgba(88,28,218,0.16) 0%, rgba(109,40,217,0.08) 50%, rgba(16,185,129,0.05) 100%)",
        border: "1px solid rgba(139,92,246,0.3)",
        borderRadius: 20, padding: "20px 24px",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(139,92,246,0.15)", filter: "blur(50px)", pointerEvents: "none" }} />
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <PulseRing size={7} />
            <span style={{ color: "rgb(52,211,153)", fontSize: 10.5, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              AutoPilot is watching
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
            <p style={{ color: primaryText, fontSize: 32, fontWeight: 800, margin: 0, letterSpacing: "-0.04em", lineHeight: 1 }}>C$0</p>
            <p style={{ color: labelColor, fontSize: 12.5, margin: 0 }}>recovered so far</p>
          </div>
          <p style={{ color: labelColor, fontSize: 12.5, margin: "6px 0 0", maxWidth: 340, lineHeight: 1.5 }}>
            Starts recovering revenue automatically the moment your first booking comes in.
          </p>
        </div>
      </div>

      <p style={{ color: primaryText, fontSize: 13, fontWeight: 700, margin: "2px 0 -4px" }}>Complete your setup</p>

      {[
        { icon: CalendarDays, iconColor: "rgb(167,139,250)", iconBg: "rgba(139,92,246,0.12)", title: "Add today's bookings", sub: "Enter your first appointment to see the schedule come alive.", cta: "Add booking", href: "/dashboard/appointments" },
        { icon: Users2,       iconColor: "rgb(96,165,250)",  iconBg: "rgba(59,130,246,0.12)", title: "Add your team",        sub: "Each staff member gets their own calendar column.",        cta: "Add team member", href: "/dashboard/team" },
        { icon: Heart,        iconColor: "rgb(248,113,113)", iconBg: "rgba(239,68,68,0.1)",   title: "Set Family Hours",     sub: "Protect your personal time. AutoPilot respects it.",       cta: "Set hours", href: "/dashboard/settings" },
      ].map(row => {
        const Icon = row.icon;
        return (
          <div key={row.title} style={{ ...card, padding: "18px 20px", display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, flexShrink: 0, background: row.iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon size={20} color={row.iconColor} strokeWidth={1.7} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ color: dark ? "rgb(250,250,250)" : "rgb(12,12,20)", fontSize: 14, fontWeight: 700, margin: "0 0 2px" }}>{row.title}</p>
              <p style={{ color: dark ? "rgba(255,255,255,0.38)" : "rgba(0,0,0,0.46)", fontSize: 12.5, margin: 0 }}>{row.sub}</p>
            </div>
            <Link href={row.href} style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "9px 16px", borderRadius: 10,
              background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
              border: dark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.12)",
              color: dark ? "rgb(250,250,250)" : "rgb(12,12,20)", fontSize: 12.5, fontWeight: 700,
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

// ─── Owner: populated (real data) ──────────────────────────────────────────────
function OwnerPopulated(props: OwnerProps) {
  const { dark } = useDashboardTheme();
  const card = cardStyle(dark);
  const { autopilot, todayAutopilotRevenue, needsYou, familyHoursStreak, familyHoursEnabled,
    todayBookingsCount, nextAppointmentTime, monthRevenue, monthRevenueDeltaPct, todaySchedule } = props;

  const topNeed = needsYou[0] ?? null;
  const paymentNeed = needsYou.find(n => n.kind === "payment") ?? null;
  const now = new Date();
  const nextId = todaySchedule.find(a => a.status !== "completed" && a.status !== "cancelled" && new Date(a.starts_at) >= now)?.id;

  const primaryText = dark ? "rgb(250,250,250)" : "rgb(12,12,20)";
  const faintChevron = dark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.28)";
  const labelColor = dark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.43)";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

      {/* Hero: AutoPilot */}
      <div style={{
        background: dark
          ? "linear-gradient(135deg, rgba(88,28,218,0.4) 0%, rgba(109,40,217,0.18) 50%, rgba(16,185,129,0.08) 100%)"
          : "linear-gradient(135deg, rgba(88,28,218,0.16) 0%, rgba(109,40,217,0.08) 50%, rgba(16,185,129,0.05) 100%)",
        border: "1px solid rgba(139,92,246,0.3)",
        borderRadius: 20, padding: "28px 32px",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(139,92,246,0.15)", filter: "blur(50px)", pointerEvents: "none" }} />

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", position: "relative", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <PulseRing size={8} />
              <span style={{ color: "rgb(52,211,153)", fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                AUTOPILOT IS ON
              </span>
            </div>
            <p style={{ color: dark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.58)", fontSize: 12, fontWeight: 600, margin: "0 0 4px", letterSpacing: "0.03em" }}>
              RECOVERED THIS MONTH
            </p>
            <p style={{ color: primaryText, fontSize: 46, fontWeight: 800, margin: "0 0 20px", letterSpacing: "-0.04em", lineHeight: 1 }}>
              C$<AnimCount target={Math.round(autopilot.totals.revenue)} />
            </p>

            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              {[
                { label: "Today", value: fmtPrice(todayAutopilotRevenue) },
                { label: "Slots filled", value: String(autopilot.flowStats.filler.count) },
                { label: "No-shows saved", value: String(autopilot.flowStats.noshow.count) },
              ].map(s => (
                <div key={s.label}>
                  <p style={{ color: primaryText, fontSize: 18, fontWeight: 800, margin: "0 0 2px", letterSpacing: "-0.03em" }}>{s.value}</p>
                  <p style={{ color: dark ? "rgba(255,255,255,0.38)" : "rgba(0,0,0,0.46)", fontSize: 11, margin: 0 }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <Link href="/dashboard/autopilot" style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "12px 20px", borderRadius: 12, flexShrink: 0,
            background: "rgb(52,211,153)", border: "none",
            color: "rgb(5,40,20)", fontSize: 13, fontWeight: 800,
            cursor: "pointer", letterSpacing: "-0.01em", textDecoration: "none",
            boxShadow: "0 4px 20px rgba(52,211,153,0.3)",
          }}>
            Open AutoPilot
            <ChevronRight size={15} strokeWidth={2.5} />
          </Link>
        </div>
      </div>

      {/* 4 nav cards */}
      <div className="home-stat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        <Link href="/dashboard/appointments" style={{ textDecoration: "none" }}>
          <div style={{ ...card, padding: "20px 20px 18px", cursor: "pointer" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(139,92,246,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CalendarDays size={17} color="rgb(167,139,250)" strokeWidth={1.8} />
              </div>
              <ChevronRight size={15} color={faintChevron} />
            </div>
            <p style={{ color: labelColor, fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 6px" }}>TODAY&apos;S BOOKINGS</p>
            <p style={{ color: primaryText, fontSize: 28, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.04em" }}>{todayBookingsCount}</p>
            <p style={{ color: labelColor, fontSize: 12, margin: 0 }}>{nextAppointmentTime ? `Next at ${nextAppointmentTime}` : "Nothing left today"}</p>
          </div>
        </Link>

        <Link href="/dashboard/daily-brief" style={{ textDecoration: "none" }}>
          <div style={{ ...card, padding: "20px 20px 18px", cursor: "pointer", border: needsYou.length > 0 ? "1px solid rgba(248,113,113,0.22)" : card.border }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                <AlertTriangle size={17} color="rgb(248,113,113)" strokeWidth={1.8} />
                {needsYou.length > 0 && (
                  <span style={{ position: "absolute", top: -4, right: -4, minWidth: 16, height: 16, borderRadius: 8, background: "rgb(239,68,68)", color: "white", fontSize: 9, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {needsYou.length}
                  </span>
                )}
              </div>
              <ChevronRight size={15} color={faintChevron} />
            </div>
            <p style={{ color: labelColor, fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 6px" }}>NEEDS YOUR EYES</p>
            <p style={{ color: needsYou.length > 0 ? "rgb(248,113,113)" : primaryText, fontSize: 28, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.04em" }}>{needsYou.length}</p>
            <p style={{ color: labelColor, fontSize: 12, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{topNeed ? topNeed.text : "All clear"}</p>
          </div>
        </Link>

        <Link href="/dashboard/settings" style={{ textDecoration: "none" }}>
          <div style={{ ...card, padding: "20px 20px 18px", cursor: "pointer" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Heart size={17} color="rgb(248,113,113)" strokeWidth={1.8} />
              </div>
              <ChevronRight size={15} color={faintChevron} />
            </div>
            <p style={{ color: labelColor, fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 6px" }}>FAMILY HOURS</p>
            {familyHoursEnabled ? (
              <>
                <p style={{ color: primaryText, fontSize: 28, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.04em" }}>
                  {familyHoursStreak} <span style={{ fontSize: 16, color: dark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.48)", fontWeight: 600 }}>day streak</span>
                </p>
                <p style={{ color: labelColor, fontSize: 12, margin: 0 }}>Protected daily</p>
              </>
            ) : (
              <>
                <p style={{ color: primaryText, fontSize: 28, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.04em" }}>Off</p>
                <p style={{ color: labelColor, fontSize: 12, margin: 0 }}>Tap to set up</p>
              </>
            )}
          </div>
        </Link>

        <Link href="/dashboard/operations" style={{ textDecoration: "none" }}>
          <div style={{ ...card, padding: "20px 20px 18px", cursor: "pointer" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(59,130,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <BarChart2 size={17} color="rgb(96,165,250)" strokeWidth={1.8} />
              </div>
              <ChevronRight size={15} color={faintChevron} />
            </div>
            <p style={{ color: labelColor, fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 6px" }}>THIS MONTH</p>
            <p style={{ color: primaryText, fontSize: 28, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.04em" }}>{fmtPrice(monthRevenue)}</p>
            <p style={{ color: monthRevenueDeltaPct == null ? labelColor : monthRevenueDeltaPct >= 0 ? "rgb(52,211,153)" : "rgb(248,113,113)", fontSize: 12, margin: 0 }}>
              {monthRevenueDeltaPct == null ? "No data last month" : `${monthRevenueDeltaPct >= 0 ? "+" : ""}${monthRevenueDeltaPct}% vs last month`}
            </p>
          </div>
        </Link>
      </div>

      {/* Today's schedule + quick actions */}
      <div className="home-schedule-grid" style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16 }}>

        <div style={card}>
          <div style={{ padding: "18px 20px 14px", borderBottom: dark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ color: primaryText, fontSize: 15, fontWeight: 700, margin: 0 }}>Today&apos;s Schedule</p>
            <Link href="/dashboard/appointments" style={{ display: "flex", alignItems: "center", gap: 4, color: "rgb(167,139,250)", fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
              View all <ChevronRight size={13} />
            </Link>
          </div>

          {paymentNeed && (
            <div style={{ margin: "12px 16px 0", padding: "11px 14px", background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
                <AlertTriangle size={14} color="rgb(251,191,36)" strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} />
                <p style={{ color: dark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.65)", fontSize: 12.5, margin: 0, lineHeight: 1.5 }}>{paymentNeed.text}</p>
              </div>
              <Link href="/dashboard/daily-brief" style={{ padding: "7px 13px", borderRadius: 9, flexShrink: 0, background: "rgb(245,158,11)", color: "rgb(10,8,0)", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap", textDecoration: "none" }}>
                View
              </Link>
            </div>
          )}

          {todaySchedule.length === 0 ? (
            <div style={{ padding: "40px 20px", textAlign: "center", color: labelColor, fontSize: 13 }}>
              No bookings scheduled for today.
            </div>
          ) : (
            <div style={{ padding: "8px 0" }}>
              {todaySchedule.map(row => (
                <ScheduleRow key={row.id} row={row} isUpNext={row.id === nextId} />
              ))}
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ ...card, padding: "18px 20px" }}>
            <p style={{ color: dark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.48)", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 14px" }}>Quick actions</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label: "+ New booking",  href: "/dashboard/appointments", color: "rgb(109,40,217)",                                     text: "white" },
                { label: "Go to Clients",  href: "/dashboard/clients",      color: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",  text: dark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.68)" },
                { label: "View AutoPilot", href: "/dashboard/autopilot",    color: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",  text: dark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.68)" },
                { label: "View Team",      href: "/dashboard/team",         color: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",  text: dark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.68)" },
              ].map(a => (
                <Link key={a.label} href={a.href} style={{ display: "block", padding: "10px 14px", borderRadius: 10, background: a.color, border: dark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.09)", color: a.text, fontSize: 13, fontWeight: 700, textDecoration: "none", textAlign: "center" }}>
                  {a.label}
                </Link>
              ))}
            </div>
          </div>

          <div style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 14, padding: "16px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <PulseRing size={6} color="rgb(167,139,250)" />
              <span style={{ color: labelColor, fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" }}>Needs your attention</span>
            </div>
            <p style={{ color: dark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.68)", fontSize: 12.5, margin: "0 0 10px", lineHeight: 1.55 }}>
              {topNeed ? topNeed.text : "You're all caught up — nothing needs your attention right now."}
            </p>
            {topNeed && (
              <Link href="/dashboard/daily-brief" style={{ display: "inline-block", padding: "7px 14px", borderRadius: 9, border: "1px solid rgba(139,92,246,0.3)", background: "rgba(139,92,246,0.1)", color: "rgb(167,139,250)", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
                View details →
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
