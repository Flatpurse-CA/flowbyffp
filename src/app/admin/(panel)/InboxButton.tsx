"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MessageSquare, ArrowRight } from "lucide-react";

type InboxItem = { id: string; name: string; business: string; createdAt: string };

function timeAgo(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

// Header inbox for demo requests. Unlike the notifications bell, the badge is
// a work queue: it counts requests still marked "new" and only clears as they
// are moved to contacted/booked/closed on the Demo Requests page.
export function InboxButton({ headerIconBtn, badgeStyle }: { headerIconBtn: React.CSSProperties; badgeStyle: React.CSSProperties }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<InboxItem[]>([]);
  const [newCount, setNewCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/inbox");
      if (!res.ok) return;
      const data = await res.json();
      setItems(data.items ?? []);
      setNewCount(data.newCount ?? 0);
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

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        style={headerIconBtn}
        onClick={() => { setOpen(o => !o); if (!open) load(); }}
        title="Demo requests"
        aria-label={`Demo requests${newCount ? `, ${newCount} new` : ""}`}
        aria-expanded={open}
      >
        <MessageSquare size={16} strokeWidth={1.6} />
      </button>
      {newCount > 0 && <span style={badgeStyle}>{newCount > 9 ? "9+" : newCount}</span>}

      {open && (
        <div className="admin-header-dropdown">
          <div className="admin-header-dropdown-head">
            <p>Demo requests</p>
            {newCount > 0 && <span className="admin-header-dropdown-count">{newCount} new</span>}
          </div>
          <div style={{ maxHeight: 340, overflowY: "auto" }}>
            {items.length === 0 ? (
              <p className="admin-header-dropdown-empty">No new demo requests</p>
            ) : (
              items.map(it => (
                <Link key={it.id} href="/admin/demo-requests?status=new" onClick={() => setOpen(false)} className="admin-header-dropdown-item">
                  <span className="admin-header-dropdown-dot" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="admin-header-dropdown-title">{it.name}</p>
                    <p className="admin-header-dropdown-sub">{it.business}</p>
                  </div>
                  <span className="admin-header-dropdown-time">{timeAgo(it.createdAt)}</span>
                </Link>
              ))
            )}
          </div>
          <Link href="/admin/demo-requests" onClick={() => setOpen(false)} className="admin-header-dropdown-foot">
            View all demo requests <ArrowRight size={13} />
          </Link>
        </div>
      )}
    </div>
  );
}
