"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import {
  LayoutDashboard, CalendarDays, Users, Zap,
  LayoutGrid, Users2, Settings,
  LogOut, Bell, ChevronLeft, ChevronRight, ChevronDown,
  Sun, Moon, User as UserIcon, Search, MessageSquare, Sparkles,
  CalendarClock, UserRound, MoreHorizontal,
} from "lucide-react";
import { logout, searchDashboard, type SearchResult } from "./actions";
import type { ShopRole } from "@/lib/dashboard/shop";

const PURPLE    = "rgb(139,92,246)";
const PURPLE_BG = "rgba(109,40,217,0.18)";

const NAV_TABS = [
  { icon: LayoutDashboard, href: "/dashboard",              label: "Home",       badge: 0, ownerOnly: false },
  { icon: CalendarDays,    href: "/dashboard/appointments", label: "Bookings",   badge: 0, ownerOnly: false },
  { icon: Users,           href: "/dashboard/clients",      label: "Clients",    badge: 0, ownerOnly: false },
  { icon: Users2,          href: "/dashboard/team",         label: "Team",       badge: 0, ownerOnly: true  },
  { icon: Zap,             href: "/dashboard/autopilot",    label: "AutoPilot",  badge: 0, ownerOnly: true  },
  { icon: LayoutGrid,      href: "/dashboard/operations",   label: "Operations", badge: 0, ownerOnly: true  },
];

const MOBILE_TABS = [
  { icon: LayoutDashboard, href: "/dashboard",              label: "Home" },
  { icon: CalendarDays,    href: "/dashboard/appointments", label: "Bookings" },
  { icon: Users,           href: "/dashboard/clients",      label: "Clients" },
  { icon: MoreHorizontal,  href: "/dashboard/more",         label: "More" },
];
const MOBILE_PRIMARY_HREFS = ["/dashboard", "/dashboard/appointments", "/dashboard/clients"];

function isActive(href: string, pathname: string) {
  return href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);
}

const DARK = {
  bg:                "rgb(10,10,12)",
  border:            "rgba(255,255,255,0.06)",
  border2:           "rgba(255,255,255,0.09)",
  text:              "rgb(240,240,248)",
  textMuted:         "rgba(255,255,255,0.3)",
  textDim:           "rgba(255,255,255,0.42)",
  iconBtn:           "rgba(255,255,255,0.04)",
  iconBtnBorder:     "rgba(255,255,255,0.07)",
  iconColor:         "rgba(255,255,255,0.35)",
  sectionLabel:      "rgba(255,255,255,0.2)",
  activePill:        "rgba(139,92,246,0.14)",
  activeText:        "rgb(200,180,255)",
  inactiveText:      "rgba(255,255,255,0.42)",
  searchBg:          "rgba(255,255,255,0.04)",
  searchBorder:      "rgba(255,255,255,0.07)",
  searchPlaceholder: "rgba(255,255,255,0.2)",
  searchKbd:         "rgba(255,255,255,0.15)",
  searchKbdBg:       "rgba(255,255,255,0.06)",
  dropBg:            "rgb(18,18,24)",
  dropBorder:        "rgba(255,255,255,0.1)",
  dropItem:          "rgba(255,255,255,0.65)",
  dropHover:         "rgba(255,255,255,0.06)",
};

const LIGHT = {
  bg:                "rgb(246,246,250)",
  border:            "rgba(0,0,0,0.08)",
  border2:           "rgba(0,0,0,0.1)",
  text:              "rgb(12,12,20)",
  textMuted:         "rgba(0,0,0,0.38)",
  textDim:           "rgba(0,0,0,0.48)",
  iconBtn:           "rgba(0,0,0,0.04)",
  iconBtnBorder:     "rgba(0,0,0,0.09)",
  iconColor:         "rgba(0,0,0,0.4)",
  sectionLabel:      "rgba(0,0,0,0.25)",
  activePill:        "rgba(139,92,246,0.1)",
  activeText:        "rgb(109,40,217)",
  inactiveText:      "rgba(0,0,0,0.48)",
  searchBg:          "rgba(0,0,0,0.04)",
  searchBorder:      "rgba(0,0,0,0.09)",
  searchPlaceholder: "rgba(0,0,0,0.3)",
  searchKbd:         "rgba(0,0,0,0.2)",
  searchKbdBg:       "rgba(0,0,0,0.06)",
  dropBg:            "rgb(255,255,255)",
  dropBorder:        "rgba(0,0,0,0.1)",
  dropItem:          "rgba(0,0,0,0.65)",
  dropHover:         "rgba(0,0,0,0.05)",
};

function SidebarNav({ open, pathname, T, tabs }: { open: boolean; pathname: string; T: typeof DARK; tabs: typeof NAV_TABS }) {
  return (
    <nav style={{ display: "flex", flexDirection: "column", gap: 1, padding: "0 8px", flexShrink: 0 }}>
      {tabs.map(({ icon: Icon, href, label, badge }) => {
        const active = isActive(href, pathname);
        return (
          <Link
            key={href}
            href={href}
            title={!open ? label : undefined}
            style={{
              display: "flex", alignItems: "center",
              gap: 12,
              padding: open ? "9px 12px" : "11px",
              borderRadius: 10,
              background: active ? T.activePill : "transparent",
              color: active ? T.activeText : T.inactiveText,
              fontSize: 13.5, fontWeight: active ? 600 : 400,
              textDecoration: "none",
              transition: "background 0.15s, color 0.15s",
              justifyContent: open ? "flex-start" : "center",
            }}
          >
            <Icon size={16} strokeWidth={active ? 2.1 : 1.7} style={{ flexShrink: 0 }} />
            {open && (
              <>
                <span style={{ flex: 1, whiteSpace: "nowrap" }}>{label}</span>
                {badge > 0 && (
                  <span style={{
                    minWidth: 18, height: 18, borderRadius: 9,
                    background: PURPLE, color: "white",
                    fontSize: 10, fontWeight: 800,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    padding: "0 4px", flexShrink: 0,
                  }}>
                    {badge}
                  </span>
                )}
              </>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardShell({ children, user, role, staffName, unreadCount }: { children: React.ReactNode; user: User; role: ShopRole; staffName: string | null; unreadCount: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const visibleTabs = role === "owner" ? NAV_TABS : NAV_TABS.filter(t => !t.ownerOnly);
  const [open, setOpen]             = useState(true);
  const [dark, setDark]             = useState(true);
  const [dropdownOpen, setDropdown] = useState(false);
  const dropdownRef                 = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const email       = user.email ?? "";
  const username    = email.split("@")[0];
  const metaFirstName = (user.user_metadata as { first_name?: string } | undefined)?.first_name;
  const fallbackName  = username.charAt(0).toUpperCase() + username.slice(1);
  const name     = staffName?.split(" ")[0] ?? (metaFirstName ? metaFirstName.charAt(0).toUpperCase() + metaFirstName.slice(1) : fallbackName);
  const initial  = name.charAt(0);

  const greeting = (() => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  })();

  useEffect(() => {
    const timeout = setTimeout(() => {
      const stored = localStorage.getItem("portal-theme");
      if (stored === "light") {
        setDark(false);
        document.documentElement.setAttribute("data-portal-theme", "light");
      }
    }, 0);
    return () => clearTimeout(timeout);
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem("portal-theme", next ? "dark" : "light");
    document.documentElement.setAttribute("data-portal-theme", next ? "dark" : "light");
  };

  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdownOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [searchOpen]);

  useEffect(() => {
    let cancelled = false;
    const timeout = setTimeout(async () => {
      if (searchQuery.trim().length < 2) {
        if (!cancelled) setSearchResults([]);
        return;
      }
      const results = await searchDashboard(searchQuery);
      if (!cancelled) setSearchResults(results);
    }, 250);
    return () => { cancelled = true; clearTimeout(timeout); };
  }, [searchQuery]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        setSearchOpen(true);
      }
      if (e.key === "Escape") setSearchOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const goToSearchResult = (r: SearchResult) => {
    setSearchOpen(false);
    setSearchQuery("");
    router.push(r.kind === "appointment" ? "/dashboard/appointments" : "/dashboard/team");
  };

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

  const sectionLabel = (text: string) => open ? (
    <p style={{
      color: T.sectionLabel, fontSize: 10, fontWeight: 700,
      letterSpacing: "0.1em", textTransform: "uppercase",
      margin: "10px 16px 6px", flexShrink: 0,
    }}>
      {text}
    </p>
  ) : (
    <div style={{ height: 1, background: T.border, margin: "8px 0" }} />
  );

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex" }}>

      {/* ══════════════════════════════════════
          SIDEBAR
          ══════════════════════════════════════ */}
      <aside style={{
        width: open ? 240 : 62,
        minHeight: "100vh",
        background: T.bg,
        borderRight: `1px solid ${T.border}`,
        display: "flex",
        flexDirection: "column",
        transition: "width 0.22s cubic-bezier(0.4,0,0.2,1)",
        overflow: "hidden",
        flexShrink: 0,
        position: "sticky",
        top: 0,
        height: "100vh",
      }}>

        {/* Profile header */}
        {open ? (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "17px 14px", flexShrink: 0,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: PURPLE_BG,
                border: "1px solid rgba(139,92,246,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 17, fontWeight: 800, color: PURPLE, flexShrink: 0,
              }}>
                {initial}
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{
                  color: T.text, fontSize: 14, fontWeight: 700,
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  margin: 0, letterSpacing: "-0.01em",
                }}>
                  {name}
                </p>
                <p style={{ color: T.textMuted, fontSize: 11, margin: 0, whiteSpace: "nowrap" }}>
                  Salon
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: "none", border: "none",
                color: T.textMuted, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 28, height: 28, borderRadius: 7, flexShrink: 0, padding: 0,
              }}
            >
              <ChevronLeft size={15} />
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "18px 0 14px", gap: 10, flexShrink: 0 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: PURPLE_BG,
              border: "1px solid rgba(139,92,246,0.3)",
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
        <div style={{ height: 1, background: T.border, flexShrink: 0 }} />

        {/* Nav */}
        <div style={{ flex: 1, overflowY: "auto", paddingBottom: 8, paddingTop: 8 }}>
          <SidebarNav open={open} pathname={pathname} T={T} tabs={visibleTabs} />
        </div>

        {/* Bottom: Settings + Sign out */}
        <div style={{ padding: "0 8px 20px", flexShrink: 0 }}>
          <div style={{ height: 1, background: T.border, margin: "0 4px 8px" }} />
          {role === "owner" && (
            <Link
              href="/dashboard/settings"
              title={!open ? "Settings" : undefined}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: open ? "9px 12px" : "11px", borderRadius: 10,
                background: isActive("/dashboard/settings", pathname) ? T.activePill : "transparent",
                color: isActive("/dashboard/settings", pathname) ? T.activeText : T.inactiveText,
                fontSize: 13.5, fontWeight: 400, textDecoration: "none",
                justifyContent: open ? "flex-start" : "center", marginBottom: 2,
              }}
            >
              <Settings size={16} strokeWidth={1.7} style={{ flexShrink: 0 }} />
              {open && <span>Settings</span>}
            </Link>
          )}
          <form action={logout} style={{ width: "100%" }}>
            <button type="submit" style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: open ? "10px 12px" : "11px", borderRadius: 10,
              background: "transparent", border: "none",
              color: T.textDim, fontSize: 13.5, fontWeight: 400,
              cursor: "pointer", fontFamily: "inherit", width: "100%",
              justifyContent: open ? "flex-start" : "center",
            }}>
              <LogOut size={16} strokeWidth={1.7} style={{ flexShrink: 0 }} />
              {open && <span>Sign out</span>}
            </button>
          </form>
        </div>
      </aside>

      {/* ══════════════════════════════════════
          RIGHT SIDE
          ══════════════════════════════════════ */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>

        {/* Top header */}
        <header className="dashboard-header" style={{
          flexShrink: 0,
          height: 73,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 32px",
          background: T.bg,
          borderBottom: `1px solid ${T.border}`,
          gap: 12,
        }}>
          {/* Greeting */}
          <div style={{ flexShrink: 1, minWidth: 0 }}>
            <p style={{ color: T.text, fontSize: 15, fontWeight: 700, margin: 0, letterSpacing: "-0.01em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {greeting}, {name}
            </p>
            <p className="header-greeting-sub" style={{ color: T.textMuted, fontSize: 12, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              Here&apos;s what&apos;s happening today.
            </p>
          </div>

          {/* Search */}
          <div ref={searchRef} className="header-search" style={{ flex: 1, maxWidth: 300, margin: "0 32px", position: "relative" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 9,
              background: T.searchBg,
              border: `1px solid ${T.searchBorder}`,
              borderRadius: 10, padding: "9px 14px",
            }}>
              <Search size={13} color={T.searchPlaceholder} />
              <input
                ref={searchInputRef}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => setSearchOpen(true)}
                placeholder="Search anything..."
                style={{
                  flex: 1, background: "none", border: "none", outline: "none",
                  color: T.text, fontSize: 13, padding: 0, fontFamily: "inherit",
                }}
              />
              <span style={{
                color: T.searchKbd, fontSize: 11, fontWeight: 600,
                background: T.searchKbdBg, padding: "2px 6px", borderRadius: 5,
              }}>⌘K</span>
            </div>

            {searchOpen && searchQuery.trim().length >= 2 && (
              <div style={{
                position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0,
                background: T.dropBg, border: `1px solid ${T.dropBorder}`, borderRadius: 12,
                boxShadow: dark ? "0 12px 40px rgba(0,0,0,0.55)" : "0 8px 32px rgba(0,0,0,0.12)",
                overflow: "hidden", zIndex: 200, maxHeight: 320, overflowY: "auto",
              }}>
                {searchResults.length === 0 ? (
                  <p style={{ color: T.textMuted, fontSize: 12.5, margin: 0, padding: "14px 15px" }}>No matches for &quot;{searchQuery}&quot;</p>
                ) : searchResults.map(r => (
                  <button
                    key={`${r.kind}-${r.id}`}
                    onClick={() => goToSearchResult(r)}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 15px",
                      background: "none", border: "none", cursor: "pointer", textAlign: "left",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = T.dropHover)}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    {r.kind === "appointment"
                      ? <CalendarClock size={14} color={T.iconColor} style={{ flexShrink: 0 }} />
                      : <UserRound size={14} color={T.iconColor} style={{ flexShrink: 0 }} />}
                    <div style={{ minWidth: 0 }}>
                      <p style={{ color: T.text, fontSize: 13, fontWeight: 600, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.title}</p>
                      <p style={{ color: T.textMuted, fontSize: 11.5, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.subtitle}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right icons */}
          <div className="header-icons" style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
            <div style={{ position: "relative" }}>
              <Link href="/dashboard/messages" title="Messages" style={{ ...headerIconBtn, display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
                <MessageSquare size={16} strokeWidth={1.6} color={T.iconColor} />
              </Link>
              {unreadCount > 0 && <span style={hdBadge}>{unreadCount > 9 ? "9+" : unreadCount}</span>}
            </div>
            <Link href="/dashboard/daily-brief" title="Daily Brief" className="header-icon-optional" style={{ ...headerIconBtn, display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
              <Sparkles size={16} strokeWidth={1.6} color={T.iconColor} />
            </Link>
            <div className="header-icon-optional" style={{ position: "relative" }}>
              <Link href="/dashboard/notifications" style={{ ...headerIconBtn, display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
                <Bell size={16} strokeWidth={1.6} color={T.iconColor} />
              </Link>
              <span style={hdBadge}>5</span>
            </div>

            {/* Theme + Avatar pill */}
            <div style={{
              display: "flex", alignItems: "center",
              background: T.iconBtn,
              border: `1px solid ${T.iconBtnBorder}`,
              borderRadius: 12,
              height: 38,
            }}>
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

              <div ref={dropdownRef} style={{ position: "relative" }}>
                <button
                  onClick={() => setDropdown(v => !v)}
                  style={{
                    width: 56, height: 38,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                    background: "transparent", border: "none",
                    cursor: "pointer", padding: "0 8px 0 0",
                    borderRadius: "0 12px 12px 0",
                  }}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: PURPLE,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 800, color: "white", flexShrink: 0,
                  }}>
                    {initial}
                  </div>
                  <ChevronDown
                    size={13}
                    color={T.iconColor}
                    style={{ flexShrink: 0, transform: dropdownOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}
                  />
                </button>

                {dropdownOpen && (
                  <div style={{
                    position: "absolute", top: "calc(100% + 10px)", right: 0,
                    width: 200,
                    background: T.dropBg,
                    border: `1px solid ${T.dropBorder}`,
                    borderRadius: 14,
                    boxShadow: dark ? "0 12px 40px rgba(0,0,0,0.55)" : "0 8px 32px rgba(0,0,0,0.12)",
                    overflow: "hidden",
                    zIndex: 200,
                  }}>
                    <div style={{ padding: "13px 15px 11px", borderBottom: `1px solid ${T.dropBorder}` }}>
                      <p style={{ color: T.text, fontSize: 13, fontWeight: 700, margin: "0 0 2px" }}>{name}</p>
                      <p style={{ color: T.textMuted, fontSize: 11.5, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{email}</p>
                    </div>

                    {[
                      { icon: UserIcon, label: "Profile",  href: "/dashboard/profile"  },
                      ...(role === "owner" ? [{ icon: Settings, label: "Settings", href: "/dashboard/settings" }] : []),
                    ].map(({ icon: Icon, label, href }) => (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setDropdown(false)}
                        style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 15px", color: T.dropItem, fontSize: 13, fontWeight: 500, textDecoration: "none" }}
                        onMouseEnter={e => (e.currentTarget.style.background = T.dropHover)}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >
                        <Icon size={14} strokeWidth={1.7} />
                        {label}
                      </Link>
                    ))}

                    <div style={{ height: 1, background: T.dropBorder, margin: "2px 0" }} />

                    <form action={logout}>
                      <button
                        type="submit"
                        style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 15px", width: "100%", background: "transparent", border: "none", color: "rgb(248,113,113)", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}
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
        <main className="dashboard-main" style={{ flex: 1, overflowY: "auto", padding: "28px 32px", background: T.bg, paddingBottom: 90 }}>
          {children}
        </main>
      </div>

      {/* ══════════════════════════════════════
          MOBILE BOTTOM NAV
          ══════════════════════════════════════ */}
      <nav style={{
        display: "none",
        position: "fixed", bottom: 0, left: 0, right: 0,
        height: 72,
        background: dark ? "rgb(12,12,16)" : "rgb(255,255,255)",
        borderTop: `1px solid ${T.border}`,
        zIndex: 100,
        alignItems: "flex-start",
        justifyContent: "space-around",
        paddingTop: 10,
      }}
        className="mobile-bottom-nav"
      >
        {MOBILE_TABS.map(({ icon: Icon, href, label }) => {
          const active = href === "/dashboard/more"
            ? !MOBILE_PRIMARY_HREFS.some(h => isActive(h, pathname))
            : isActive(href, pathname);
          const badge = href === "/dashboard/more" ? unreadCount : 0;
          return (
            <Link key={href} href={href} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
              textDecoration: "none", position: "relative", padding: "0 8px",
              color: active ? PURPLE : T.textMuted,
            }}>
              <div style={{ position: "relative" }}>
                <Icon size={22} strokeWidth={active ? 2.2 : 1.6} />
                {badge > 0 && (
                  <span style={{
                    position: "absolute", top: -4, right: -6,
                    minWidth: 14, height: 14, borderRadius: 7,
                    background: PURPLE, color: "white",
                    fontSize: 8, fontWeight: 800,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    padding: "0 3px",
                  }}>{badge > 9 ? "9+" : badge}</span>
                )}
              </div>
              <span style={{ fontSize: 10, fontWeight: active ? 700 : 500 }}>{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
