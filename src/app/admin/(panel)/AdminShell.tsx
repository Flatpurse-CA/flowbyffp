"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, ClipboardList, Store, CreditCard, LogOut, Shield,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { logout } from "@/app/dashboard/actions";

const NAV = [
  { label: "Overview", icon: LayoutDashboard, href: "/admin"          },
  { label: "Users",    icon: Users,           href: "/admin/users"    },
  { label: "Waitlist", icon: ClipboardList,   href: "/admin/waitlist" },
  { label: "Shops",    icon: Store,           href: "/admin/shops"    },
  { label: "Plans",    icon: CreditCard,      href: "/admin/plans"    },
];

function Sidebar({ pathname, user }: { pathname: string; user: User }) {
  const email = user.email ?? "";
  const initials = email.slice(0, 2).toUpperCase();

  return (
    <aside style={{
      width: 220,
      minHeight: "100vh",
      background: "rgb(11,8,8)",
      borderRight: "1px solid rgba(239,68,68,0.12)",
      display: "flex",
      flexDirection: "column",
      flexShrink: 0,
    }}>
      {/* Logo + admin badge */}
      <div style={{
        padding: "18px 16px",
        borderBottom: "1px solid rgba(239,68,68,0.08)",
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}>
        <Image src="/main logo.png" alt="Flow" width={30} height={30} style={{ objectFit: "contain", flexShrink: 0 }} />
        <div>
          <p style={{ margin: "0 0 2px", color: "rgb(250,250,250)", fontSize: 13, fontWeight: 800, letterSpacing: "-0.02em" }}>Flow</p>
          <span style={{
            fontSize: 9, fontWeight: 800, color: "rgb(239,68,68)", letterSpacing: "0.12em",
            textTransform: "uppercase", background: "rgba(239,68,68,0.1)",
            padding: "1px 6px", borderRadius: 3,
          }}>
            ADMIN
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "14px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV.map(({ label, icon: Icon, href }) => {
          const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 12px",
                borderRadius: 10,
                background: active
                  ? "linear-gradient(90deg, rgba(239,68,68,0.14) 0%, rgba(220,38,38,0.26) 100%)"
                  : "transparent",
                borderRight: active ? "2.5px solid rgb(239,68,68)" : "2.5px solid transparent",
                color: active ? "rgb(252,165,165)" : "rgba(255,255,255,0.42)",
                fontSize: 13.5,
                fontWeight: active ? 600 : 400,
                textDecoration: "none",
                transition: "all 0.15s",
                whiteSpace: "nowrap",
              }}
            >
              <Icon size={16} strokeWidth={active ? 2.2 : 1.7} style={{ flexShrink: 0 }} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div style={{ padding: "0 10px 14px", borderTop: "1px solid rgba(239,68,68,0.08)" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "11px 12px", borderRadius: 12,
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.06)",
          marginTop: 10,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 16,
            background: "rgba(239,68,68,0.2)",
            border: "1.5px solid rgba(239,68,68,0.35)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "rgb(252,165,165)", fontSize: 11, fontWeight: 700, flexShrink: 0,
          }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ color: "rgb(250,250,250)", fontSize: 11.5, fontWeight: 700, margin: "0 0 2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{email}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Shield size={9} color="rgb(239,68,68)" />
              <span style={{ color: "rgb(239,68,68)", fontSize: 10, fontWeight: 600 }}>Admin</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export function AdminShell({ children, user }: { children: React.ReactNode; user: User }) {
  const pathname = usePathname();

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "rgb(9,9,11)" }}>
      <Sidebar pathname={pathname} user={user} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Top bar */}
        <header style={{
          height: 52,
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          padding: "0 28px",
          justifyContent: "space-between",
          background: "rgb(9,9,11)",
          position: "sticky",
          top: 0,
          zIndex: 30,
        }}>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, margin: 0 }}>
            {new Date().toLocaleDateString("en-CA", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
          <form action={logout}>
            <button
              type="submit"
              style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "none", border: "none",
                color: "rgba(255,255,255,0.3)", cursor: "pointer",
                fontSize: 12, padding: 4, fontFamily: "inherit",
              }}
            >
              <LogOut size={13} /> Sign out
            </button>
          </form>
        </header>

        <main style={{ flex: 1, padding: "28px 32px" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
