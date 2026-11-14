"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search, Zap, ChevronRight } from "lucide-react";
import { type DerivedClient, type ClientTag } from "@/lib/dashboard/clients";

const CHURN_DOT: Record<string, string> = {
  "Churn risk": "rgb(248,113,113)",
  "Overdue":    "rgb(251,191,36)",
};
const CHURN_DOT_DEFAULT = "rgb(52,211,153)";

// Solid status pill tones (dash.css .fd-status-*)
const TAG_TONE: Record<NonNullable<ClientTag>, string> = {
  VIP: "amber", Loyal: "violet", "New": "green", Overdue: "orange", "Churn risk": "red",
};

const PAGE_SIZE = 100;

const FILTER_CHIPS: Array<"All" | NonNullable<ClientTag>> = ["All", "VIP", "Loyal", "New", "Overdue", "Churn risk"];


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

function fmtDaysAgo(days: number | null) {
  if (days == null) return "No visits yet";
  const d = Math.round(days);
  if (d <= 0) return "Today";
  if (d === 1) return "Yesterday";
  return `${d} days ago`;
}

// ─── Clients page ─────────────────────────────────────────────────────────────

export function ClientsClient({ clients, engagedNames }: {
  clients: DerivedClient[]; engagedNames: string[];
}) {
  const router = useRouter();
  const [query, setQuery]   = useState("");
  const [filter, setFilter] = useState<"All" | NonNullable<ClientTag>>("All");
  // Imported shops can have thousands of clients; render in pages.
  const [shown, setShown]   = useState(PAGE_SIZE);

  const engagedSet = useMemo(() => new Set(engagedNames), [engagedNames]);
  const isEngaged = (c: DerivedClient) => engagedSet.has(c.name.trim().toLowerCase());

  const filtered = clients.filter(c => {
    const q = query.toLowerCase();
    const matchQ = query === "" || c.name.toLowerCase().includes(q) || (c.email ?? "").toLowerCase().includes(q) || (c.phone ?? "").includes(query);
    const matchF = filter === "All" || c.tag === filter;
    return matchQ && matchF;
  });

  const visible = filtered.slice(0, shown);

  const highChurn = clients.filter(c => c.tag === "Churn risk").length;
  const totalLTV  = clients.reduce((s, c) => s + c.ltv, 0);
  const onAutoPilot = clients.filter(isEngaged).length;

  const dot = (c: DerivedClient) => (c.tag ? (CHURN_DOT[c.tag] ?? CHURN_DOT_DEFAULT) : CHURN_DOT_DEFAULT);
  const open = (c: DerivedClient) => router.push(`/dashboard/clients/${encodeURIComponent(c.key)}`);

  return (
    <div className="fd-page">

      {/* Header */}
      <div className="fd-page-head">
        <div>
          <h1>Clients</h1>
          <p className="fd-sub">{clients.length} client{clients.length === 1 ? "" : "s"}, {onAutoPilot} on AutoPilot</p>
        </div>
        <Link href="/dashboard/appointments" className="fd-btn fd-btn-primary">
          <Plus size={15} strokeWidth={2.2} /> New booking
        </Link>
      </div>

      {/* KPI strip */}
      <div className="fd-stats clients-kpi-grid">
        {[
          { label: "Total clients", value: String(clients.length), sub: "in your book", alert: false },
          { label: "Lifetime value", value: fmtPrice(totalLTV), sub: "all time", alert: false },
          { label: "Churn risk", value: String(highChurn), sub: highChurn > 0 ? "need attention" : "all clear", alert: highChurn > 0 },
          { label: "On AutoPilot", value: String(onAutoPilot), sub: "being followed up", alert: false },
        ].map(s => (
          <div key={s.label} className="fd-card fd-stat">
            <div className="fd-stat-top"><h2>{s.label}</h2></div>
            <p className={`fd-big${s.alert ? " is-alert" : ""}`}>{s.value}</p>
            <p className="fd-foot">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="fd-inline clients-toolbar">
        <label className="fd-field clients-search" style={{ width: 280 }}>
          <Search size={14} />
          <input value={query} onChange={e => { setQuery(e.target.value); setShown(PAGE_SIZE); }} placeholder="Search clients" aria-label="Search clients" />
        </label>
        <div className="fd-chips clients-filter-chips">
          {FILTER_CHIPS.map(f => (
            <button key={f} onClick={() => { setFilter(f); setShown(PAGE_SIZE); }} className={`fd-chip${filter === f ? " is-on" : ""}`} aria-pressed={filter === f}>{f}</button>
          ))}
        </div>
      </div>

      {/* Client list, desktop table */}
      <div className="fd-card clients-table-wrap">
        <table className="fd-table">
          <thead>
            <tr>
              {["Client", "Tag", "Visits", "Lifetime value", "Last visit", "Avg spend", "AutoPilot", ""].map((h, i) => <th key={i}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {visible.map(c => {
              const avgSpend = c.visits > 0 ? c.ltv / c.visits : 0;
              return (
                <tr key={c.key} onClick={() => open(c)}>
                  <td>
                    <div className="fd-person">
                      <span className="fd-sched-avatar" style={{ background: colorFor(c.name) }}>
                        {initialsFor(c.name)}
                        <i style={{ background: dot(c) }} />
                      </span>
                      <span className="fd-row-main">
                        <b>{c.name}</b>
                        <small>{c.email ?? c.phone ?? ""}</small>
                      </span>
                    </div>
                  </td>
                  <td>{c.tag && <span className={`fd-status fd-status-${TAG_TONE[c.tag]}`}>{c.tag}</span>}</td>
                  <td className="fd-td-num">{c.visits}</td>
                  <td className="fd-td-num">{fmtPrice(c.ltv)}</td>
                  <td className="fd-td-muted">{fmtDaysAgo(c.daysSinceLastVisit)}</td>
                  <td className="fd-td-num">{fmtPrice(avgSpend)}</td>
                  <td>
                    {isEngaged(c)
                      ? <span className="fd-status fd-status-violet"><Zap size={10} strokeWidth={2.5} style={{ marginRight: 4 }} /> On</span>
                      : <span className="fd-status fd-status-grey">Off</span>}
                  </td>
                  <td className="fd-td-end"><ChevronRight size={15} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="fd-empty" style={{ paddingBottom: 36 }}>
            <span className="fd-empty-icon"><Search size={17} strokeWidth={1.8} /></span>
            <b>No clients found</b>
            <p>{clients.length === 0 ? "Clients appear here after their first booking." : "Try a different search or filter."}</p>
          </div>
        )}
      </div>

      {/* Client list, mobile cards */}
      <div className="fd-cards clients-card-list">
        {visible.map(c => (
          <button type="button" key={c.key} onClick={() => open(c)} className="fd-card fd-list-row">
            <span className="fd-sched-avatar" style={{ background: colorFor(c.name) }}>
              {initialsFor(c.name)}
              <i style={{ background: dot(c) }} />
            </span>
            <span className="fd-row-main">
              <b>{c.name}</b>
              <small>{c.visits} visits · {fmtPrice(c.ltv)} · {fmtDaysAgo(c.daysSinceLastVisit)}</small>
            </span>
            {c.tag && <span className={`fd-status fd-status-${TAG_TONE[c.tag]}`}>{c.tag}</span>}
            <ChevronRight size={15} style={{ flexShrink: 0, color: "var(--fd-faint)" }} />
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="fd-card fd-empty" style={{ paddingBottom: 36 }}><b>No clients found</b></div>
        )}
      </div>

      {filtered.length > shown && (
        <button onClick={() => setShown(n => n + PAGE_SIZE)} className="fd-btn fd-btn-ghost" style={{ alignSelf: "center" }}>
          Show more ({(filtered.length - shown).toLocaleString()} left)
        </button>
      )}
    </div>
  );
}
