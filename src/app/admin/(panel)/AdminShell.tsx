"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, ClipboardList, Store, CreditCard,
  LogOut, ChevronLeft, ChevronRight, Menu, X,
  Sun, Moon, MessageSquare, User as UserIcon, Settings, Mail,
  BarChart3, GitFork, Zap, ShieldAlert, Flag, FlaskConical, Activity,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { adminLogout } from "@/app/admin/actions";
import { NotificationsBell } from "./NotificationsBell";
import { AdminSearch } from "./AdminSearch";

const PURPLE = "rgb(139,92,246)";
const PURPLE_BG = "rgba(109,40,217,0.18)";

const NAV = [
  { icon: LayoutDashboard, href: "/admin",                    label: "Overview"          },
  { icon: Users,           href: "/admin/users",              label: "Users"             },
  { icon: ClipboardList,   href: "/admin/waitlist",           label: "Waitlist"          },
  { icon: Mail,            href: "/admin/emails",             label: "Emails"            },
  { icon: Store,           href: "/admin/shops",              label: "Shops"             },
  { icon: CreditCard,      href: "/admin/plans",              label: "Plans"             },
  { icon: BarChart3,       href: "/admin/analytics",          label: "Analytics"         },
  { icon: GitFork,         href: "/admin/cohorts",            label: "Cohort Analysis"   },
  { icon: Zap,             href: "/admin/autopilot-activity", label: "AutoPilot Activity"},
  { icon: ShieldAlert,     href: "/admin/payments-risk",      label: "Payments Risk"     },
  { icon: Flag,            href: "/admin/feature-flags",      label: "Feature Flags"     },
  { icon: FlaskConical,    href: "/admin/experiments",        label: "Experiments"       },
  { icon: Activity,        href: "/admin/feature-usage",      label: "Feature Usage"     },
];

function isActive(href: string, pathname: string) {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

const DARK = {
  bg:             "rgb(10,10,12)",
  border:         "rgba(255,255,255,0.06)",
  border2:        "rgba(255,255,255,0.09)",
  text:           "rgb(240,240,248)",
  textMuted:      "rgba(255,255,255,0.3)",
  textDim:        "rgba(255,255,255,0.42)",
  iconBtn:        "rgba(255,255,255,0.04)",
  iconBtnBorder:  "rgba(255,255,255,0.07)",
  iconColor:      "rgba(255,255,255,0.35)",
  menuLabel:      "rgba(255,255,255,0.2)",
  activePill:     "rgba(139,92,246,0.12)",
  activeText:     "rgb(200,180,255)",
  inactiveText:   "rgba(255,255,255,0.42)",
  searchBg:       "rgba(255,255,255,0.04)",
  searchBorder:   "rgba(255,255,255,0.07)",
  searchPlaceholder: "rgba(255,255,255,0.2)",
  searchKbd:      "rgba(255,255,255,0.15)",
  searchKbdBg:    "rgba(255,255,255,0.06)",
  dropBg:         "rgb(18,18,24)",
  dropBorder:     "rgba(255,255,255,0.1)",
  dropItem:       "rgba(255,255,255,0.65)",
  dropHover:      "rgba(255,255,255,0.06)",
  divider:        "rgba(255,255,255,0.06)",
};

const LIGHT = {
  bg:             "rgb(246,246,250)",
  border:         "rgba(0,0,0,0.08)",
  border2:        "rgba(0,0,0,0.1)",
  text:           "rgb(12,12,20)",
  textMuted:      "rgba(0,0,0,0.38)",
  textDim:        "rgba(0,0,0,0.48)",
  iconBtn:        "rgba(0,0,0,0.04)",
  iconBtnBorder:  "rgba(0,0,0,0.09)",
  iconColor:      "rgba(0,0,0,0.4)",
  menuLabel:      "rgba(0,0,0,0.25)",
  activePill:     "rgba(139,92,246,0.1)",
  activeText:     "rgb(109,40,217)",
  inactiveText:   "rgba(0,0,0,0.48)",
  searchBg:       "rgba(0,0,0,0.04)",
  searchBorder:   "rgba(0,0,0,0.09)",
  searchPlaceholder: "rgba(0,0,0,0.3)",
  searchKbd:      "rgba(0,0,0,0.2)",
  searchKbdBg:    "rgba(0,0,0,0.06)",
  dropBg:         "rgb(255,255,255)",
  dropBorder:     "rgba(0,0,0,0.1)",
  dropItem:       "rgba(0,0,0,0.65)",
  dropHover:      "rgba(0,0,0,0.05)",
  divider:        "rgba(0,0,0,0.08)",
};

export function AdminShell({ children, user }: { children: React.ReactNode; user: User }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(true);
  const [dark, setDark] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isMobile && mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMobile, mobileOpen]);

  const asideExpanded = isMobile || open;

  const email    = user.email ?? "";
  const username = email.split("@")[0];
  const name     = username.charAt(0).toUpperCase() + username.slice(1);
  const initial  = name.charAt(0);

  const greeting = (() => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  })();

  useEffect(() => {
    const stored = localStorage.getItem("admin-theme");
    if (stored === "light") {
      setDark(false);
      document.documentElement.setAttribute("data-theme", "light");
    }
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem("admin-theme", next ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
  };

  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdownOpen]);

  const T = dark ? DARK : LIGHT;

  const headerIconBtn: React.CSSProperties = {
    width: 36, height: 36,
    display: "flex", alignItems: "center", justifyContent: "center",
    borderRadius: 10, background: T.iconBtn,
    border: `1px solid ${T.iconBtnBorder}`,
    color: T.iconColor, cursor: "pointer",
  };

  const hdBadge: React.CSSProperties = {
    position: "absolute", top: 4, right: 4,
    minWidth: 14, height: 14, borderRadius: 7,
    background: PURPLE,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 9, fontWeight: 800, color: "white",
    padding: "0 3px",
    border: `1.5px solid ${T.bg}`,
  };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex" }}>

      {/* Mobile drawer backdrop */}
      {isMobile && mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 290,
          }}
        />
      )}

      {/* ═══════════════════════════════════════════════
          SIDEBAR
          ═══════════════════════════════════════════════ */}
      <div style={{
        width: isMobile ? 260 : (open ? 260 : 62),
        minHeight: "100vh",
        background: T.bg,
        borderRight: `1px solid ${T.border}`,
        display: "flex",
        flexDirection: "column",
        transition: isMobile ? "transform 0.25s cubic-bezier(0.4,0,0.2,1)" : "width 0.22s cubic-bezier(0.4,0,0.2,1)",
        overflow: "hidden",
        flexShrink: 0,
        position: isMobile ? "fixed" : "sticky",
        top: 0,
        left: 0,
        height: "100vh",
        transform: isMobile ? `translateX(${mobileOpen ? 0 : -100}%)` : "none",
        zIndex: isMobile ? 300 : "auto",
      }}>

        {/* User profile header */}
        {asideExpanded ? (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "17px 14px", flexShrink: 0,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: PURPLE_BG,
                border: `1px solid rgba(139,92,246,0.3)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 17, fontWeight: 800, color: PURPLE, flexShrink: 0,
              }}>
                {initial}
              </div>
              <span style={{
                color: T.text, fontSize: 15, fontWeight: 700,
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                letterSpacing: "-0.01em",
              }}>
                {name}
              </span>
            </div>
            <button
              onClick={() => (isMobile ? setMobileOpen(false) : setOpen(false))}
              style={{
                background: "none", border: "none",
                color: T.textMuted, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 28, height: 28, borderRadius: 7, flexShrink: 0, padding: 0,
              }}
            >
              {isMobile ? <X size={16} /> : <ChevronLeft size={15} />}
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "18px 0 14px", gap: 10, flexShrink: 0 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: PURPLE_BG,
              border: `1px solid rgba(139,92,246,0.3)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 17, fontWeight: 800, color: PURPLE,
            }}>
              {initial}
            </div>
            <button
              onClick={() => setOpen(true)}
              title="Expand sidebar"
              style={{
                background: T.iconBtn,
                border: `1px solid ${T.border2}`,
                borderRadius: 8, width: 34, height: 26,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: T.textDim, cursor: "pointer", padding: 0,
              }}
            >
              <ChevronRight size={13} />
            </button>
          </div>
        )}

        {/* Divider */}
        <div style={{ height: 1, background: T.divider, margin: "0 0 14px", flexShrink: 0 }} />

        {/* MENU label */}
        {asideExpanded && (
          <p style={{
            color: T.menuLabel, fontSize: 10, fontWeight: 700,
            letterSpacing: "0.1em", textTransform: "uppercase",
            margin: "0 16px 8px", flexShrink: 0,
          }}>
            Menu
          </p>
        )}

        {/* Nav items */}
        <nav style={{ display: "flex", flexDirection: "column", gap: 1, padding: "0 8px", flex: 1 }}>
          {NAV.map(({ icon: Icon, href, label }) => {
            const active = isActive(href, pathname);
            return (
              <Link
                key={href}
                href={href}
                title={!asideExpanded ? label : undefined}
                onClick={() => isMobile && setMobileOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: asideExpanded ? "10px 12px" : "11px",
                  borderRadius: 10,
                  background: active ? T.activePill : "transparent",
                  color: active ? T.activeText : T.inactiveText,
                  fontSize: 14,
                  fontWeight: active ? 600 : 500,
                  textDecoration: "none",
                  transition: "background 0.15s, color 0.15s",
                  justifyContent: asideExpanded ? "flex-start" : "center",
                }}
              >
                <Icon size={17} strokeWidth={active ? 2.1 : 1.7} style={{ flexShrink: 0 }} />
                {asideExpanded && (
                  <>
                    <span style={{ flex: 1, whiteSpace: "nowrap" }}>{label}</span>
                    <ChevronRight size={13} style={{ opacity: 0.28, flexShrink: 0 }} />
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sign out */}
        <div style={{ padding: "0 8px 20px", flexShrink: 0 }}>
          <div style={{ height: 1, background: T.divider, margin: "0 4px 8px" }} />
          <form action={adminLogout} style={{ width: "100%" }}>
            <button type="submit" style={{
              display: "flex", alignItems: "center",
              gap: 12,
              padding: asideExpanded ? "10px 12px" : "11px",
              borderRadius: 10,
              background: "transparent", border: "none",
              color: T.textDim, fontSize: 14, fontWeight: 500,
              cursor: "pointer", fontFamily: "inherit",
              width: "100%",
              justifyContent: asideExpanded ? "flex-start" : "center",
            }}>
              <LogOut size={17} strokeWidth={1.7} style={{ flexShrink: 0 }} />
              {asideExpanded && <span>Sign out</span>}
            </button>
          </form>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          RIGHT SIDE
          ═══════════════════════════════════════════════ */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>

        {/* Top header */}
        <header style={{
          flexShrink: 0,
          height: isMobile ? 60 : 73,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: isMobile ? "0 12px" : "0 32px",
          gap: isMobile ? 10 : 0,
          background: T.bg,
          borderBottom: `1px solid ${T.border}`,
        }}>
          {/* Hamburger (mobile only) */}
          {isMobile && (
            <button
              onClick={() => setMobileOpen(true)}
              style={{ ...headerIconBtn, flexShrink: 0 }}
              aria-label="Open menu"
            >
              <Menu size={18} strokeWidth={1.8} />
            </button>
          )}

          {/* Greeting */}
          <div style={{ flexShrink: 0, minWidth: 0, display: isMobile ? "none" : "block" }}>
            <p style={{ color: T.text, fontSize: 15, fontWeight: 700, margin: 0, letterSpacing: "-0.01em" }}>
              {greeting}, {name}
            </p>
            <p style={{ color: T.textMuted, fontSize: 12, margin: 0 }}>
              Here&apos;s what&apos;s happening today.
            </p>
          </div>

          {/* Search */}
          <div style={{ margin: isMobile ? 0 : "0 32px", flex: 1, minWidth: 0, maxWidth: isMobile ? "none" : 300 }}>
            <AdminSearch
              compact={isMobile}
              T={{
                searchBg: T.searchBg, searchBorder: T.searchBorder, searchPlaceholder: T.searchPlaceholder,
                searchKbd: T.searchKbd, searchKbdBg: T.searchKbdBg,
                dropBg: T.dropBg, dropBorder: T.dropBorder, dropItem: T.dropItem, textMuted: T.textMuted, dropHover: T.dropHover,
              }}
            />
          </div>

          {/* Action icons */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
            {!isMobile && (
              <div style={{ position: "relative" }}>
                <button style={headerIconBtn}><MessageSquare size={16} strokeWidth={1.6} /></button>
                <span style={hdBadge}>3</span>
              </div>
            )}
            <NotificationsBell
              headerIconBtn={headerIconBtn}
              badgeStyle={hdBadge}
              T={{ dropBg: T.dropBg, dropBorder: T.dropBorder, text: T.text, textMuted: T.textMuted, dropItem: T.dropItem, dropHover: T.dropHover }}
            />

            {/* Theme + Avatar grouped */}
            <div style={{
              display: "flex", alignItems: "center",
              background: T.iconBtn,
              border: `1px solid ${T.iconBtnBorder}`,
              borderRadius: 12, overflow: "visible",
              height: 38,
            }}>
              {/* Dark mode toggle */}
              <button
                onClick={toggleDark}
                title={dark ? "Switch to light" : "Switch to dark"}
                style={{
                  width: 38, height: 38,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "transparent", border: "none",
                  borderRight: `1px solid ${T.iconBtnBorder}`,
                  color: T.iconColor, cursor: "pointer",
                  borderRadius: "12px 0 0 12px",
                }}
              >
                {dark ? <Sun size={15} strokeWidth={1.6} /> : <Moon size={15} strokeWidth={1.6} />}
              </button>

              {/* Avatar with dropdown */}
              <div ref={dropdownRef} style={{ position: "relative" }}>
                <button
                  onClick={() => setDropdownOpen(v => !v)}
                  style={{
                    width: 44, height: 38,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: "transparent", border: "none",
                    cursor: "pointer", padding: 0,
                    borderRadius: "0 12px 12px 0",
                  }}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: PURPLE,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 800, color: "white",
                    flexShrink: 0,
                  }}>
                    {initial}
                  </div>
                </button>

                {/* Dropdown menu */}
                {dropdownOpen && (
                  <div style={{
                    position: "absolute", top: "calc(100% + 10px)", right: 0,
                    width: 200,
                    background: T.dropBg,
                    border: `1px solid ${T.dropBorder}`,
                    borderRadius: 14,
                    boxShadow: dark
                      ? "0 12px 40px rgba(0,0,0,0.55)"
                      : "0 8px 32px rgba(0,0,0,0.12)",
                    overflow: "hidden",
                    zIndex: 200,
                  }}>
                    {/* User info */}
                    <div style={{
                      padding: "13px 15px 11px",
                      borderBottom: `1px solid ${T.dropBorder}`,
                    }}>
                      <p style={{ color: T.text, fontSize: 13, fontWeight: 700, margin: "0 0 2px" }}>{name}</p>
                      <p style={{
                        color: T.textMuted, fontSize: 11.5, margin: 0,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {email}
                      </p>
                    </div>

                    {/* Nav items */}
                    {[
                      { icon: UserIcon, label: "Profile",  href: "/admin/profile" },
                      { icon: Settings, label: "Settings", href: "/admin/settings" },
                    ].map(({ icon: Icon, label, href }) => (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setDropdownOpen(false)}
                        style={{
                          display: "flex", alignItems: "center", gap: 10,
                          padding: "10px 15px",
                          color: T.dropItem,
                          fontSize: 13, fontWeight: 500,
                          textDecoration: "none",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = T.dropHover)}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >
                        <Icon size={14} strokeWidth={1.7} />
                        {label}
                      </Link>
                    ))}

                    <div style={{ height: 1, background: T.dropBorder, margin: "2px 0" }} />

                    <form action={adminLogout}>
                      <button
                        type="submit"
                        style={{
                          display: "flex", alignItems: "center", gap: 10,
                          padding: "10px 15px", width: "100%",
                          background: "transparent", border: "none",
                          color: "rgb(248,113,113)",
                          fontSize: 13, fontWeight: 500,
                          cursor: "pointer", fontFamily: "inherit",
                          textAlign: "left",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = "rgba(239,68,68,0.08)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >
                        <LogOut size={14} strokeWidth={1.7} />
                        Sign out
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable content */}
        <main style={{ flex: 1, overflowY: "auto", padding: "28px 32px", background: T.bg }}>
          {children}
        </main>
      </div>

    </div>
  );
}
