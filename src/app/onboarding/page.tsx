"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const easing = "cubic-bezier(0.16,1,0.3,1)";

const STEPS = [
  {
    icon: "✦",
    title: "Welcome to Flow",
    subtitle: "Your AI-powered salon operating system. Built for professionals who want to run a smarter business.",
    visual: (
      <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
        {["Booking", "AutoPilot", "Client Intel", "Payments", "AI Brief"].map((tag) => (
          <span
            key={tag}
            style={{
              background: "rgba(109,40,217,0.15)",
              border: "1px solid rgba(139,92,246,0.3)",
              color: "rgba(196,181,253,0.9)",
              borderRadius: 100,
              padding: "6px 14px",
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    ),
  },
  {
    icon: "◈",
    title: "Everything in one place",
    subtitle: "Manage appointments, clients, and revenue without switching between apps.",
    visual: (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, maxWidth: 340 }}>
        {[
          { label: "Smart Booking", desc: "24/7 online bookings that fill your chair" },
          { label: "AutoPilot", desc: "AI handles reminders, follow-ups & no-shows" },
          { label: "Client Intel", desc: "Know every client's history at a glance" },
          { label: "Daily Brief", desc: "Morning summary of your day, sent to you" },
        ].map((f) => (
          <div
            key={f.label}
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 14,
              padding: "14px 16px",
              textAlign: "left",
            }}
          >
            <p style={{ color: "rgba(250,250,250,0.95)", fontSize: 13, fontWeight: 600, margin: "0 0 4px" }}>
              {f.label}
            </p>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11.5, margin: 0, lineHeight: 1.4 }}>
              {f.desc}
            </p>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: "◉",
    title: "You're all set",
    subtitle: "Your salon workspace is ready. Head to your dashboard to explore and set up your booking page.",
    visual: (
      <div style={{ position: "relative", width: 80, height: 80, margin: "0 auto" }}>
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          <circle
            cx="40" cy="40" r="36"
            stroke="rgba(139,92,246,0.6)"
            strokeWidth="2"
            fill="rgba(109,40,217,0.12)"
          />
          <path
            d="M24 41l10 10 22-22"
            stroke="rgb(167,139,250)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
  },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const router = useRouter();
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "rgb(9,9,11)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Glow */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: 700,
          height: 400,
          background:
            "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(109,40,217,0.15) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Logo */}
      <div style={{ position: "absolute", top: 20, left: 24 }}>
        <Image src="/main logo.png" alt="Flow" width={44} height={44} style={{ objectFit: "contain" }} />
      </div>

      {/* Step dots */}
      <div style={{ display: "flex", gap: 6, marginBottom: 48, position: "relative", zIndex: 1 }}>
        {STEPS.map((_, i) => (
          <div
            key={i}
            style={{
              width: i === step ? 24 : 6,
              height: 6,
              borderRadius: 3,
              background: i === step ? "rgb(139,92,246)" : "rgba(255,255,255,0.15)",
              transition: "all 0.35s ease",
            }}
          />
        ))}
      </div>

      {/* Card */}
      <div
        key={step}
        style={{
          position: "relative",
          zIndex: 1,
          textAlign: "center",
          maxWidth: 520,
          width: "100%",
          animation: `fp-fade-up 0.45s ${easing} both`,
        }}
      >
        <div style={{ fontSize: 36, marginBottom: 24, color: "rgba(167,139,250,0.8)" }}>
          {current.icon}
        </div>

        <h1
          style={{
            color: "rgb(250,250,250)",
            fontSize: "clamp(26px, 4vw, 36px)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            margin: "0 0 14px",
            lineHeight: 1.15,
          }}
        >
          {current.title}
        </h1>

        <p
          style={{
            color: "rgba(255,255,255,0.45)",
            fontSize: 15,
            lineHeight: 1.6,
            margin: "0 0 40px",
            maxWidth: 400,
            marginInline: "auto",
          }}
        >
          {current.subtitle}
        </p>

        <div style={{ marginBottom: 48 }}>{current.visual}</div>

        {/* CTA */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
          <button
            onClick={() => (isLast ? router.push("/dashboard") : setStep((s) => s + 1))}
            style={{
              background: "rgb(109,40,217)",
              color: "white",
              border: "none",
              borderRadius: 14,
              padding: "14px 40px",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
              letterSpacing: "-0.01em",
              boxShadow: "0 0 30px 6px rgba(109,40,217,0.35)",
              transition: "box-shadow 0.2s, transform 0.15s",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {isLast ? "Open Dashboard" : "Continue"}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {!isLast && (
            <button
              onClick={() => router.push("/dashboard")}
              style={{
                background: "none",
                border: "none",
                color: "rgba(255,255,255,0.3)",
                fontSize: 13,
                cursor: "pointer",
                padding: "4px 0",
              }}
            >
              Skip for now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
