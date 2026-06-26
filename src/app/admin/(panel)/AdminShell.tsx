"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, ClipboardList, Store, CreditCard,
  LogOut, Search, Bell, ChevronLeft, ChevronRight,
  Sun, MessageSquare,
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

function isActive(href: string, pathname: string) {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

export function AdminShell({ children, user }: { children: React.ReactNode; user: User }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(true);

  const email   = user.email ?? "";
  const username = email.split("@")[0];
  const name    = username.charAt(0).toUpperCase() + username.slice(1);
  const initial = name.charAt(0);

  const greeting = (() => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  })();

  return (
    <div style={{ minHeight: "100vh", background: "rgb(10,10,12)", display: "flex" }}>

      {/* ═══════════════════════════════════════════════
          SIDEBAR — single collapsible panel
          ═══════════════════════════════════════════════ */}
      <aside style={{
        width: open ? 260 : 62,
        minHeight: "100vh",
        background: "rgb(10,10,12)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.22s cubic-bezier(0.4,0,0.2,1)",
        overflow: "hidden",
        flexShrink: 0,
        position: "sticky",
        top: 0,
        height: "100vh",
      }}>

        {/* ── User profile header ── */}
        {open ? (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "18px 14px 16px", flexShrink: 0,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: "rgb(234,88,12)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 17, fontWeight: 800, color: "white", flexShrink: 0,
              }}>
                {initial}
              </div>
              <span style={{
                color: "rgb(240,240,248)", fontSize: 15, fontWeight: 700,
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                letterSpacing: "-0.01em",
              }}>
                {name}
              </span>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: "none", border: "none",
                color: "rgba(255,255,255,0.28)", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 28, height: 28, borderRadius: 7, flexShrink: 0, padding: 0,
              }}
            >
              <ChevronLeft size={15} />
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "18px 0 14px", gap: 10, flexShrink: 0 }}>
            {/* Avatar */}
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: "rgb(234,88,12)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 17, fontWeight: 800, color: "white",
            }}>
              {initial}
            </div>
            {/* Expand button */}
            <button
              onClick={() => setOpen(true)}
              title="Expand sidebar"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.09)",
                borderRadius: 8, width: 34, height: 26,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "rgba(255,255,255,0.4)", cursor: "pointer", padding: 0,
              }}
            >
              <ChevronRight size={13} />
            </button>
          </div>
        )}

        {/* Divider */}
        <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "0 0 14px", flexShrink: 0 }} />

        {/* ── MENU label ── */}
        {open && (
          <p style={{
            color: "rgba(255,255,255,0.2)", fontSize: 10, fontWeight: 700,
            letterSpacing: "0.1em", textTransform: "uppercase",
            margin: "0 16px 8px", flexShrink: 0,
          }}>
            Menu
          </p>
        )}

        {/* ── Nav items ── */}
        <nav style={{ display: "flex", flexDirection: "column", gap: 1, padding: "0 8px", flex: 1 }}>
          {NAV.map(({ icon: Icon, href, label }) => {
            const active = isActive(href, pathname);
            return (
              <Link
                key={href}
                href={href}
                title={!open ? label : undefined}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: open ? "10px 12px" : "11px",
                  borderRadius: 10,
                  background: active ? "rgba(255,255,255,0.07)" : "transparent",
                  color: active ? "rgb(245,245,250)" : "rgba(255,255,255,0.42)",
                  fontSize: 14,
                  fontWeight: active ? 600 : 500,
                  textDecoration: "none",
                  transition: "background 0.15s, color 0.15s",
                  justifyContent: open ? "flex-start" : "center",
                }}
              >
                <Icon size={17} strokeWidth={active ? 2.1 : 1.7} style={{ flexShrink: 0 }} />
                {open && (
                  <>
                    <span style={{ flex: 1, whiteSpace: "nowrap" }}>{label}</span>
                    <ChevronRight size={13} style={{ opacity: 0.28, flexShrink: 0 }} />
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── Sign out ── */}
        <div style={{ padding: "0 8px 20px", flexShrink: 0 }}>
          <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "0 4px 8px" }} />
          <form action={logout} style={{ width: "100%" }}>
            <button type="submit" style={{
              display: "flex", alignItems: "center",
              gap: 12,
              padding: open ? "10px 12px" : "11px",
              borderRadius: 10,
              background: "transparent", border: "none",
              color: "rgba(255,255,255,0.35)", fontSize: 14, fontWeight: 500,
              cursor: "pointer", fontFamily: "inherit",
              width: "100%",
              justifyContent: open ? "flex-start" : "center",
            }}>
              <LogOut size={17} strokeWidth={1.7} style={{ flexShrink: 0 }} />
              {open && <span>Sign out</span>}
            </button>
          </form>
        </div>
      </aside>

      {/* ═══════════════════════════════════════════════
          RIGHT SIDE — top header + scrollable content
          ═══════════════════════════════════════════════ */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>

        {/* Top header */}
        <header style={{
          flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 32px",
          background: "rgb(10,10,12)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}>
          {/* Greeting */}
          <div style={{ flexShrink: 0 }}>
            <p style={{ color: "rgb(240,240,248)", fontSize: 15, fontWeight: 700, margin: 0, letterSpacing: "-0.01em" }}>
              {greeting}, {name}
            </p>
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, margin: 0 }}>
              Here&apos;s what&apos;s happening today.
            </p>
          </div>

          {/* Search */}
          <div style={{ flex: 1, maxWidth: 300, margin: "0 32px" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 9,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 10, padding: "9px 14px",
            }}>
              <Search size={13} color="rgba(255,255,255,0.22)" />
              <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 13, flex: 1 }}>Search anything...</span>
              <span style={{ color: "rgba(255,255,255,0.15)", fontSize: 11, fontWeight: 600, background: "rgba(255,255,255,0.06)", padding: "2px 6px", borderRadius: 5 }}>⌘K</span>
            </div>
          </div>

          {/* Action icons */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
            <div style={{ position: "relative" }}>
              <button style={headerIconBtn}><MessageSquare size={16} strokeWidth={1.6} /></button>
              <span style={hdBadge}>3</span>
            </div>
            <div style={{ position: "relative" }}>
              <button style={headerIconBtn}><Bell size={16} strokeWidth={1.6} /></button>
              <span style={hdBadge}>3</span>
            </div>
            <button style={headerIconBtn}><Sun size={16} strokeWidth={1.6} /></button>
            <div style={{
              width: 34, height: 34, borderRadius: "50%",
              background: "rgb(234,88,12)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 800, color: "white", cursor: "pointer",
            }}>
              {initial}
            </div>
          </div>
        </header>

        {/* Scrollable content */}
        <main style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }}>
          {children}
        </main>
      </div>

    </div>
  );
}

// ─── Shared header styles ─────────────────────────────────────────────────────

const headerIconBtn: React.CSSProperties = {
  width: 36, height: 36,
  display: "flex", alignItems: "center", justifyContent: "center",
  borderRadius: 10, background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.07)",
  color: "rgba(255,255,255,0.35)", cursor: "pointer",
};

const hdBadge: React.CSSProperties = {
  position: "absolute", top: 4, right: 4,
  minWidth: 14, height: 14, borderRadius: 7,
  background: "rgb(234,88,12)",
  display: "flex", alignItems: "center", justifyContent: "center",
  fontSize: 9, fontWeight: 800, color: "white",
  padding: "0 3px",
  border: "1.5px solid rgb(9,11,17)",
};
