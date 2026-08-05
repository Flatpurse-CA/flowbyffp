"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search, Zap, ChevronRight } from "lucide-react";
import { type DerivedClient, type ClientTag } from "@/lib/dashboard/clients";
import { tint } from "@/lib/color";

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

const card: React.CSSProperties = {
  background: "var(--dsurface1)",
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
      <div className="clients-toolbar" style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div className="clients-search" style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--dsurface2)", border: "1px solid var(--dw07)", borderRadius: 10, padding: "8px 12px", width: 240, flex: "1 1 200px", maxWidth: 320 }}>
          <Search size={13} color="var(--dw3)" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search clients…" style={{ background: "none", border: "none", outline: "none", color: "var(--dtext)", fontSize: 12.5, flex: 1, minWidth: 0 }} />
        </div>
        <div
          className="clients-filter-chips"
          style={{ display: "flex", gap: 6, flexWrap: "nowrap", overflowX: "auto", WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}
        >
          {FILTER_CHIPS.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: "7px 14px", borderRadius: 20, flexShrink: 0,
              border: filter === f ? "none" : "1px solid var(--dw08)",
              background: filter === f ? "rgb(109,40,217)" : "var(--dw03)",
              color: filter === f ? "white" : "var(--dw4)",
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
                <th key={i} style={{ padding: "11px 18px", textAlign: "left", color: "var(--dw25)", fontSize: 10.5, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", background: "var(--dsurface1)", borderBottom: "1px solid var(--dw05)", whiteSpace: "nowrap" }}>
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
                  onClick={() => router.push(`/dashboard/clients/${encodeURIComponent(c.key)}`)}
                  style={{ borderBottom: "1px solid var(--dw04)", cursor: "pointer" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--dw02)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "13px 18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                      <div style={{ position: "relative", flexShrink: 0 }}>
                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: tint(color, 0.09), border: `1.5px solid ${tint(color, 0.2)}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color }}>
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
                      : <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, color: "var(--dw2)", background: "var(--dsurface2)" }}>OFF</span>}
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
            <div key={c.key} onClick={() => router.push(`/dashboard/clients/${encodeURIComponent(c.key)}`)} style={{ ...card, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
              <div style={{ position: "relative", flexShrink: 0 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: tint(color, 0.09), border: `1.5px solid ${tint(color, 0.2)}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color }}>
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
    </div>
  );
}
