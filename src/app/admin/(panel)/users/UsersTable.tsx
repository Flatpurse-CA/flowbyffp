import Link from "next/link";
import { banUser, unbanUser, deleteUser, resetShopTrial, setTrialOverride, pauseShopTrial, resumeShopTrial, setUnlimited, sendSetupReminder } from "./actions";
import { UserX, UserCheck, Trash2, RotateCcw, ShieldCheck, ShieldOff, Pause, Play, Infinity as InfinityIcon, KeyRound, Send, UserRound } from "lucide-react";
import { addAdmin, removeAdmin } from "../settings/actions";
import { PlanSelect } from "./PlanSelect";
import { AddTrialDaysForm } from "./AddTrialDaysForm";
import { RowActionsMenu } from "./RowActionsMenu";
import { formatCAD } from "@/lib/plans";
import type { AccessStatus } from "@/lib/dashboard/accessStatus";

export type UserRow = {
  id: string;
  email: string;
  name: string | null;
  shopName: string | null;
  plan: string | null;
  revenue: number | null;
  createdAt: string;
  isBanned: boolean;
  accessStatus: AccessStatus | null;
  trialOverride: boolean;
  trialPaused: boolean;
  unlimited: boolean;
  noShop: boolean;
  emailConfirmed: boolean;
  needsSetup: boolean;
  setupReminderSentAt: string | null;
  isRootAdmin: boolean;
  isAdmin: boolean;
};

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

const actionBtn: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 5, height: 28,
  padding: "0 10px", borderRadius: 8, cursor: "pointer",
  fontSize: 11.5, fontWeight: 600, fontFamily: "inherit", whiteSpace: "nowrap",
};

function daysAgo(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  return days <= 0 ? "today" : days === 1 ? "yesterday" : `${days}d ago`;
}

export function UsersTable({ rows }: { rows: UserRow[] }) {
  return (
    <div style={{ background: "var(--asurface1)", border: "1px solid var(--aw07)", borderRadius: 16, overflowY: "hidden", overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
        <thead>
          <tr style={{ background: "var(--aw015)" }}>
            {["User", "Shop", "Plan", "Revenue", "Joined", "Status", "Trial", "Actions"].map(h => (
              <th key={h} style={{
                padding: "11px 14px", textAlign: h === "Actions" ? "right" : "left",
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
              <tr key={row.id} style={{ verticalAlign: "middle", borderBottom: i < rows.length - 1 ? "1px solid var(--aw04)" : "none" }}>
                {/* User */}
                <td style={{ padding: "12px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 16, flexShrink: 0,
                      background: `hsl(${(i * 61 + 210) % 360}, 35%, var(--aavatar-l, 22%))`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 700, color: "var(--aavatar-fg, var(--aw85))",
                      opacity: row.isBanned ? 0.4 : 1,
                    }}>
                      {initials}
                    </div>
                    <Link href={`/admin/users/${row.id}`} className="admin-user-link">
                      {(row.name || row.isAdmin) && (
                        <p style={{ color: "var(--atext2)", fontSize: 12.5, fontWeight: 600, margin: "0 0 1px", display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", maxWidth: 230 }}>
                          <span title={row.name ?? undefined} style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{row.name}</span>
                          {row.isAdmin && (
                            <span style={{ fontSize: 9.5, fontWeight: 700, padding: "2px 7px", borderRadius: 20, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--astatus-purple-fg)", background: "var(--astatus-purple-bg)", flexShrink: 0 }}>
                              Admin
                            </span>
                          )}
                        </p>
                      )}
                      <p title={row.email} style={{ color: "var(--aw42)", fontSize: 11.5, margin: 0, maxWidth: 230, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.email}</p>
                    </Link>
                  </div>
                </td>

                {/* Shop */}
                <td style={{ padding: "12px 14px", color: row.shopName ? "var(--aw55)" : "var(--aw18)", fontSize: 12.5, minWidth: 110 }}>
                  {row.shopName ?? "-"}
                </td>

                {/* Plan */}
                <td style={{ padding: "12px 14px" }}>
                  {row.plan ? (
                    <PlanSelect userId={row.id} plan={row.plan} />
                  ) : (
                    <span style={{ color: "var(--aw18)", fontSize: 12 }}>-</span>
                  )}
                </td>

                {/* Revenue */}
                <td style={{ padding: "12px 14px", color: row.revenue ? "var(--aw55)" : "var(--aw18)", fontSize: 12.5, fontWeight: 600, whiteSpace: "nowrap" }}>
                  {row.revenue !== null ? formatCAD(row.revenue) : "-"}
                </td>

                {/* Joined */}
                <td style={{ padding: "12px 14px", color: "var(--aw35)", fontSize: 12, whiteSpace: "nowrap" }}>
                  {date}
                </td>

                {/* Status */}
                <td style={{ padding: "12px 14px" }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, whiteSpace: "nowrap", display: "inline-block",
                    letterSpacing: "0.04em", textTransform: "uppercase",
                    color: row.isBanned ? "var(--astatus-red-fg)" : "var(--astatus-green-fg)",
                    background: row.isBanned ? "var(--astatus-red-bg)" : "var(--astatus-green-bg)",
                  }}>
                    {row.isBanned ? "Banned" : "Active"}
                  </span>
                </td>

                {/* Trial */}
                <td style={{ padding: "12px 14px" }}>
                  {row.accessStatus ? (
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, whiteSpace: "nowrap", display: "inline-block",
                      letterSpacing: "0.04em", textTransform: "uppercase",
                      color: ACCESS_STATUS_COLOR[row.accessStatus].fg,
                      background: ACCESS_STATUS_COLOR[row.accessStatus].bg,
                    }}>
                      {row.unlimited ? "Unlimited" : row.trialOverride ? "Bypassed" : ACCESS_STATUS_LABEL[row.accessStatus]}
                    </span>
                  ) : row.noShop && row.unlimited ? (
                    <span title="Applied when they finish setting up their shop" style={{
                      fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, whiteSpace: "nowrap", display: "inline-block",
                      letterSpacing: "0.04em", textTransform: "uppercase",
                      color: ACCESS_STATUS_COLOR.paused.fg, background: ACCESS_STATUS_COLOR.paused.bg,
                    }}>
                      Unlimited (no shop yet)
                    </span>
                  ) : (
                    row.noShop ? (
                      <div>
                        <span style={{ color: "var(--aw45)", fontSize: 12 }}>{row.emailConfirmed ? "No shop yet" : "Email not verified"}</span>
                        {row.setupReminderSentAt && (
                          <p style={{ color: "var(--aw3)", fontSize: 11, margin: "2px 0 0", whiteSpace: "nowrap" }}>Reminded {daysAgo(row.setupReminderSentAt)}</p>
                        )}
                      </div>
                    ) : <span style={{ color: "var(--aw18)", fontSize: 12 }}>-</span>
                  )}
                </td>

                {/* Actions: the two most-used toggles inline, everything
                    else in the row menu so every row keeps one height */}
                <td style={{ padding: "12px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6 }}>
                    {(row.accessStatus || row.noShop) && (
                      <form action={setUnlimited}>
                        <input type="hidden" name="userId" value={row.id} />
                        <input type="hidden" name="enabled" value={row.unlimited ? "false" : "true"} />
                        <button
                          type="submit"
                          title={row.unlimited ? "Remove unlimited, restores their previous plan" : "Unlimited: free full access on Enterprise, no payment needed"}
                          style={{
                            ...actionBtn,
                            background: row.unlimited ? "var(--astatus-purple-bg)" : "var(--asurface1)",
                            border: row.unlimited ? "1px solid var(--astatus-purple-border)" : "1px solid var(--aw08)",
                            color: row.unlimited ? "var(--astatus-purple-fg)" : "var(--aw65)",
                          }}
                        >
                          <InfinityIcon size={12} />
                          {row.unlimited ? "Remove unlimited" : "Unlimited"}
                        </button>
                      </form>
                    )}
                    <form action={row.isBanned ? unbanUser : banUser}>
                      <input type="hidden" name="userId" value={row.id} />
                      <button
                        type="submit"
                        title={row.isBanned ? "Unban" : "Ban"}
                        style={{
                          ...actionBtn,
                          background: row.isBanned ? "var(--astatus-green-bg)" : "var(--astatus-red-bg)",
                          border: `1px solid ${row.isBanned ? "var(--astatus-green-border)" : "var(--astatus-red-border)"}`,
                          color: row.isBanned ? "var(--astatus-green-fg)" : "var(--astatus-red-fg)",
                        }}
                      >
                        {row.isBanned ? <><UserCheck size={12} /> Unban</> : <><UserX size={12} /> Ban</>}
                      </button>
                    </form>
                    <RowActionsMenu>
                      {row.accessStatus && (
                        <>
                          <p className="admin-menu-label">Trial</p>
                          <form action={resetShopTrial}>
                            <input type="hidden" name="userId" value={row.id} />
                            <button type="submit" className="admin-menu-item"><RotateCcw size={13} /> Reset trial to today</button>
                          </form>
                          <form action={row.trialPaused ? resumeShopTrial : pauseShopTrial}>
                            <input type="hidden" name="userId" value={row.id} />
                            <button type="submit" className="admin-menu-item">
                              {row.trialPaused ? <><Play size={13} /> Resume trial clock</> : <><Pause size={13} /> Pause trial clock</>}
                            </button>
                          </form>
                          <AddTrialDaysForm userId={row.id} />
                          <form action={setTrialOverride}>
                            <input type="hidden" name="userId" value={row.id} />
                            <input type="hidden" name="enabled" value={row.trialOverride ? "false" : "true"} />
                            <button type="submit" className="admin-menu-item">
                              {row.trialOverride ? <><ShieldOff size={13} /> Remove trial bypass</> : <><ShieldCheck size={13} /> Bypass trial gating</>}
                            </button>
                          </form>
                          <div className="admin-menu-sep" />
                        </>
                      )}
                      {row.needsSetup && (
                        <>
                          <form action={sendSetupReminder}>
                            <input type="hidden" name="userId" value={row.id} />
                            <button type="submit" className="admin-menu-item"><Send size={13} /> Send setup reminder</button>
                          </form>
                          <div className="admin-menu-sep" />
                        </>
                      )}
                      <Link href={`/admin/users/${row.id}`} className="admin-menu-item"><UserRound size={13} /> View profile</Link>
                      {!row.isRootAdmin && row.email !== "-" && (
                        <form action={row.isAdmin ? removeAdmin : addAdmin}>
                          <input type="hidden" name="email" value={row.email} />
                          <button type="submit" className="admin-menu-item">
                            <KeyRound size={13} /> {row.isAdmin ? "Remove admin access" : "Make admin"}
                          </button>
                        </form>
                      )}
                      <form action={deleteUser}>
                        <input type="hidden" name="userId" value={row.id} />
                        <button type="submit" className="admin-menu-item danger"><Trash2 size={13} /> Delete user</button>
                      </form>
                    </RowActionsMenu>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
