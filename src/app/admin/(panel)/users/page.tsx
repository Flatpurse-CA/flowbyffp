import { createAdminClient } from "@/lib/supabase/admin";
import { banUser, unbanUser, deleteUser } from "./actions";
import { UserX, UserCheck, Trash2 } from "lucide-react";
import { PlanSelect } from "./PlanSelect";
import { formatCAD } from "@/lib/plans";
import { sumRevenueByShop } from "@/lib/admin/shopRevenue";

export default async function AdminUsersPage() {
  const admin = createAdminClient();

  const [usersRes, profilesRes, shopsRes, apptsRes] = await Promise.all([
    admin.auth.admin.listUsers({ perPage: 1000 }),
    admin.from("profiles").select("id, first_name, last_name"),
    admin.from("shops").select("id, owner_id, name, plan"),
    admin.from("appointments").select("shop_id, price").eq("status", "completed"),
  ]);

  const users    = usersRes.data?.users ?? [];
  const profiles = Object.fromEntries((profilesRes.data ?? []).map(p => [p.id, p]));
  const shops    = Object.fromEntries((shopsRes.data ?? []).map(s => [s.owner_id, s]));
  const revenueByShop = sumRevenueByShop((apptsRes.data ?? []) as { shop_id: string; price: number }[]);

  const rows = users
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .map(u => ({
      id:        u.id,
      email:     u.email ?? "-",
      name:      profiles[u.id] ? `${profiles[u.id].first_name} ${profiles[u.id].last_name}` : null,
      shopName:  shops[u.id]?.name ?? null,
      plan:      shops[u.id]?.plan ?? null,
      revenue:   shops[u.id] ? revenueByShop[shops[u.id].id] ?? 0 : null,
      createdAt: u.created_at,
      isBanned:  !!(u.banned_until && new Date(u.banned_until) > new Date()),
    }));

  return (
    <div style={{ maxWidth: 1200 }}>
      {/* Heading */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: "var(--atext2)", fontSize: 22, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.03em" }}>Users</h1>
        <p style={{ color: "var(--aw3)", fontSize: 13, margin: 0 }}>{rows.length} total account{rows.length !== 1 ? "s" : ""}</p>
      </div>

      {rows.length === 0 ? (
        <div style={{ padding: "48px 0", textAlign: "center", color: "var(--aw25)", fontSize: 14 }}>
          No users yet.
        </div>
      ) : (
        <div style={{ background: "var(--aw025)", border: "1px solid var(--aw07)", borderRadius: 16, overflowY: "hidden", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
            <thead>
              <tr style={{ background: "var(--aw015)" }}>
                {["User", "Shop", "Plan", "Revenue", "Joined", "Status", "Actions"].map(h => (
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
                        color: row.isBanned ? "rgb(248,113,113)" : "rgb(52,211,153)",
                        background: row.isBanned ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)",
                      }}>
                        {row.isBanned ? "Banned" : "Active"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "13px 18px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {row.isBanned ? (
                          <form action={unbanUser}>
                            <input type="hidden" name="userId" value={row.id} />
                            <button
                              type="submit"
                              title="Unban"
                              style={{
                                display: "flex", alignItems: "center", gap: 5,
                                padding: "5px 10px", borderRadius: 8, cursor: "pointer",
                                background: "rgba(16,185,129,0.1)", border: "1px solid rgba(52,211,153,0.2)",
                                color: "rgb(52,211,153)", fontSize: 11, fontWeight: 600, fontFamily: "inherit",
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
                                background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)",
                                color: "rgb(248,113,113)", fontSize: 11, fontWeight: 600, fontFamily: "inherit",
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
