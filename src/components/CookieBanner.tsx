"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "ffp-cookie-consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  function handleAccept() {
    try { localStorage.setItem(STORAGE_KEY, "accepted"); } catch {}
    setVisible(false);
  }

  function handleReject() {
    try { localStorage.setItem(STORAGE_KEY, "rejected"); } catch {}
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: 24,
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 9999,
      width: "calc(100% - 40px)",
      maxWidth: 580,
      background: "#111",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 16,
      padding: "20px 24px",
      display: "flex",
      alignItems: "center",
      gap: 20,
      boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
    }}>
      <p style={{
        flex: 1,
        fontSize: 13.5,
        color: "rgba(255,255,255,0.55)",
        lineHeight: 1.65,
        margin: 0,
      }}>
        We use cookies to operate the site and improve your experience.{" "}
        <Link href="/privacy" style={{ color: "#712AE2", textDecoration: "none" }}>
          Privacy Policy
        </Link>
      </p>
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        <button
          onClick={handleReject}
          style={{
            padding: "9px 18px",
            fontSize: 13,
            fontWeight: 600,
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8,
            color: "rgba(255,255,255,0.6)",
            cursor: "pointer",
            fontFamily: "inherit",
            whiteSpace: "nowrap",
          }}
        >
          Reject
        </button>
        <button
          onClick={handleAccept}
          style={{
            padding: "9px 18px",
            fontSize: 13,
            fontWeight: 700,
            background: "#712AE2",
            border: "none",
            borderRadius: 8,
            color: "#fff",
            cursor: "pointer",
            fontFamily: "inherit",
            whiteSpace: "nowrap",
          }}
        >
          Accept
        </button>
      </div>
    </div>
  );
}
