import Link from "next/link";
import { UserX, UserCheck, Trash2, UserRound } from "lucide-react";
import { banUser, unbanUser, deleteUser } from "./actions";
import { RowActionsMenu } from "./RowActionsMenu";
import { initialsOf, type Account } from "@/lib/admin/accounts";

// Generic table for the Clients and Team pages: user cell + page-specific
// columns + the same Ban / ⋯ actions as the Owners table.
export type Column = { header: string; cell: (a: Account) => React.ReactNode; nowrap?: boolean };

const th: React.CSSProperties = {
  padding: "11px 14px", textAlign: "left", color: "var(--aw3)", fontSize: 11, fontWeight: 600,
  letterSpacing: "0.05em", textTransform: "uppercase", borderBottom: "1px solid var(--aw06)", whiteSpace: "nowrap",
};
const td: React.CSSProperties = { padding: "12px 14px", fontSize: 12.5, color: "var(--aw55)", verticalAlign: "middle" };
const actionBtn: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 5, height: 28, padding: "0 10px", borderRadius: 8, cursor: "pointer",
  fontSize: 11.5, fontWeight: 600, fontFamily: "inherit", whiteSpace: "nowrap",
};

export const pill = (label: string, tone: "green" | "amber" | "red" | "blue" | "purple" | "slate") => (
  <span style={{
    display: "inline-block", whiteSpace: "nowrap", fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20,
    letterSpacing: "0.04em", textTransform: "uppercase",
    color: tone === "slate" ? "white" : `var(--astatus-${tone}-fg)`,
    background: tone === "slate" ? "rgb(71,85,105)" : `var(--astatus-${tone}-bg)`,
  }}>{label}</span>
);

export const fmtDate = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" }) : "-";

export function AccountsTable({ accounts, columns }: { accounts: Account[]; columns: Column[] }) {
  return (
    <div style={{ background: "var(--asurface1)", border: "1px solid var(--aw07)", borderRadius: 16, overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 820 }}>
        <thead>
          <tr style={{ background: "var(--aw015)" }}>
            <th style={th}>User</th>
            {columns.map(c => <th key={c.header} style={th}>{c.header}</th>)}
            <th style={{ ...th, textAlign: "right" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((a, i) => (
            <tr key={a.user.id} style={{ borderBottom: i < accounts.length - 1 ? "1px solid var(--aw04)" : "none" }}>
              <td style={td}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 16, flexShrink: 0,
                    background: `hsl(${(i * 61 + 150) % 360}, 35%, var(--aavatar-l, 22%))`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 700, color: "var(--aavatar-fg, var(--aw85))", opacity: a.isBanned ? 0.4 : 1,
                  }}>
                    {initialsOf(a.name, a.user.email ?? "")}
                  </div>
                  <Link href={`/admin/users/${a.user.id}`} className="admin-user-link">
                    {a.name && <p style={{ color: "var(--atext2)", fontSize: 12.5, fontWeight: 600, margin: "0 0 1px", maxWidth: 230, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.name}</p>}
                    <p style={{ color: "var(--aw42)", fontSize: 11.5, margin: 0, maxWidth: 230, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.user.email}</p>
                  </Link>
                </div>
              </td>
              {columns.map(c => <td key={c.header} style={{ ...td, whiteSpace: c.nowrap ? "nowrap" : undefined }}>{c.cell(a)}</td>)}
              <td style={td}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6 }}>
                  <form action={a.isBanned ? unbanUser : banUser}>
                    <input type="hidden" name="userId" value={a.user.id} />
                    <button type="submit" style={{
                      ...actionBtn,
                      background: a.isBanned ? "var(--astatus-green-bg)" : "var(--astatus-red-bg)",
                      border: `1px solid ${a.isBanned ? "var(--astatus-green-border)" : "var(--astatus-red-border)"}`,
                      color: a.isBanned ? "var(--astatus-green-fg)" : "var(--astatus-red-fg)",
                    }}>
                      {a.isBanned ? <><UserCheck size={12} /> Unban</> : <><UserX size={12} /> Ban</>}
                    </button>
                  </form>
                  <RowActionsMenu>
                    <Link href={`/admin/users/${a.user.id}`} className="admin-menu-item"><UserRound size={13} /> View profile</Link>
                    <form action={deleteUser}>
                      <input type="hidden" name="userId" value={a.user.id} />
                      <button type="submit" className="admin-menu-item danger"><Trash2 size={13} /> Delete user</button>
                    </form>
                  </RowActionsMenu>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
