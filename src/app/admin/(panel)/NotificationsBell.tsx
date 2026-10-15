"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Bell, ClipboardList, Store, Users, XCircle, ArrowRight } from "lucide-react";

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
  waitlist: "var(--aamber-text)",
  shop: "var(--agreen-text)",
  user: "var(--aviolet-text)",
  email_failed: "var(--ared-text)",
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
  headerIconBtn, badgeStyle,
}: {
  headerIconBtn: React.CSSProperties;
  badgeStyle: React.CSSProperties;
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [seenAt, setSeenAt] = useState<string | null>(null);
  // Snapshot of seenAt from before this open, so items that were unread
  // keep their dot while the dropdown is showing even though opening it
  // marks everything read.
  const [unreadSince, setUnreadSince] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/notifications");
      if (!res.ok) return;
      const data = await res.json();
      const prefs = readNotificationPrefs();
      setItems((data.items ?? []).filter((it: NotificationItem) => prefs[it.type]));
      setSeenAt(data.seenAt ?? null);
    } catch {
      // Network blip: keep showing the last known state.
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch, then poll
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

  const isUnread = (it: NotificationItem, since: string | null) =>
    !since || new Date(it.createdAt).getTime() > new Date(since).getTime();
  const unreadCount = items.filter(it => isUnread(it, seenAt)).length;

  const markSeen = async () => {
    setSeenAt(new Date().toISOString());
    try {
      const res = await fetch("/api/admin/notifications", { method: "POST" });
      if (res.ok) setSeenAt((await res.json()).seenAt);
    } catch {
      // Badge stays cleared locally; next poll reconciles with the server.
    }
  };

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) {
      setUnreadSince(seenAt);
      if (unreadCount > 0) markSeen();
    }
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        style={headerIconBtn}
        onClick={toggle}
        title="Notifications"
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={open}
      >
        <Bell size={16} strokeWidth={1.6} />
      </button>
      {unreadCount > 0 && <span style={badgeStyle}>{unreadCount > 9 ? "9+" : unreadCount}</span>}

      {open && (
        <div className="admin-header-dropdown">
          <div className="admin-header-dropdown-head">
            <p>Notifications</p>
          </div>
          <div style={{ maxHeight: 360, overflowY: "auto" }}>
            {items.length === 0 ? (
              <p className="admin-header-dropdown-empty">Nothing new</p>
            ) : (
              items.map(it => {
                const Icon = ICON[it.type];
                const unread = isUnread(it, unreadSince);
                return (
                  <Link key={it.id} href={it.href} onClick={() => setOpen(false)}
                    className={`admin-header-dropdown-item${unread ? " unread" : ""}`}>
                    <Icon size={14} strokeWidth={1.8} color={ICON_COLOR[it.type]} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className="admin-header-dropdown-title">{it.title}</p>
                      <p className="admin-header-dropdown-sub">{it.subtitle}</p>
                    </div>
                    <span className="admin-header-dropdown-time">{timeAgo(it.createdAt)}</span>
                    {unread && <span className="admin-header-dropdown-dot" style={{ marginLeft: 2 }} />}
                  </Link>
                );
              })
            )}
          </div>
          <Link href="/admin/settings" onClick={() => setOpen(false)} className="admin-header-dropdown-foot">
            Notification settings <ArrowRight size={13} />
          </Link>
        </div>
      )}
    </div>
  );
}
