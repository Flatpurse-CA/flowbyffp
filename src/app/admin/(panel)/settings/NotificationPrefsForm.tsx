"use client";

import { useState, useEffect } from "react";

type Prefs = { waitlist: boolean; shop: boolean; user: boolean; email_failed: boolean };

const DEFAULT_PREFS: Prefs = { waitlist: true, shop: true, user: true, email_failed: true };

const ROWS: { key: keyof Prefs; label: string; hint: string }[] = [
  { key: "waitlist",     label: "New waitlist signups",  hint: "Someone joins the beta waitlist" },
  { key: "shop",         label: "New shop registrations", hint: "A new shop signs up" },
  { key: "user",         label: "New members",            hint: "A new account is created" },
  { key: "email_failed", label: "Failed email sends",     hint: "A drip email fails to send" },
];

export function NotificationPrefsForm() {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("admin-notification-prefs");
      if (raw) setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(raw) });
    } catch {
      // ignore malformed prefs, fall back to defaults
    }
    setLoaded(true);
  }, []);

  const toggle = (key: keyof Prefs) => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    localStorage.setItem("admin-notification-prefs", JSON.stringify(next));
  };

  if (!loaded) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {ROWS.map(row => (
        <label
          key={row.key}
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 4px", cursor: "pointer",
          }}
        >
          <div>
            <p style={{ color: "rgb(240,240,248)", fontSize: 13, fontWeight: 600, margin: "0 0 2px" }}>{row.label}</p>
            <p style={{ color: "rgba(255,255,255,0.32)", fontSize: 11.5, margin: 0 }}>{row.hint}</p>
          </div>
          <input
            type="checkbox"
            checked={prefs[row.key]}
            onChange={() => toggle(row.key)}
            style={{ width: 17, height: 17, accentColor: "rgb(139,92,246)", cursor: "pointer" }}
          />
        </label>
      ))}
      <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, margin: "6px 4px 0" }}>
        Stored on this device only; controls what shows up in the notification bell.
      </p>
    </div>
  );
}
