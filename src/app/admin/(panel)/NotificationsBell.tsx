"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Bell, ClipboardList, Store, Users, XCircle } from "lucide-react";

type NotificationItem = {
  id: string;
  type: "waitlist" | "shop" | "user" | "email_failed";
  title: string;
  subtitle: string;
  createdAt: string;
  href: string;
};

type Prefs = { waitlist: boolean; shop: boolean; user: boolean; email_failed: boolean };

const DEFAULT_PREFS: Prefs = { waitlist: true, shop: true, user: true, email_failed: true };

export function readNotificationPrefs(): Prefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = localStorage.getItem("admin-notification-prefs");
    return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : DEFAULT_PREFS;
  } catch {
    return DEFAULT_PREFS;
  }
}

const ICON: Record<NotificationItem["type"], React.ComponentType<{ size?: number; strokeWidth?: number; color?: string }>> = {
  waitlist: ClipboardList,
  shop: Store,
  user: Users,
  email_failed: XCircle,
};

const ICON_COLOR: Record<NotificationItem["type"], string> = {
  waitlist: "rgb(251,191,36)",
  shop: "rgb(52,211,153)",
  user: "rgb(167,139,250)",
  email_failed: "rgb(248,113,113)",
};

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function NotificationsBell({
  headerIconBtn, badgeStyle, T,
}: {
  headerIconBtn: React.CSSProperties;
  badgeStyle: React.CSSProperties;
  T: { dropBg: string; dropBorder: string; text: string; textMuted: string; dropItem: string; dropHover: string; dim?: string };
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [lastSeen, setLastSeen] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/notifications");
      if (!res.ok) return;
      const data = await res.json();
      const prefs = readNotificationPrefs();
      setItems((data.items ?? []).filter((it: NotificationItem) => prefs[it.type]));
    } catch {
      // silently ignore — bell just shows nothing
    }
  }, []);

  useEffect(() => {
    setLastSeen(localStorage.getItem("admin-notifications-seen"));
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const unreadCount = lastSeen
    ? items.filter(it => new Date(it.createdAt).getTime() > new Date(lastSeen).getTime()).length
    : items.length;

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) {
      const now = new Date().toISOString();
      localStorage.setItem("admin-notifications-seen", now);
      setLastSeen(now);
    }
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button style={headerIconBtn} onClick={toggle}>
        <Bell size={16} strokeWidth={1.6} />
      </button>
      {unreadCount > 0 && <span style={badgeStyle}>{unreadCount > 9 ? "9+" : unreadCount}</span>}

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 10px)", right: 0,
          width: 320,
          background: T.dropBg,
          border: `1px solid ${T.dropBorder}`,
          borderRadius: 14,
          boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
          overflow: "hidden",
          zIndex: 200,
        }}>
          <div style={{ padding: "13px 15px", borderBottom: `1px solid ${T.dropBorder}` }}>
            <p style={{ color: T.text, fontSize: 13, fontWeight: 700, margin: 0 }}>Notifications</p>
          </div>
          <div style={{ maxHeight: 340, overflowY: "auto" }}>
            {items.length === 0 ? (
              <div style={{ padding: "28px 15px", textAlign: "center" }}>
                <p style={{ color: T.textMuted, fontSize: 12.5, margin: 0 }}>Nothing new</p>
              </div>
            ) : (
              items.map(it => {
                const Icon = ICON[it.type];
                return (
                  <Link
                    key={it.id}
                    href={it.href}
                    onClick={() => setOpen(false)}
                    style={{
                      display: "flex", alignItems: "flex-start", gap: 10,
                      padding: "10px 15px",
                      textDecoration: "none",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = T.dropHover)}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <Icon size={14} strokeWidth={1.8} color={ICON_COLOR[it.type]} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: T.dropItem, fontSize: 12.5, fontWeight: 600, margin: "0 0 1px" }}>{it.title}</p>
                      <p style={{
                        color: T.textMuted, fontSize: 11.5, margin: 0,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {it.subtitle}
                      </p>
                    </div>
                    <span style={{ color: T.textMuted, fontSize: 10.5, flexShrink: 0, whiteSpace: "nowrap" }}>
                      {timeAgo(it.createdAt)}
                    </span>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
