"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, ClipboardList, Store, CreditCard,
  LogOut, Search, Bell, Plus, ChevronRight,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { logout } from "@/app/dashboard/actions";

const NAV = [
  { icon: LayoutDashboard, href: "/admin",          label: "Overview"  },
  { icon: Users,           href: "/admin/users",    label: "Users"     },
  { icon: ClipboardList,   href: "/admin/waitlist", label: "Waitlist"  },
  { icon: Store,           href: "/admin/shops",    label: "Shops"     },
  { icon: CreditCard,      href: "/admin/plans",    label: "Plans"     },
];

const PAGE_LABELS: Record<string, string> = {
  "/admin":          "Overview",
  "/admin/users":    "Users",
  "/admin/waitlist": "Waitlist",
  "/admin/shops":    "Shops",
  "/admin/plans":    "Plans",
};

function IconSidebar({ pathname }: { pathname: string }) {
  return (
    <aside style={{
      width: 54,
      background: "rgb(10,12,19)",
      borderRight: "1px solid rgba(255,255,255,0.05)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      paddingTop: 14,
      paddingBottom: 14,
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ marginBottom: 22, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Image src="/main logo.png" alt="Flow" width={26} height={26} style={{ objectFit: "contain" }} />
      </div>

      {/* Divider */}
      <div style={{ width: 28, height: 1, background: "rgba(255,255,255,0.07)", marginBottom: 12 }} />

      {/* Nav icons */}
      <nav style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, flex: 1 }}>
        {NAV.map(({ icon: Icon, href, label }) => {
          const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              title={label}
              style={{
                width: 36, height: 36,
                display: "flex", alignItems: "center", justifyContent: "center",
                borderRadius: 9,
                background: active ? "rgba(109,40,217,0.22)" : "transparent",
                color: active ? "rgb(196,181,253)" : "rgba(255,255,255,0.28)",
                textDecoration: "none",
                transition: "background 0.15s, color 0.15s",
              }}
            >
              <Icon size={16} strokeWidth={active ? 2.2 : 1.6} />
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <form action={logout}>
        <button
          type="submit"
          title="Sign out"
          style={{
            width: 36, height: 36,
            display: "flex", alignItems: "center", justifyContent: "center",
            borderRadius: 9, background: "transparent", border: "none",
            color: "rgba(255,255,255,0.22)", cursor: "pointer",
          }}
        >
          <LogOut size={15} strokeWidth={1.6} />
        </button>
      </form>
    </aside>
  );
}

export function AdminShell({ children, user }: { children: React.ReactNode; user: User }) {
  const pathname  = usePathname();
  const pageLabel = PAGE_LABELS[pathname] ?? "Admin";

  return (
    <div style={{ minHeight: "100vh", background: "rgb(8,10,16)", display: "flex", flexDirection: "column" }}>

      {/* ── Top bar ── */}
      <header style={{
        height: 50,
        background: "rgb(10,12,19)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        display: "flex",
        alignItems: "center",
        padding: "0 18px 0 0",
        gap: 10,
        flexShrink: 0,
        position: "sticky",
        top: 0,
        zIndex: 40,
      }}>
        {/* Sidebar spacer */}
        <div style={{ width: 54, flexShrink: 0 }} />

        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 5, flex: 1, minWidth: 0 }}>
          <span style={{ color: "rgba(255,255,255,0.28)", fontSize: 13 }}>Admin</span>
          <ChevronRight size={12} color="rgba(255,255,255,0.18)" />
          <span style={{ color: "rgb(240,240,245)", fontSize: 13, fontWeight: 600 }}>{pageLabel}</span>
        </div>

        {/* Search */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 8, padding: "6px 12px", width: 200,
        }}>
          <Search size={12} color="rgba(255,255,255,0.25)" />
          <span style={{ color: "rgba(255,255,255,0.22)", fontSize: 12.5 }}>Search...</span>
        </div>

        {/* Bell */}
        <button style={{
          width: 32, height: 32, borderRadius: 8, cursor: "pointer",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.07)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "rgba(255,255,255,0.38)", position: "relative",
        }}>
          <Bell size={14} strokeWidth={1.6} />
          <span style={{
            position: "absolute", top: 6, right: 6,
            width: 6, height: 6, borderRadius: 3,
            background: "rgb(139,92,246)",
            border: "1.5px solid rgb(10,12,19)",
          }} />
        </button>

        {/* Primary action */}
        <Link
          href="/admin/waitlist"
          style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "7px 13px", borderRadius: 8,
            background: "rgb(109,40,217)",
            color: "#fff", fontSize: 12.5, fontWeight: 600,
            textDecoration: "none", whiteSpace: "nowrap",
          }}
        >
          <Plus size={13} /> New Entry
        </Link>
      </header>

      {/* ── Body ── */}
      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        <IconSidebar pathname={pathname} />
        <main style={{ flex: 1, minWidth: 0, overflowY: "auto", padding: "24px 28px" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
