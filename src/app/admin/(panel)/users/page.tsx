import { createAdminClient } from "@/lib/supabase/admin";
import { banUser, unbanUser, deleteUser, resetShopTrial, setTrialOverride, pauseShopTrial, resumeShopTrial } from "./actions";
import { UserX, UserCheck, Trash2, RotateCcw, ShieldCheck, ShieldOff, Pause, Play } from "lucide-react";
import { PlanSelect } from "./PlanSelect";
import { AddTrialDaysForm } from "./AddTrialDaysForm";
import { RestartAllTrialsButton } from "./RestartAllTrialsButton";
import { formatCAD } from "@/lib/plans";
import { sumRevenueByShop } from "@/lib/admin/shopRevenue";
import { computeAccessStatus, type AccessStatus } from "@/lib/dashboard/accessStatus";

const ACCESS_STATUS_LABEL: Record<AccessStatus, string> = {
  trialing: "Trialing",
  grace:    "Grace",
  inactive: "Locked out",
  active:   "Active",
  paused:   "Paused",
};
// References the theme-aware --astatus-* pairs (globals.css) instead of
// fixed rgb values — a pastel accent tuned for a dark card reads as
// washed-out on a white one, so the token itself flips to a deeper shade
// under [data-admin-theme="light"].
const ACCESS_STATUS_COLOR: Record<AccessStatus, { fg: string; bg: string }> = {
  trialing: { fg: "var(--astatus-blue-fg)",   bg: "var(--astatus-blue-bg)" },
  grace:    { fg: "var(--astatus-amber-fg)",  bg: "var(--astatus-amber-bg)" },
  inactive: { fg: "var(--astatus-red-fg)",    bg: "var(--astatus-red-bg)" },
  active:   { fg: "var(--astatus-green-fg)",  bg: "var(--astatus-green-bg)" },
  paused:   { fg: "var(--astatus-purple-fg)", bg: "var(--astatus-purple-bg)" },
};

export default async function AdminUsersPage() {
  const admin = createAdminClient();

  const [usersRes, profilesRes, shopsRes, apptsRes] = await Promise.all([
    admin.auth.admin.listUsers({ perPage: 1000 }),
    admin.from("profiles").select("id, first_name, last_name"),
    admin.from("shops").select("id, owner_id, name, plan, trial_started_at, subscription_status, trial_override, trial_paused_at"),
    admin.from("appointments").select("shop_id, price").eq("status", "completed"),
  ]);

  const users    = usersRes.data?.users ?? [];
  const profiles = Object.fromEntries((profilesRes.data ?? []).map(p => [p.id, p]));
  const shops    = Object.fromEntries((shopsRes.data ?? []).map(s => [s.owner_id, s]));
  const revenueByShop = sumRevenueByShop((apptsRes.data ?? []) as { shop_id: string; price: number }[]);

  const rows = users
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .map(u => {
      const shop = shops[u.id];
      const access = shop?.trial_started_at
        ? computeAccessStatus(shop as { trial_started_at: string; subscription_status: string | null; trial_override: boolean; trial_paused_at: string | null })
        : null;
      return {
        id:        u.id,
        email:     u.email ?? "-",
        name:      profiles[u.id] ? `${profiles[u.id].first_name} ${profiles[u.id].last_name}` : null,
        shopName:  shop?.name ?? null,
        plan:      shop?.plan ?? null,
        revenue:   shop ? revenueByShop[shop.id] ?? 0 : null,
        createdAt: u.created_at,
        isBanned:  !!(u.banned_until && new Date(u.banned_until) > new Date()),
        accessStatus: access?.status ?? null,
        trialOverride: shop?.trial_override ?? false,
        trialPaused: !!shop?.trial_paused_at,
      };
    });

  return (
    <div style={{ maxWidth: 1200 }}>
      {/* Heading */}
      <div style={{ marginBottom: 24, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ color: "var(--atext2)", fontSize: 22, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.03em" }}>Users</h1>
          <p style={{ color: "var(--aw3)", fontSize: 13, margin: 0 }}>{rows.length} total account{rows.length !== 1 ? "s" : ""}</p>
        </div>
        <RestartAllTrialsButton />
      </div>

      {rows.length === 0 ? (
        <div style={{ padding: "48px 0", textAlign: "center", color: "var(--aw25)", fontSize: 14 }}>
          No users yet.
        </div>
      ) : (
        <div style={{ background: "var(--asurface1)", border: "1px solid var(--aw07)", borderRadius: 16, overflowY: "hidden", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
            <thead>
              <tr style={{ background: "var(--aw015)" }}>
                {["User", "Shop", "Plan", "Revenue", "Joined", "Status", "Trial", "Actions"].map(h => (
                  <th key={h} style={{
                    padding: "11px 18px", textAlign: "left",
                    color: "var(--aw3)", fontSize: 11,
                    fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase",
                    borderBottom: "1px solid var(--aw06)",
                    whiteSpace: "nowrap",
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const initials = row.email.slice(0, 2).toUpperCase();
                const date = new Date(row.createdAt).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" });
                return (
                  <tr key={row.id} style={{ borderBottom: i < rows.length - 1 ? "1px solid var(--aw04)" : "none" }}>
                    {/* User */}
                    <td style={{ padding: "13px 18px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: 16, flexShrink: 0,
                          background: `hsl(${(i * 61 + 210) % 360}, 35%, 22%)`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 11, fontWeight: 700, color: "var(--aw85)",
                          opacity: row.isBanned ? 0.4 : 1,
                        }}>
                          {initials}
                        </div>
                        <div>
                          {row.name && <p style={{ color: "var(--atext2)", fontSize: 12.5, fontWeight: 600, margin: "0 0 1px" }}>{row.name}</p>}
                          <p style={{ color: "var(--aw42)", fontSize: 11.5, margin: 0 }}>{row.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Shop */}
                    <td style={{ padding: "13px 18px", color: row.shopName ? "var(--aw55)" : "var(--aw18)", fontSize: 12.5 }}>
                      {row.shopName ?? "-"}
                    </td>

                    {/* Plan */}
                    <td style={{ padding: "13px 18px" }}>
                      {row.plan ? (
                        <PlanSelect userId={row.id} plan={row.plan} />
                      ) : (
                        <span style={{ color: "var(--aw18)", fontSize: 12 }}>-</span>
                      )}
                    </td>

                    {/* Revenue */}
                    <td style={{ padding: "13px 18px", color: row.revenue ? "var(--aw55)" : "var(--aw18)", fontSize: 12.5, fontWeight: 600, whiteSpace: "nowrap" }}>
                      {row.revenue !== null ? formatCAD(row.revenue) : "-"}
                    </td>

                    {/* Joined */}
                    <td style={{ padding: "13px 18px", color: "var(--aw35)", fontSize: 12, whiteSpace: "nowrap" }}>
                      {date}
                    </td>

                    {/* Status */}
                    <td style={{ padding: "13px 18px" }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20,
                        letterSpacing: "0.04em", textTransform: "uppercase",
                        color: row.isBanned ? "var(--astatus-red-fg)" : "var(--astatus-green-fg)",
                        background: row.isBanned ? "var(--astatus-red-bg)" : "var(--astatus-green-bg)",
                      }}>
                        {row.isBanned ? "Banned" : "Active"}
                      </span>
                    </td>

                    {/* Trial */}
                    <td style={{ padding: "13px 18px" }}>
                      {row.accessStatus ? (
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20,
                          letterSpacing: "0.04em", textTransform: "uppercase",
                          color: ACCESS_STATUS_COLOR[row.accessStatus].fg,
                          background: ACCESS_STATUS_COLOR[row.accessStatus].bg,
                        }}>
                          {row.trialOverride ? "Bypassed" : ACCESS_STATUS_LABEL[row.accessStatus]}
                        </span>
                      ) : (
                        <span style={{ color: "var(--aw18)", fontSize: 12 }}>-</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "13px 18px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {row.accessStatus && (
                          <>
                            <form action={resetShopTrial}>
                              <input type="hidden" name="userId" value={row.id} />
                              <button
                                type="submit"
                                title="Reset trial clock to today"
                                style={{
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  width: 28, height: 28, borderRadius: 8, cursor: "pointer",
                                  background: "var(--aw04)", border: "1px solid var(--aw08)",
                                  color: "var(--aw3)", fontFamily: "inherit",
                                }}
                              >
                                <RotateCcw size={12} />
                              </button>
                            </form>
                            <form action={row.trialPaused ? resumeShopTrial : pauseShopTrial}>
                              <input type="hidden" name="userId" value={row.id} />
                              <button
                                type="submit"
                                title={row.trialPaused ? "Resume trial clock" : "Pause trial clock (freezes remaining time)"}
                                style={{
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  width: 28, height: 28, borderRadius: 8, cursor: "pointer",
                                  background: row.trialPaused ? "var(--astatus-purple-bg)" : "var(--aw04)",
                                  border: row.trialPaused ? "1px solid var(--astatus-purple-border)" : "1px solid var(--aw08)",
                                  color: row.trialPaused ? "var(--astatus-purple-fg)" : "var(--aw3)", fontFamily: "inherit",
                                }}
                              >
                                {row.trialPaused ? <Play size={12} /> : <Pause size={12} />}
                              </button>
                            </form>
                            <AddTrialDaysForm userId={row.id} />
                            <form action={setTrialOverride}>
                              <input type="hidden" name="userId" value={row.id} />
                              <input type="hidden" name="enabled" value={row.trialOverride ? "false" : "true"} />
                              <button
                                type="submit"
                                title={row.trialOverride ? "Remove bypass — trial gating applies again" : "Bypass trial gating — always full access"}
                                style={{
                                  display: "flex", alignItems: "center", gap: 5,
                                  padding: "5px 10px", borderRadius: 8, cursor: "pointer",
                                  background: row.trialOverride ? "var(--astatus-green-bg)" : "var(--aw04)",
                                  border: row.trialOverride ? "1px solid var(--astatus-green-border)" : "1px solid var(--aw08)",
                                  color: row.trialOverride ? "var(--astatus-green-fg)" : "var(--aw3)",
                                  fontSize: 11, fontWeight: 600, fontFamily: "inherit",
                                }}
                              >
                                {row.trialOverride ? <ShieldOff size={12} /> : <ShieldCheck size={12} />}
                                {row.trialOverride ? "Remove bypass" : "Bypass"}
                              </button>
                            </form>
                          </>
                        )}
                        {row.isBanned ? (
                          <form action={unbanUser}>
                            <input type="hidden" name="userId" value={row.id} />
                            <button
                              type="submit"
                              title="Unban"
                              style={{
                                display: "flex", alignItems: "center", gap: 5,
                                padding: "5px 10px", borderRadius: 8, cursor: "pointer",
                                background: "var(--astatus-green-bg)", border: "1px solid var(--astatus-green-border)",
                                color: "var(--astatus-green-fg)", fontSize: 11, fontWeight: 600, fontFamily: "inherit",
                              }}
                            >
                              <UserCheck size={12} /> Unban
                            </button>
                          </form>
                        ) : (
                          <form action={banUser}>
                            <input type="hidden" name="userId" value={row.id} />
                            <button
                              type="submit"
                              title="Ban"
                              style={{
                                display: "flex", alignItems: "center", gap: 5,
                                padding: "5px 10px", borderRadius: 8, cursor: "pointer",
                                background: "var(--astatus-red-bg)", border: "1px solid var(--astatus-red-border)",
                                color: "var(--astatus-red-fg)", fontSize: 11, fontWeight: 600, fontFamily: "inherit",
                              }}
                            >
                              <UserX size={12} /> Ban
                            </button>
                          </form>
                        )}
                        <form action={deleteUser}>
                          <input type="hidden" name="userId" value={row.id} />
                          <button
                            type="submit"
                            title="Delete"
                            style={{
                              display: "flex", alignItems: "center", justifyContent: "center",
                              width: 28, height: 28, borderRadius: 8, cursor: "pointer",
                              background: "var(--aw04)", border: "1px solid var(--aw08)",
                              color: "var(--aw3)", fontFamily: "inherit",
                            }}
                          >
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
