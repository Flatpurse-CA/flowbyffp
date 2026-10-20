"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { RESOURCE_GROUPS } from "@/lib/seo/siteLinks";

const BRAND_PURPLE = "#712AE2";


// Optional overrides so a page can supply its own CTA banner copy and an
// extra links row; omitted props keep the footer exactly as before.
export type FooterCta = { heading: ReactNode; body: ReactNode; href: string; label: ReactNode; eyebrow?: string };

export default function Footer({ cta, children }: { cta?: FooterCta; children?: ReactNode } = {}) {
  return (
    <footer style={{ background: "#060606" }}>
      {/* CTA Banner */}
      <div className="footer-cta-wrap" style={{
        position: "relative",
        backgroundColor: BRAND_PURPLE,
        padding: "120px 40px",
        textAlign: "center",
        overflow: "hidden",
      }}>
        <Image src="/cta.jpg" alt="" fill priority style={{ objectFit: "cover", objectPosition: "center" }} />
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.18)", pointerEvents: "none", zIndex: 1 }} />

        <div style={{ position: "relative", zIndex: 2, maxWidth: 680, margin: "0 auto" }}>
          {cta?.eyebrow && (
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", color: "rgba(255,255,255,0.75)", margin: "0 0 16px" }}>{cta.eyebrow}</p>
          )}
          <h2 className="footer-cta-heading" style={{
            fontSize: "clamp(32px, 4.5vw, 60px)",
            fontWeight: 900,
            letterSpacing: "-0.04em",
            lineHeight: 1.06,
            color: "#fff",
            margin: "0 0 20px",
          }}>
            {cta ? cta.heading : <>Stop Letting Your Client<br />Book Your Competitors</>}
          </h2>
          <p style={{
            fontSize: 16,
            color: "rgba(255,255,255,0.7)",
            lineHeight: 1.7,
            margin: "0 auto 40px",
            maxWidth: 480,
          }}>
            {cta ? cta.body : <>Start free today. No credit card required. Auto-enrolled in 40% off for 12 months, then 25% off for life, if you&apos;re one of the first 40 shops.</>}
          </p>
          <Link href={cta?.href ?? "/signup"} style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            padding: "16px 36px",
            background: "transparent",
            border: "2px solid rgba(255,255,255,0.7)",
            color: "#fff",
            fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em",
            borderRadius: 12,
            textDecoration: "none",
            transition: "background 0.2s, border-color 0.2s",
          }}
            className="footer-cta-btn"
          >
            {cta ? cta.label : "Start Your Free Trial"}
          </Link>
        </div>
      </div>

      {/* Footer body */}
      <div className="footer-body" style={{ padding: "0 155px 0", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        {children}
        {/* Resource links: every SEO page is within two clicks of any page. */}
        <nav className="footer-resources" aria-label="Resources" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 32, padding: "40px 0" }}>
          {RESOURCE_GROUPS.map(g => (
            <div key={g.heading}>
              <p style={{ margin: "0 0 14px", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.9)" }}>{g.heading}</p>
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {g.links.map(l => (
                  <li key={l.href}>
                    <Link href={l.href} className="footer-res-link" style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        {/* Bottom bar */}
        <div className="footer-bottom" style={{
          borderTop: "1px solid rgba(255,255,255,0.07)",
          padding: "20px 0 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", margin: 0 }}>
            © 2026 FlatPurse Flow. All rights reserved.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 24px" }}>
            {[
              { label: "Terms of Service", href: "/terms" },
              { label: "Privacy Policy", href: "/privacy" },
              { label: "Cookie Policy", href: "/cookie-policy" },
              { label: "Refund Policy", href: "/refund-policy" },
            ].map(({ label, href }) => (
              <Link key={label} href={href} style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", textDecoration: "none", transition: "color 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div style={{ height: 3, background: "#712AE2" }} />

      <style>{`
        .footer-res-link:hover { color: #fff !important; }
        .footer-cta-btn:hover { background: rgba(255,255,255,0.12) !important; border-color: #fff !important; }
        @media (max-width: 768px) {
          .footer-cta-wrap { padding: 80px 24px !important; }
          .footer-cta-heading { font-size: 30px !important; }
          .footer-body { padding: 0 20px !important; }
          .footer-resources { grid-template-columns: 1fr 1fr !important; gap: 28px 20px !important; }
          .footer-body > div:first-child {
            grid-template-columns: 1fr 1fr !important;
            gap: 32px !important;
          }
          .footer-bottom {
            flex-direction: column !important;
            gap: 16px !important;
            align-items: center !important;
            text-align: center !important;
          }
        }
      `}</style>
    </footer>
  );
}
