"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Lock } from "lucide-react";

const INK = "#342448";
const NAV_MUTED = "#5b5b5b";
const PURPLE = "#33067a";
const BORDER = "rgba(52,36,72,0.14)";

const NAV_LINKS = [
  { key: "home", label: "Home", href: "/" },
  { key: "features", label: "Features", href: "/features" },
  { key: "pricing", label: "Pricing", href: "/pricing" },
];

export default function LandingNav({ active = "home" }: { active?: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close on arrival, not on tap: unmounting the link inside its own click
  // handler can cancel the navigation on touch browsers.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <nav
      style={{
        position: "relative",
        height: 90,
        display: "flex",
        alignItems: "center",
        background: "#ffffff",
      }}
    >
      {/* Mirrors the hero's gutter and max-width so the logo and Account
          button line up with the hero container's edges at every width */}
      <div
        className="h3-nav-gutter"
        style={{
          width: "100%",
          padding: "0 20px",
        }}
      >
      <div
        style={{
          width: "100%",
          maxWidth: 1830,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <img src="/home3/logo-mark.svg" alt="" width={28} height={28} />
          <span style={{ fontSize: 16, fontWeight: 700, color: INK }}>
            FlatPurse<span style={{ fontWeight: 400 }}> Flow</span>
          </span>
        </Link>

        <div className="h3-nav-links" style={{ display: "flex", alignItems: "center", gap: 32 }}>
          {NAV_LINKS.map((l) => {
            const style = {
              fontSize: 16,
              fontWeight: 500,
              color: l.key === active ? "#000" : NAV_MUTED,
              textDecoration: "none",
            } as const;

            return l.href.includes("#") ? (
              <a key={l.key} href={l.href} style={style}>
                {l.label}
              </a>
            ) : (
              <Link key={l.key} href={l.href} style={style}>
                {l.label}
              </Link>
            );
          })}
        </div>

        <Link
          href="/login"
          className="h3-account-btn"
          style={{
            position: "relative",
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            background: PURPLE,
            color: "#fff",
            fontSize: 15,
            padding: "10px 20px",
            borderRadius: 100,
            textDecoration: "none",
          }}
        >
          <img
            src="/home3/btn-glow.svg"
            alt=""
            style={{
              position: "absolute",
              top: -14,
              left: "50%",
              transform: "translateX(-50%)",
              width: "148%",
              pointerEvents: "none",
            }}
          />
          <img src="/home3/lock-icon.svg" alt="" width={18} height={18} style={{ position: "relative" }} />
          <span style={{ position: "relative" }}>Account</span>
        </Link>

        {/* Mobile: padlock to sign in, plus the menu toggle */}
        <div className="h3-nav-mobile" style={{ alignItems: "center", gap: 10 }}>
          <Link
            href="/login"
            aria-label="Sign in"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 40,
              height: 40,
              borderRadius: 12,
              background: PURPLE,
              color: "#fff",
              textDecoration: "none",
            }}
          >
            <Lock size={18} />
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 40,
              height: 40,
              padding: 0,
              borderRadius: 12,
              background: "#fff",
              border: `1px solid ${BORDER}`,
              color: INK,
              cursor: "pointer",
            }}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      </div>

      {menuOpen && (
        <div
          className="h3-nav-drawer"
          style={{
            position: "absolute",
            top: 90,
            left: 0,
            right: 0,
            zIndex: 60,
            background: "#fff",
            borderTop: `1px solid ${BORDER}`,
            boxShadow: "0 12px 32px rgba(17,1,41,0.10)",
            padding: "10px 20px 18px",
            boxSizing: "border-box",
          }}
        >
          {NAV_LINKS.map((l) => {
            const style = {
              display: "block",
              padding: "14px 4px",
              fontSize: 16,
              fontWeight: 500,
              color: l.key === active ? "#000" : NAV_MUTED,
              textDecoration: "none",
              borderBottom: `1px solid ${BORDER}`,
            } as const;

            // A same-page hash never changes the pathname, so it closes itself
            return l.href.includes("#") ? (
              <a key={l.key} href={l.href} onClick={() => setMenuOpen(false)} style={style}>
                {l.label}
              </a>
            ) : (
              <Link key={l.key} href={l.href} style={style}>
                {l.label}
              </Link>
            );
          })}
          <Link
            href="/signup"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: 16,
              padding: "13px 0",
              borderRadius: 10,
              background: PURPLE,
              color: "#fff",
              fontSize: 15,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Start Free Trial
          </Link>
        </div>
      )}
    </nav>
  );
}
