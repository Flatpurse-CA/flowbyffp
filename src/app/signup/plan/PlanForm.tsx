"use client";

import { useState } from "react";
import { StepProgress } from "@/components/StepProgress";
import { choosePlan } from "./actions";

const easing = "cubic-bezier(0.16, 1, 0.3, 1)";

const PLANS = [
  {
    id: "starter",
    label: "Starter",
    badge: null,
    price: "$0",
    description: "Ideal for solo operators and small salons",
    features: ["50 appts/mo", "1 staff", "Booking page", "AutoPilot basic", "Tap to Pay"],
    cta: "Start for Free",
    gradient:
      "radial-gradient(140% 60% at 50% 100%, rgb(109,40,217) 0%, rgb(76,29,149) 28%, rgb(30,10,60) 58%, rgba(9,9,11,0) 85%)",
  },
  {
    id: "pro",
    label: "Pro",
    badge: "Popular",
    price: "C$49",
    description: "Best for growing salons and studios",
    features: ["Unlimited appts", "Full AutoPilot", "Client Intelligence", "SMS + Email", "Daily Brief"],
    cta: "Continue with Pro",
    gradient:
      "radial-gradient(140% 60% at 50% 100%, rgb(109,40,217) 0%, rgb(76,29,149) 28%, rgb(30,10,60) 58%, rgba(9,9,11,0) 85%)",
  },
  {
    id: "unlimited",
    label: "Unlimited",
    badge: null,
    price: "C$274",
    description: "For large studios and multi-location shops",
    features: ["Everything in Pro+", "Multi-location", "Custom integrations", "White-glove onboard", "SLA guarantee"],
    cta: "Continue with Unlimited",
    gradient:
      "radial-gradient(140% 60% at 50% 100%, rgb(109,40,217) 0%, rgb(76,29,149) 28%, rgb(30,10,60) 58%, rgba(9,9,11,0) 85%)",
  },
  {
    id: "founders",
    label: "Founders",
    badge: "Limited",
    price: "C$29",
    description: "Pro at half price — locked in forever. 50 spots only.",
    features: ["Everything in Pro", "Price locked forever", "Founding member badge", "Early access features", "50 spots remaining"],
    cta: "Continue with Founders",
    gradient:
      "radial-gradient(140% 60% at 50% 100%, rgba(161,98,7,0.6) 0%, rgba(120,53,15,0.35) 40%, rgba(9,9,11,0) 75%)",
  },
];

function CheckIcon({ active }: { active: boolean }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <circle
        cx="12" cy="12" r="10"
        fill={active ? "rgba(124,58,237,0.28)" : "rgba(255,255,255,0.06)"}
      />
      <path
        d="M8 12.5l2.5 2.5 5.5-5.5"
        stroke={active ? "#A78BFA" : "rgba(255,255,255,0.35)"}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PlanForm({ error }: { error?: string }) {
  const [selected, setSelected] = useState("starter");
  const [hovered, setHovered] = useState<string | null>(null);
  const plan = PLANS.find((p) => p.id === selected)!;

  return (
    <div style={{ width: "100%", maxWidth: 960 }}>
      <StepProgress step={3} backHref="/signup/shop" title="Choose Your Plan" />

      <p
        style={{
          color: "rgb(113,113,122)",
          fontSize: 14,
          marginBottom: 32,
          lineHeight: 1.6,
          marginTop: 8,
          animation: `0.5s ${easing} 60ms 1 normal both running fp-fade-up`,
        }}
      >
        Start free and upgrade anytime.
      </p>

      {error && (
        <p style={{ background: "rgb(70,10,10)", color: "rgb(252,165,165)", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 20 }}>
          {error}
        </p>
      )}

      <form action={choosePlan}>
        <input type="hidden" name="plan" value={selected} />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr",
            gap: 12,
            marginBottom: 14,
            alignItems: "stretch",
          }}
        >
          {PLANS.map((p, idx) => {
            const isSelected = selected === p.id;
            const isHovered = hovered === p.id;
            const isFounders = p.id === "founders";
            const delay = 80 + idx * 70;

            const hoverShadow = isFounders
              ? "0 0 0 1px rgba(249,115,22,0.7), 0 0 18px 4px rgba(234,88,12,0.55), 0 0 60px 10px rgba(234,88,12,0.25)"
              : "0 0 0 1px rgba(139,92,246,0.7), 0 0 18px 4px rgba(109,40,217,0.55), 0 0 60px 10px rgba(109,40,217,0.25)";
            const selectedShadow = isFounders
              ? "0 0 0 1px rgba(249,115,22,0.9), 0 0 24px 6px rgba(234,88,12,0.65), 0 0 80px 16px rgba(234,88,12,0.3)"
              : "0 0 0 1px rgba(139,92,246,0.9), 0 0 24px 6px rgba(109,40,217,0.65), 0 0 80px 16px rgba(109,40,217,0.3)";
            const hoverBorder = isFounders
              ? "1px solid rgba(249,115,22,0.65)"
              : "1px solid rgba(139,92,246,0.65)";
            const selectedBorder = isFounders
              ? "1px solid rgba(249,115,22,0.9)"
              : "1px solid rgba(139,92,246,0.9)";

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
                  animation: `0.5s ${easing} ${delay}ms 1 normal both running fp-fade-up`,
                }}
              >
                {/* Gradient overlay */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: p.gradient,
                    opacity: isSelected ? 1 : isHovered ? 0.75 : 0,
                    transition: "opacity 0.25s",
                    pointerEvents: "none",
                  }}
                />

                {/* Selected checkmark */}
                {isSelected && (
                  <div
                    style={{
                      position: "absolute",
                      top: 14,
                      right: 14,
                      zIndex: 2,
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: isFounders ? "rgba(234,88,12,0.5)" : "rgba(109,40,217,0.5)",
                      border: isFounders ? "1.5px solid rgba(249,115,22,0.8)" : "1.5px solid rgba(139,92,246,0.8)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                      <path d="M5 13l4 4L19 7" stroke={isFounders ? "#FED7AA" : "#C4B5FD"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}

                <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", flex: 1 }}>
                  {/* Badge or spacer */}
                  {p.badge ? (
                    <div
                      style={{
                        alignSelf: "flex-start",
                        background: "rgb(28,28,33)",
                        border: "1px solid rgb(39,39,42)",
                        borderRadius: 100,
                        padding: "3px 9px",
                        fontSize: 9,
                        fontWeight: 700,
                        color: "rgb(113,113,122)",
                        letterSpacing: "0.09em",
                        textTransform: "uppercase",
                        marginBottom: 12,
                      }}
                    >
                      {p.badge}
                    </div>
                  ) : (
                    <div style={{ height: 21, marginBottom: 12 }} />
                  )}

                  {/* Label */}
                  <p
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: isSelected ? "rgba(196,181,253,0.65)" : "rgb(113,113,122)",
                      margin: "0 0 10px",
                      transition: "color 0.25s",
                    }}
                  >
                    {p.label}
                  </p>

                  {/* Price */}
                  <div style={{ marginBottom: 8 }}>
                    <span
                      style={{
                        fontSize: 32,
                        fontWeight: 800,
                        letterSpacing: "-0.04em",
                        lineHeight: 1,
                        color: isSelected ? "rgb(237,233,254)" : "rgb(250,250,250)",
                        transition: "color 0.25s",
                      }}
                    >
                      {p.price}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        color: isSelected ? "rgba(196,181,253,0.55)" : "rgb(113,113,122)",
                        marginLeft: 3,
                        transition: "color 0.25s",
                      }}
                    >
                      /month
                    </span>
                  </div>

                  {/* Description */}
                  <p
                    style={{
                      fontSize: 11.5,
                      color: isSelected ? "rgba(196,181,253,0.65)" : "rgb(113,113,122)",
                      lineHeight: 1.55,
                      margin: "0 0 14px",
                      minHeight: 36,
                      transition: "color 0.25s",
                    }}
                  >
                    {p.description}
                  </p>

                  {/* Divider */}
                  <div
                    style={{
                      height: 1,
                      background: isSelected ? "rgba(139,92,246,0.25)" : "rgb(39,39,42)",
                      marginBottom: 13,
                      transition: "background 0.25s",
                    }}
                  />

                  {/* Features */}
                  <ul style={{ listStyle: "none", padding: 0, margin: "0 0 18px", display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                    {p.features.map((f) => (
                      <li
                        key={f}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 7,
                          fontSize: 11.5,
                          color: isSelected ? "rgba(224,213,255,0.82)" : "rgb(113,113,122)",
                          lineHeight: 1.3,
                          transition: "color 0.25s",
                        }}
                      >
                        <CheckIcon active={isSelected} /> {f}
                      </li>
                    ))}
                  </ul>

                  {/* CTA inside selected card */}
                  {isSelected && (
                    <button
                      type="submit"
                      style={{
                        width: "100%",
                        background: isFounders ? "rgba(234,88,12,0.45)" : "rgba(109,40,217,0.45)",
                        border: isFounders ? "1px solid rgba(249,115,22,0.65)" : "1px solid rgba(139,92,246,0.65)",
                        color: isFounders ? "rgb(254,215,170)" : "rgb(233,213,255)",
                        borderRadius: 8,
                        padding: "11px 0",
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: "pointer",
                        letterSpacing: "0.01em",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                      }}
                    >
                      {plan.cta}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </form>
    </div>
  );
}
