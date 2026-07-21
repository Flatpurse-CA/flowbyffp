"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus, Search, Zap, Phone, Mail, MessageSquare,
  CalendarDays, X, ChevronRight, AlertTriangle, Check,
} from "lucide-react";
import type { AppointmentRow, AppointmentStatus } from "../appointments/actions";
import { keyFor, type DerivedClient, type ClientTag } from "@/lib/dashboard/clients";

const CHURN_DOT: Record<string, string> = {
  "Churn risk": "rgb(248,113,113)",
  "Overdue":    "rgb(251,191,36)",
};
const CHURN_DOT_DEFAULT = "rgb(52,211,153)";

const TAG_STYLE: Record<NonNullable<ClientTag>, { color: string; bg: string }> = {
  VIP:          { color: "rgb(251,191,36)",  bg: "rgba(245,158,11,0.12)" },
  Loyal:        { color: "rgb(96,165,250)",  bg: "rgba(59,130,246,0.1)"  },
  "New":        { color: "rgb(52,211,153)",  bg: "rgba(16,185,129,0.1)"  },
  Overdue:      { color: "rgb(251,146,60)",  bg: "rgba(249,115,22,0.1)"  },
  "Churn risk": { color: "rgb(248,113,113)", bg: "rgba(239,68,68,0.1)"   },
};

const FILTER_CHIPS: Array<"All" | NonNullable<ClientTag>> = ["All", "VIP", "Loyal", "New", "Overdue", "Churn risk"];

const STATUS_LABEL: Record<AppointmentStatus, { label: string; color: string; bg: string }> = {
  completed: { label: "Done",      color: "var(--dw35)", bg: "var(--dw05)" },
  confirmed: { label: "Confirmed", color: "rgb(52,211,153)",        bg: "rgba(16,185,129,0.1)"   },
  pending:   { label: "Pending",   color: "var(--dw5)",  bg: "var(--dw06)" },
  deposit:   { label: "⚠ Deposit", color: "rgb(251,191,36)",        bg: "rgba(245,158,11,0.1)"   },
  cancelled: { label: "Cancelled", color: "var(--dw25)", bg: "var(--dw03)" },
};

const card: React.CSSProperties = {
  background: "var(--dw025)",
  border: "1px solid var(--dw07)",
  borderRadius: 16,
};

const AVATAR_COLORS = ["rgb(167,139,250)", "rgb(52,211,153)", "rgb(96,165,250)", "rgb(251,191,36)", "rgb(248,113,113)", "rgb(251,146,60)"];
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

// ─── Client Profile overlay ───────────────────────────────────────────────────

const PROFILE_TABS = ["Overview", "History"] as const;
type ProfileTab = typeof PROFILE_TABS[number];

function ClientProfile({ client, appointments, engaged, onClose }: {
  client: DerivedClient; appointments: AppointmentRow[]; engaged: boolean; onClose: () => void;
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
        border: `1px solid ${primary ? "rgba(139,92,246,0.4)" : "var(--dw08)"}`,
        background: primary ? "rgba(109,40,217,0.15)" : "var(--dw03)",
        cursor: disabled ? "default" : "pointer", flex: 1, textDecoration: "none",
        opacity: disabled ? 0.4 : 1, pointerEvents: disabled ? "none" : "auto",
      }}>
        <Icon size={18} color={primary ? "rgb(167,139,250)" : "var(--dw5)"} strokeWidth={1.7} />
        <span style={{ color: primary ? "rgb(167,139,250)" : "var(--dw45)", fontSize: 10.5, fontWeight: 600 }}>{label}</span>
      </a>
    );
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 300,
      background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }} onClick={onClose}>
      <div style={{
        background: "var(--dm2)", border: "1px solid var(--dw1)",
        borderRadius: 24, width: "100%", maxWidth: 600,
        maxHeight: "90vh", display: "flex", flexDirection: "column",
        margin: 20, overflow: "hidden",
        boxShadow: "0 32px 100px rgba(0,0,0,0.8)",
      }} onClick={e => e.stopPropagation()}>

        <div style={{ padding: "24px 24px 0", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16, gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
              <div style={{ position: "relative", flexShrink: 0 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: "50%",
                  background: `${color}20`, border: `2px solid ${color}44`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, fontWeight: 800, color,
                }}>
                  {initialsFor(client.name)}
                </div>
                <span style={{
                  position: "absolute", bottom: 1, right: 1,
                  width: 12, height: 12, borderRadius: "50%",
                  background: client.tag ? (CHURN_DOT[client.tag] ?? CHURN_DOT_DEFAULT) : CHURN_DOT_DEFAULT,
                  border: "2px solid var(--dm2)",
                }} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                  <h2 style={{ color: "var(--dtext)", fontSize: 20, fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>{client.name}</h2>
                  {client.tag === "Churn risk" && (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, color: "rgb(248,113,113)", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.2)" }}>
                      ⚠ Churn risk
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                  {client.tag && (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, color: TAG_STYLE[client.tag].color, background: TAG_STYLE[client.tag].bg }}>
                      {client.tag}
                    </span>
                  )}
                  {engaged && (
                    <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, color: "rgb(167,139,250)", background: "rgba(109,40,217,0.12)" }}>
                      <Zap size={8} /> AutoPilot
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button onClick={onClose} style={{ background: "var(--dw06)", border: "none", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--dw45)", flexShrink: 0 }}>
              <X size={16} />
            </button>
          </div>

          <div style={{
            display: "grid", gridTemplateColumns: "repeat(4,1fr)",
            background: "var(--dw03)", border: "1px solid var(--dw06)",
            borderRadius: 14, padding: "14px 16px", marginBottom: 16, gap: 8,
          }}>
            {statItem("Visits", String(client.visits))}
            <div style={{ width: 1, background: "var(--dw06)" }} />
            {statItem("LTV", fmtPrice(client.ltv), "rgb(52,211,153)")}
            <div style={{ width: 1, background: "var(--dw06)" }} />
            {statItem("Avg spend", fmtPrice(avgSpend))}
            <div style={{ width: 1, background: "var(--dw06)" }} />
            {statItem("Last visit", fmtDaysAgo(client.daysSinceLastVisit))}
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {actionBtn(CalendarDays, "Book", "/dashboard/appointments", true)}
            {actionBtn(MessageSquare, "SMS", client.phone ? `sms:${client.phone}` : null)}
            {actionBtn(Phone, "Call", client.phone ? `tel:${client.phone}` : null)}
            {actionBtn(Mail, "Email", client.email ? `mailto:${client.email}` : null)}
          </div>

          <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--dw07)", overflowX: "auto" }}>
            {PROFILE_TABS.map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: "10px 16px", border: "none", background: "transparent", cursor: "pointer",
                fontSize: 12.5, fontWeight: tab === t ? 700 : 500,
                color: tab === t ? "rgb(210,196,254)" : "var(--dw35)",
                borderBottom: tab === t ? "2px solid rgb(139,92,246)" : "2px solid transparent",
                whiteSpace: "nowrap", transition: "color 0.15s",
              }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px 24px" }}>
          {tab === "Overview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {upcoming ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 14, padding: "14px 16px", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                    <CalendarDays size={16} color="rgb(167,139,250)" style={{ flexShrink: 0 }} />
                    <div style={{ minWidth: 0 }}>
                      <p style={{ color: "var(--dw4)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 2px" }}>Next appointment</p>
                      <p style={{ color: "var(--dtext)", fontSize: 13.5, fontWeight: 700, margin: 0 }}>{fmtDate(upcoming.starts_at)} · {upcoming.service_name}</p>
                    </div>
                  </div>
                  <ChevronRight size={14} color="var(--dw25)" style={{ flexShrink: 0 }} />
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(248,113,113,0.06)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 14, padding: "14px 16px", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                    <AlertTriangle size={16} color="rgb(248,113,113)" style={{ flexShrink: 0 }} />
                    <div style={{ minWidth: 0 }}>
                      <p style={{ color: "var(--dw4)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 2px" }}>No upcoming appointment</p>
                      <p style={{ color: "var(--dw55)", fontSize: 13, margin: 0 }}>Last seen {fmtDaysAgo(client.daysSinceLastVisit).toLowerCase()}</p>
                    </div>
                  </div>
                  <Link href="/dashboard/appointments" style={{ padding: "6px 14px", borderRadius: 9, background: "rgb(109,40,217)", color: "white", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap", textDecoration: "none", flexShrink: 0 }}>
                    Book now
                  </Link>
                </div>
              )}

              <div style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.18)", borderRadius: 14, padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                  <Zap size={13} color="rgb(167,139,250)" />
                  <span style={{ color: "var(--dw35)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Insight</span>
                </div>
                <p style={{ color: "var(--dw7)", fontSize: 13, margin: 0, lineHeight: 1.55 }}>
                  {client.tag === "Churn risk" || client.tag === "Overdue"
                    ? `${client.name.split(" ")[0]} usually books every ~${Math.round(client.avgIntervalDays ?? 0)} days and is now ${fmtDaysAgo(client.daysSinceLastVisit).toLowerCase()} since their last visit — a win-back message could bring them back.`
                    : client.avgIntervalDays
                      ? `${client.name.split(" ")[0]} books every ~${Math.round(client.avgIntervalDays)} days on average — right on track.`
                      : client.visits === 0
                        ? `${client.name.split(" ")[0]} has an upcoming booking but no completed visits yet.`
                        : `${client.name.split(" ")[0]} has one visit so far — not enough history yet to predict a rebooking pattern.`}
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
                        <div style={{ width: 32, height: 32, borderRadius: 9, background: "rgba(139,92,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Check size={14} color="rgb(167,139,250)" strokeWidth={2} />
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
      </div>
    </div>
  );
}

// ─── Clients page ─────────────────────────────────────────────────────────────

export function ClientsClient({ clients, appointments, engagedNames }: {
  clients: DerivedClient[]; appointments: AppointmentRow[]; engagedNames: string[];
}) {
  const [query, setQuery]       = useState("");
  const [filter, setFilter]     = useState<"All" | NonNullable<ClientTag>>("All");
  const [selected, setSelected] = useState<DerivedClient | null>(null);

  const engagedSet = useMemo(() => new Set(engagedNames), [engagedNames]);
  const isEngaged = (c: DerivedClient) => engagedSet.has(c.name.trim().toLowerCase());

  const filtered = clients.filter(c => {
    const q = query.toLowerCase();
    const matchQ = query === "" || c.name.toLowerCase().includes(q) || (c.email ?? "").toLowerCase().includes(q) || (c.phone ?? "").includes(query);
    const matchF = filter === "All" || c.tag === filter;
    return matchQ && matchF;
  });

  const highChurn = clients.filter(c => c.tag === "Churn risk").length;
  const totalLTV  = clients.reduce((s, c) => s + c.ltv, 0);
  const onAutoPilot = clients.filter(isEngaged).length;

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", rowGap: 12 }}>
        <div>
          <h1 style={{ color: "var(--dtext)", fontSize: 22, fontWeight: 800, margin: "0 0 3px", letterSpacing: "-0.03em" }}>Clients</h1>
          <p style={{ color: "var(--dw35)", fontSize: 13, margin: 0 }}>
            {clients.length} client{clients.length === 1 ? "" : "s"} · {onAutoPilot} on AutoPilot
          </p>
        </div>
        <Link href="/dashboard/appointments" style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 18px", borderRadius: 11, background: "rgb(109,40,217)", border: "none", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", textDecoration: "none" }}>
          <Plus size={15} strokeWidth={2.5} /> New booking
        </Link>
      </div>

      {/* KPI strip */}
      <div className="clients-kpi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        {[
          { label: "Total clients", value: String(clients.length), sub: undefined, color: undefined },
          { label: "Total LTV",     value: fmtPrice(totalLTV), sub: "all time", color: "rgb(52,211,153)" },
          { label: "Churn risk",    value: String(highChurn), sub: highChurn > 0 ? "need attention" : "all clear", color: "rgb(248,113,113)" },
          { label: "On AutoPilot",  value: String(onAutoPilot), sub: "AI engaged", color: "rgb(167,139,250)" },
        ].map(s => (
          <div key={s.label} style={{ ...card, padding: "16px 18px" }}>
            <p style={{ color: "var(--dw35)", fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 6px" }}>{s.label}</p>
            <p style={{ color: s.color ?? "var(--dtext)", fontSize: 24, fontWeight: 800, margin: "0 0 3px", letterSpacing: "-0.03em" }}>{s.value}</p>
            {s.sub && <p style={{ color: "var(--dw25)", fontSize: 11, margin: 0 }}>{s.sub}</p>}
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--dw04)", border: "1px solid var(--dw07)", borderRadius: 10, padding: "8px 12px", width: 240, flex: "1 1 200px", maxWidth: 320 }}>
          <Search size={13} color="var(--dw3)" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search clients…" style={{ background: "none", border: "none", outline: "none", color: "var(--dtext)", fontSize: 12.5, flex: 1, minWidth: 0 }} />
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {FILTER_CHIPS.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: "7px 14px", borderRadius: 20,
              border: `1px solid ${filter === f ? "rgba(139,92,246,0.5)" : "var(--dw08)"}`,
              background: filter === f ? "rgba(109,40,217,0.2)" : "var(--dw03)",
              color: filter === f ? "rgb(210,196,254)" : "var(--dw4)",
              fontSize: 12.5, fontWeight: filter === f ? 700 : 500, cursor: "pointer",
            }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Client list — desktop table */}
      <div className="clients-table-wrap" style={{ ...card, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Client", "Tag", "Visits · LTV · Last visit", "Avg spend", "AutoPilot", ""].map((h, i) => (
                <th key={i} style={{ padding: "11px 18px", textAlign: "left", color: "var(--dw25)", fontSize: 10.5, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", background: "var(--dw015)", borderBottom: "1px solid var(--dw05)", whiteSpace: "nowrap" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => {
              const color = colorFor(c.name);
              const avgSpend = c.visits > 0 ? c.ltv / c.visits : 0;
              const engaged = isEngaged(c);
              return (
                <tr
                  key={c.key}
                  onClick={() => setSelected(c)}
                  style={{ borderBottom: "1px solid var(--dw04)", cursor: "pointer" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--dw02)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "13px 18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                      <div style={{ position: "relative", flexShrink: 0 }}>
                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${color}18`, border: `1.5px solid ${color}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color }}>
                          {initialsFor(c.name)}
                        </div>
                        <span style={{ position: "absolute", bottom: 0, right: 0, width: 9, height: 9, borderRadius: "50%", background: c.tag ? (CHURN_DOT[c.tag] ?? CHURN_DOT_DEFAULT) : CHURN_DOT_DEFAULT, border: "1.5px solid var(--dring)" }} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ color: "var(--dtext)", fontSize: 13, fontWeight: 700, margin: "0 0 2px" }}>{c.name}</p>
                        <p style={{ color: "var(--dw3)", fontSize: 11.5, margin: 0 }}>{c.email ?? c.phone ?? ""}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "13px 18px" }}>
                    {c.tag && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20, color: TAG_STYLE[c.tag].color, background: TAG_STYLE[c.tag].bg, whiteSpace: "nowrap" }}>{c.tag}</span>}
                  </td>
                  <td style={{ padding: "13px 18px" }}>
                    <div style={{ display: "flex", gap: 14 }}>
                      <span style={{ color: "var(--dw5)", fontSize: 12.5 }}><span style={{ color: "var(--dtext)", fontWeight: 700 }}>{c.visits}</span> visits</span>
                      <span style={{ color: "var(--dw5)", fontSize: 12.5 }}><span style={{ color: "rgb(52,211,153)", fontWeight: 700 }}>{fmtPrice(c.ltv)}</span></span>
                      <span style={{ color: "var(--dw35)", fontSize: 12.5 }}>{fmtDaysAgo(c.daysSinceLastVisit)}</span>
                    </div>
                  </td>
                  <td style={{ padding: "13px 18px", color: "var(--dtext)", fontSize: 13, fontWeight: 600 }}>{fmtPrice(avgSpend)}</td>
                  <td style={{ padding: "13px 18px" }}>
                    {engaged
                      ? <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, color: "rgb(167,139,250)", background: "rgba(109,40,217,0.12)", width: "fit-content" }}><Zap size={9} strokeWidth={2.5} /> ON</span>
                      : <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, color: "var(--dw2)", background: "var(--dw04)" }}>OFF</span>}
                  </td>
                  <td style={{ padding: "13px 18px" }}>
                    <ChevronRight size={14} color="var(--dw2)" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ padding: "60px 20px", textAlign: "center", color: "var(--dw25)", fontSize: 13 }}>No clients found</div>
        )}
      </div>

      {/* Client list — mobile cards */}
      <div className="clients-card-list" style={{ display: "none", flexDirection: "column", gap: 8 }}>
        {filtered.map((c) => {
          const color = colorFor(c.name);
          const engaged = isEngaged(c);
          return (
            <div key={c.key} onClick={() => setSelected(c)} style={{ ...card, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
              <div style={{ position: "relative", flexShrink: 0 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: `${color}18`, border: `1.5px solid ${color}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color }}>
                  {initialsFor(c.name)}
                </div>
                <span style={{ position: "absolute", bottom: 0, right: 0, width: 10, height: 10, borderRadius: "50%", background: c.tag ? (CHURN_DOT[c.tag] ?? CHURN_DOT_DEFAULT) : CHURN_DOT_DEFAULT, border: "1.5px solid var(--dring)" }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                  <p style={{ color: "var(--dtext)", fontSize: 13.5, fontWeight: 700, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</p>
                  {engaged && <Zap size={11} color="rgb(167,139,250)" style={{ flexShrink: 0 }} />}
                </div>
                <p style={{ color: "var(--dw35)", fontSize: 11.5, margin: 0 }}>{c.visits} visits · {fmtPrice(c.ltv)} · {fmtDaysAgo(c.daysSinceLastVisit)}</p>
              </div>
              {c.tag && <span style={{ fontSize: 9.5, fontWeight: 700, padding: "2px 7px", borderRadius: 20, color: TAG_STYLE[c.tag].color, background: TAG_STYLE[c.tag].bg, whiteSpace: "nowrap", flexShrink: 0 }}>{c.tag}</span>}
              <ChevronRight size={14} color="var(--dw2)" style={{ flexShrink: 0 }} />
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ ...card, padding: "40px 20px", textAlign: "center", color: "var(--dw25)", fontSize: 13 }}>No clients found</div>
        )}
      </div>

      {selected && <ClientProfile client={selected} appointments={appointments} engaged={isEngaged(selected)} onClose={() => setSelected(null)} />}
    </div>
  );
}
