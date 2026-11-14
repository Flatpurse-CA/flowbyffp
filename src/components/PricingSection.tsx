"use client";

import { useState, useEffect, useRef } from "react";
import AutoPilotChip from "@/components/AutoPilotChip";
import ScrollReveal from "@/components/ScrollReveal";

const BRAND_PURPLE = "#712AE2";

const PLANS = [
  {
    id: "starter",
    label: "Starter",
    badge: null,
    originalPrice: null,
    price: "C$39",
    priceSuffix: "/mo",
    subtitle: "Flat monthly price",
    description: "Solo businesses getting started",
    features: ["Bookings, calendar & online booking page", "Payments & Tap to Pay on iPhone", "Client CRM, reminders & reviews", "Up to 2 team members"],
    cta: "Start Free Trial",
    href: "/signup",
    gradient: "radial-gradient(140% 60% at 50% 100%, rgb(109,40,217) 0%, rgb(76,29,149) 28%, rgb(30,10,60) 58%, rgba(9,9,11,0) 85%)",
    isFounders: false,
  },
  {
    id: "pro",
    label: "Pro",
    badge: null,
    originalPrice: "C$89/mo",
    price: "C$53.40",
    priceSuffix: "/mo",
    subtitle: "Year 1 · then C$66.75/mo forever",
    description: "Run your business",
    features: ["AI Front Desk: answers clients and books appointments", "Daily Brief: morning business summary", "Client segmentation & churn-risk alerts", "Up to 6 team members"],
    cta: "Get started with Pro",
    href: "/signup",
    gradient: "radial-gradient(140% 60% at 50% 100%, rgb(109,40,217) 0%, rgb(76,29,149) 28%, rgb(30,10,60) 58%, rgba(9,9,11,0) 85%)",
    isFounders: false,
  },
  {
    id: "pro-plus",
    label: "Pro+",
    badge: "Most Popular",
    originalPrice: "C$189/mo",
    price: "C$113.40",
    priceSuffix: "/mo",
    subtitle: "Year 1 · then C$141.75/mo forever",
    description: "Grow your business",
    features: ["AutoPilot: no-show recovery, slot filler, win-backs, birthday offers", "Flow Coach™: your AI business consultant", "Business Health Score & revenue forecasting", "Unlimited team members at one location"],
    cta: "Get started with Pro+",
    href: "/signup",
    gradient: "radial-gradient(140% 60% at 50% 100%, rgb(109,40,217) 0%, rgb(76,29,149) 28%, rgb(30,10,60) 58%, rgba(9,9,11,0) 85%)",
    isFounders: false,
  },
  {
    id: "enterprise",
    label: "Enterprise",
    badge: null,
    originalPrice: null,
    price: "Custom",
    priceSuffix: "",
    subtitle: "Unlimited staff, 3+ locations",
    description: "Scale your business",
    features: ["Multi-location dashboard", "Advanced reporting & priority support", "Dedicated onboarding", "Unlimited team members"],
    cta: "Talk to Us",
    href: "mailto:sales@flatpurse.com?subject=Enterprise%20plan",
    gradient: "radial-gradient(140% 60% at 50% 100%, rgb(109,40,217) 0%, rgb(76,29,149) 28%, rgb(30,10,60) 58%, rgba(9,9,11,0) 85%)",
    isFounders: false,
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

// finePrint "cards" (home-6): the trial / founders / fee notes as cards and a
// fee table instead of two grey paragraphs. Default keeps every other page as-is.
const FINE_CARDS = [
  { t: "14-day free trial", d: "Every plan starts with Pro+ free for 14 days. Cancel any time before it ends." },
  { t: "Founders pricing, locked in", d: "Beta members are pre-qualified. Your price holds as long as your subscription stays active. Cancel and it is gone for good." },
  { t: "0% commission", d: "Flow never takes a commission on a new client." },
];
const FEES = [
  { k: "Tapped in person", v: "2.7% + 20¢" },
  { k: "Interac debit", v: "30¢ flat" },
  { k: "Online", v: "2.9% + 30¢" },
];

export default function PricingSection({ finePrint = "text" }: { finePrint?: "text" | "cards" } = {}) {
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
          The first 40 businesses to join get 40% off Pro or Pro+ for 12 months, then 25% off forever. No code required. Here&apos;s what that looks like:
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
                  {p.originalPrice ? (
                    <span style={{
                      fontSize: 11, color: "rgb(113,113,122)",
                      textDecoration: "line-through", display: "block", marginBottom: 2,
                    }}>
                      {p.originalPrice}
                    </span>
                  ) : (
                    <div style={{ height: 15, marginBottom: 2 }} />
                  )}
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
        {finePrint === "cards" ? (
          <div className="ps-fine">
            <div className="ps-fine-cards">
              {FINE_CARDS.map(c => (
                <div key={c.t} className="ps-fine-card">
                  <p className="ps-fine-t">{c.t}</p>
                  <p className="ps-fine-d">{c.d}</p>
                </div>
              ))}
            </div>
            <div className="ps-fees">
              <p className="ps-fees-label">Card processing<span>Stripe&apos;s standard rates, paid by your shop to Stripe, the same on every plan</span></p>
              <dl className="ps-fees-list">
                {FEES.map(f => (
                  <div key={f.k}><dt>{f.k}</dt><dd>{f.v}</dd></div>
                ))}
              </dl>
            </div>
            <style>{`
              .ps-fine { margin: 0 0 36px; text-align: left; }
              .ps-fine-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
              .ps-fine-card { background: #16121d; border: 1px solid #2b2438; border-radius: 16px; padding: 20px 22px; }
              .ps-fine-t { margin: 0 0 6px; font-size: 15px; font-weight: 700; color: #fff; }
              .ps-fine-d { margin: 0; font-size: 13.5px; line-height: 1.6; color: #a59cb8; }
              .ps-fees { margin-top: 14px; display: flex; align-items: center; justify-content: space-between; gap: 24px; background: #16121d; border: 1px solid #2b2438; border-radius: 16px; padding: 18px 22px; }
              .ps-fees-label { margin: 0; font-size: 15px; font-weight: 700; color: #fff; }
              .ps-fees-label span { display: block; margin-top: 4px; font-size: 12.5px; font-weight: 400; color: #a59cb8; }
              .ps-fees-list { margin: 0; display: flex; gap: 10px; flex-wrap: wrap; }
              .ps-fees-list div { background: #221b2e; border-radius: 12px; padding: 10px 16px; min-width: 128px; }
              .ps-fees-list dt { font-size: 11.5px; color: #a59cb8; margin: 0 0 3px; }
              .ps-fees-list dd { margin: 0; font-size: 16px; font-weight: 700; color: #fff; letter-spacing: -0.01em; }
              @media (max-width: 900px) {
                .ps-fine-cards { grid-template-columns: 1fr; }
                .ps-fees { flex-direction: column; align-items: flex-start; }
                .ps-fees-list div { flex: 1; min-width: 0; }
              }
            `}</style>
          </div>
        ) : (<>
        <p style={{
          fontSize: 15,
          color: "rgba(255,255,255,0.5)",
          lineHeight: 1.7,
          margin: "0 auto 28px",
          maxWidth: 480,
        }}>
          Beta members are pre-qualified. Founders pricing is locked in for as long as your subscription stays active; cancel and you lose it for good.
        </p>
        <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, margin: "-12px auto 28px", maxWidth: 560 }}>
          Every plan starts with a free 14-day trial of Pro+. Cancel any time before it ends. Card payments are Stripe&apos;s standard rates, paid by your shop to Stripe and the same on every plan: 2.7% + 20¢ tapped, 30¢ flat for Interac, 2.9% + 30¢ online. Flow never takes a commission on a new client.
        </p>
        </>)}
        <a href="/signup" style={{
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
          Start your free trial
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
