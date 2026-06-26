import { createAdminClient } from "@/lib/supabase/admin";
import {
  approveWaitlistEntry, rejectWaitlistEntry,
  deleteWaitlistEntry, resetWaitlistEntry,
} from "./actions";
import {
  CheckCircle, XCircle, Trash2, RotateCcw,
  ClipboardList, Clock, CheckCheck, Ban,
} from "lucide-react";

const STATUS_STYLE: Record<string, { color: string; bg: string; label: string }> = {
  pending:  { color: "rgb(251,191,36)",  bg: "rgba(245,158,11,0.12)",  label: "Pending"  },
  approved: { color: "rgb(52,211,153)",  bg: "rgba(16,185,129,0.12)",  label: "Approved" },
  rejected: { color: "rgb(248,113,113)", bg: "rgba(239,68,68,0.12)",   label: "Rejected" },
};

function StatCard({
  label, count, Icon, iconColor, iconBg,
}: {
  label: string; count: number;
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number; color?: string }>;
  iconColor: string; iconBg: string;
}) {
  return (
    <div style={{
      background: "rgb(10,10,12)",
      border: "1px solid rgba(255,255,255,0.09)",
      borderRadius: 16, padding: "20px 22px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      <div>
        <p style={{ color: "rgba(255,255,255,0.38)", fontSize: 12, fontWeight: 500, margin: "0 0 8px" }}>{label}</p>
        <p style={{ color: "rgb(245,245,252)", fontSize: 32, fontWeight: 800, letterSpacing: "-0.04em", margin: 0, lineHeight: 1 }}>{count}</p>
      </div>
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        background: iconBg,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <Icon size={18} color={iconColor} strokeWidth={1.8} />
      </div>
    </div>
  );
}

export default async function AdminWaitlistPage() {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("waitlist")
    .select("*")
    .order("created_at", { ascending: false });

  const entries = (data ?? []) as {
    id: string;
    name: string | null;
    email: string;
    shop_type: string | null;
    status: string;
    notes: string | null;
    created_at: string;
    approved_at: string | null;
  }[];

  const counts = {
    total:    entries.length,
    pending:  entries.filter(e => e.status === "pending").length,
    approved: entries.filter(e => e.status === "approved").length,
    rejected: entries.filter(e => e.status === "rejected").length,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Header ── */}
      <div>
        <h1 style={{ color: "rgb(250,250,250)", fontSize: 22, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.03em" }}>
          Waitlist
        </h1>
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, margin: 0 }}>
          {counts.total} total &mdash; {counts.pending} pending review
        </p>
      </div>

      {/* ── Stat cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        <StatCard label="Total"    count={counts.total}    Icon={ClipboardList} iconColor="rgb(167,139,250)" iconBg="rgba(109,40,217,0.15)" />
        <StatCard label="Pending"  count={counts.pending}  Icon={Clock}         iconColor="rgb(251,191,36)"  iconBg="rgba(245,158,11,0.12)" />
        <StatCard label="Approved" count={counts.approved} Icon={CheckCheck}    iconColor="rgb(52,211,153)"  iconBg="rgba(16,185,129,0.12)" />
        <StatCard label="Rejected" count={counts.rejected} Icon={Ban}           iconColor="rgb(248,113,113)" iconBg="rgba(239,68,68,0.12)"  />
      </div>

      {/* ── Error ── */}
      {error && (
        <div style={{ padding: "14px 18px", borderRadius: 12, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "rgb(248,113,113)", fontSize: 13 }}>
          Could not load waitlist — make sure the migration has been run.
        </div>
      )}

      {/* ── Table ── */}
      {entries.length === 0 && !error ? (
        <div style={{
          background: "rgb(10,10,12)", border: "1px solid rgba(255,255,255,0.09)",
          borderRadius: 16, padding: "72px 0",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <ClipboardList size={22} color="rgba(255,255,255,0.2)" strokeWidth={1.4} />
          </div>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 14, fontWeight: 600, margin: 0 }}>No waitlist entries yet</p>
          <p style={{ color: "rgba(255,255,255,0.18)", fontSize: 12.5, margin: 0 }}>Entries will appear here once people join the waitlist</p>
        </div>
      ) : (
        <div style={{ background: "rgb(10,10,12)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 16, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.02)" }}>
                {["Name", "Email", "Shop Type", "Joined", "Status", "Actions"].map(h => (
                  <th key={h} style={{
                    padding: "12px 20px", textAlign: "left",
                    color: "rgba(255,255,255,0.25)", fontSize: 11,
                    fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    whiteSpace: "nowrap",
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, i) => {
                const displayName = entry.name ?? entry.email.split("@")[0];
                const initials = displayName.slice(0, 2).toUpperCase();
                const date = new Date(entry.created_at).toLocaleDateString("en-CA", {
                  month: "short", day: "numeric", year: "numeric",
                });
                const s = STATUS_STYLE[entry.status] ?? STATUS_STYLE.pending;

                return (
                  <tr
                    key={entry.id}
                    style={{ borderBottom: i < entries.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
                  >
                    {/* Name */}
                    <td style={{ padding: "14px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                          background: `hsl(${(i * 61 + 180) % 360}, 30%, 20%)`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.7)",
                        }}>
                          {initials}
                        </div>
                        <span style={{ color: "rgb(240,240,248)", fontSize: 13.5, fontWeight: 600 }}>
                          {entry.name ?? <span style={{ color: "rgba(255,255,255,0.25)", fontWeight: 400, fontStyle: "italic" }}>no name</span>}
                        </span>
                      </div>
                    </td>

                    {/* Email */}
                    <td style={{ padding: "14px 20px", color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
                      {entry.email}
                    </td>

                    {/* Shop type */}
                    <td style={{ padding: "14px 20px" }}>
                      {entry.shop_type ? (
                        <span style={{
                          fontSize: 11.5, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
                          background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.55)",
                          border: "1px solid rgba(255,255,255,0.08)",
                        }}>
                          {entry.shop_type}
                        </span>
                      ) : (
                        <span style={{ color: "rgba(255,255,255,0.18)", fontSize: 13 }}>—</span>
                      )}
                    </td>

                    {/* Date */}
                    <td style={{ padding: "14px 20px", color: "rgba(255,255,255,0.32)", fontSize: 12.5, whiteSpace: "nowrap" }}>
                      {date}
                    </td>

                    {/* Status */}
                    <td style={{ padding: "14px 20px" }}>
                      <span style={{
                        fontSize: 10.5, fontWeight: 700, padding: "4px 10px", borderRadius: 20,
                        letterSpacing: "0.04em", textTransform: "uppercase",
                        color: s.color, background: s.bg,
                        border: `1px solid ${s.color}22`,
                      }}>
                        {s.label}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "14px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {entry.status === "pending" && (
                          <>
                            <form action={approveWaitlistEntry}>
                              <input type="hidden" name="id" value={entry.id} />
                              <button type="submit" style={{
                                display: "flex", alignItems: "center", gap: 5,
                                padding: "5px 11px", borderRadius: 8, cursor: "pointer",
                                background: "rgba(16,185,129,0.1)", border: "1px solid rgba(52,211,153,0.22)",
                                color: "rgb(52,211,153)", fontSize: 11.5, fontWeight: 600, fontFamily: "inherit",
                              }}>
                                <CheckCircle size={12} /> Approve
                              </button>
                            </form>
                            <form action={rejectWaitlistEntry}>
                              <input type="hidden" name="id" value={entry.id} />
                              <button type="submit" style={{
                                display: "flex", alignItems: "center", gap: 5,
                                padding: "5px 11px", borderRadius: 8, cursor: "pointer",
                                background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)",
                                color: "rgb(248,113,113)", fontSize: 11.5, fontWeight: 600, fontFamily: "inherit",
                              }}>
                                <XCircle size={12} /> Reject
                              </button>
                            </form>
                          </>
                        )}
                        {(entry.status === "approved" || entry.status === "rejected") && (
                          <form action={resetWaitlistEntry}>
                            <input type="hidden" name="id" value={entry.id} />
                            <button type="submit" style={{
                              display: "flex", alignItems: "center", gap: 5,
                              padding: "5px 11px", borderRadius: 8, cursor: "pointer",
                              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)",
                              color: "rgba(255,255,255,0.4)", fontSize: 11.5, fontWeight: 600, fontFamily: "inherit",
                            }}>
                              <RotateCcw size={11} /> Reset
                            </button>
                          </form>
                        )}
                        <form action={deleteWaitlistEntry}>
                          <input type="hidden" name="id" value={entry.id} />
                          <button type="submit" title="Delete" style={{
                            display: "flex", alignItems: "center", justifyContent: "center",
                            width: 30, height: 30, borderRadius: 8, cursor: "pointer",
                            background: "transparent", border: "1px solid rgba(255,255,255,0.07)",
                            color: "rgba(255,255,255,0.25)", fontFamily: "inherit",
                          }}>
                            <Trash2 size={13} />
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
