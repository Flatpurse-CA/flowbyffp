"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteWaitlistEntry, bulkDeleteWaitlistEntries } from "./actions";

export type WaitlistEntry = {
  id: string;
  name: string | null;
  email: string;
  shop_type: string | null;
  created_at: string;
};

export function WaitlistTable({ entries }: { entries: WaitlistEntry[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();

  const allSelected = entries.length > 0 && selected.size === entries.length;
  const someSelected = selected.size > 0;

  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(entries.map(e => e.id)));
  };

  const toggle = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const handleBulkDelete = () => {
    startTransition(async () => {
      await bulkDeleteWaitlistEntries(Array.from(selected));
      setSelected(new Set());
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const fd = new FormData();
      fd.append("id", id);
      await deleteWaitlistEntry(fd);
    });
  };

  return (
    <div style={{ background: "rgb(10,10,12)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 16, overflow: "hidden" }}>
      {/* Bulk action bar */}
      {someSelected && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 20px",
          background: "rgba(234,88,12,0.07)",
          borderBottom: "1px solid rgba(234,88,12,0.15)",
        }}>
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>
            <strong style={{ color: "rgb(251,146,60)" }}>{selected.size}</strong> {selected.size === 1 ? "entry" : "entries"} selected
          </span>
          <button
            onClick={handleBulkDelete}
            disabled={pending}
            style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "6px 14px", borderRadius: 8, cursor: pending ? "not-allowed" : "pointer",
              background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)",
              color: "rgb(248,113,113)", fontSize: 12.5, fontWeight: 600, fontFamily: "inherit",
              opacity: pending ? 0.6 : 1,
            }}
          >
            <Trash2 size={13} />
            {pending ? "Deleting…" : `Delete ${selected.size} selected`}
          </button>
        </div>
      )}

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "rgba(255,255,255,0.02)" }}>
            {/* Select all */}
            <th style={{ padding: "12px 16px 12px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", width: 20 }}>
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
                style={{ width: 15, height: 15, accentColor: "rgb(234,88,12)", cursor: "pointer" }}
              />
            </th>
            {["Name", "Email", "Shop Type", "Joined", ""].map((h, i) => (
              <th key={i} style={{
                padding: "12px 20px 12px 0", textAlign: "left",
                color: "rgba(255,255,255,0.25)", fontSize: 11,
                fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                whiteSpace: "nowrap",
              }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, i) => {
            const isSelected = selected.has(entry.id);
            const displayName = entry.name ?? entry.email.split("@")[0];
            const initials    = displayName.slice(0, 2).toUpperCase();
            const date        = new Date(entry.created_at).toLocaleDateString("en-CA", {
              month: "short", day: "numeric", year: "numeric",
            });

            return (
              <tr
                key={entry.id}
                style={{
                  borderBottom: i < entries.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                  background: isSelected ? "rgba(234,88,12,0.04)" : "transparent",
                  transition: "background 0.1s",
                }}
              >
                {/* Checkbox */}
                <td style={{ padding: "14px 16px 14px 20px" }}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggle(entry.id)}
                    style={{ width: 15, height: 15, accentColor: "rgb(234,88,12)", cursor: "pointer" }}
                  />
                </td>

                {/* Name */}
                <td style={{ padding: "14px 20px 14px 0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                      background: `hsl(${(i * 61 + 180) % 360}, 30%, 20%)`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.7)",
                    }}>
                      {initials}
                    </div>
                    <span style={{ color: "rgb(240,240,248)", fontSize: 13.5, fontWeight: 600 }}>
                      {entry.name ?? (
                        <span style={{ color: "rgba(255,255,255,0.25)", fontWeight: 400, fontStyle: "italic" }}>no name</span>
                      )}
                    </span>
                  </div>
                </td>

                {/* Email */}
                <td style={{ padding: "14px 20px 14px 0", color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
                  {entry.email}
                </td>

                {/* Shop type */}
                <td style={{ padding: "14px 20px 14px 0" }}>
                  {entry.shop_type ? (
                    <span style={{
                      fontSize: 11.5, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
                      background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.55)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}>
                      {entry.shop_type}
                    </span>
                  ) : (
                    <span style={{ color: "rgba(255,255,255,0.18)", fontSize: 13 }}>-</span>
                  )}
                </td>

                {/* Date */}
                <td style={{ padding: "14px 20px 14px 0", color: "rgba(255,255,255,0.32)", fontSize: 12.5, whiteSpace: "nowrap" }}>
                  {date}
                </td>

                {/* Delete */}
                <td style={{ padding: "14px 20px 14px 0" }}>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    disabled={pending}
                    title="Remove"
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center",
                      width: 30, height: 30, borderRadius: 8, cursor: pending ? "not-allowed" : "pointer",
                      background: "transparent", border: "1px solid rgba(255,255,255,0.07)",
                      color: "rgba(255,255,255,0.25)", fontFamily: "inherit",
                      opacity: pending ? 0.5 : 1,
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
