"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import {
  LayoutDashboard, CalendarDays, Users, Zap,
  LayoutGrid, Users2, Settings, Compass, ArrowRightLeft, Gift,
  LogOut, Bell, ChevronsLeft, ChevronsRight, ChevronDown,
  Sun, Moon, User as UserIcon, Search, MessageSquare, Sparkles,
  CalendarClock, UserRound, MoreHorizontal, Star, Wallet, type LucideIcon,
} from "lucide-react";
import { logout, searchDashboard, type SearchResult } from "./actions";
import type { ShopRole } from "@/lib/dashboard/shop";
import { DashboardThemeProvider, useDashboardTheme } from "./theme-context";
import "./dash.css";

const PURPLE = "rgb(139,92,246)";

type NavTab = {
  icon: LucideIcon; href: string; label: string; badge: number; ownerOnly: boolean;
  group: "main" | "business" | "account";
  subTabs?: { href: string; label: string }[];
};

// Same pages in the same order as before; the groups only add a label between them.
const NAV_TABS: NavTab[] = [
  { icon: LayoutDashboard, href: "/dashboard",              label: "Home",       badge: 0, ownerOnly: false, group: "main" },
  { icon: CalendarDays,    href: "/dashboard/appointments", label: "Bookings",   badge: 0, ownerOnly: false, group: "main",
    subTabs: [
      { href: "/dashboard/appointments",           label: "All Bookings" },
      { href: "/dashboard/appointments/active",    label: "Active Bookings" },
      { href: "/dashboard/appointments/cancelled", label: "Cancelled Bookings" },
      { href: "/dashboard/appointments/pending",   label: "Pending Bookings" },
      { href: "/dashboard/appointments/history",   label: "Booking History" },
    ],
  },
  { icon: Users,           href: "/dashboard/clients",      label: "Clients",    badge: 0, ownerOnly: false, group: "main" },
  { icon: Wallet,          href: "/dashboard/payments",     label: "Payments",   badge: 0, ownerOnly: true,  group: "main" },
  { icon: Star,            href: "/dashboard/reviews",      label: "Reviews",    badge: 0, ownerOnly: false, group: "main" },
  { icon: Users2,          href: "/dashboard/team",         label: "Team",       badge: 0, ownerOnly: true,  group: "business" },
  { icon: Zap,             href: "/dashboard/autopilot",    label: "AutoPilot",  badge: 0, ownerOnly: true,  group: "business" },
  { icon: LayoutGrid,      href: "/dashboard/operations",   label: "Operations", badge: 0, ownerOnly: true,  group: "business" },
  { icon: Compass,         href: "/dashboard/flow-coach",   label: "Flow Coach", badge: 0, ownerOnly: true,  group: "business" },
  { icon: Gift,            href: "/dashboard/referrals",    label: "Referrals",  badge: 0, ownerOnly: true,  group: "account" },
  { icon: ArrowRightLeft,  href: "/dashboard/migrate",      label: "Switch to Flow", badge: 0, ownerOnly: true, group: "account" },
  { icon: Settings,        href: "/dashboard/settings",     label: "Settings",   badge: 0, ownerOnly: true,  group: "account" },
];

const NAV_GROUPS: { key: NavTab["group"]; label: string | null }[] = [
  { key: "main", label: null },
  { key: "business", label: "Business" },
  { key: "account", label: "Account" },
];

const MOBILE_TABS = [
  { icon: LayoutDashboard, href: "/dashboard",              label: "Home" },
  { icon: Users,           href: "/dashboard/clients",      label: "Clients" },
  { icon: CalendarDays,    href: "/dashboard/appointments", label: "Bookings", circle: true },
  { icon: Zap,             href: "/dashboard/autopilot",    label: "AutoPilot" },
  { icon: MoreHorizontal,  href: "/dashboard/more",         label: "More" },
];
const MOBILE_PRIMARY_HREFS = ["/dashboard", "/dashboard/clients", "/dashboard/appointments", "/dashboard/autopilot"];

function isActive(href: string, pathname: string) {
  return href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);
}

// The Flow mark on its own (the wordmark sits beside it as text).
function FlowMark() {
  return (
    <svg width="30" height="17" viewBox="0 0 600 340" fill="none" stroke="currentColor" strokeWidth="40" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 230C20 143.333 63.3333 100 150 100H290" />
      <path d="M290 20H580C580 73.3333 550 100 490 100H290" />
      <path d="M290 20V320" />
      <path d="M20 230H290" />
      <path d="M290 230H580C580 290 550 320 490 320H290" />
    </svg>
  );
}

function SidebarNav({ open, pathname, tabs }: { open: boolean; pathname: string; tabs: NavTab[] }) {
  return (
    <nav className="fd-nav" aria-label="Dashboard">
      {NAV_GROUPS.map(group => {
        const items = tabs.filter(t => t.group === group.key);
        if (items.length === 0) return null;
        return (
          <div key={group.key}>
            {group.label && <p className="fd-nav-label">{group.label}</p>}
            {items.map(({ icon: Icon, href, label, badge, subTabs }) => {
              const active = isActive(href, pathname);
              return (
                <div key={href}>
                  <Link
                    href={href}
                    title={!open ? label : undefined}
                    aria-current={active ? "page" : undefined}
                    className={`fd-nav-item${active ? " is-active" : ""}`}
                  >
                    <Icon size={17} strokeWidth={1.8} />
                    {open && <span className="fd-nav-text">{label}</span>}
                    {open && badge > 0 && <span className="fd-count">{badge}</span>}
                  </Link>

                  {open && active && subTabs && (
                    <div className="fd-subnav">
                      {subTabs.map(sub => (
                        <Link key={sub.href} href={sub.href} className={`fd-subnav-item${pathname === sub.href ? " is-active" : ""}`}>
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}

export function DashboardShell({ initialDark, ...props }: { children: React.ReactNode; user: User; role: ShopRole; staffName: string | null; unreadCount: number; accessStatus?: "trialing" | "grace" | "inactive" | "active" | "paused"; initialDark?: boolean }) {
  return (
    <DashboardThemeProvider initialDark={initialDark}>
      <DashboardShellInner {...props} />
    </DashboardThemeProvider>
  );
}

function DashboardShellInner({ children, user, role, staffName, unreadCount, accessStatus }: { children: React.ReactNode; user: User; role: ShopRole; staffName: string | null; unreadCount: number; accessStatus?: "trialing" | "grace" | "inactive" | "active" | "paused" }) {
  const router = useRouter();
  const pathname = usePathname();
  const visibleTabs = role === "owner" ? NAV_TABS : NAV_TABS.filter(t => !t.ownerOnly);
  const [open, setOpen]             = useState(true);
  const { dark, T, toggle }         = useDashboardTheme();
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

  return (
    <div className="fd-shell">

      {/* Sidebar: brand on top, grouped nav, the signed-in user at the bottom */}
      <aside className={`fd-sidebar${open ? "" : " is-collapsed"}`}>
        <div className="fd-sidebar-top">
          <Link href="/dashboard" className="fd-brand" aria-label="FlatPurse Flow home">
            <FlowMark />
            {open && <span className="fd-brand-text"><b>FlatPurse</b> Flow</span>}
          </Link>
          <button
            type="button"
            className="fd-icon-btn fd-collapse"
            onClick={() => setOpen(v => !v)}
            aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
            title={open ? "Collapse sidebar" : "Expand sidebar"}
          >
            {open ? <ChevronsLeft size={17} /> : <ChevronsRight size={17} />}
          </button>
        </div>

        <SidebarNav open={open} pathname={pathname} tabs={visibleTabs} />

        <div className="fd-sidebar-foot">
          <Link href="/dashboard/profile" className="fd-user" title={!open ? name : undefined}>
            <span className="fd-avatar">{initial}</span>
            {open && (
              <span className="fd-user-text">
                <strong>{name}</strong>
                <small>{email}</small>
              </span>
            )}
          </Link>
          {open && (
            <form action={logout}>
              <button type="submit" className="fd-icon-btn" aria-label="Sign out" title="Sign out">
                <LogOut size={16} />
              </button>
            </form>
          )}
        </div>
      </aside>

      {/* 100dvh, not 100vh: on mobile Safari, 100vh assumes the browser chrome is
          fully collapsed, so the header renders above the actual visible viewport
          until the address bar collapses on scroll ("pull down to see it") */}
      <div className="fd-body">

        <header className="dashboard-header fd-header">
          <p className="fd-greet">{greeting}, <span>{name}</span></p>

          <div ref={searchRef} className="header-search fd-search">
            <label className="fd-search-box">
              <Search size={14} />
              <input
                ref={searchInputRef}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => setSearchOpen(true)}
                placeholder="Search anything..."
                aria-label="Search bookings and team"
              />
              <kbd>⌘K</kbd>
            </label>

            {searchOpen && searchQuery.trim().length >= 2 && (
              <div className="fd-menu is-wide">
                {searchResults.length === 0 ? (
                  <p className="fd-menu-empty">No matches for &quot;{searchQuery}&quot;</p>
                ) : searchResults.map(r => (
                  <button key={`${r.kind}-${r.id}`} type="button" className="fd-menu-item" onClick={() => goToSearchResult(r)}>
                    {r.kind === "appointment" ? <CalendarClock size={15} /> : <UserRound size={15} />}
                    <span className="fd-menu-text">
                      <b>{r.title}</b>
                      <small>{r.subtitle}</small>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="header-icons fd-header-right">
            <Link href="/dashboard/daily-brief" className="header-icon-optional fd-pill">
              <Sparkles size={15} /> Daily brief
            </Link>
            <Link href="/dashboard/messages" className="fd-icon-btn" title="Messages" aria-label="Messages">
              <MessageSquare size={17} strokeWidth={1.8} />
              {unreadCount > 0 && <span className="fd-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>}
            </Link>
            <Link href="/dashboard/notifications" className="header-icon-optional fd-icon-btn" title="Notifications" aria-label="Notifications">
              <Bell size={17} strokeWidth={1.8} />
              <span className="fd-badge">5</span>
            </Link>
            <button
              type="button"
              className="fd-icon-btn"
              onClick={toggle}
              title={dark ? "Switch to light" : "Switch to dark"}
              aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {dark ? <Sun size={17} strokeWidth={1.8} /> : <Moon size={17} strokeWidth={1.8} />}
            </button>

            <span className="fd-header-divider" />

            <div ref={dropdownRef} className="fd-profile">
              <button type="button" className="fd-profile-btn" onClick={() => setDropdown(v => !v)} aria-label="Account menu" aria-expanded={dropdownOpen}>
                <span className="fd-avatar">{initial}</span>
                <ChevronDown size={13} className={`fd-chev${dropdownOpen ? " is-open" : ""}`} />
              </button>

              {dropdownOpen && (
                <div className="fd-menu">
                  <div className="fd-menu-head">
                    <strong>{name}</strong>
                    <small>{email}</small>
                  </div>

                  {[
                    { icon: UserIcon, label: "Profile",  href: "/dashboard/profile"  },
                    ...(role === "owner" ? [{ icon: Settings, label: "Settings", href: "/dashboard/settings" }] : []),
                  ].map(({ icon: Icon, label, href }) => (
                    <Link key={href} href={href} onClick={() => setDropdown(false)} className="fd-menu-item">
                      <Icon size={15} strokeWidth={1.8} />
                      {label}
                    </Link>
                  ))}

                  <div className="fd-menu-sep" />

                  <form action={logout}>
                    <button type="submit" className="fd-menu-item is-danger">
                      <LogOut size={15} strokeWidth={1.8} />
                      Sign out
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="dashboard-main fd-main">
          {accessStatus === "grace" && (
            <div className="fd-banner">
              <p>Your trial ended and AutoPilot is paused. Add a card to pick up right where you left off.</p>
              <Link href="/dashboard/settings?tab=Billing">Add a card</Link>
            </div>
          )}
          {children}
        </main>
      </div>

      {/* ══════════════════════════════════════
          MOBILE BOTTOM NAV
          ══════════════════════════════════════ */}
      {/* Flow Coach — floating bubble hovering above the bar, mobile only */}
      <Link
        href="/dashboard/flow-coach"
        className="mobile-flow-coach-bubble"
        style={{
          display: "none",
          position: "fixed", right: 16, bottom: "calc(88px + env(safe-area-inset-bottom, 0px))", zIndex: 101,
          width: 48, height: 48, borderRadius: "50%",
          alignItems: "center", justifyContent: "center",
          background: "rgb(109,40,217)",
          boxShadow: "0 8px 20px rgba(109,40,217,0.5)",
          border: isActive("/dashboard/flow-coach", pathname) ? "2px solid white" : "none",
          textDecoration: "none",
        }}
        aria-label="Flow Coach"
      >
        <Compass size={20} color="white" strokeWidth={2.1} />
      </Link>

      <nav style={{
        display: "none",
        position: "fixed", bottom: 0, left: 0, right: 0,
        height: "calc(72px + env(safe-area-inset-bottom, 0px))",
        background: dark ? "rgb(12,12,16)" : "rgb(255,255,255)",
        borderTop: `1px solid ${T.border}`,
        zIndex: 100,
        alignItems: "flex-start",
        justifyContent: "space-around",
        paddingTop: 10,
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        overflow: "visible",
      }}
        className="mobile-bottom-nav"
      >
        {MOBILE_TABS.map(({ icon: Icon, href, label, circle }) => {
          const active = href === "/dashboard/more"
            ? !MOBILE_PRIMARY_HREFS.some(h => isActive(h, pathname))
            : isActive(href, pathname);
          const badge = href === "/dashboard/more" ? unreadCount : 0;

          if (circle) {
            return (
              <Link key={href} href={href} style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                textDecoration: "none", position: "relative", marginTop: -28,
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: "50%",
                  background: "rgb(109,40,217)",
                  border: `4px solid ${dark ? "rgb(12,12,16)" : "rgb(255,255,255)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 6px 18px rgba(109,40,217,0.45)",
                }}>
                  <Icon size={24} color="white" strokeWidth={2.2} />
                </div>
                <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, color: active ? PURPLE : T.textMuted }}>
                  {label}
                </span>
              </Link>
            );
          }

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
