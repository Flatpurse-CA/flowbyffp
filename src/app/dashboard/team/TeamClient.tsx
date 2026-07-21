"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, TrendingDown, TrendingUp, AlertTriangle, MoreHorizontal, X } from "lucide-react";
import type { StaffRow } from "./actions";
import { inviteStaff, resendInvite, archiveStaff } from "./actions";
import type { AppointmentRow } from "../appointments/actions";
import { computeStaffUtilization, computeRebookTrend, type MetricsAppointment } from "@/lib/dashboard/metrics";

const PERIODS = ["This week", "This month", "90 days"] as const;
type Period = typeof PERIODS[number];
const PERIOD_DAYS: Record<Period, number> = { "This week": 7, "This month": 30, "90 days": 90 };
const DAY_MS = 24 * 60 * 60 * 1000;

function fmtPrice(n: number) {
  return Number.isInteger(n) ? `C$${n}` : `C$${n.toFixed(2)}`;
}
function initialsFor(name: string) {
  return name.trim().split(/\s+/).map(w => w[0]?.toUpperCase() ?? "").slice(0, 2).join("") || "?";
}
function pctDelta(cur: number, prev: number): string | null {
  if (prev === 0) return cur > 0 ? "New this period" : null;
  const pct = Math.round(((cur - prev) / prev) * 100);
  if (pct === 0) return "Flat vs last period";
  return `${pct > 0 ? "+" : ""}${pct}% vs last period`;
}

function TrendChart({ data, avg, declining }: { data: number[]; avg: number; declining: boolean }) {
  const W = 100; const H = 48;
  const max = Math.max(...data, 1) * 1.15; const min = 0;
  const x = (i: number) => (i / (data.length - 1)) * W;
  const y = (v: number) => H - ((v - min) / (max - min)) * H;
  const pts = data.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  const area = `0,${H} ` + pts + ` ${W},${H}`;
  const avgY = y(avg);
  const color = declining ? "rgb(248,113,113)" : "rgb(52,211,153)";

  return (
    <svg viewBox="0 0 100 48" preserveAspectRatio="none" style={{ width: "100%", height: 64 }}>
      <defs>
        <linearGradient id={`g-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#g-${color})`} />
      <polyline points={pts} stroke={color} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="0" y1={avgY} x2={W} y2={avgY} stroke="var(--dw2)" strokeWidth="0.8" strokeDasharray="3,2" />
      <circle cx={x(data.length - 1)} cy={y(data[data.length - 1])} r="2" fill={color} />
    </svg>
  );
}

function AddStaffModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "var(--dw05)", border: "1px solid var(--dw1)",
    borderRadius: 10, padding: "10px 13px", color: "var(--dtext)", fontSize: 13.5,
    outline: "none", boxSizing: "border-box",
  };

  const handleSubmit = async () => {
    if (!fullName.trim()) { setError("Name is required."); return; }
    if (!email.trim()) { setError("Email is required to send them an invite."); return; }
    setError(null);
    setSubmitting(true);
    try {
      await inviteStaff({ fullName: fullName.trim(), role: role.trim() || undefined, email: email.trim() });
      onCreated();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't send that invite — try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 300,
      background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }} onClick={onClose}>
      <div style={{
        background: "var(--dm1)", border: "1px solid var(--dw1)",
        borderRadius: 22, width: "100%", maxWidth: 420,
        padding: "28px 28px 24px", margin: 20,
        boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ color: "var(--dtext)", fontSize: 18, fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>
            Invite team member
          </h2>
          <button onClick={onClose} style={{ background: "var(--dw06)", border: "none", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--dw5)" }}>
            <X size={16} />
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ color: "var(--dw4)", fontSize: 12, fontWeight: 500, display: "block", marginBottom: 7 }}>Full name</label>
            <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="e.g. Emma Watson" style={inputStyle} />
          </div>
          <div>
            <label style={{ color: "var(--dw4)", fontSize: 12, fontWeight: 500, display: "block", marginBottom: 7 }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="them@example.com" style={inputStyle} />
            <p style={{ color: "var(--dw3)", fontSize: 11, margin: "6px 0 0" }}>They&apos;ll get an email to set up their own login, scoped to their own bookings.</p>
          </div>
          <div>
            <label style={{ color: "var(--dw4)", fontSize: 12, fontWeight: 500, display: "block", marginBottom: 7 }}>Role (optional)</label>
            <input value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Senior Stylist" style={inputStyle} />
          </div>
          {error && <p style={{ color: "rgb(248,113,113)", fontSize: 12.5, margin: 0 }}>{error}</p>}
          <button onClick={handleSubmit} disabled={submitting} style={{
            padding: "12px 18px", borderRadius: 12, border: "none",
            background: "rgb(109,40,217)", color: "white", fontSize: 14, fontWeight: 700,
            cursor: submitting ? "default" : "pointer", opacity: submitting ? 0.6 : 1,
          }}>
            {submitting ? "Sending invite…" : "Send invite"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function TeamClient({ staff, appointments }: { staff: StaffRow[]; appointments: AppointmentRow[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [selected, setSelected] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period>("This week");
  const [showAdd, setShowAdd] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const refresh = () => startTransition(() => router.refresh());
  const now = useMemo(() => new Date(), []);

  const metricsAppts: MetricsAppointment[] = useMemo(() => appointments.map(a => ({
    id: a.id,
    staff_id: a.staff_id,
    starts_at: a.starts_at,
    duration_minutes: a.duration_minutes,
    price: Number(a.price),
    status: a.status,
  })), [appointments]);

  const rows = useMemo(() => {
    const rangeEnd = now;
    const rangeStart = new Date(now.getTime() - PERIOD_DAYS[period] * DAY_MS);
    const prevRangeEnd = rangeStart;
    const prevRangeStart = new Date(rangeStart.getTime() - PERIOD_DAYS[period] * DAY_MS);

    return staff.map(s => {
      const cur = computeStaffUtilization(metricsAppts, s.id, rangeStart, rangeEnd);
      const prev = computeStaffUtilization(metricsAppts, s.id, prevRangeStart, prevRangeEnd);
      const trend = computeRebookTrend(metricsAppts, s.id, now);
      return { ...s, ...cur, prevBookings: prev.bookings, prevRevenue: prev.revenue, trend };
    });
  }, [staff, metricsAppts, period, now]);

  const selectedRow = rows.find(r => r.id === selected) ?? null;

  const card: React.CSSProperties = {
    background: "var(--dw025)",
    border: "1px solid var(--dw07)",
    borderRadius: 16,
    overflow: "hidden",
  };

  const [resendError, setResendError] = useState<string | null>(null);

  const handleArchive = async (id: string) => {
    setMenuOpenId(null);
    if (selected === id) setSelected(null);
    await archiveStaff(id);
    refresh();
  };

  const handleResend = async (id: string) => {
    setMenuOpenId(null);
    setResendError(null);
    try {
      await resendInvite(id);
      refresh();
    } catch (e) {
      setResendError(e instanceof Error ? e.message : "Couldn't resend that invite.");
    }
  };

  if (staff.length === 0) {
    return (
      <div style={{ maxWidth: 480, margin: "80px auto", textAlign: "center", padding: "0 20px" }}>
        <div style={{ fontSize: 40, marginBottom: 20 }}>👥</div>
        <h2 style={{ color: "var(--dtext2)", fontSize: 22, fontWeight: 800, margin: "0 0 10px", letterSpacing: "-0.03em" }}>
          Add your team when ready
        </h2>
        <p style={{ color: "var(--dw4)", fontSize: 14, lineHeight: 1.6, margin: "0 0 28px" }}>
          Each staff member gets their own calendar column so clients can book with the person they love.
        </p>
        <button onClick={() => setShowAdd(true)} style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "12px 22px", borderRadius: 12,
          background: "rgb(109,40,217)", border: "none",
          color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer",
        }}>
          <Plus size={16} strokeWidth={2.5} /> Invite first team member
        </button>
        {showAdd && <AddStaffModal onClose={() => setShowAdd(false)} onCreated={refresh} />}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", flexWrap: "wrap", gap: 20 }}>

      {/* Staff list */}
      <div style={{ flex: "3 1 400px", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ color: "var(--dtext)", fontSize: 22, fontWeight: 800, margin: "0 0 3px", letterSpacing: "-0.03em" }}>Team</h1>
            <p style={{ color: "var(--dw35)", fontSize: 13, margin: 0 }}>{staff.length} active staff member{staff.length === 1 ? "" : "s"}</p>
          </div>
          <button onClick={() => setShowAdd(true)} style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "10px 18px", borderRadius: 11,
            background: "rgb(109,40,217)", border: "none",
            color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer",
          }}>
            <Plus size={15} strokeWidth={2.5} /> Invite member
          </button>
        </div>

        {resendError && (
          <p style={{ color: "rgb(248,113,113)", fontSize: 12.5, margin: 0 }}>{resendError}</p>
        )}

        {/* Staff cards */}
        {rows.map(row => (
          <div
            key={row.id}
            onClick={() => setSelected(row.id === selected ? null : row.id)}
            style={{
              ...card,
              cursor: "pointer",
              border: row.id === selected
                ? "1px solid rgba(139,92,246,0.5)"
                : row.trend.declining
                  ? "1px solid rgba(248,113,113,0.25)"
                  : "1px solid var(--dw07)",
              transition: "border-color 0.15s",
              position: "relative",
            }}
          >
            <div style={{ padding: "18px 20px", display: "flex", alignItems: "center", gap: 16 }}>
              {/* Avatar */}
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: `${row.color}22`,
                border: `1.5px solid ${row.color}44`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16, fontWeight: 800, color: row.color, flexShrink: 0,
              }}>
                {initialsFor(row.full_name)}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                  <span style={{ color: "var(--dtext)", fontSize: 14, fontWeight: 700 }}>{row.full_name}</span>
                  {row.role && <span style={{ color: "var(--dw3)", fontSize: 12 }}>{row.role}</span>}
                  {row.invite_status === "pending" && (
                    <span style={{
                      fontSize: 10, fontWeight: 700, color: "rgb(251,191,36)",
                      background: "rgba(245,158,11,0.1)", padding: "2px 8px", borderRadius: 20,
                    }}>
                      Invite pending
                    </span>
                  )}
                  {row.invite_status === "not_invited" && (
                    <span style={{
                      fontSize: 10, fontWeight: 700, color: "var(--dw4)",
                      background: "var(--dw06)", padding: "2px 8px", borderRadius: 20,
                    }}>
                      No account
                    </span>
                  )}
                  {row.trend.declining && (
                    <span style={{
                      display: "flex", alignItems: "center", gap: 4,
                      fontSize: 10, fontWeight: 700,
                      color: "rgb(248,113,113)", background: "rgba(239,68,68,0.1)",
                      padding: "2px 8px", borderRadius: 20,
                    }}>
                      <AlertTriangle size={9} /> Rebook rate dropping
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
                  <span style={{ color: "var(--dw4)", fontSize: 12 }}>
                    <span style={{ color: "var(--dtext)", fontWeight: 600 }}>{row.bookings}</span> bookings · {period.toLowerCase()}
                  </span>
                  <span style={{ color: "var(--dw4)", fontSize: 12 }}>
                    <span style={{ color: "rgb(52,211,153)", fontWeight: 600 }}>{fmtPrice(row.revenue)}</span> revenue
                  </span>
                  <span style={{ color: "var(--dw4)", fontSize: 12 }}>
                    <span style={{ color: "var(--dtext)", fontWeight: 600 }}>{row.utilizationPct}%</span> utilized
                  </span>
                </div>
              </div>

              <div style={{ position: "relative" }}>
                <button
                  onClick={e => { e.stopPropagation(); setMenuOpenId(menuOpenId === row.id ? null : row.id); }}
                  style={{ background: "none", border: "none", color: "var(--dw3)", cursor: "pointer", padding: 4 }}
                >
                  <MoreHorizontal size={16} />
                </button>
                {menuOpenId === row.id && (
                  <div
                    onClick={e => e.stopPropagation()}
                    style={{
                      position: "absolute", top: "calc(100% + 4px)", right: 0, zIndex: 10,
                      background: "var(--dm3)", border: "1px solid var(--dw1)",
                      borderRadius: 10, overflow: "hidden", minWidth: 140,
                      boxShadow: "0 12px 32px rgba(0,0,0,0.5)",
                    }}
                  >
                    {row.invite_status === "pending" && (
                      <button onClick={() => handleResend(row.id)} style={{
                        display: "block", width: "100%", textAlign: "left", padding: "9px 14px",
                        background: "none", border: "none", color: "var(--dw7)", fontSize: 12.5, cursor: "pointer",
                      }}>
                        Resend invite
                      </button>
                    )}
                    <button onClick={() => handleArchive(row.id)} style={{
                      display: "block", width: "100%", textAlign: "left", padding: "9px 14px",
                      background: "none", border: "none", color: "rgb(248,113,113)", fontSize: 12.5, cursor: "pointer",
                    }}>
                      Remove from team
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Utilization bar */}
            <div style={{ height: 3, background: "var(--dw06)", margin: "0 20px 18px" }}>
              <div style={{
                height: "100%", borderRadius: 2,
                width: `${row.utilizationPct}%`,
                background: row.utilizationPct > 85 ? "rgb(52,211,153)" : row.utilizationPct > 65 ? "rgb(251,191,36)" : "rgb(248,113,113)",
                transition: "width 0.4s ease",
              }} />
            </div>
          </div>
        ))}
      </div>

      {/* Staff detail panel */}
      {selectedRow && (
        <div style={{ flex: "1 1 320px", maxWidth: 380, display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Profile */}
          <div style={{ ...card, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: `${selectedRow.color}22`,
                border: `1.5px solid ${selectedRow.color}55`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20, fontWeight: 800, color: selectedRow.color,
              }}>
                {initialsFor(selectedRow.full_name)}
              </div>
              <div>
                <p style={{ color: "var(--dtext)", fontSize: 16, fontWeight: 800, margin: "0 0 2px" }}>{selectedRow.full_name}</p>
                {selectedRow.role && <p style={{ color: "var(--dw4)", fontSize: 12, margin: 0 }}>{selectedRow.role}</p>}
              </div>
            </div>

            {/* Period picker */}
            <div style={{ display: "flex", gap: 4, background: "var(--dw04)", borderRadius: 10, padding: 3, marginBottom: 16 }}>
              {PERIODS.map(p => (
                <button key={p} onClick={() => setPeriod(p)} style={{
                  flex: 1, padding: "5px 0", borderRadius: 7, border: "none", cursor: "pointer",
                  fontSize: 11, fontWeight: period === p ? 700 : 500,
                  background: period === p ? "rgba(139,92,246,0.35)" : "transparent",
                  color: period === p ? "rgb(210,196,254)" : "var(--dw35)",
                }}>
                  {p}
                </button>
              ))}
            </div>

            {/* Metrics 2×2 */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { label: "Bookings", value: String(selectedRow.bookings), sub: pctDelta(selectedRow.bookings, selectedRow.prevBookings) },
                { label: "Revenue", value: fmtPrice(selectedRow.revenue), sub: pctDelta(selectedRow.revenue, selectedRow.prevRevenue) },
                { label: "Utilization", value: `${selectedRow.utilizationPct}%`, sub: "of available slots" },
                { label: "Avg ticket", value: selectedRow.avgTicket > 0 ? fmtPrice(selectedRow.avgTicket) : "—", sub: "per completed visit" },
              ].map(m => (
                <div key={m.label} style={{
                  background: "var(--dw03)", border: "1px solid var(--dw07)",
                  borderRadius: 12, padding: "12px 14px",
                }}>
                  <p style={{ color: "var(--dw35)", fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 4px" }}>{m.label}</p>
                  <p style={{ color: "var(--dtext)", fontSize: 18, fontWeight: 800, margin: "0 0 2px", letterSpacing: "-0.03em" }}>{m.value}</p>
                  {m.sub && <p style={{ color: "var(--dw3)", fontSize: 10, margin: 0 }}>{m.sub}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Rebook trend */}
          <div style={{ ...card, padding: 20 }}>
            {selectedRow.trend.declining && (
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: 10, padding: "10px 14px", marginBottom: 14,
              }}>
                <AlertTriangle size={14} color="rgb(248,113,113)" />
                <div>
                  <p style={{ color: "rgb(248,113,113)", fontSize: 12, fontWeight: 700, margin: 0 }}>Needs attention</p>
                  <p style={{ color: "rgba(248,113,113,0.7)", fontSize: 11, margin: 0 }}>Rebook rate dropping</p>
                </div>
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <p style={{ color: "var(--dw5)", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", margin: 0 }}>
                8-week rebook trend
              </p>
              {selectedRow.trend.declining
                ? <TrendingDown size={14} color="rgb(248,113,113)" />
                : <TrendingUp size={14} color="rgb(52,211,153)" />
              }
            </div>
            <TrendChart
              data={selectedRow.trend.buckets}
              avg={selectedRow.trend.avg}
              declining={selectedRow.trend.declining}
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
              {["W1","W2","W3","W4","W5","W6","W7","W8"].map(w => (
                <span key={w} style={{ color: "var(--dw2)", fontSize: 9 }}>{w}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {showAdd && <AddStaffModal onClose={() => setShowAdd(false)} onCreated={refresh} />}
    </div>
  );
}
