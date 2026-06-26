"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const PURPLE = "#712AE2";
const GOLD   = "#C9913A";
const GOLD_B = "#D9A040";
const BG     = "#0D0B1E";

const BUSINESS_TYPES = [
  { label: "Hair Salon",  emoji: "✂️" },
  { label: "Barbershop",  emoji: "💈" },
  { label: "Spa",         emoji: "🧖" },
  { label: "Massage",     emoji: "💆" },
  { label: "Nail Studio", emoji: "💅" },
  { label: "Fitness",     emoji: "🏋️" },
];

const FEATURES = [
  { icon: "📋", bold: "Recover up to 30%",    rest: " of lost revenue from no-shows" },
  { icon: "🔔", bold: "Reduce no-shows by 40%", rest: " with automated SMS & email reminders" },
  { icon: "📅", bold: "Fill empty slots in minutes", rest: " with AI-powered rebooking" },
  { icon: "💳", bold: "Stripe pass-through processing", rest: " — no markup, no marketplace BS" },
];

const TOTAL = 40;
const CLAIMED = 13;

export default function Waitlist2Page() {
  const [bizType,    setBizType]    = useState<string | null>(null);
  const [email,      setEmail]      = useState("");
  const [name,       setName]       = useState("");
  const [submitted,  setSubmitted]  = useState(false);
  const [hovering,   setHovering]   = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (email.trim() && name.trim()) setSubmitted(true);
  }

  return (
    <div style={{ background: BG, color: "#fff", minHeight: "100vh", fontFamily: "var(--font-geist-sans, system-ui, sans-serif)" }}>

      {/* ── Nav ── */}
      <nav style={{ padding: "22px 48px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 10 }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <Image src="/logo-white.svg" alt="FLOWBYFFP" width={105} height={35} priority />
        </Link>
        <Link
          href="/login"
          style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.38)", textDecoration: "none", letterSpacing: "-0.01em", transition: "color 0.18s" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
          onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.38)")}
        >
          Already have an account?
        </Link>
      </nav>

      {/* ── Split ── */}
      <div className="wl2-split" style={{
        display: "grid",
        gridTemplateColumns: "1.1fr 0.9fr",
        gap: 0,
        padding: "32px 48px 96px",
        boxSizing: "border-box",
        maxWidth: 1340,
        margin: "0 auto",
        alignItems: "start",
      }}>

        {/* ── LEFT ── */}
        <div className="wl2-left" style={{ paddingRight: 72, paddingTop: 12 }}>

          {/* Pill */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(255,255,255,0.055)",
            border: "1px solid rgba(255,255,255,0.11)",
            borderRadius: 999, padding: "6px 16px", marginBottom: 36,
          }}>
            <span style={{ color: GOLD, fontSize: 10 }}>✦</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.55)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              FlatPurse Flow&nbsp;&nbsp;·&nbsp;&nbsp;Founder Beta
            </span>
          </div>

          {/* Heading */}
          <h1 style={{
            fontSize: "clamp(34px, 4.2vw, 60px)",
            fontWeight: 900, letterSpacing: "-0.045em", lineHeight: 1.06,
            margin: "0 0 28px", color: "#fff",
          }}>
            Turn No-Shows into<br />
            <em style={{ color: GOLD_B, fontStyle: "italic" }}>Revenue</em>{" "}—<br />
            Automatically.
          </h1>

          {/* Body */}
          <p style={{ fontSize: 16.5, color: "rgba(255,255,255,0.52)", lineHeight: 1.8, margin: "0 0 10px", maxWidth: 480 }}>
            Every no-show costs you <strong style={{ color: "#fff" }}>C$80–C$200</strong>. Multiply that by a
            slow week and you've lost more than your software bill. FlatPurse Flow fills empty chairs
            automatically, recovers lost revenue, and keeps your clients{" "}
            <em style={{ color: GOLD_B }}>yours</em> — no marketplace, no commission, no FX surprises.
          </p>

          {/* Tagline */}
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.28)", fontStyle: "italic", lineHeight: 1.65, margin: "0 0 48px" }}>
            Built for barbers, salons, spas, massage therapists, nail studios, and personal trainers.
          </p>

          {/* Feature list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 56 }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 9, flexShrink: 0,
                  background: "rgba(255,255,255,0.045)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 17,
                }}>
                  {f.icon}
                </div>
                <p style={{ fontSize: 14.5, color: "rgba(255,255,255,0.6)", lineHeight: 1.65, margin: "auto 0" }}>
                  <strong style={{ color: "#fff", fontWeight: 700 }}>{f.bold}</strong>{f.rest}
                </p>
              </div>
            ))}
          </div>

          {/* Builder badge */}
          <div style={{
            display: "flex", alignItems: "flex-start", gap: 14,
            background: "rgba(255,255,255,0.035)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 14, padding: "18px 20px",
            maxWidth: 430,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22,
            }}>
              🇨🇦
            </div>
            <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.55)", lineHeight: 1.75, margin: 0 }}>
              Built by <strong style={{ color: "#fff" }}>George & Maxwell in Edmonton, AB.</strong>{" "}
              Real founders. Real phone number. Real Canadian support.
            </p>
          </div>
        </div>

        {/* ── RIGHT (form card) ── */}
        <div className="wl2-right">
          <div style={{
            background: "rgba(255,255,255,0.038)",
            border: "1px solid rgba(255,255,255,0.085)",
            borderRadius: 22,
            padding: "36px 36px 32px",
            position: "sticky",
            top: 28,
            backdropFilter: "blur(12px)",
          }}>

            {/* Card label */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.13em", color: "rgba(255,255,255,0.32)", textTransform: "uppercase" }}>Founder Beta</span>
              <span style={{ width: 3, height: 3, borderRadius: "50%", background: "rgba(255,255,255,0.18)", display: "inline-block" }} />
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.13em", color: "rgba(255,255,255,0.32)", textTransform: "uppercase" }}>Free Access</span>
            </div>

            {/* Card heading */}
            <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 2px", color: "#fff" }}>
              Reserve your beta spot.
            </h2>
            <p style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.025em", margin: "0 0 14px", color: GOLD_B, fontStyle: "italic" }}>
              Get 40% off forever.
            </p>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.75, margin: "0 0 24px" }}>
              First 40 shops get <strong style={{ color: "#fff" }}>free beta access</strong> + automatic
              enrollment in <strong style={{ color: "#fff" }}>Founders 100</strong> — 40% off your
              subscription for 12 months, then 25% off as long as you stay.
            </p>

            {/* Progress bar */}
            <div style={{ marginBottom: 26 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 9 }}>
                <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.11em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>
                  Beta Spots Claimed
                </span>
                <span style={{ fontSize: 13.5, fontWeight: 800, color: "#fff", letterSpacing: "-0.025em" }}>
                  <span style={{ color: GOLD_B }}>{CLAIMED}</span> / {TOTAL}
                </span>
              </div>
              <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.07)" }}>
                <div style={{
                  height: "100%", width: `${(CLAIMED / TOTAL) * 100}%`,
                  borderRadius: 2,
                  background: `linear-gradient(to right, ${GOLD}, #E8C06A)`,
                }} />
              </div>
            </div>

            {submitted ? (
              <div style={{
                display: "flex", alignItems: "center", gap: 12,
                background: "rgba(113,42,226,0.12)",
                border: "1px solid rgba(113,42,226,0.3)",
                borderRadius: 12, padding: "20px 22px",
              }}>
                <CheckCircle2 size={20} color={PURPLE} />
                <span style={{ fontSize: 15, fontWeight: 600, color: "#fff", letterSpacing: "-0.02em" }}>
                  You&apos;re on the list. We&apos;ll be in touch soon.
                </span>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>

                {/* Business type grid */}
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: "block", fontSize: 10, fontWeight: 700, letterSpacing: "0.09em", color: "rgba(255,255,255,0.38)", textTransform: "uppercase", marginBottom: 10 }}>
                    Business Type <span style={{ color: "#E05555" }}>*</span>
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 7 }}>
                    {BUSINESS_TYPES.map((type) => {
                      const sel = bizType === type.label;
                      return (
                        <button
                          key={type.label}
                          type="button"
                          onClick={() => setBizType(type.label)}
                          style={{
                            padding: "13px 6px",
                            background: sel ? "rgba(113,42,226,0.18)" : "rgba(255,255,255,0.04)",
                            border: `1.5px solid ${sel ? PURPLE : "rgba(255,255,255,0.07)"}`,
                            borderRadius: 10, cursor: "pointer",
                            display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
                            transition: "all 0.15s ease",
                          }}
                        >
                          <span style={{ fontSize: 21 }}>{type.emoji}</span>
                          <span style={{ fontSize: 10.5, fontWeight: 600, color: sel ? "#fff" : "rgba(255,255,255,0.48)", letterSpacing: "-0.01em" }}>
                            {type.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Email */}
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: "block", fontSize: 10, fontWeight: 700, letterSpacing: "0.09em", color: "rgba(255,255,255,0.38)", textTransform: "uppercase", marginBottom: 8 }}>
                    Email <span style={{ color: "#E05555" }}>*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="jane@mybusiness.com"
                    style={{
                      width: "100%", boxSizing: "border-box",
                      padding: "13px 16px",
                      background: "rgba(255,255,255,0.05)",
                      border: "1.5px solid rgba(255,255,255,0.08)",
                      borderRadius: 10, color: "#fff", fontSize: 14,
                      outline: "none", fontFamily: "inherit",
                      transition: "border-color 0.15s ease",
                    }}
                    onFocus={e => (e.currentTarget.style.borderColor = `${PURPLE}80`)}
                    onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
                  />
                </div>

                {/* Name */}
                <div style={{ marginBottom: 22 }}>
                  <label style={{ display: "block", fontSize: 10, fontWeight: 700, letterSpacing: "0.09em", color: "rgba(255,255,255,0.38)", textTransform: "uppercase", marginBottom: 8 }}>
                    Name <span style={{ color: "#E05555" }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Jane Doe"
                    style={{
                      width: "100%", boxSizing: "border-box",
                      padding: "13px 16px",
                      background: "rgba(255,255,255,0.05)",
                      border: "1.5px solid rgba(255,255,255,0.08)",
                      borderRadius: 10, color: "#fff", fontSize: 14,
                      outline: "none", fontFamily: "inherit",
                      transition: "border-color 0.15s ease",
                    }}
                    onFocus={e => (e.currentTarget.style.borderColor = `${PURPLE}80`)}
                    onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
                  />
                </div>

                {/* CTA */}
                <button
                  type="submit"
                  onMouseEnter={() => setHovering(true)}
                  onMouseLeave={() => setHovering(false)}
                  style={{
                    width: "100%", padding: "15px 24px",
                    background: hovering ? "#C8891E" : GOLD_B,
                    color: "#0A0704",
                    fontSize: 15, fontWeight: 800, letterSpacing: "-0.025em",
                    border: "none", borderRadius: 12,
                    cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    fontFamily: "inherit",
                    transition: "background 0.18s ease",
                  }}
                >
                  ⚡ Claim My Beta Spot <ArrowRight size={16} />
                </button>

                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.28)", textAlign: "center", margin: "14px 0 0", lineHeight: 1.65 }}>
                  Free during beta. No credit card. We&apos;ll never spam you, and you can leave anytime.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>

      <style>{`
        input::placeholder { color: rgba(255,255,255,0.22); }

        @media (max-width: 880px) {
          .wl2-split {
            grid-template-columns: 1fr !important;
            padding: 24px 20px 64px !important;
          }
          .wl2-left {
            padding-right: 0 !important;
            margin-bottom: 40px;
          }
        }
      `}</style>
    </div>
  );
}
