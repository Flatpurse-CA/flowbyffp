"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Lock, ChevronDown } from "lucide-react";
import { RESOURCE_GROUPS } from "@/lib/seo/siteLinks";

const INK = "#342448";
const NAV_MUTED = "#5b5b5b";
const PURPLE = "#33067a";
const BORDER = "rgba(52,36,72,0.14)";

const NAV_LINKS = [
  { key: "home", label: "Home", href: "/" },
  { key: "features", label: "Features", href: "/features" },
  { key: "pricing", label: "Pricing", href: "/pricing" },
];

// v2 (homepage): warm off-white bar, links grouped beside the logo,
// "Log in" text link + solid indigo trial pill on the right.
const V2_BG = "#f8f7f4";
const V2_INK = "#1c1b22";
const V2_MUTED = "#4b4a55";
const V2_ACCENT = "#5233db";
// Intercepted by the homepage's AudienceProvider to switch to the Clients view.
const FOR_CLIENTS_HREF = "#for-clients";

export default function LandingNav({ active = "home", variant = "v1" }: { active?: string; variant?: "v1" | "v2" }) {
  const v2 = variant === "v2";
  const muted = v2 ? V2_MUTED : NAV_MUTED;
  const activeColor = v2 ? V2_INK : "#000";
  const [menuOpen, setMenuOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const pathname = usePathname();

  // Close on arrival, not on tap: unmounting the link inside its own click
  // handler can cancel the navigation on touch browsers.
  useEffect(() => {
    setMenuOpen(false);
    setResourcesOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!resourcesOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setResourcesOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [resourcesOpen]);

  return (
    <nav
      style={{
        position: "relative",
        height: 90,
        display: "flex",
        alignItems: "center",
        background: v2 ? V2_BG : "#ffffff",
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
      {/* v2: three-column grid so the menu sits at the true centre no matter
          how wide the logo and the right-hand buttons are */}
      <div
        className={v2 ? "nav-v2-grid" : undefined}
        style={{
          width: "100%",
          maxWidth: 1830,
          margin: "0 auto",
          display: v2 ? "grid" : "flex",
          gridTemplateColumns: v2 ? "1fr auto 1fr" : undefined,
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

        {renderLinks()}

        {v2 ? (
          <div className="h3-account-btn" style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 28 }}>
            <Link href="/login" className="nav-v2-login" style={{ fontSize: 16, fontWeight: 500, color: V2_MUTED, textDecoration: "none" }}>
              Log in
            </Link>
            <Link
              href="/signup"
              className="nav-v2-cta"
              style={{
                display: "inline-flex",
                alignItems: "center",
                height: 48,
                padding: "0 26px",
                borderRadius: 100,
                background: V2_ACCENT,
                color: "#fff",
                fontSize: 16,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Start your free trial
            </Link>
          </div>
        ) : (
          renderAccountButton()
        )}

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
              background: v2 ? V2_ACCENT : PURPLE,
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

      {menuOpen && renderDrawer()}
      <style>{`.nav-res-link:hover { color: ${PURPLE} !important; text-decoration: underline !important; text-underline-offset: 3px; }
.nav-v2-link:hover, .nav-v2-login:hover { color: ${V2_INK} !important; }
.nav-v2-cta { transition: background 0.15s; }
.nav-v2-cta:hover { background: #4426c4 !important; }
@media (max-width: 900px) { .nav-v2-grid { display: flex !important; } }`}</style>
    </nav>
  );

  function renderLinks() {
    return (
        <div className="h3-nav-links" style={{ display: "flex", alignItems: "center", gap: v2 ? 40 : 32 }}>
          {NAV_LINKS.map((l) => {
            const style = {
              fontSize: v2 ? 17 : 16,
              fontWeight: 500,
              color: l.key === active ? activeColor : muted,
              textDecoration: "none",
            } as const;

            const cls = v2 && l.key !== active ? "nav-v2-link" : undefined;
            return l.href.includes("#") ? (
              <a key={l.key} href={l.href} className={cls} style={style}>
                {l.label}
              </a>
            ) : (
              <Link key={l.key} href={l.href} className={cls} style={style}>
                {l.label}
              </Link>
            );
          })}
          {/* Wrapper spans the nav's full height so the pointer can travel
              from the button down into the panel without closing it. */}
          <div
            style={{ height: 90, display: "flex", alignItems: "center" }}
            onMouseEnter={() => setResourcesOpen(true)}
            onMouseLeave={() => setResourcesOpen(false)}
          >
            <button
              type="button"
              aria-expanded={resourcesOpen}
              aria-controls="nav-resources"
              onClick={() => setResourcesOpen(o => !o)}
              style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: v2 ? 17 : 16, fontWeight: 500, color: resourcesOpen ? activeColor : muted, fontFamily: "inherit" }}
            >
              Resources
              <ChevronDown size={16} style={{ transition: "transform 0.15s", transform: resourcesOpen ? "rotate(180deg)" : "none" }} />
            </button>
            {resourcesOpen && (
              <div
                id="nav-resources"
                style={{ position: "absolute", top: 90, left: 0, right: 0, zIndex: 60, background: "#fff", borderTop: `1px solid ${BORDER}`, boxShadow: "0 16px 40px rgba(17,1,41,0.12)" }}
              >
                <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px 32px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 32 }}>
                  {RESOURCE_GROUPS.map(g => (
                    <div key={g.heading}>
                      <p style={{ margin: "0 0 12px", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: PURPLE }}>{g.heading}</p>
                      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                        {g.links.map(l => (
                          <li key={l.href}>
                            <Link href={l.href} className="nav-res-link" style={{ fontSize: 15, color: INK, textDecoration: "none" }}>{l.label}</Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {v2 && (
            <a href={FOR_CLIENTS_HREF} className="nav-v2-link" style={{ fontSize: 17, fontWeight: 500, color: muted, textDecoration: "none" }}>
              For clients
            </a>
          )}
        </div>
    );
  }

  function renderAccountButton() {
    return (
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
    );
  }

  function renderDrawer() {
    return (
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
            maxHeight: "calc(100vh - 90px)",
            overflowY: "auto",
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
          {v2 && (
            <>
              <a href={FOR_CLIENTS_HREF} onClick={() => setMenuOpen(false)} style={{ display: "block", padding: "14px 4px", fontSize: 16, fontWeight: 500, color: NAV_MUTED, textDecoration: "none", borderBottom: `1px solid ${BORDER}` }}>
                For clients
              </a>
              <Link href="/login" style={{ display: "block", padding: "14px 4px", fontSize: 16, fontWeight: 500, color: NAV_MUTED, textDecoration: "none", borderBottom: `1px solid ${BORDER}` }}>
                Log in
              </Link>
            </>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px 16px", padding: "18px 4px 4px" }}>
            {RESOURCE_GROUPS.map(g => (
              <div key={g.heading}>
                <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: PURPLE }}>{g.heading}</p>
                {g.links.map(l => (
                  <Link key={l.href} href={l.href} style={{ display: "block", padding: "5px 0", fontSize: 14, color: NAV_MUTED, textDecoration: "none" }}>{l.label}</Link>
                ))}
              </div>
            ))}
          </div>
          <Link
            href="/signup"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: 16,
              padding: "13px 0",
              borderRadius: 10,
              background: v2 ? V2_ACCENT : PURPLE,
              color: "#fff",
              fontSize: 15,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            {v2 ? "Start your free trial" : "Start Free Trial"}
          </Link>
        </div>
    );
  }
}
