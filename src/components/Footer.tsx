"use client";

import Link from "next/link";
import Image from "next/image";

const BRAND_PURPLE = "#712AE2";


export default function Footer() {
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
          <Link href="/waitlist#waitlist-form" style={{
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
            align-items: center !important;
            text-align: center !important;
          }
        }
      `}</style>
    </footer>
  );
}
