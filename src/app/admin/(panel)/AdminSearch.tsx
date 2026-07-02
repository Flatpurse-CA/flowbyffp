"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Users, Store, ClipboardList } from "lucide-react";

type SearchResult = {
  id: string;
  type: "user" | "shop" | "waitlist";
  title: string;
  subtitle: string;
  href: string;
};

const ICON = { user: Users, shop: Store, waitlist: ClipboardList };

export function AdminSearch({
  T,
}: {
  T: {
    searchBg: string; searchBorder: string; searchPlaceholder: string;
    searchKbd: string; searchKbdBg: string;
    dropBg: string; dropBorder: string; dropItem: string; textMuted: string; dropHover: string;
  };
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    try {
      const res = await fetch(`/api/admin/search?q=${encodeURIComponent(q)}`);
      if (!res.ok) return;
      const data = await res.json();
      setResults(data.results ?? []);
    } catch {
      // silently ignore
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => search(query), 220);
    return () => clearTimeout(t);
  }, [query, search]);

  const go = (href: string) => {
    setOpen(false);
    setQuery("");
    router.push(href);
  };

  return (
    <div ref={wrapRef} style={{ position: "relative", flex: 1, maxWidth: 300 }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 9,
        background: T.searchBg,
        border: `1px solid ${T.searchBorder}`,
        borderRadius: 10, padding: "9px 14px",
      }}>
        <Search size={13} color={T.searchPlaceholder} />
        <input
          ref={inputRef}
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search users, shops, waitlist..."
          style={{
            flex: 1, background: "transparent", border: "none", outline: "none",
            color: T.dropItem, fontSize: 13, fontFamily: "inherit",
          }}
        />
        {!query && (
          <span style={{
            color: T.searchKbd, fontSize: 11, fontWeight: 600,
            background: T.searchKbdBg, padding: "2px 6px", borderRadius: 5,
          }}>⌘K</span>
        )}
      </div>

      {open && query.trim().length >= 2 && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0,
          background: T.dropBg,
          border: `1px solid ${T.dropBorder}`,
          borderRadius: 12,
          boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
          overflow: "hidden",
          zIndex: 200,
          maxHeight: 320,
          overflowY: "auto",
        }}>
          {results.length === 0 ? (
            <div style={{ padding: "18px 15px", textAlign: "center" }}>
              <p style={{ color: T.textMuted, fontSize: 12.5, margin: 0 }}>No results</p>
            </div>
          ) : (
            results.map(r => {
              const Icon = ICON[r.type];
              return (
                <button
                  key={`${r.type}-${r.id}`}
                  onClick={() => go(r.href)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10, width: "100%",
                    padding: "10px 15px", background: "transparent", border: "none",
                    cursor: "pointer", textAlign: "left", fontFamily: "inherit",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = T.dropHover)}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <Icon size={14} strokeWidth={1.8} color={T.textMuted} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      color: T.dropItem, fontSize: 12.5, fontWeight: 600, margin: "0 0 1px",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {r.title}
                    </p>
                    <p style={{ color: T.textMuted, fontSize: 11, margin: 0 }}>{r.subtitle}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
