import { createAdminClient } from "@/lib/supabase/admin";
import { approveWaitlistEntry, rejectWaitlistEntry, deleteWaitlistEntry, resetWaitlistEntry } from "./actions";
import { CheckCircle, XCircle, Trash2, RotateCcw } from "lucide-react";

const STATUS_STYLE: Record<string, { color: string; bg: string; label: string }> = {
  pending:  { color: "rgb(251,191,36)",  bg: "rgba(245,158,11,0.1)",  label: "Pending"  },
  approved: { color: "rgb(52,211,153)",  bg: "rgba(16,185,129,0.1)",  label: "Approved" },
  rejected: { color: "rgb(248,113,113)", bg: "rgba(239,68,68,0.1)",   label: "Rejected" },
};

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
    <div>
      {/* Heading */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: "rgb(250,250,250)", fontSize: 22, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.03em" }}>Waitlist</h1>
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, margin: 0 }}>{counts.total} total — {counts.pending} pending</p>
      </div>

      {/* Summary chips */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {[
          { label: "Total",    count: counts.total,    color: "rgba(255,255,255,0.5)", bg: "rgba(255,255,255,0.06)" },
          { label: "Pending",  count: counts.pending,  color: "rgb(251,191,36)",       bg: "rgba(245,158,11,0.1)"  },
          { label: "Approved", count: counts.approved, color: "rgb(52,211,153)",       bg: "rgba(16,185,129,0.1)"  },
          { label: "Rejected", count: counts.rejected, color: "rgb(248,113,113)",      bg: "rgba(239,68,68,0.1)"   },
        ].map(({ label, count, color, bg }) => (
          <div key={label} style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "7px 14px", borderRadius: 10,
            background: bg, border: `1px solid ${color}22`,
          }}>
            <span style={{ color, fontSize: 15, fontWeight: 800 }}>{count}</span>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>{label}</span>
          </div>
        ))}
      </div>

      {error && (
        <div style={{ padding: "14px 18px", borderRadius: 12, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "rgb(248,113,113)", fontSize: 13, marginBottom: 16 }}>
          Could not load waitlist — make sure the migration has been run.
        </div>
      )}

      {entries.length === 0 && !error ? (
        <div style={{ padding: "48px 0", textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: 14 }}>
          No waitlist entries yet.
        </div>
      ) : (
        <div style={{ background: "rgb(10,10,12)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 16, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.02)" }}>
                {["Name", "Email", "Shop Type", "Joined", "Status", "Actions"].map(h => (
                  <th key={h} style={{
                    padding: "11px 18px", textAlign: "left",
                    color: "rgba(255,255,255,0.28)", fontSize: 11,
                    fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase",
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
                const date = new Date(entry.created_at).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" });
                const s = STATUS_STYLE[entry.status] ?? STATUS_STYLE.pending;

                return (
                  <tr key={entry.id} style={{ borderBottom: i < entries.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>

                    {/* Name */}
                    <td style={{ padding: "13px 18px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                          background: `hsl(${(i * 61 + 180) % 360}, 30%, 20%)`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.7)",
                        }}>
                          {initials}
                        </div>
                        <span style={{ color: "rgb(240,240,248)", fontSize: 13, fontWeight: 600 }}>
                          {entry.name ?? <span style={{ color: "rgba(255,255,255,0.25)", fontWeight: 400 }}>—</span>}
                        </span>
                      </div>
                    </td>

                    {/* Email */}
                    <td style={{ padding: "13px 18px", color: "rgba(255,255,255,0.55)", fontSize: 12.5 }}>
                      {entry.email}
                    </td>

                    {/* Shop type */}
                    <td style={{ padding: "13px 18px", color: entry.shop_type ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.18)", fontSize: 12.5 }}>
                      {entry.shop_type ?? "—"}
                    </td>

                    {/* Date */}
                    <td style={{ padding: "13px 18px", color: "rgba(255,255,255,0.35)", fontSize: 12, whiteSpace: "nowrap" }}>
                      {date}
                    </td>

                    {/* Status */}
                    <td style={{ padding: "13px 18px" }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20,
                        letterSpacing: "0.04em", textTransform: "uppercase",
                        color: s.color, background: s.bg,
                      }}>
                        {s.label}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "13px 18px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {entry.status === "pending" && (
                          <>
                            <form action={approveWaitlistEntry}>
                              <input type="hidden" name="id" value={entry.id} />
                              <button type="submit" style={{
                                display: "flex", alignItems: "center", gap: 5,
                                padding: "5px 10px", borderRadius: 8, cursor: "pointer",
                                background: "rgba(16,185,129,0.1)", border: "1px solid rgba(52,211,153,0.22)",
                                color: "rgb(52,211,153)", fontSize: 11, fontWeight: 600, fontFamily: "inherit",
                              }}>
                                <CheckCircle size={11} /> Approve
                              </button>
                            </form>
                            <form action={rejectWaitlistEntry}>
                              <input type="hidden" name="id" value={entry.id} />
                              <button type="submit" style={{
                                display: "flex", alignItems: "center", gap: 5,
                                padding: "5px 10px", borderRadius: 8, cursor: "pointer",
                                background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)",
                                color: "rgb(248,113,113)", fontSize: 11, fontWeight: 600, fontFamily: "inherit",
                              }}>
                                <XCircle size={11} /> Reject
                              </button>
                            </form>
                          </>
                        )}
                        {(entry.status === "approved" || entry.status === "rejected") && (
                          <form action={resetWaitlistEntry}>
                            <input type="hidden" name="id" value={entry.id} />
                            <button type="submit" style={{
                              display: "flex", alignItems: "center", gap: 5,
                              padding: "5px 10px", borderRadius: 8, cursor: "pointer",
                              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                              color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 600, fontFamily: "inherit",
                            }}>
                              <RotateCcw size={11} /> Reset
                            </button>
                          </form>
                        )}
                        <form action={deleteWaitlistEntry}>
                          <input type="hidden" name="id" value={entry.id} />
                          <button type="submit" title="Delete" style={{
                            display: "flex", alignItems: "center", justifyContent: "center",
                            width: 28, height: 28, borderRadius: 8, cursor: "pointer",
                            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                            color: "rgba(255,255,255,0.28)", fontFamily: "inherit",
                          }}>
                            <Trash2 size={12} />
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
