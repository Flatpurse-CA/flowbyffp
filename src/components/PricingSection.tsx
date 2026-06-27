"use client";

import { useState, useEffect, useRef } from "react";
import AutoPilotChip from "@/components/AutoPilotChip";
import ScrollReveal from "@/components/ScrollReveal";

const BRAND_PURPLE = "#712AE2";

const PLANS = [
  {
    id: "pro",
    label: "Pro",
    badge: null,
    originalPrice: "C$59/mo",
    price: "C$35.40",
    priceSuffix: "/mo",
    subtitle: "Year 1 · then C$44.25/mo forever",
    description: "Best for solo operators and growing salons",
    features: ["Unlimited appts", "1 staff", "Booking page", "AutoPilot basic", "Tap to Pay"],
    cta: "Get started with Pro",
    href: "/signup",
    gradient: "radial-gradient(140% 60% at 50% 100%, rgb(109,40,217) 0%, rgb(76,29,149) 28%, rgb(30,10,60) 58%, rgba(9,9,11,0) 85%)",
    isFounders: false,
  },
  {
    id: "pro-plus",
    label: "Pro+",
    badge: "Most Popular",
    originalPrice: "C$149/mo",
    price: "C$89.40",
    priceSuffix: "/mo",
    subtitle: "Year 1 · then C$111.75/mo forever",
    description: "Full power for multi-staff salons and studios",
    features: ["Unlimited appts", "Full AutoPilot", "Client Intelligence", "SMS + Email", "Daily Brief"],
    cta: "Get started with Pro+",
    href: "/signup",
    gradient: "radial-gradient(140% 60% at 50% 100%, rgb(109,40,217) 0%, rgb(76,29,149) 28%, rgb(30,10,60) 58%, rgba(9,9,11,0) 85%)",
    isFounders: false,
  },
  {
    id: "enterprise",
    label: "Enterprise",
    badge: null,
    originalPrice: "C$274/mo",
    price: "C$164.40",
    priceSuffix: "/mo",
    subtitle: "Year 1 · then C$205.50/mo forever",
    description: "For large studios and multi-location shops",
    features: ["Everything in Pro+", "Multi-location", "Custom integrations", "White-glove onboard", "SLA guarantee"],
    cta: "Get started with Enterprise",
    href: "/signup",
    gradient: "radial-gradient(140% 60% at 50% 100%, rgb(109,40,217) 0%, rgb(76,29,149) 28%, rgb(30,10,60) 58%, rgba(9,9,11,0) 85%)",
    isFounders: false,
  },
  {
    id: "annual-founders",
    label: "Annual Founders",
    badge: "Best Deal",
    originalPrice: "C$1,490/yr",
    price: "C$894",
    priceSuffix: "/yr",
    subtitle: "Pro+ annual · C$74.50 effective monthly",
    description: "Pro+ at half price — locked in forever. 50 spots only.",
    features: ["Everything in Pro+", "Price locked forever", "Founding member badge", "Early access features", "50 spots remaining"],
    cta: "Claim Annual Founders Rate",
    href: "/signup",
    gradient: "radial-gradient(140% 60% at 50% 100%, rgba(161,98,7,0.6) 0%, rgba(120,53,15,0.35) 40%, rgba(9,9,11,0) 75%)",
    isFounders: true,
  },
];

function CheckIcon({ active, founders }: { active: boolean; founders: boolean }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10" fill={active ? (founders ? "rgba(234,88,12,0.28)" : "rgba(124,58,237,0.28)") : "rgba(255,255,255,0.06)"} />
      <path d="M8 12.5l2.5 2.5 5.5-5.5" stroke={active ? (founders ? "#FED7AA" : "#A78BFA") : "rgba(255,255,255,0.35)"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function PricingSection() {
  const [selected, setSelected] = useState("pro-plus");
  const [hovered, setHovered] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const cards = Array.from(grid.children) as HTMLElement[];

    cards.forEach((card, i) => {
      card.style.opacity = "0";
      card.style.transform = "translateY(60px)";
      card.style.transition = `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${i * 120}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${i * 120}ms`;
    });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          cards.forEach((card) => {
            card.style.opacity = "1";
            card.style.transform = "translateY(0px)";
          });
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );

    observer.observe(grid);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="pricing-section-outer" style={{ background: "#000", padding: "100px 155px 300px", position: "relative" }}>
      {/* Header */}
      <ScrollReveal delay={0} style={{ marginBottom: 56, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <AutoPilotChip theme="dark" words={["Simple,", "transparent", "pricing."]} />
        <h2 style={{
          fontSize: "clamp(32px, 4vw, 54px)",
          fontWeight: 800,
          letterSpacing: "-0.04em",
          lineHeight: 1.08,
          color: "#fff",
          margin: "0 0 16px",
        }}>
          Beta members are<br /><span style={{ color: BRAND_PURPLE }}>auto-enrolled.</span>
        </h2>
        <p style={{
          fontSize: 16,
          color: "rgba(255,255,255,0.45)",
          lineHeight: 1.7,
          margin: 0,
          maxWidth: 520,
        }}>
          When beta ends, every member who enters a card gets 40% off for 12 months, then 25% off forever. No code required. No fine print. Here&apos;s what that looks like:
        </p>
      </ScrollReveal>

      {/* Cards */}
      <div ref={gridRef} className="pricing-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, alignItems: "stretch" }}>
        {PLANS.map((p, idx) => {
          const isSelected = selected === p.id;
          const isHovered = hovered === p.id;

          const hoverShadow = p.isFounders
            ? "0 0 0 1px rgba(249,115,22,0.7), 0 0 18px 4px rgba(234,88,12,0.55), 0 0 60px 10px rgba(234,88,12,0.25)"
            : "0 0 0 1px rgba(139,92,246,0.7), 0 0 18px 4px rgba(109,40,217,0.55), 0 0 60px 10px rgba(109,40,217,0.25)";
          const selectedShadow = p.isFounders
            ? "0 0 0 1px rgba(249,115,22,0.9), 0 0 24px 6px rgba(234,88,12,0.65), 0 0 80px 16px rgba(234,88,12,0.3)"
            : "0 0 0 1px rgba(139,92,246,0.9), 0 0 24px 6px rgba(109,40,217,0.65), 0 0 80px 16px rgba(109,40,217,0.3)";
          const hoverBorder = p.isFounders ? "1px solid rgba(249,115,22,0.65)" : "1px solid rgba(139,92,246,0.65)";
          const selectedBorder = p.isFounders ? "1px solid rgba(249,115,22,0.9)" : "1px solid rgba(139,92,246,0.9)";

          return (
            <div
              key={p.id}
              onClick={() => setSelected(p.id)}
              onMouseEnter={() => setHovered(p.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                position: "relative",
                background: "rgba(255,255,255,0.03)",
                border: isSelected ? selectedBorder : isHovered ? hoverBorder : "1px solid rgba(255,255,255,0.08)",
                borderRadius: 0,
                padding: "22px 18px 20px",
                cursor: "pointer",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                transition: "border-color 0.2s, box-shadow 0.2s, background 0.25s",
                boxShadow: isSelected ? selectedShadow : isHovered ? hoverShadow : "none",
              }}
            >
              {/* Gradient overlay */}
              <div style={{
                position: "absolute", inset: 0,
                background: p.gradient,
                opacity: isSelected ? 1 : isHovered ? 0.75 : 0,
                transition: "opacity 0.25s",
                pointerEvents: "none",
              }} />

              {/* Selected checkmark */}
              {isSelected && (
                <div style={{
                  position: "absolute", top: 14, right: 14, zIndex: 2,
                  width: 22, height: 22, borderRadius: "50%",
                  background: p.isFounders ? "rgba(234,88,12,0.5)" : "rgba(109,40,217,0.5)",
                  border: p.isFounders ? "1.5px solid rgba(249,115,22,0.8)" : "1.5px solid rgba(139,92,246,0.8)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                    <path d="M5 13l4 4L19 7" stroke={p.isFounders ? "#FED7AA" : "#C4B5FD"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}

              <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", flex: 1 }}>
                {/* Badge or spacer */}
                {p.badge ? (
                  <div style={{
                    alignSelf: "flex-start",
                    background: "rgb(28,28,33)", border: "1px solid rgb(39,39,42)",
                    borderRadius: 100, padding: "3px 9px",
                    fontSize: 9, fontWeight: 700, color: "rgb(113,113,122)",
                    letterSpacing: "0.09em", textTransform: "uppercase" as const,
                    marginBottom: 12,
                  }}>
                    {p.badge}
                  </div>
                ) : (
                  <div style={{ height: 21, marginBottom: 12 }} />
                )}

                {/* Label */}
                <p style={{
                  fontSize: 10, fontWeight: 600, letterSpacing: "0.14em",
                  textTransform: "uppercase" as const,
                  color: isSelected ? "rgba(196,181,253,0.65)" : "rgb(113,113,122)",
                  margin: "0 0 10px", transition: "color 0.25s",
                }}>
                  {p.label}
                </p>

                {/* Price */}
                <div style={{ marginBottom: 4 }}>
                  <span style={{
                    fontSize: 11, color: "rgb(113,113,122)",
                    textDecoration: "line-through", display: "block", marginBottom: 2,
                  }}>
                    {p.originalPrice}
                  </span>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
                    <span style={{
                      fontSize: 32, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1,
                      color: isSelected ? "rgb(237,233,254)" : "rgb(250,250,250)",
                      transition: "color 0.25s",
                    }}>
                      {p.price}
                    </span>
                    <span style={{
                      fontSize: 11, color: isSelected ? "rgba(196,181,253,0.55)" : "rgb(113,113,122)",
                      transition: "color 0.25s",
                    }}>
                      {p.priceSuffix}
                    </span>
                  </div>
                  <span style={{
                    fontSize: 10.5, color: isSelected ? "rgba(196,181,253,0.55)" : "rgb(113,113,122)",
                    display: "block", marginTop: 4, transition: "color 0.25s",
                  }}>
                    {p.subtitle}
                  </span>
                </div>

                {/* Description */}
                <p style={{
                  fontSize: 11.5,
                  color: isSelected ? "rgba(196,181,253,0.65)" : "rgb(113,113,122)",
                  lineHeight: 1.55, margin: "0 0 14px", minHeight: 36,
                  transition: "color 0.25s",
                }}>
                  {p.description}
                </p>

                {/* Divider */}
                <div style={{
                  height: 1,
                  background: isSelected ? "rgba(139,92,246,0.25)" : "rgb(39,39,42)",
                  marginBottom: 13, transition: "background 0.25s",
                  flex: 1,
                }} />

                {/* CTA */}
                {isSelected && (
                  <a href={p.href} style={{
                    width: "100%",
                    background: p.isFounders ? "rgba(234,88,12,0.45)" : "rgba(109,40,217,0.45)",
                    border: p.isFounders ? "1px solid rgba(249,115,22,0.65)" : "1px solid rgba(139,92,246,0.65)",
                    color: p.isFounders ? "rgb(254,215,170)" : "rgb(233,213,255)",
                    borderRadius: 8, padding: "11px 0",
                    fontSize: 13, fontWeight: 700,
                    cursor: "pointer", letterSpacing: "0.01em",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    textDecoration: "none", boxSizing: "border-box" as const,
                  }}>
                    {p.cta}
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div style={{ textAlign: "center", marginTop: 48 }}>
        <p style={{
          fontSize: 15,
          color: "rgba(255,255,255,0.5)",
          lineHeight: 1.7,
          margin: "0 auto 28px",
          maxWidth: 480,
        }}>
          Beta members are pre-qualified. The remaining 60 Founders spots open to the public on launch day.
        </p>
        <a href="/waitlist" style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: BRAND_PURPLE,
          color: "#fff",
          fontSize: 15, fontWeight: 800, letterSpacing: "-0.02em",
          padding: "15px 32px",
          borderRadius: 12,
          textDecoration: "none",
          transition: "opacity 0.15s",
        }}
          onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
        >
          Claim your beta spot now
        </a>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .pricing-section-outer { padding: 60px 20px 80px !important; }
          .pricing-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 540px) {
          .pricing-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
