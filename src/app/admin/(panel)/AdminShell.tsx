"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, ClipboardList, Store, CreditCard,
  LogOut, Search, Bell, PanelLeftClose, PanelLeftOpen,
  Settings, HelpCircle, Shield, ChevronUp, ChevronDown, ExternalLink,
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

  const email    = user.email ?? "";
  const initials = email.slice(0, 2).toUpperCase();

  return (
    <div style={{ minHeight: "100vh", background: "rgb(9,11,17)", display: "flex" }}>

      {/* ═══════════════════════════════════════════════════════
          SIDEBAR — icon strip + collapsible panel side by side
          ═══════════════════════════════════════════════════════ */}
      <div style={{ display: "flex", flexShrink: 0, minHeight: "100vh", position: "sticky", top: 0, height: "100vh" }}>

        {/* ── Left icon strip ── */}
        <aside style={{
          width: 56,
          background: "rgb(11,13,21)",
          borderRight: "1px solid rgba(255,255,255,0.05)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "14px 0",
          gap: 0,
        }}>
          {/* Logo */}
          <div style={{ marginBottom: 16 }}>
            <Image src="/main logo.png" alt="Flow" width={26} height={26} style={{ objectFit: "contain" }} />
          </div>

          <div style={{ width: 28, height: 1, background: "rgba(255,255,255,0.07)", marginBottom: 12 }} />

          {/* Utility icons */}
          <button style={iconBtn}>
            <Search size={15} strokeWidth={1.6} />
          </button>
          <button style={{ ...iconBtn, position: "relative" }}>
            <Bell size={15} strokeWidth={1.6} />
            <span style={{
              position: "absolute", top: 7, right: 7,
              width: 5, height: 5, borderRadius: 3,
              background: "rgb(139,92,246)",
              border: "1px solid rgb(11,13,21)",
            }} />
          </button>

          <div style={{ width: 28, height: 1, background: "rgba(255,255,255,0.06)", margin: "10px 0" }} />

          {/* Nav icons */}
          <nav style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, flex: 1 }}>
            {NAV.map(({ icon: Icon, href, label }) => {
              const active = isActive(href, pathname);
              return (
                <Link
                  key={href}
                  href={href}
                  title={label}
                  style={{
                    width: 36, height: 36,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    borderRadius: 10,
                    background: active ? "rgba(109,40,217,0.2)" : "transparent",
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

          {/* Bottom utility */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <button style={iconBtn}><Settings size={15} strokeWidth={1.6} /></button>
            <button style={iconBtn}><HelpCircle size={15} strokeWidth={1.6} /></button>
            <div style={{ width: 28, height: 1, background: "rgba(255,255,255,0.06)", margin: "8px 0" }} />
            {/* User avatar */}
            <div style={{
              width: 30, height: 30, borderRadius: "50%",
              background: "rgba(109,40,217,0.3)",
              border: "1.5px solid rgba(139,92,246,0.4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 10, fontWeight: 700, color: "rgb(196,181,253)",
            }}>
              {initials}
            </div>
          </div>
        </aside>

        {/* ── Right expanded panel ── */}
        {open && (
          <div style={{
            width: 216,
            background: "rgb(13,15,24)",
            borderRight: "1px solid rgba(255,255,255,0.05)",
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
          }}>

            {/* Panel header */}
            <div style={{
              padding: "14px 14px 12px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
              flexShrink: 0,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Image src="/main logo.png" alt="Flow" width={22} height={22} style={{ objectFit: "contain" }} />
                <span style={{ color: "rgb(240,240,248)", fontSize: 14, fontWeight: 700, letterSpacing: "-0.02em" }}>Flow Admin</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: "rgba(255,255,255,0.05)", border: "none",
                  borderRadius: 7, width: 26, height: 26,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "rgba(255,255,255,0.3)", cursor: "pointer",
                }}
              >
                <PanelLeftClose size={13} />
              </button>
            </div>

            {/* Quick search */}
            <div style={{ padding: "10px 10px 8px", flexShrink: 0 }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 9, padding: "8px 11px",
              }}>
                <Search size={12} color="rgba(255,255,255,0.25)" />
                <span style={{ color: "rgba(255,255,255,0.22)", fontSize: 12.5 }}>Quick search</span>
              </div>
            </div>

            {/* Inbox / Notifications */}
            <div style={{ padding: "0 10px 10px", flexShrink: 0 }}>
              <Link href="/admin/waitlist" style={utilRow}>
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <Bell size={14} strokeWidth={1.6} color="rgba(255,255,255,0.38)" />
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>Notifications</span>
                </div>
                <span style={{
                  fontSize: 10.5, fontWeight: 700, color: "rgb(196,181,253)",
                  background: "rgba(109,40,217,0.15)", padding: "2px 7px", borderRadius: 12,
                }}>
                  {/* live count would go here */}
                </span>
              </Link>
            </div>

            <div style={{ margin: "0 10px", borderTop: "1px solid rgba(255,255,255,0.05)", paddingBottom: 10 }} />

            {/* Menu section */}
            <div style={{ padding: "4px 10px 6px", flexShrink: 0 }}>
              <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 4px 8px" }}>
                Menu
              </p>
              <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {NAV.map(({ icon: Icon, href, label }) => {
                  const active = isActive(href, pathname);
                  return (
                    <Link
                      key={href}
                      href={href}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "9px 12px", borderRadius: 10,
                        background: active ? "rgba(255,255,255,0.07)" : "transparent",
                        border: active ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent",
                        color: active ? "rgb(240,240,248)" : "rgba(255,255,255,0.45)",
                        fontSize: 13.5, fontWeight: active ? 600 : 400,
                        textDecoration: "none", transition: "all 0.15s",
                      }}
                    >
                      <Icon size={15} strokeWidth={active ? 2.1 : 1.6} style={{ flexShrink: 0 }} />
                      {label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Spacer */}
            <div style={{ flex: 1 }} />

            {/* Admin access card */}
            <div style={{ padding: "0 10px 10px", flexShrink: 0 }}>
              <div style={{
                padding: "14px",
                background: "rgba(109,40,217,0.1)",
                border: "1px solid rgba(139,92,246,0.18)",
                borderRadius: 12,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: "50%",
                    background: "rgba(109,40,217,0.25)",
                    border: "1px solid rgba(139,92,246,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <Shield size={13} color="rgb(167,139,250)" />
                  </div>
                  <div>
                    <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 10.5, margin: "0 0 1px" }}>Access level:</p>
                    <p style={{ color: "rgb(240,240,248)", fontSize: 12.5, fontWeight: 700, margin: 0 }}>Full Admin</p>
                  </div>
                </div>
                <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11.5, margin: "0 0 11px", lineHeight: 1.5 }}>
                  You have full control over all platform data.
                </p>
                <Link
                  href="/"
                  target="_blank"
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    width: "100%", padding: "8px 0",
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 9, color: "rgba(255,255,255,0.6)",
                    fontSize: 12, fontWeight: 600, textDecoration: "none",
                    boxSizing: "border-box",
                  }}
                >
                  <ExternalLink size={11} /> View Live Site
                </Link>
              </div>
            </div>

            <div style={{ margin: "0 10px", borderTop: "1px solid rgba(255,255,255,0.05)", paddingBottom: 8 }} />

            {/* Bottom utility links */}
            <div style={{ padding: "0 10px 8px", flexShrink: 0 }}>
              {[
                { icon: Settings,    label: "Preferences"  },
                { icon: HelpCircle,  label: "Help"         },
              ].map(({ icon: Icon, label }) => (
                <button key={label} style={{
                  display: "flex", alignItems: "center", gap: 9,
                  width: "100%", padding: "8px 12px", borderRadius: 10,
                  background: "transparent", border: "none",
                  color: "rgba(255,255,255,0.4)", fontSize: 13, cursor: "pointer",
                  textAlign: "left", fontFamily: "inherit",
                }}>
                  <Icon size={14} strokeWidth={1.6} />
                  {label}
                </button>
              ))}
              <form action={logout} style={{ width: "100%" }}>
                <button type="submit" style={{
                  display: "flex", alignItems: "center", gap: 9,
                  width: "100%", padding: "8px 12px", borderRadius: 10,
                  background: "transparent", border: "none",
                  color: "rgba(255,255,255,0.4)", fontSize: 13, cursor: "pointer",
                  textAlign: "left", fontFamily: "inherit",
                }}>
                  <LogOut size={14} strokeWidth={1.6} />
                  Sign out
                </button>
              </form>
            </div>

            {/* User profile */}
            <div style={{
              margin: "0 10px 12px",
              padding: "10px 12px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 12,
              display: "flex", alignItems: "center", gap: 9,
              flexShrink: 0,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                background: "rgba(109,40,217,0.25)",
                border: "1.5px solid rgba(139,92,246,0.35)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700, color: "rgb(196,181,253)",
              }}>
                {initials}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: "rgb(240,240,248)", fontSize: 12, fontWeight: 700, margin: "0 0 1px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{email.split("@")[0]}</p>
                <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 10.5, margin: 0 }}>Admin</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 0, flexShrink: 0 }}>
                <ChevronUp size={11} color="rgba(255,255,255,0.25)" />
                <ChevronDown size={11} color="rgba(255,255,255,0.25)" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Collapse re-open button (when panel closed) ── */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          title="Open sidebar"
          style={{
            position: "fixed", top: 14, left: 66,
            width: 28, height: 28, borderRadius: 8,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.08)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "rgba(255,255,255,0.4)", cursor: "pointer", zIndex: 50,
          }}
        >
          <PanelLeftOpen size={13} />
        </button>
      )}

      {/* ── Main content ── */}
      <main style={{ flex: 1, minWidth: 0, overflowY: "auto", padding: "28px 32px" }}>
        {children}
      </main>
    </div>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const iconBtn: React.CSSProperties = {
  width: 36, height: 36,
  display: "flex", alignItems: "center", justifyContent: "center",
  borderRadius: 10, background: "transparent", border: "none",
  color: "rgba(255,255,255,0.26)", cursor: "pointer",
};

const utilRow: React.CSSProperties = {
  display: "flex", alignItems: "center", justifyContent: "space-between",
  padding: "8px 12px", borderRadius: 10,
  background: "transparent", textDecoration: "none",
  transition: "background 0.15s",
};
