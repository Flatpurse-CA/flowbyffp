import Link from "next/link";
import type { Account, AccountKind } from "@/lib/admin/accounts";

const TABS: { kind: AccountKind; label: string; href: string }[] = [
  { kind: "owner",  label: "Owners",  href: "/admin/users" },
  { kind: "client", label: "Clients", href: "/admin/users/clients" },
  { kind: "team",   label: "Team",    href: "/admin/users/team" },
];

// Shared top of the three Users pages: title, the Owners / Clients / Team
// switcher with live counts (mirrors the sidebar sub-menu, and is the only
// switcher visible when the sidebar is collapsed), plus page actions.
export function UsersSectionHeader({ active, accounts, subtitle, actions }: {
  active: AccountKind; accounts: Account[]; subtitle: string; actions?: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
        <div>
          <h1 style={{ color: "var(--atext2)", fontSize: 22, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.03em" }}>Users</h1>
          <p style={{ color: "var(--aw3)", fontSize: 13, margin: 0 }}>{subtitle}</p>
        </div>
        {actions && <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{actions}</div>}
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {TABS.map(t => {
          const on = t.kind === active;
          const count = accounts.filter(a => a.kind === t.kind).length;
          return (
            <Link key={t.kind} href={t.href} style={{
              display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 14px", borderRadius: 9,
              fontSize: 12.5, fontWeight: 600, textDecoration: "none",
              background: on ? "rgb(124,58,237)" : "var(--asurface1)",
              border: `1px solid ${on ? "rgb(124,58,237)" : "var(--aw08)"}`,
              color: on ? "white" : "var(--aw55)",
            }}>
              {t.label}
              <span style={{ fontSize: 11, fontWeight: 700, opacity: on ? 0.85 : 0.6 }}>{count}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
