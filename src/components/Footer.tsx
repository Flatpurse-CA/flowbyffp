"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

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
      <div style={{ padding: "100px 155px 80px" }}>
        <div style={{
          background: BRAND_PURPLE,
          borderRadius: 10,
          padding: "64px 72px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Subtle radial glow */}
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 20% 50%, rgba(255,255,255,0.08) 0%, transparent 60%)", pointerEvents: "none" }} />

          <h2 style={{
            fontSize: "clamp(28px, 3vw, 44px)",
            fontWeight: 800,
            letterSpacing: "-0.04em",
            lineHeight: 1.1,
            color: "#fff",
            margin: 0,
            position: "relative",
            zIndex: 1,
            maxWidth: 560,
          }}>
            Your shop on AutoPilot.<br />Start free today.
          </h2>

          <Link href="/signup" style={{
            width: 80, height: 80, borderRadius: 10,
            background: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, position: "relative", zIndex: 1,
            textDecoration: "none",
            transition: "transform 0.2s cubic-bezier(0.16,1,0.3,1), box-shadow 0.2s",
            boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
          }}>
            <ArrowRight size={28} color={BRAND_PURPLE} strokeWidth={2.5} />
          </Link>
        </div>
      </div>

      {/* Footer body */}
      <div style={{ padding: "0 155px 0", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
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
        <div style={{
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
    </footer>
  );
}
