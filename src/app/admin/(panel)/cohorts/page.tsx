import { createAdminClient } from "@/lib/supabase/admin";
import { GitFork } from "lucide-react";
import { computeSignupCohorts } from "@/lib/admin/cohorts";

function cellColor(pct: number | null) {
  if (pct === null) return "rgba(255,255,255,0.15)";
  if (pct >= 60) return "rgb(52,211,153)";
  if (pct >= 30) return "rgb(251,191,36)";
  return "rgb(248,113,113)";
}

function cellBg(pct: number | null) {
  if (pct === null) return "transparent";
  if (pct >= 60) return "rgba(16,185,129,0.12)";
  if (pct >= 30) return "rgba(245,158,11,0.12)";
  return "rgba(239,68,68,0.1)";
}

export default async function AdminCohortsPage() {
  const admin = createAdminClient();

  const [shopsRes, apptsRes] = await Promise.all([
    admin.from("shops").select("id, created_at"),
    admin.from("appointments").select("shop_id, starts_at, status"),
  ]);

  const shops = (shopsRes.data ?? []) as { id: string; created_at: string }[];
  const appointments = (apptsRes.data ?? []) as { shop_id: string; starts_at: string; status: string }[];

  const rows = computeSignupCohorts(shops, appointments, new Date());

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 style={{ color: "rgb(250,250,250)", fontSize: 22, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.03em" }}>Cohort Analysis</h1>
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, margin: 0 }}>
          Shops grouped by signup week: % that had a real booking in each week after joining. &ldquo;-&rdquo; means that cohort hasn&apos;t reached that week yet.
        </p>
      </div>

      {rows.length === 0 ? (
        <div style={{ background: "rgb(10,10,12)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 18, minHeight: 170, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
          <div style={{ width: 50, height: 50, borderRadius: "50%", background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <GitFork size={22} color="rgba(255,255,255,0.2)" strokeWidth={1.4} />
          </div>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, fontWeight: 600, margin: 0 }}>No shops yet</p>
        </div>
      ) : (
        <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.015)" }}>
                {["Signup week", "Shops", "Week 1", "Week 2", "Week 3", "Week 4"].map(h => (
                  <th key={h} style={{
                    padding: "11px 18px", textAlign: "left",
                    color: "rgba(255,255,255,0.28)", fontSize: 11,
                    fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase",
                    borderBottom: "1px solid rgba(255,255,255,0.06)", whiteSpace: "nowrap",
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.cohortStart} style={{ borderBottom: i < rows.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                  <td style={{ padding: "13px 18px", color: "rgb(250,250,250)", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>{r.cohortLabel}</td>
                  <td style={{ padding: "13px 18px", color: "rgba(255,255,255,0.5)", fontSize: 13 }}>{r.size}</td>
                  {[r.w1, r.w2, r.w3, r.w4].map((pct, wi) => (
                    <td key={wi} style={{ padding: "13px 18px" }}>
                      {pct === null ? (
                        <span style={{ color: "rgba(255,255,255,0.15)", fontSize: 12.5 }}>-</span>
                      ) : (
                        <span style={{
                          fontSize: 11.5, fontWeight: 700, padding: "3px 9px", borderRadius: 20,
                          color: cellColor(pct), background: cellBg(pct),
                        }}>
                          {pct}%
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
