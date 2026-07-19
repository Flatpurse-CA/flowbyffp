"use client";

import { useState } from "react";
import { StepProgress } from "@/components/StepProgress";
import { useTheme } from "@/lib/theme-context";
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
  },
  {
    id: "pro",
    label: "Pro",
    badge: "Popular",
    price: "C$49",
    description: "Best for growing salons and studios",
    features: ["Unlimited appts", "Full AutoPilot", "Client Intelligence", "SMS + Email", "Daily Brief"],
    cta: "Continue with Pro",
  },
  {
    id: "unlimited",
    label: "Unlimited",
    badge: null,
    price: "C$274",
    description: "For large studios and multi-location shops",
    features: ["Everything in Pro+", "Multi-location", "Custom integrations", "White-glove onboard", "SLA guarantee"],
    cta: "Continue with Unlimited",
  },
  {
    id: "founders",
    label: "Founders",
    badge: "Limited",
    price: "C$29",
    description: "Pro at half price — locked in forever. 50 spots only.",
    features: ["Everything in Pro", "Price locked forever", "Founding member badge", "Early access features", "50 spots remaining"],
    cta: "Continue with Founders",
  },
];

// The selected-card treatment (gradient wash, glow, checkmark, CTA) needs real
// per-theme values, not just color swaps — a dark radial gradient designed to
// fade into a near-black page reads as a dirty smudge on a light one.
function selectedGradient(isDark: boolean, isFounders: boolean) {
  if (isFounders) {
    return isDark
      ? "radial-gradient(140% 60% at 50% 100%, rgba(161,98,7,0.6) 0%, rgba(120,53,15,0.35) 40%, rgba(9,9,11,0) 75%)"
      : "radial-gradient(140% 60% at 50% 100%, rgba(251,191,36,0.2) 0%, rgba(251,191,36,0.07) 45%, rgba(251,191,36,0) 80%)";
  }
  return isDark
    ? "radial-gradient(140% 60% at 50% 100%, rgb(109,40,217) 0%, rgb(76,29,149) 28%, rgb(30,10,60) 58%, rgba(9,9,11,0) 85%)"
    : "radial-gradient(140% 60% at 50% 100%, rgba(139,92,246,0.16) 0%, rgba(139,92,246,0.06) 45%, rgba(139,92,246,0) 80%)";
}

function CheckIcon({ active, isDark }: { active: boolean; isDark: boolean }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <circle
        cx="12" cy="12" r="10"
        fill={active ? (isDark ? "rgba(124,58,237,0.28)" : "rgb(109,40,217)") : "var(--auth-input-bg)"}
      />
      <path
        d="M8 12.5l2.5 2.5 5.5-5.5"
        stroke={active ? (isDark ? "#A78BFA" : "white") : "var(--auth-text-sub)"}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PlanForm({ error }: { error?: string }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [selected, setSelected] = useState("starter");
  const [hovered, setHovered] = useState<string | null>(null);
  const plan = PLANS.find((p) => p.id === selected)!;

  return (
    <div style={{ width: "100%", maxWidth: 960 }}>
      <StepProgress step={3} backHref="/signup/shop" title="Choose Your Plan" />

      <p
        style={{
          color: "var(--auth-text-sub)",
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
          className="signup-plan-grid"
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

            const hoverShadow = isDark
              ? (isFounders
                ? "0 0 0 1px rgba(249,115,22,0.7), 0 0 18px 4px rgba(234,88,12,0.55), 0 0 60px 10px rgba(234,88,12,0.25)"
                : "0 0 0 1px rgba(139,92,246,0.7), 0 0 18px 4px rgba(109,40,217,0.55), 0 0 60px 10px rgba(109,40,217,0.25)")
              : (isFounders
                ? "0 0 0 1px rgba(234,88,12,0.5), 0 2px 10px rgba(234,88,12,0.12)"
                : "0 0 0 1px rgba(109,40,217,0.5), 0 2px 10px rgba(109,40,217,0.12)");
            const selectedShadow = isDark
              ? (isFounders
                ? "0 0 0 1px rgba(249,115,22,0.9), 0 0 24px 6px rgba(234,88,12,0.65), 0 0 80px 16px rgba(234,88,12,0.3)"
                : "0 0 0 1px rgba(139,92,246,0.9), 0 0 24px 6px rgba(109,40,217,0.65), 0 0 80px 16px rgba(109,40,217,0.3)")
              : (isFounders
                ? "0 0 0 1.5px rgba(234,88,12,0.9), 0 4px 16px rgba(234,88,12,0.18)"
                : "0 0 0 1.5px rgba(109,40,217,0.9), 0 4px 16px rgba(109,40,217,0.18)");
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
                  background: "var(--auth-input-bg)",
                  border: isSelected ? selectedBorder : isHovered ? hoverBorder : "1px solid var(--auth-input-border)",
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
                    background: selectedGradient(isDark, isFounders),
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
                      background: isDark
                        ? (isFounders ? "rgba(234,88,12,0.5)" : "rgba(109,40,217,0.5)")
                        : (isFounders ? "rgb(234,88,12)" : "rgb(109,40,217)"),
                      border: isDark
                        ? (isFounders ? "1.5px solid rgba(249,115,22,0.8)" : "1.5px solid rgba(139,92,246,0.8)")
                        : "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                      <path d="M5 13l4 4L19 7" stroke={isDark ? (isFounders ? "#FED7AA" : "#C4B5FD") : "white"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}

                <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", flex: 1 }}>
                  {/* Badge or spacer */}
                  {p.badge ? (
                    <div
                      style={{
                        alignSelf: "flex-start",
                        background: "var(--auth-input-bg)",
                        border: "1px solid var(--auth-input-border)",
                        borderRadius: 100,
                        padding: "3px 9px",
                        fontSize: 9,
                        fontWeight: 700,
                        color: "var(--auth-text-sub)",
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
                      color: isSelected ? (isDark ? "rgba(196,181,253,0.65)" : "rgb(109,40,217)") : "var(--auth-text-sub)",
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
                        color: isSelected ? (isDark ? "rgb(237,233,254)" : "rgb(30,10,60)") : "var(--auth-text)",
                        transition: "color 0.25s",
                      }}
                    >
                      {p.price}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        color: isSelected ? (isDark ? "rgba(196,181,253,0.55)" : "rgba(30,10,60,0.65)") : "var(--auth-text-sub)",
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
                      color: isSelected ? (isDark ? "rgba(196,181,253,0.65)" : "rgba(30,10,60,0.75)") : "var(--auth-text-sub)",
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
                      background: isSelected ? (isDark ? "rgba(139,92,246,0.25)" : "rgba(109,40,217,0.2)") : "var(--auth-input-border)",
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
                          color: isSelected ? (isDark ? "rgba(224,213,255,0.82)" : "rgba(30,10,60,0.85)") : "var(--auth-text-sub)",
                          lineHeight: 1.3,
                          transition: "color 0.25s",
                        }}
                      >
                        <CheckIcon active={isSelected} isDark={isDark} /> {f}
                      </li>
                    ))}
                  </ul>

                  {/* CTA inside selected card */}
                  {isSelected && (
                    <button
                      type="submit"
                      style={{
                        width: "100%",
                        background: isDark
                          ? (isFounders ? "rgba(234,88,12,0.45)" : "rgba(109,40,217,0.45)")
                          : (isFounders ? "rgb(234,88,12)" : "rgb(109,40,217)"),
                        border: isDark
                          ? (isFounders ? "1px solid rgba(249,115,22,0.65)" : "1px solid rgba(139,92,246,0.65)")
                          : "none",
                        color: isDark ? (isFounders ? "rgb(254,215,170)" : "rgb(233,213,255)") : "white",
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
