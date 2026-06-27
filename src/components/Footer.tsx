"use client";

import Link from "next/link";
import Image from "next/image";

const BRAND_PURPLE = "#712AE2";

const LINKS = [
  {
    heading: "Product",
    items: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "AutoPilot", href: "#" },
      { label: "Integrations", href: "#" },
    ],
  },
  {
    heading: "Company",
    items: [
      { label: "About", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Press", href: "#" },
    ],
  },
  {
    heading: "Help",
    items: [
      { label: "Support", href: "#" },
      { label: "Docs", href: "#" },
      { label: "Contact", href: "#" },
      { label: "System Status", href: "#" },
    ],
  },
  {
    heading: "Legal",
    items: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Cookie Policy", href: "#" },
    ],
  },
];

export default function Footer() {
  return (
    <footer style={{ background: "#060606" }}>
      {/* CTA Banner */}
      <div className="footer-cta-wrap" style={{
        position: "relative",
        backgroundImage: "url('/cta.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: BRAND_PURPLE,
        padding: "120px 40px",
        textAlign: "center",
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.18)", pointerEvents: "none", zIndex: 1 }} />

        <div style={{ position: "relative", zIndex: 2, maxWidth: 680, margin: "0 auto" }}>
          <h2 className="footer-cta-heading" style={{
            fontSize: "clamp(32px, 4.5vw, 60px)",
            fontWeight: 900,
            letterSpacing: "-0.04em",
            lineHeight: 1.06,
            color: "#fff",
            margin: "0 0 20px",
          }}>
            Stop Letting Your Client<br />Book Your Competitors
          </h2>
          <p style={{
            fontSize: 16,
            color: "rgba(255,255,255,0.7)",
            lineHeight: 1.7,
            margin: "0 auto 40px",
            maxWidth: 480,
          }}>
            Free during beta. No credit card. Auto-enrolled in 40% off forever. Edmonton-built and the door&apos;s closing.
          </p>
          <Link href="/waitlist" style={{
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
            Claim Your Beta Spot
          </Link>
        </div>
      </div>

      {/* Footer body */}
      <div className="footer-body" style={{ padding: "0 155px 0", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 40, padding: "60px 0 48px" }}>
          {/* Logo col */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Image src="/logo-white.svg" alt="FLOWBYFFP" width={100} height={34} />
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", lineHeight: 1.65, margin: 0, maxWidth: 180 }}>
              AI-powered booking for independent salons and barbershops.
            </p>
          </div>

          {/* Link columns */}
          {LINKS.map((col) => (
            <div key={col.heading}>
              <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 16px" }}>
                {col.heading}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {col.items.map((item) => (
                  <Link key={item.label} href={item.href} style={{
                    fontSize: 13.5, color: "rgba(255,255,255,0.55)",
                    textDecoration: "none",
                    transition: "color 0.15s",
                  }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                    onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom" style={{
          borderTop: "1px solid rgba(255,255,255,0.07)",
          padding: "20px 0 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", margin: 0 }}>
            © 2026 FlatPurse Flow. All rights reserved.
          </p>
          <div style={{ display: "flex", gap: 24 }}>
            {["Terms of Service", "Privacy Policy", "Cookie Policy"].map((label) => (
              <Link key={label} href="#" style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", textDecoration: "none", transition: "color 0.15s" }}
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
        .footer-cta-btn:hover { background: rgba(255,255,255,0.12) !important; border-color: #fff !important; }
        @media (max-width: 768px) {
          .footer-cta-wrap { padding: 80px 24px !important; }
          .footer-cta-heading { font-size: 30px !important; }
          .footer-body { padding: 0 20px !important; }
          .footer-body > div:first-child {
            grid-template-columns: 1fr 1fr !important;
            gap: 32px !important;
          }
          .footer-bottom {
            flex-direction: column !important;
            gap: 16px !important;
            align-items: flex-start !important;
          }
        }
      `}</style>
    </footer>
  );
}
