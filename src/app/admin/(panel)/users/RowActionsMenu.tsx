"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal } from "lucide-react";

// Secondary per-user actions (trial clock, bypass, admin access, delete)
// behind one "more" button, so every row in the Users table keeps the same
// height instead of wrapping up to nine buttons. The panel is portalled and
// fixed-positioned because the table's scroll container clips overflow.
export function RowActionsMenu({ children }: { children: React.ReactNode }) {
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pos) return;
    // Opening can scroll the table to bring the button into view; ignore
    // that first scroll so it doesn't immediately close the menu.
    const openedAt = Date.now();
    const close = (e: Event) => {
      if (e.type === "scroll" && Date.now() - openedAt < 250) return;
      if (e.type === "keydown" && (e as KeyboardEvent).key !== "Escape") return;
      if (e.type === "mousedown" && (panelRef.current?.contains(e.target as Node) || btnRef.current?.contains(e.target as Node))) return;
      setPos(null);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [pos]);

  const toggle = () => {
    if (pos) return setPos(null);
    const r = btnRef.current!.getBoundingClientRect();
    // Open upward when there isn't room below (last rows of the table).
    const openUp = window.innerHeight - r.bottom < 300;
    setPos({ top: openUp ? Math.max(8, r.top - 6 - 290) : r.bottom + 6, right: window.innerWidth - r.right });
  };

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={toggle}
        title="More actions"
        aria-haspopup="menu"
        aria-expanded={!!pos}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: 28, height: 28, borderRadius: 8, cursor: "pointer",
          background: pos ? "var(--aw08)" : "var(--asurface1)", border: "1px solid var(--aw08)",
          color: "var(--aw55)", fontFamily: "inherit",
        }}
      >
        <MoreHorizontal size={14} />
      </button>
      {pos && createPortal(
        <div
          ref={panelRef}
          role="menu"
          className="admin-row-menu"
          style={{
            position: "fixed", top: pos.top, right: pos.right, zIndex: 400,
            width: 230, padding: 6, borderRadius: 12,
            background: "var(--am2)", border: "1px solid var(--aw08)",
            boxShadow: "0 12px 36px rgba(0,0,0,0.18)",
            display: "flex", flexDirection: "column", gap: 2,
          }}
        >
          {children}
        </div>,
        document.body,
      )}
    </>
  );
}
