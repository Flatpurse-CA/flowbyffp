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
  HelpCircle,
  Sparkles,
  ChevronUp,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { logout } from "./actions";

const NAV_MAIN = [
  { label: "Overview",     icon: LayoutDashboard, href: "/dashboard"              },
  { label: "Appointments", icon: CalendarDays,    href: "/dashboard/appointments" },
  { label: "Clients",      icon: Users,           href: "/dashboard/clients"      },
  { label: "Services",     icon: Scissors,        href: "/dashboard/services"     },
  { label: "Reports",      icon: BarChart2,       href: "/dashboard/reports"      },
];

const NAV_OTHER = [
  { label: "Settings",    icon: Settings,    href: "/dashboard/settings" },
  { label: "Help Center", icon: HelpCircle,  href: "/dashboard/help"     },
];

function Sidebar({
  pathname,
  user,
  collapsed,
  onClose,
  onCollapseToggle,
}: {
  pathname: string;
  user: User;
  collapsed: boolean;
  onClose?: () => void;
  onCollapseToggle?: () => void;
}) {
  const email = user.email ?? "";
  const raw   = email.split("@")[0];
  const name  = raw.charAt(0).toUpperCase() + raw.slice(1);
  const initials = raw.slice(0, 2).toUpperCase();

  const w = collapsed ? 72 : 248;

  return (
    <aside
      style={{
        width: w,
        minHeight: "100vh",
        background: "rgb(12,12,15)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        overflow: "hidden",
        transition: "width 0.3s cubic-bezier(0.16,1,0.3,1)",
        position: "relative",
      }}
    >
      {/* Logo + collapse */}
      <div
        style={{
          padding: collapsed ? "18px 0" : "18px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          flexShrink: 0,
        }}
      >
        <Image src="/main logo.png" alt="Flow" width={34} height={34} style={{ objectFit: "contain", flexShrink: 0 }} />
        {!collapsed && (
          <button
            onClick={onClose ?? onCollapseToggle}
            style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", padding: 4, display: "flex" }}
          >
            {onClose ? <X size={17} /> : <PanelLeftClose size={17} />}
          </button>
        )}
      </div>

      {/* Search */}
      {!collapsed && (
        <div style={{ padding: "14px 12px 0" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 9,
              padding: "8px 10px",
            }}
          >
            <Search size={13} color="rgba(255,255,255,0.28)" style={{ flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: 12.5, color: "rgba(255,255,255,0.28)" }}>Search…</span>
            <div style={{ display: "flex", gap: 3 }}>
              {["⌘", "K"].map((k) => (
                <kbd
                  key={k}
                  style={{
                    fontSize: 10,
                    padding: "1px 5px",
                    borderRadius: 4,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.3)",
                    fontFamily: "inherit",
                    lineHeight: 1.6,
                  }}
                >
                  {k}
                </kbd>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, padding: collapsed ? "14px 0" : "14px 8px", display: "flex", flexDirection: "column", gap: 2, overflowY: "auto" }}>
        {/* Main section */}
        {NAV_MAIN.map(({ label, icon: Icon, href }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: collapsed ? "10px 0" : "9px 12px",
                justifyContent: collapsed ? "center" : "flex-start",
                borderRadius: collapsed ? 0 : 10,
                background: active
                  ? collapsed
                    ? "rgba(109,40,217,0.25)"
                    : "linear-gradient(90deg, rgba(109,40,217,0.22) 0%, rgba(89,28,180,0.42) 100%)"
                  : "transparent",
                borderRight: active && !collapsed ? "2.5px solid rgb(139,92,246)" : "2.5px solid transparent",
                color: active ? "rgb(210,196,254)" : "rgba(255,255,255,0.42)",
                fontSize: 13.5,
                fontWeight: active ? 600 : 400,
                textDecoration: "none",
                transition: "all 0.15s",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              <Icon size={16} strokeWidth={active ? 2.2 : 1.7} style={{ flexShrink: 0 }} />
              {!collapsed && label}
            </Link>
          );
        })}

        {/* Divider + OTHER section */}
        {!collapsed && (
          <div style={{ margin: "10px 4px", borderTop: "1px solid rgba(255,255,255,0.06)" }} />
        )}
        {!collapsed && (
          <p style={{ color: "rgba(255,255,255,0.22)", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "2px 12px 6px", margin: 0 }}>
            Other
          </p>
        )}
        {NAV_OTHER.map(({ label, icon: Icon, href }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: collapsed ? "10px 0" : "9px 12px",
                justifyContent: collapsed ? "center" : "flex-start",
                borderRadius: collapsed ? 0 : 10,
                background: active ? "rgba(109,40,217,0.18)" : "transparent",
                borderRight: active && !collapsed ? "2.5px solid rgb(139,92,246)" : "2.5px solid transparent",
                color: active ? "rgb(210,196,254)" : "rgba(255,255,255,0.38)",
                fontSize: 13.5,
                fontWeight: active ? 600 : 400,
                textDecoration: "none",
                transition: "all 0.15s",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              <Icon size={16} strokeWidth={active ? 2.2 : 1.7} style={{ flexShrink: 0 }} />
              {!collapsed && label}
            </Link>
          );
        })}
      </nav>

      {/* AutoPilot boost card */}
      {!collapsed && (
        <div style={{ padding: "0 10px 10px" }}>
          <div
            style={{
              padding: "15px 14px",
              background: "linear-gradient(135deg, rgb(18,14,50) 0%, rgb(32,18,80) 100%)",
              border: "1px solid rgba(139,92,246,0.25)",
              borderRadius: 13,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 7 }}>
              <Sparkles size={14} color="rgb(167,139,250)" strokeWidth={1.8} />
              <p style={{ color: "white", fontSize: 13, fontWeight: 700, margin: 0 }}>
                Boost with <span style={{ color: "rgb(167,139,250)" }}>AutoPilot</span>
              </p>
            </div>
            <p style={{ color: "rgba(255,255,255,0.42)", fontSize: 11.5, margin: "0 0 12px", lineHeight: 1.6 }}>
              AI-powered reminders, rebooking, and tools that save hours.
            </p>
            <button
              style={{
                width: "100%",
                padding: "9px 0",
                borderRadius: 9,
                background: "linear-gradient(90deg, rgb(109,40,217) 0%, rgb(99,102,241) 100%)",
                border: "none",
                color: "white",
                fontSize: 12.5,
                fontWeight: 700,
                cursor: "pointer",
                letterSpacing: "-0.01em",
              }}
            >
              Activate AutoPilot
            </button>
          </div>
        </div>
      )}

      {/* User profile */}
      <div style={{ padding: collapsed ? "10px 0" : "0 10px 14px", borderTop: "1px solid rgba(255,255,255,0.05)", flexShrink: 0 }}>
        {collapsed ? (
          <div style={{ display: "flex", justifyContent: "center", paddingTop: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: 17, background: "rgba(109,40,217,0.35)", border: "1.5px solid rgba(139,92,246,0.5)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgb(196,181,253)", fontSize: 12, fontWeight: 700 }}>
              {initials}
            </div>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "11px 12px",
              borderRadius: 12,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
              cursor: "pointer",
              marginTop: 10,
            }}
          >
            <div style={{ width: 34, height: 34, borderRadius: 17, background: "rgba(109,40,217,0.35)", border: "1.5px solid rgba(139,92,246,0.5)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgb(196,181,253)", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: "rgb(250,250,250)", fontSize: 13, fontWeight: 700, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</p>
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{email}</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 0, flexShrink: 0 }}>
              <ChevronUp size={12} color="rgba(255,255,255,0.3)" />
              <ChevronDown size={12} color="rgba(255,255,255,0.3)" />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

// ─── Shell ────────────────────────────────────────────────────────────────────

export function DashboardShell({ children, user }: { children: React.ReactNode; user: User }) {
  const pathname   = usePathname();
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [sideCollapsed, setSideCollapsed] = useState(false);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "rgb(9,9,11)" }}>
      {/* Desktop sidebar */}
      <div style={{ display: "none" }} className="dash-sidebar-desktop">
        <Sidebar
          pathname={pathname}
          user={user}
          collapsed={sideCollapsed}
          onCollapseToggle={() => setSideCollapsed((v) => !v)}
        />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex" }}>
          <div onClick={() => setMobileOpen(false)} style={{ flex: 1, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} />
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0 }}>
            <Sidebar pathname={pathname} user={user} collapsed={false} onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Top bar */}
        <header
          style={{
            height: 58,
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
          {/* Mobile menu */}
          <button onClick={() => setMobileOpen(true)} className="dash-mobile-menu" style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", padding: 4, display: "none" }}>
            <Menu size={20} />
          </button>

          {/* Desktop collapse toggle */}
          {sideCollapsed && (
            <button onClick={() => setSideCollapsed(false)} className="dash-sidebar-desktop" style={{ display: "none", background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", padding: 4 }}>
              <PanelLeftOpen size={18} />
            </button>
          )}

          {/* Search */}
          <div style={{ flex: 1, maxWidth: 380, display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "7px 12px" }}>
            <Search size={13} color="rgba(255,255,255,0.3)" />
            <span style={{ flex: 1, fontSize: 13, color: "rgba(255,255,255,0.28)" }}>Search…</span>
            <kbd style={{ fontSize: 10, padding: "1px 6px", borderRadius: 4, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.28)", fontFamily: "inherit", lineHeight: 1.6 }}>⌘K</kbd>
          </div>

          <div style={{ flex: 1 }} />

          {/* Date */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 11px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 9 }}>
            <CalendarDays size={13} color="rgba(255,255,255,0.32)" />
            <span style={{ color: "rgba(255,255,255,0.42)", fontSize: 12, fontWeight: 500, whiteSpace: "nowrap" }}>
              {new Date().toLocaleDateString("en-CA", { weekday: "short", month: "short", day: "numeric" })}
            </span>
          </div>

          {/* Bell */}
          <button style={{ background: "none", border: "none", color: "rgba(255,255,255,0.45)", cursor: "pointer", position: "relative", padding: 4 }}>
            <Bell size={18} />
            <span style={{ position: "absolute", top: 2, right: 2, width: 7, height: 7, background: "rgb(139,92,246)", borderRadius: "50%", border: "1.5px solid rgb(9,9,11)" }} />
          </button>

          {/* Sign out */}
          <form action={logout}>
            <button type="submit" style={{ background: "none", border: "none", color: "rgba(255,255,255,0.28)", cursor: "pointer", padding: 4, display: "flex" }}>
              <LogOut size={16} />
            </button>
          </form>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: "28px 28px" }}>
          {children}
        </main>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .dash-sidebar-desktop { display: flex !important; }
          .dash-mobile-menu { display: none !important; }
        }
        @media (max-width: 767px) {
          .dash-mobile-menu { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
