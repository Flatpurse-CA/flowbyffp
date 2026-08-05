"use client";

import { useState } from "react";
import { StepProgress } from "@/components/StepProgress";
import { SubmitButton } from "@/components/SubmitButton";
import { useTheme } from "@/lib/theme-context";
import { PLANS as REAL_PLANS } from "@/lib/plans";
import { choosePlan } from "./actions";

const easing = "cubic-bezier(0.16, 1, 0.3, 1)";

const PLANS = REAL_PLANS.map(p => ({
  id: p.key,
  label: p.label,
  badge: p.badge ?? null,
  price: p.monthlyPrice === null ? "Custom" : p.monthlyPrice === 0 ? "$0" : `C$${p.monthlyPrice}`,
  priceSuffix: p.monthlyPrice === null ? "" : "/month",
  description: p.perfectFor,
  features: p.features.slice(0, 5),
  cta: p.key === "enterprise" ? "Continue with Enterprise" : `Continue with ${p.label}`,
}));

// The selected-card treatment (fill, glow, checkmark, CTA) needs real per-theme
// values, not just color swaps — a saturated purple designed to sit on a
// near-black page reads as a dirty smudge on a light one.
function selectedFill(isDark: boolean) {
  return isDark ? "rgb(45,20,102)" : "rgba(139,92,246,0.1)";
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

export function PlanForm({ error, foundersSpotsRemaining }: { error?: string; foundersSpotsRemaining: number }) {
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
          marginBottom: foundersSpotsRemaining > 0 ? 16 : 32,
          lineHeight: 1.6,
          marginTop: 8,
          animation: `0.5s ${easing} 60ms 1 normal both running fp-fade-up`,
        }}
      >
        Start free and upgrade anytime.
      </p>

      {foundersSpotsRemaining > 0 && (
        <div
          style={{
            background: "rgba(251,191,36,0.08)",
            border: "1px solid rgba(251,191,36,0.25)",
            borderRadius: 8,
            padding: "12px 16px",
            marginBottom: 24,
            animation: `0.5s ${easing} 40ms 1 normal both running fp-fade-up`,
          }}
        >
          <p style={{ color: "rgb(217,161,10)", fontSize: 13, fontWeight: 700, margin: "0 0 2px" }}>
            Founders Beta — {foundersSpotsRemaining} spot{foundersSpotsRemaining === 1 ? "" : "s"} left
          </p>
          <p style={{ color: "var(--auth-text-sub)", fontSize: 12.5, margin: 0, lineHeight: 1.5 }}>
            Pick Pro or Pro+ and get 40% off your first 12 months, then 25% off forever — applied automatically when you set up billing.
          </p>
        </div>
      )}

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
            const delay = 80 + idx * 70;

            const hoverShadow = isDark
              ? "0 0 0 1px rgba(139,92,246,0.7), 0 0 18px 4px rgba(109,40,217,0.55), 0 0 60px 10px rgba(109,40,217,0.25)"
              : "0 0 0 1px rgba(109,40,217,0.5), 0 2px 10px rgba(109,40,217,0.12)";
            const selectedShadow = isDark
              ? "0 0 0 1px rgba(139,92,246,0.9), 0 0 24px 6px rgba(109,40,217,0.65), 0 0 80px 16px rgba(109,40,217,0.3)"
              : "0 0 0 1.5px rgba(109,40,217,0.9), 0 4px 16px rgba(109,40,217,0.18)";
            const hoverBorder = "1px solid rgba(139,92,246,0.65)";
            const selectedBorder = "1px solid rgba(139,92,246,0.9)";

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
                {/* Selected/hover fill overlay */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: selectedFill(isDark),
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
                      background: isDark ? "rgba(109,40,217,0.5)" : "rgb(109,40,217)",
                      border: isDark ? "1.5px solid rgba(139,92,246,0.8)" : "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                      <path d="M5 13l4 4L19 7" stroke={isDark ? "#C4B5FD" : "white"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
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
                    {p.priceSuffix && (
                      <span
                        style={{
                          fontSize: 11,
                          color: isSelected ? (isDark ? "rgba(196,181,253,0.55)" : "rgba(30,10,60,0.65)") : "var(--auth-text-sub)",
                          marginLeft: 3,
                          transition: "color 0.25s",
                        }}
                      >
                        {p.priceSuffix}
                      </span>
                    )}
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
                    <SubmitButton
                      pendingText="Saving…"
                      style={{
                        width: "100%",
                        background: isDark ? "rgba(109,40,217,0.45)" : "rgb(109,40,217)",
                        border: isDark ? "1px solid rgba(139,92,246,0.65)" : "none",
                        color: isDark ? "rgb(233,213,255)" : "white",
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
                    </SubmitButton>
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
