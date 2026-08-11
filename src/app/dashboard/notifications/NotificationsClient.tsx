"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Zap, AlertCircle, RotateCcw, Calendar, MessageSquare, Clock, Gift,
  Users, TrendingDown, CreditCard, Bell, BellOff, Filter, X,
} from "lucide-react";
import type { AutopilotEvent, FlowKey } from "../autopilot/actions";
import type { NeedsYouCard } from "../daily-brief/actions";

type NotifKind = "needs_you" | "autopilot";

type Notif = {
  id: string;
  kind: NotifKind;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  title: string;
  body: string;
  timeAgo: string;
  read: boolean;
  href?: string;
  actionLabel?: string;
  client?: string;
  amount?: string;
};

const FLOW_META: Record<FlowKey, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  noshow:    { icon: RotateCcw,     color: "rgb(248,113,113)", bg: "rgba(239,68,68,0.12)",  label: "No-show recovery" },
  filler:    { icon: Calendar,      color: "rgb(251,191,36)",  bg: "rgba(245,158,11,0.12)", label: "Last-minute slot filled" },
  winback:   { icon: Zap,           color: "rgb(167,139,250)", bg: "rgba(139,92,246,0.15)", label: "Win-back" },
  frontdesk: { icon: MessageSquare, color: "rgb(96,165,250)",  bg: "rgba(59,130,246,0.12)", label: "AI Front Desk" },
  reminders: { icon: Clock,         color: "rgb(52,211,153)",  bg: "rgba(16,185,129,0.12)", label: "Rebooking reminder" },
  birthday:  { icon: Gift,          color: "rgb(251,146,60)",  bg: "rgba(249,115,22,0.12)", label: "Birthday offer" },
};

const NEEDS_META: Record<NeedsYouCard["kind"], { icon: React.ElementType; color: string; bg: string; title: string; href: string; actionLabel: string }> = {
  winback: { icon: Users,        color: "rgb(167,139,250)", bg: "rgba(139,92,246,0.12)", title: "Client at risk of churning", href: "/dashboard/clients", actionLabel: "View clients" },
  staff:   { icon: TrendingDown, color: "rgb(248,113,113)", bg: "rgba(239,68,68,0.12)",  title: "Team member needs attention", href: "/dashboard/team", actionLabel: "View team" },
  payment: { icon: CreditCard,   color: "rgb(251,146,60)",  bg: "rgba(249,115,22,0.12)", title: "Unpaid deposit", href: "/dashboard/appointments", actionLabel: "View appointments" },
};

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

function buildNotifs(events: AutopilotEvent[], needsYou: NeedsYouCard[]): Notif[] {
  const now = Date.now();
  const DAY_MS = 24 * 60 * 60 * 1000;

  const needsNotifs: Notif[] = needsYou.map(c => {
    const meta = NEEDS_META[c.kind];
    return {
      id: c.id,
      kind: "needs_you",
      icon: meta.icon,
      iconColor: meta.color,
      iconBg: meta.bg,
      title: meta.title,
      body: c.text,
      timeAgo: "Now",
      read: false,
      href: meta.href,
      actionLabel: meta.actionLabel,
    };
  });

  const autoNotifs: Notif[] = events.map(e => {
    const meta = FLOW_META[e.flow_key] ?? FLOW_META.winback;
    return {
      id: e.id,
      kind: "autopilot",
      icon: meta.icon,
      iconColor: meta.color,
      iconBg: meta.bg,
      title: e.client_name ? `${meta.label}: ${e.client_name}` : meta.label,
      body: e.event_text,
      timeAgo: timeAgo(e.created_at),
      read: now - new Date(e.created_at).getTime() > DAY_MS,
      client: e.client_name ?? undefined,
      amount: e.amount && e.amount > 0 ? fmtPrice(Number(e.amount)) : undefined,
    };
  });

  return [...needsNotifs, ...autoNotifs];
}

function NotifCard({ n, onDismiss }: { n: Notif; onDismiss: (id: string) => void }) {
  const Icon = n.icon;
  const isNeeds = n.kind === "needs_you";

  return (
    <div style={{
      position: "relative",
      background: n.read ? "var(--dsurface1)" : isNeeds ? "rgba(248,113,113,0.04)" : "rgba(139,92,246,0.04)",
      border: `1px solid ${n.read ? "var(--dw06)" : isNeeds ? "rgba(239,68,68,0.18)" : "rgba(139,92,246,0.18)"}`,
      borderRadius: 16,
      padding: "16px 18px",
      transition: "border-color 0.2s",
    }}>
      {!n.read && (
        <span style={{
          position: "absolute", top: 18, right: 18,
          width: 8, height: 8, borderRadius: "50%",
          background: isNeeds ? "rgb(248,113,113)" : "rgb(167,139,250)",
        }} />
      )}

      <div style={{ display: "flex", gap: 14 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 11, flexShrink: 0,
          background: n.iconBg,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon size={18} color={n.iconColor} strokeWidth={2} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 5 }}>
            <p style={{ color: "var(--dtext)", fontSize: 13.5, fontWeight: 700, margin: 0, lineHeight: 1.3 }}>{n.title}</p>
            <span style={{ color: "var(--dw25)", fontSize: 11, whiteSpace: "nowrap", flexShrink: 0 }}>{n.timeAgo}</span>
          </div>

          <p style={{ color: "var(--dw55)", fontSize: 13, margin: "0 0 12px", lineHeight: 1.55 }}>{n.body}</p>

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: n.href ? 12 : 0 }}>
            {n.client && (
              <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 9px", borderRadius: 20, color: "var(--dw4)", background: "var(--dsurface3)" }}>
                {n.client}
              </span>
            )}
            {n.amount && (
              <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 20, color: "rgb(52,211,153)", background: "rgba(16,185,129,0.1)" }}>
                {n.amount}
              </span>
            )}
          </div>

          {n.href && (
            <div style={{ display: "flex", gap: 8 }}>
              <Link href={n.href} style={{
                padding: "7px 16px", borderRadius: 9, cursor: "pointer",
                fontSize: 12.5, fontWeight: 700, textDecoration: "none", display: "inline-block",
                background: isNeeds ? "rgb(109,40,217)" : "rgba(139,92,246,0.2)",
                color: isNeeds ? "white" : "rgb(167,139,250)",
                border: !isNeeds ? "1px solid rgba(139,92,246,0.3)" : "1px solid transparent",
              }}>
                {n.actionLabel ?? "View"}
              </Link>
              <button onClick={() => onDismiss(n.id)} style={{
                padding: "7px 14px", borderRadius: 9,
                background: "var(--dsurface2)", border: "1px solid var(--dw07)",
                color: "var(--dw35)", fontSize: 12.5, cursor: "pointer",
              }}>
                Dismiss
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

type FilterTab = "All" | "Needs you" | "AutoPilot wins";

export function NotificationsClient({ events, needsYou }: { events: AutopilotEvent[]; needsYou: NeedsYouCard[] }) {
  const initial = useMemo(() => buildNotifs(events, needsYou), [events, needsYou]);
  const [notifs, setNotifs] = useState<Notif[]>(initial);
  const [filter, setFilter] = useState<FilterTab>("All");
  const [muteAll, setMuteAll] = useState(false);

  const dismiss = (id: string) => setNotifs(n => n.filter(x => x.id !== id));
  const markAll = () => setNotifs(n => n.map(x => ({ ...x, read: true })));

  const unreadNeeds = notifs.filter(n => n.kind === "needs_you" && !n.read).length;
  const unreadAuto  = notifs.filter(n => n.kind === "autopilot" && !n.read).length;
  const totalUnread = unreadNeeds + unreadAuto;

  const visible = notifs.filter(n => {
    if (filter === "Needs you") return n.kind === "needs_you";
    if (filter === "AutoPilot wins") return n.kind === "autopilot";
    return true;
  });

  const needsGroup = visible.filter(n => n.kind === "needs_you");
  const autoGroup = visible.filter(n => n.kind === "autopilot");

  return (
    <div style={{ maxWidth: 740, margin: "0 auto", display: "flex", flexDirection: "column", gap: 22 }}>

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <h1 style={{ color: "var(--dtext)", fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: "-0.03em" }}>Notifications</h1>
            {totalUnread > 0 && (
              <span style={{ fontSize: 12, fontWeight: 800, padding: "2px 9px", borderRadius: 20, background: "rgba(248,113,113,0.2)", color: "rgb(248,113,113)", border: "1px solid rgba(239,68,68,0.25)" }}>
                {totalUnread} new
              </span>
            )}
          </div>
          <p style={{ color: "var(--dw35)", fontSize: 13, margin: 0 }}>
            {unreadNeeds > 0 ? `${unreadNeeds} need${unreadNeeds > 1 ? "" : "s"} your attention` : "You're all caught up"} · AutoPilot handled {notifs.filter(n => n.kind === "autopilot").length} thing{notifs.filter(n => n.kind === "autopilot").length === 1 ? "" : "s"}
          </p>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {totalUnread > 0 && (
            <button onClick={markAll} style={{ padding: "8px 14px", borderRadius: 9, background: "var(--dsurface3)", border: "1px solid var(--dw09)", color: "var(--dw45)", fontSize: 12.5, cursor: "pointer" }}>
              Mark all read
            </button>
          )}
          <button onClick={() => setMuteAll(v => !v)} style={{
            width: 36, height: 36, borderRadius: 9,
            background: muteAll ? "rgba(248,113,113,0.1)" : "var(--dw05)",
            border: `1px solid ${muteAll ? "rgba(239,68,68,0.2)" : "var(--dw09)"}`,
            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
          }}>
            {muteAll ? <BellOff size={15} color="rgb(248,113,113)" /> : <Bell size={15} color="var(--dw4)" />}
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={{
          background: unreadNeeds > 0 ? "rgba(248,113,113,0.06)" : "var(--dw025)",
          border: `1px solid ${unreadNeeds > 0 ? "rgba(239,68,68,0.2)" : "var(--dw07)"}`,
          borderRadius: 14, padding: "16px 18px", display: "flex", alignItems: "center", gap: 14,
        }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <AlertCircle size={18} color="rgb(248,113,113)" strokeWidth={2} />
          </div>
          <div>
            <p style={{ color: "var(--dtext)", fontSize: 20, fontWeight: 800, margin: "0 0 2px", letterSpacing: "-0.03em" }}>{needsGroup.length}</p>
            <p style={{ color: "var(--dw35)", fontSize: 12, margin: 0 }}>Need your eyes</p>
          </div>
          {unreadNeeds > 0 && (
            <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "rgba(239,68,68,0.15)", color: "rgb(248,113,113)" }}>{unreadNeeds} new</span>
          )}
        </div>

        <div style={{
          background: "rgba(139,92,246,0.05)",
          border: "1px solid rgba(139,92,246,0.15)",
          borderRadius: 14, padding: "16px 18px", display: "flex", alignItems: "center", gap: 14,
        }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(139,92,246,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Zap size={18} color="rgb(167,139,250)" strokeWidth={2} />
          </div>
          <div>
            <p style={{ color: "var(--dtext)", fontSize: 20, fontWeight: 800, margin: "0 0 2px", letterSpacing: "-0.03em" }}>{autoGroup.length}</p>
            <p style={{ color: "var(--dw35)", fontSize: 12, margin: 0 }}>AutoPilot wins</p>
          </div>
          {unreadAuto > 0 && (
            <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "rgba(139,92,246,0.15)", color: "rgb(167,139,250)" }}>{unreadAuto} new</span>
          )}
        </div>
      </div>

      <div style={{ display: "flex", gap: 6 }}>
        {(["All", "Needs you", "AutoPilot wins"] as FilterTab[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              display: "flex", alignItems: "center", gap: 7, padding: "8px 16px",
              borderRadius: 20,
              border: `1px solid ${filter === f ? (f === "Needs you" ? "rgba(239,68,68,0.35)" : f === "AutoPilot wins" ? "rgba(139,92,246,0.35)" : "var(--dw15)") : "var(--dw07)"}`,
              background: filter === f ? (f === "Needs you" ? "rgba(239,68,68,0.1)" : f === "AutoPilot wins" ? "rgba(109,40,217,0.12)" : "var(--dw07)") : "var(--dw03)",
              color: filter === f ? (f === "Needs you" ? "rgb(248,113,113)" : f === "AutoPilot wins" ? "var(--dpurple-text)" : "var(--dtext)") : "var(--dw38)",
              fontSize: 13, fontWeight: filter === f ? 700 : 500, cursor: "pointer",
            }}
          >
            {f === "Needs you" && <AlertCircle size={12} strokeWidth={2.5} />}
            {f === "AutoPilot wins" && <Zap size={12} strokeWidth={2.5} />}
            {f === "All" && <Filter size={11} strokeWidth={2} />}
            {f}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--dw2)", fontSize: 13 }}>
          {notifs.length === 0 ? "Nothing here yet. AutoPilot activity and things that need your attention will show up here." : "No notifications here"}
        </div>
      ) : (
        <>
          {(filter === "All" || filter === "Needs you") && needsGroup.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filter === "All" && (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <AlertCircle size={13} color="rgb(248,113,113)" strokeWidth={2.5} />
                  <span style={{ color: "rgb(248,113,113)", fontSize: 11.5, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase" }}>Needs your attention</span>
                  {unreadNeeds > 0 && (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 20, background: "rgba(239,68,68,0.15)", color: "rgb(248,113,113)" }}>{unreadNeeds}</span>
                  )}
                </div>
              )}
              {needsGroup.map(n => (
                <NotifCard key={n.id} n={n} onDismiss={dismiss} />
              ))}
            </div>
          )}

          {filter === "All" && needsGroup.length > 0 && autoGroup.length > 0 && (
            <div style={{ height: 4 }} />
          )}

          {(filter === "All" || filter === "AutoPilot wins") && autoGroup.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filter === "All" && (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Zap size={13} color="rgb(167,139,250)" strokeWidth={2.5} />
                  <span style={{ color: "rgb(167,139,250)", fontSize: 11.5, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase" }}>AutoPilot wins</span>
                  {unreadAuto > 0 && (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 20, background: "rgba(139,92,246,0.15)", color: "rgb(167,139,250)" }}>{unreadAuto}</span>
                  )}
                </div>
              )}
              {autoGroup.map(n => (
                <NotifCard key={n.id} n={n} onDismiss={dismiss} />
              ))}
            </div>
          )}
        </>
      )}

      {muteAll && (
        <div style={{
          position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)",
          background: "rgba(15,12,30,0.95)", border: "1px solid rgba(248,113,113,0.3)",
          borderRadius: 12, padding: "12px 20px",
          display: "flex", alignItems: "center", gap: 10,
          boxShadow: "0 8px 40px rgba(0,0,0,0.6)", backdropFilter: "blur(12px)",
          zIndex: 200, whiteSpace: "nowrap",
        }}>
          <BellOff size={15} color="rgb(248,113,113)" />
          <span style={{ color: "var(--dw7)", fontSize: 13 }}>Notifications muted</span>
          <button onClick={() => setMuteAll(false)} style={{ background: "none", border: "none", cursor: "pointer", marginLeft: 4 }}>
            <X size={13} color="var(--dw4)" />
          </button>
        </div>
      )}
    </div>
  );
}
