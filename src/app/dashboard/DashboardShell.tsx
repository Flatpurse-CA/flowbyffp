"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Scissors,
  BarChart2,
  Settings,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
} from "lucide-react";
import { logout } from "./actions";

const NAV = [
  { label: "Overview", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Appointments", icon: CalendarDays, href: "/dashboard/appointments" },
  { label: "Clients", icon: Users, href: "/dashboard/clients" },
  { label: "Services", icon: Scissors, href: "/dashboard/services" },
  { label: "Reports", icon: BarChart2, href: "/dashboard/reports" },
  { label: "Settings", icon: Settings, href: "/dashboard/settings" },
];

function Sidebar({ pathname, collapsed, onClose }: { pathname: string; collapsed?: boolean; onClose?: () => void }) {
  return (
    <aside
      style={{
        width: collapsed ? 0 : 228,
        minHeight: "100vh",
        background: "rgb(11,11,14)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        overflow: "hidden",
        transition: "width 0.3s cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      <div style={{ padding: "18px 20px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Image src="/main logo.png" alt="Flow" width={38} height={38} style={{ objectFit: "contain" }} />
        {onClose && (
          <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", padding: 4 }}>
            <X size={18} />
          </button>
        )}
      </div>

      <nav style={{ flex: 1, padding: "28px 12px", display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV.map(({ label, icon: Icon, href }) => {
          const active = pathname === href;
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
                background: active ? "rgba(109,40,217,0.18)" : "transparent",
                color: active ? "rgb(196,181,253)" : "rgba(255,255,255,0.45)",
                fontSize: 13.5,
                fontWeight: active ? 600 : 400,
                textDecoration: "none",
                transition: "background 0.15s, color 0.15s",
                whiteSpace: "nowrap",
              }}
            >
              <Icon size={16} strokeWidth={active ? 2.2 : 1.8} />
              {label}
            </Link>
          );
        })}
      </nav>

      <form
        action={logout}
        style={{ padding: "0 12px 24px" }}
      >
        <button
          type="submit"
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "9px 12px",
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.3)",
            fontSize: 13.5,
            cursor: "pointer",
            borderRadius: 10,
            transition: "color 0.15s",
            whiteSpace: "nowrap",
          }}
        >
          <LogOut size={16} strokeWidth={1.8} />
          Sign out
        </button>
      </form>
    </aside>
  );
}

export function DashboardShell({ children, user }: { children: React.ReactNode; user: User }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = (user.email ?? "U").slice(0, 2).toUpperCase();

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "rgb(9,9,11)" }}>
      {/* Desktop sidebar */}
      <div style={{ display: "none" }} className="dash-sidebar-desktop">
        <Sidebar pathname={pathname} />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            display: "flex",
          }}
        >
          <div
            onClick={() => setMobileOpen(false)}
            style={{ flex: 1, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          />
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0 }}>
            <Sidebar pathname={pathname} onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Top bar */}
        <header
          style={{
            height: 60,
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            padding: "0 20px",
            gap: 12,
            background: "rgb(9,9,11)",
            position: "sticky",
            top: 0,
            zIndex: 30,
          }}
        >
          <button
            onClick={() => setMobileOpen(true)}
            style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", padding: 4, display: "flex" }}
          >
            <Menu size={20} />
          </button>

          <div
            style={{
              flex: 1,
              maxWidth: 360,
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 10,
              padding: "7px 12px",
            }}
          >
            <Search size={14} color="rgba(255,255,255,0.35)" />
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>Search…</span>
          </div>

          <div style={{ flex: 1 }} />

          <button style={{ background: "none", border: "none", color: "rgba(255,255,255,0.45)", cursor: "pointer", position: "relative", padding: 4 }}>
            <Bell size={18} />
            <span
              style={{
                position: "absolute",
                top: 2,
                right: 2,
                width: 7,
                height: 7,
                background: "rgb(139,92,246)",
                borderRadius: "50%",
                border: "1.5px solid rgb(9,9,11)",
              }}
            />
          </button>

          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "rgba(109,40,217,0.35)",
              border: "1.5px solid rgba(139,92,246,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgb(196,181,253)",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: "32px 24px" }}>
          {children}
        </main>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .dash-sidebar-desktop { display: block !important; }
        }
      `}</style>
    </div>
  );
}
