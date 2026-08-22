"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Zap, Phone, Mail, MessageSquare,
  CalendarDays, ChevronRight, AlertTriangle, Check,
} from "lucide-react";
import type { AppointmentRow, AppointmentStatus } from "../../appointments/actions";
import { keyFor, type DerivedClient, type ClientTag } from "@/lib/dashboard/clients";

const TAG_FILL: Record<NonNullable<ClientTag>, string> = {
  VIP:          "rgb(217,119,6)",
  Loyal:        "rgb(37,99,235)",
  "New":        "rgb(5,150,105)",
  Overdue:      "rgb(234,88,12)",
  "Churn risk": "rgb(220,38,38)",
};
const CHURN_DOT: Record<string, string> = {
  "Churn risk": "rgb(248,113,113)",
  "Overdue":    "rgb(251,191,36)",
};
const CHURN_DOT_DEFAULT = "rgb(52,211,153)";

const STATUS_LABEL: Record<AppointmentStatus, { label: string; color: string; bg: string }> = {
  completed: { label: "Done",      color: "var(--dw35)", bg: "var(--dw05)" },
  confirmed: { label: "Confirmed", color: "rgb(52,211,153)", bg: "rgba(16,185,129,0.1)" },
  pending:   { label: "Pending",   color: "var(--dw5)",  bg: "var(--dw06)" },
  deposit:   { label: "⚠ Deposit", color: "rgb(251,191,36)", bg: "rgba(245,158,11,0.1)" },
  cancelled: { label: "Cancelled", color: "var(--dw25)", bg: "var(--dw03)" },
};

const card: React.CSSProperties = {
  background: "var(--dsurface1)",
  border: "1px solid var(--dw07)",
  borderRadius: 16,
};

const AVATAR_COLORS = ["rgb(124,58,237)", "rgb(5,150,105)", "rgb(37,99,235)", "rgb(217,119,6)", "rgb(220,38,38)", "rgb(234,88,12)"];
function colorFor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function initialsFor(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

function fmtPrice(n: number) {
  return Number.isInteger(n) ? `C$${n.toLocaleString()}` : `C$${n.toFixed(2)}`;
}

function fmtDate(iso: string) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Edmonton", month: "short", day: "numeric", year: "numeric" }).format(new Date(iso));
}

function fmtDaysAgo(days: number | null) {
  if (days == null) return "No visits yet";
  const d = Math.round(days);
  if (d <= 0) return "Today";
  if (d === 1) return "Yesterday";
  return `${d} days ago`;
}

const PROFILE_TABS = ["Overview", "History"] as const;
type ProfileTab = typeof PROFILE_TABS[number];

export function ClientProfilePage({ client, appointments, engaged }: {
  client: DerivedClient; appointments: AppointmentRow[]; engaged: boolean;
}) {
  const [tab, setTab] = useState<ProfileTab>("Overview");
  const now = new Date();

  const own = useMemo(
    () => appointments.filter(a => keyFor(a) === client.key).sort((a, b) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime()),
    [appointments, client.key],
  );
  const upcoming = own.find(a => a.status !== "completed" && a.status !== "cancelled" && new Date(a.starts_at) >= now) ?? null;
  const past = own.filter(a => a.status === "completed");
  const avgSpend = client.visits > 0 ? client.ltv / client.visits : 0;
  const color = colorFor(client.name);
  const bookHref = `/dashboard/appointments?newBooking=1&clientName=${encodeURIComponent(client.name)}`;

  const statItem = (label: string, value: string, valColor?: string) => (
    <div style={{ textAlign: "center" }}>
      <p style={{ color: valColor ?? "var(--dtext)", fontSize: 18, fontWeight: 800, margin: "0 0 2px", letterSpacing: "-0.02em" }}>{value}</p>
      <p style={{ color: "var(--dw3)", fontSize: 10, margin: 0, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>{label}</p>
    </div>
  );

  const actionBtn = (Icon: React.ElementType, label: string, href: string | null, primary?: boolean) => {
    const disabled = href === null;
    return (
      <a href={href ?? undefined} style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
        padding: "10px 12px", borderRadius: 12,
        border: primary ? "none" : "1px solid var(--dw08)",
        background: primary ? "rgb(109,40,217)" : "var(--dw04)",
        cursor: disabled ? "default" : "pointer", flex: 1, textDecoration: "none",
        opacity: disabled ? 0.4 : 1, pointerEvents: disabled ? "none" : "auto",
      }}>
        <Icon size={18} color={primary ? "white" : "var(--dw6)"} strokeWidth={1.8} />
        <span style={{ color: primary ? "white" : "var(--dw55)", fontSize: 10.5, fontWeight: 700 }}>{label}</span>
      </a>
    );
  };

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", paddingBottom: 40 }}>
      <Link href="/dashboard/clients" style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        color: "var(--dw5)", fontSize: 13, fontWeight: 600,
        textDecoration: "none", marginBottom: 18,
      }}>
        <ArrowLeft size={15} /> Back to Clients
      </Link>

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16, gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{
              width: 56, height: 56, borderRadius: "50%",
              background: color,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, fontWeight: 800, color: "white",
            }}>
              {initialsFor(client.name)}
            </div>
            <span style={{
              position: "absolute", bottom: 1, right: 1,
              width: 12, height: 12, borderRadius: "50%",
              background: client.tag ? (CHURN_DOT[client.tag] ?? CHURN_DOT_DEFAULT) : CHURN_DOT_DEFAULT,
              border: "2px solid var(--dring)",
            }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
              <h1 style={{ color: "var(--dtext)", fontSize: 20, fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>{client.name}</h1>
              {client.tag === "Churn risk" && (
                <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, color: "white", background: "rgb(220,38,38)" }}>
                  ⚠ Churn risk
                </span>
              )}
            </div>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {client.tag && (
                <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, color: "white", background: TAG_FILL[client.tag] }}>
                  {client.tag}
                </span>
              )}
              {engaged && (
                <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, color: "white", background: "rgb(109,40,217)" }}>
                  <Zap size={8} /> AutoPilot
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{
        display: "grid", gridTemplateColumns: "repeat(4,1fr)",
        background: "var(--dsurface2)", border: "1px solid var(--dw06)",
        borderRadius: 14, padding: "14px 16px", marginBottom: 16, gap: 8,
      }}>
        {statItem("Visits", String(client.visits))}
        <div style={{ width: 1, background: "var(--dsurface3)" }} />
        {statItem("LTV", fmtPrice(client.ltv), "rgb(52,211,153)")}
        <div style={{ width: 1, background: "var(--dsurface3)" }} />
        {statItem("Avg spend", fmtPrice(avgSpend))}
        <div style={{ width: 1, background: "var(--dsurface3)" }} />
        {statItem("Last visit", fmtDaysAgo(client.daysSinceLastVisit))}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {actionBtn(CalendarDays, "Book", bookHref, true)}
        {actionBtn(MessageSquare, "SMS", client.phone ? `sms:${client.phone}` : null)}
        {actionBtn(Phone, "Call", client.phone ? `tel:${client.phone}` : null)}
        {actionBtn(Mail, "Email", client.email ? `mailto:${client.email}` : null)}
      </div>

      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--dw07)", overflowX: "auto", marginBottom: 20 }}>
        {PROFILE_TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "10px 16px", border: "none", background: "transparent", cursor: "pointer",
            fontSize: 12.5, fontWeight: tab === t ? 700 : 500,
            color: tab === t ? "rgb(139,92,246)" : "var(--dw35)",
            borderBottom: tab === t ? "2px solid rgb(139,92,246)" : "2px solid transparent",
            whiteSpace: "nowrap", transition: "color 0.15s",
          }}>
            {t}
          </button>
        ))}
      </div>

      {tab === "Overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {upcoming ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgb(109,40,217)", borderRadius: 14, padding: "14px 16px", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                <CalendarDays size={16} color="white" style={{ flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <p style={{ color: "rgba(255,255,255,0.68)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 2px" }}>Next appointment</p>
                  <p style={{ color: "white", fontSize: 13.5, fontWeight: 700, margin: 0 }}>{fmtDate(upcoming.starts_at)} · {upcoming.service_name}</p>
                </div>
              </div>
              <ChevronRight size={14} color="rgba(255,255,255,0.7)" style={{ flexShrink: 0 }} />
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgb(220,38,38)", borderRadius: 14, padding: "14px 16px", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                <AlertTriangle size={16} color="white" style={{ flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 2px" }}>No upcoming appointment</p>
                  <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, margin: 0 }}>Last seen {fmtDaysAgo(client.daysSinceLastVisit).toLowerCase()}</p>
                </div>
              </div>
              <Link href={bookHref} style={{ padding: "6px 14px", borderRadius: 9, background: "white", color: "rgb(153,27,27)", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap", textDecoration: "none", flexShrink: 0 }}>
                Book now
              </Link>
            </div>
          )}

          <div style={{ background: "rgb(109,40,217)", borderRadius: 14, padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <Zap size={13} color="white" />
              <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Insight</span>
            </div>
            <p style={{ color: "white", fontSize: 13, margin: 0, lineHeight: 1.55 }}>
              {client.tag === "Churn risk" || client.tag === "Overdue"
                ? `${client.name.split(" ")[0]} usually books every ~${Math.round(client.avgIntervalDays ?? 0)} days and is now ${fmtDaysAgo(client.daysSinceLastVisit).toLowerCase()} since their last visit. A win-back message could bring them back.`
                : client.avgIntervalDays
                  ? `${client.name.split(" ")[0]} books every ~${Math.round(client.avgIntervalDays)} days on average, right on track.`
                  : client.visits === 0
                    ? `${client.name.split(" ")[0]} has an upcoming booking but no completed visits yet.`
                    : `${client.name.split(" ")[0]} has one visit so far, not enough history yet to predict a rebooking pattern.`}
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ ...card, padding: "14px 16px" }}>
              <p style={{ color: "var(--dw35)", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 10px" }}>Contact</p>
              {[{ Icon: Mail, val: client.email }, { Icon: Phone, val: client.phone }].filter(c => c.val).map(({ Icon, val }) => (
                <div key={val} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
                  <Icon size={12} color="var(--dw3)" style={{ flexShrink: 0 }} />
                  <span style={{ color: "var(--dw55)", fontSize: 12.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{val}</span>
                </div>
              ))}
              {!client.email && !client.phone && <p style={{ color: "var(--dw3)", fontSize: 12.5, margin: 0 }}>No contact info on file</p>}
            </div>
            <div style={{ ...card, padding: "14px 16px" }}>
              <p style={{ color: "var(--dw35)", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 10px" }}>Revenue</p>
              {[
                { label: "Lifetime value", value: fmtPrice(client.ltv), color: "rgb(52,211,153)" },
                { label: "Avg per visit",  value: fmtPrice(avgSpend) },
                { label: "Rebooks every",  value: client.avgIntervalDays ? `~${Math.round(client.avgIntervalDays)}d` : "N/A" },
              ].map(r => (
                <div key={r.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, gap: 8 }}>
                  <span style={{ color: "var(--dw35)", fontSize: 12 }}>{r.label}</span>
                  <span style={{ color: r.color ?? "var(--dtext)", fontSize: 12, fontWeight: 700 }}>{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "History" && (
        <div>
          <p style={{ color: "var(--dw35)", fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 10px" }}>
            {past.length} completed visit{past.length === 1 ? "" : "s"}
          </p>
          {past.length === 0 ? (
            <div style={{ ...card, padding: "40px 20px", textAlign: "center", color: "var(--dw3)", fontSize: 13 }}>No completed visits yet</div>
          ) : (
            <div style={{ ...card, overflow: "hidden" }}>
              {past.map((v) => {
                const s = STATUS_LABEL[v.status];
                return (
                  <div key={v.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 16px", borderBottom: "1px solid var(--dw04)" }}>
                    <div style={{ width: 32, height: 32, borderRadius: 9, background: "rgb(109,40,217)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Check size={14} color="white" strokeWidth={2.2} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: "var(--dtext)", fontSize: 13, fontWeight: 700, margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.service_name}</p>
                      <p style={{ color: "var(--dw32)", fontSize: 11.5, margin: 0 }}>{fmtDate(v.starts_at)}{v.stylist_name ? ` · ${v.stylist_name}` : ""}</p>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <p style={{ color: "rgb(52,211,153)", fontSize: 13, fontWeight: 700, margin: "0 0 2px" }}>{fmtPrice(Number(v.price))}</p>
                      {v.tip_amount ? <p style={{ color: "var(--dw25)", fontSize: 11, margin: 0 }}>+{fmtPrice(Number(v.tip_amount))} tip</p> : <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20, color: s.color, background: s.bg }}>{s.label}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
