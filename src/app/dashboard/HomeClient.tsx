"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  AlertTriangle, ArrowUpRight, CalendarDays, ChevronRight, CircleCheck,
  Plus, RotateCcw, Users, Users2, Zap, type LucideIcon,
} from "lucide-react";
import type { AppointmentRow, AppointmentStatus } from "./appointments/actions";
import type { AutopilotState } from "./autopilot/actions";
import type { NeedsYouCard } from "./daily-brief/actions";

// Layout and styles: ./dash.css (fd- classes), loaded by DashboardShell.

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
function PulseRing({ color = "var(--fd-green)", size = 10 }: { color?: string; size?: number }) {
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

// Solid pills in both themes; grey is the quiet one for states that need no attention.
type Tone = "violet" | "green" | "amber" | "orange" | "grey";
const STATUS: Record<AppointmentStatus, { label: string; tone: Tone }> = {
  completed: { label: "Done",        tone: "grey" },
  confirmed: { label: "Confirmed",   tone: "green" },
  pending:   { label: "Pending",     tone: "grey" },
  deposit:   { label: "Deposit due", tone: "amber" },
  cancelled: { label: "Cancelled",   tone: "grey" },
  no_show:   { label: "No-show",     tone: "orange" },
};
const UP_NEXT: { label: string; tone: Tone } = { label: "Up next", tone: "violet" };

const NEED_ICON: Record<NeedsYouCard["kind"], LucideIcon> = {
  winback: RotateCcw,
  staff: Users2,
  payment: AlertTriangle,
};

// ─── Props ────────────────────────────────────────────────────────────────────
type OwnerProps = {
  role: "owner";
  everBooked: boolean;
  todaySchedule: AppointmentRow[];
  autopilot: AutopilotState;
  todayAutopilotRevenue: number;
  needsYou: NeedsYouCard[];
  todayBookingsCount: number;
  nextAppointmentTime: string | null;
  revenueScheduled: number;
  staffWorking: number;
  monthRevenue: number;
  monthRevenueDeltaPct: number | null;
};
type StaffProps = { role: "staff"; todaySchedule: AppointmentRow[] };

export function HomeClient(props: OwnerProps | StaffProps) {
  const dateStr = new Date().toLocaleDateString("en-CA", { weekday: "long", month: "long", day: "numeric" });
  const owner = props.role === "owner";

  return (
    <div className="fd-page">
      <div className="fd-page-head">
        <div>
          <p className="fd-date">{dateStr}</p>
          <h1>Overview</h1>
          <p className="fd-sub">{owner ? "Here's what's happening at your shop today." : "Here's your schedule for today."}</p>
        </div>
        <div className="fd-inline">
          <span className="fd-tag"><PulseRing size={8} /> Live</span>
          {owner && (
            <Link href="/dashboard/appointments" className="fd-btn fd-btn-primary">
              <Plus size={15} strokeWidth={2.2} /> New booking
            </Link>
          )}
        </div>
      </div>

      {props.role === "staff"
        ? <ScheduleCard title="Your schedule today" schedule={props.todaySchedule} emptyText="No bookings on your calendar today." />
        : props.everBooked
          ? <OwnerPopulated {...props} />
          : <EmptyState />}
    </div>
  );
}

// ─── Today's schedule (owner and staff) ───────────────────────────────────────
function ScheduleCard({ title, schedule, emptyText, showNew = false }: {
  title: string; schedule: AppointmentRow[]; emptyText: string; showNew?: boolean;
}) {
  const now = new Date();
  const nextId = schedule.find(a => a.status !== "completed" && a.status !== "cancelled" && a.status !== "no_show" && new Date(a.starts_at) >= now)?.id;

  return (
    <section className="fd-card fd-card-pad">
      <div className="fd-head is-line">
        <h2>{title}</h2>
        <Link href="/dashboard/appointments">View all <ChevronRight size={13} /></Link>
      </div>

      {schedule.length === 0 ? (
        <div className="fd-empty">
          <span className="fd-empty-icon"><CalendarDays size={18} strokeWidth={1.8} /></span>
          <b>Nothing booked today</b>
          <p>{emptyText}</p>
          {showNew && (
            <Link href="/dashboard/appointments" className="fd-btn fd-btn-ghost fd-btn-sm">
              <Plus size={14} /> New booking
            </Link>
          )}
        </div>
      ) : (
        <div>
          {schedule.map(row => (
            <ScheduleRow key={row.id} row={row} isUpNext={row.id === nextId} />
          ))}
        </div>
      )}
    </section>
  );
}

function ScheduleRow({ row, isUpNext }: { row: AppointmentRow; isUpNext: boolean }) {
  const s = isUpNext ? UP_NEXT : STATUS[row.status];
  return (
    <div className="fd-sched-row">
      <span className="fd-sched-time">{fmtTime(row.starts_at)}</span>
      <span className="fd-sched-avatar" style={{ background: colorFor(row.client_name) }} aria-hidden="true">
        {initialsFor(row.client_name)}
      </span>
      <span className="fd-row-main">
        <b>{row.client_name}</b>
        <small>{row.service_name}{row.stylist_name ? ` · ${row.stylist_name}` : ""}</small>
      </span>
      <span className={`fd-status fd-status-${s.tone}`}>{s.label}</span>
      <span className="fd-sched-price">{fmtPrice(Number(row.price))}</span>
    </div>
  );
}

// ─── Owner: before the first booking ──────────────────────────────────────────
function EmptyState() {
  const steps: { icon: LucideIcon; title: string; sub: string; cta: string; href: string; primary: boolean }[] = [
    { icon: CalendarDays, title: "Add today's bookings", sub: "Enter your first appointment to see the schedule come alive.", cta: "Add booking", href: "/dashboard/appointments", primary: true },
    { icon: Users2,       title: "Add your team",        sub: "Each staff member gets their own calendar column.",        cta: "Add team member", href: "/dashboard/team", primary: false },
  ];

  return (
    <>
      <section className="fd-band">
        <div className="fd-band-main">
          <p className="fd-band-status"><PulseRing color="#6ee7b7" size={9} /> AutoPilot is watching</p>
          <p className="fd-band-value">C$0 <small>recovered so far</small></p>
        </div>
        <p className="fd-band-note">Starts recovering revenue automatically the moment your first booking comes in.</p>
        <Link href="/dashboard/autopilot" className="fd-band-btn">
          Open AutoPilot <ArrowUpRight size={16} strokeWidth={2.2} />
        </Link>
      </section>

      <section className="fd-card fd-card-pad">
        <div className="fd-head is-line">
          <h2>Complete your setup</h2>
          <small>{steps.length} steps</small>
        </div>
        <ul className="fd-rows fd-setup">
          {steps.map(({ icon: Icon, title, sub, cta, href, primary }) => (
            <li key={title}>
              <div className="fd-row">
                <span className="fd-ico"><Icon size={17} strokeWidth={1.8} /></span>
                <span className="fd-row-main">
                  <b>{title}</b>
                  <small>{sub}</small>
                </span>
                <Link href={href} className={`fd-btn fd-btn-sm ${primary ? "fd-btn-primary" : "fd-btn-ghost"}`}>
                  <Plus size={14} strokeWidth={2.2} /> {cta}
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

// ─── Owner: live numbers ──────────────────────────────────────────────────────
function OwnerPopulated(props: OwnerProps) {
  const { autopilot, todayAutopilotRevenue, needsYou, todayBookingsCount, nextAppointmentTime,
    revenueScheduled, staffWorking, monthRevenue, monthRevenueDeltaPct, todaySchedule } = props;

  const topNeed = needsYou[0] ?? null;

  const bandStats = [
    { label: "Today", value: fmtPrice(todayAutopilotRevenue) },
    { label: "Slots filled", value: String(autopilot.flowStats.filler.count) },
    { label: "No-shows saved", value: String(autopilot.flowStats.noshow.count) },
    { label: "Win-backs", value: String(autopilot.flowStats.winback.count) },
    { label: "Clients reached", value: String(autopilot.totals.customers) },
  ];

  const delta = monthRevenueDeltaPct;
  const stats: { title: string; value: string; foot: string; href: string; alert?: boolean; footTone?: "up" | "down" }[] = [
    {
      title: "Today's bookings", value: String(todayBookingsCount), href: "/dashboard/appointments",
      foot: nextAppointmentTime ? `Next at ${nextAppointmentTime}` : "Nothing left today",
    },
    {
      title: "Needs your eyes", value: String(needsYou.length), href: "/dashboard/daily-brief",
      foot: topNeed ? topNeed.text : "All clear", alert: needsYou.length > 0,
    },
    {
      title: "Booked today", value: fmtPrice(revenueScheduled), href: "/dashboard/payments",
      foot: staffWorking > 0 ? `${staffWorking} staff working` : "No one scheduled yet",
    },
    {
      title: "Revenue this month", value: fmtPrice(monthRevenue), href: "/dashboard/operations",
      foot: delta == null ? "No data last month" : `${delta >= 0 ? "+" : ""}${delta}% vs last month`,
      footTone: delta == null ? undefined : delta >= 0 ? "up" : "down",
    },
  ];

  const links: { icon: LucideIcon; label: string; href: string }[] = [
    { icon: Users,  label: "Go to Clients",  href: "/dashboard/clients" },
    { icon: Zap,    label: "View AutoPilot", href: "/dashboard/autopilot" },
    { icon: Users2, label: "View Team",      href: "/dashboard/team" },
  ];

  return (
    <>
      <section className="fd-band">
        <div className="fd-band-main">
          <p className="fd-band-status"><PulseRing color="#6ee7b7" size={9} /> AutoPilot is on</p>
          <p className="fd-band-value">
            <span>C$<AnimCount target={Math.round(autopilot.totals.revenue)} /></span>
            <small>recovered this month</small>
          </p>
        </div>
        <dl className="fd-band-stats">
          {bandStats.map(s => (
            <div key={s.label}>
              <dt>{s.label}</dt>
              <dd>{s.value}</dd>
            </div>
          ))}
        </dl>
        <Link href="/dashboard/autopilot" className="fd-band-btn">
          Open AutoPilot <ArrowUpRight size={16} strokeWidth={2.2} />
        </Link>
      </section>

      <div className="fd-stats">
        {stats.map(s => (
          <Link key={s.title} href={s.href} className="fd-card fd-stat">
            <div className="fd-stat-top">
              <h2>{s.title}</h2>
              <ArrowUpRight size={15} aria-hidden="true" />
            </div>
            <p className={`fd-big${s.alert ? " is-alert" : ""}`}>{s.value}</p>
            <p className={`fd-foot${s.footTone ? ` is-${s.footTone}` : ""}`}>{s.foot}</p>
          </Link>
        ))}
      </div>

      <div className="fd-grid-main">
        <ScheduleCard title="Today's schedule" schedule={todaySchedule} emptyText="Bookings for today will show up here as they come in." showNew />

        <div className="fd-col">
          <section className="fd-card fd-card-pad">
            <div className="fd-head">
              <h2>Needs attention {needsYou.length > 0 && <span className="fd-num">{needsYou.length}</span>}</h2>
              {needsYou.length > 0 && <Link href="/dashboard/daily-brief">Daily brief <ChevronRight size={13} /></Link>}
            </div>
            {needsYou.length > 0 ? (
              <ul className="fd-rows">
                {needsYou.map(n => {
                  const Icon = NEED_ICON[n.kind] ?? AlertTriangle;
                  return (
                    <li key={n.id}>
                      <Link href="/dashboard/daily-brief" className="fd-row">
                        <span className="fd-ico"><Icon size={16} strokeWidth={1.8} /></span>
                        <span className="fd-row-text">{n.text}</span>
                        <ChevronRight size={15} />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="fd-clear"><CircleCheck size={16} /> You&apos;re all caught up.</p>
            )}
          </section>

          <section className="fd-card fd-card-pad">
            <div className="fd-head">
              <h2>Quick actions</h2>
            </div>
            <ul className="fd-rows">
              {links.map(({ icon: Icon, label, href }) => (
                <li key={href}>
                  <Link href={href} className="fd-row">
                    <span className="fd-ico"><Icon size={16} strokeWidth={1.8} /></span>
                    <span className="fd-row-text">{label}</span>
                    <ChevronRight size={15} />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
