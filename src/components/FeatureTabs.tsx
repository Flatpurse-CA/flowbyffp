"use client";

import { useState } from "react";

const BRAND_PURPLE = "#712AE2";
const TAB_DURATION = 5;

const FEATURES = [
  {
    id: "booking",
    title: "01 — Smart Booking System",
    description:
      "Give your shop a live booking page clients can use 24/7. They pick a service, choose a barber, pay a deposit, and you get notified — no back and forth, no missed bookings.",
    image: "/features1.png",
  },
  {
    id: "noshows",
    title: "02 — No-Show Recovery",
    description:
      "When a client cancels or ghosts, AutoPilot immediately fills that slot from your waitlist and sends a payment link, recovering revenue you would have lost.",
    image: "/Features2.png",
  },
  {
    id: "frontdesk",
    title: "03 — AI Front Desk",
    description:
      "AutoPilot answers client DMs, books appointments, and handles questions around the clock. It only escalates to you when it genuinely needs a human decision.",
    image: "/feature3.png",
  },
  {
    id: "winback",
    title: "04 — Win-Back Automation",
    description:
      "Clients who haven't visited in 30 days get a personalised message automatically. No manual chasing, no forgotten regulars, just returning clients.",
    image: "/Features4.png",
  },
  {
    id: "rebooking",
    title: "05 — Rebooking Reminders",
    description:
      "AutoPilot tracks each client's visit rhythm and nudges them to rebook at exactly the right time, keeping your calendar consistently full without you lifting a finger.",
    image: "/Features5.png",
  },
  {
    id: "payments",
    title: "06 — Payments and Zero Commission",
    description:
      "Collect deposits, tips, and full payments in-app. You keep every dollar you earn — FlatPurse Flow never takes a cut of your revenue.",
    image: "/features6.png",
  },
];


export default function FeatureTabs() {
  const [activeIndex, setActiveIndex] = useState(0);
  const feature = FEATURES[activeIndex];

  const handleNext = () => setActiveIndex((i) => (i + 1) % FEATURES.length);

  return (
    <>
      <style>{`
        @keyframes fillBar {
          from { height: 0% }
          to   { height: 100% }
        }
        @keyframes tabSlideIn {
          from { transform: translateX(-12px); opacity: 0; }
          to   { transform: translateX(0);     opacity: 1; }
        }
        @keyframes tabFadeUp {
          from { transform: translateY(8px); opacity: 0; }
          to   { transform: translateY(0);   opacity: 1; }
        }
      `}</style>

      <div style={{ marginTop: 80, width: "100%", textAlign: "left" }}>
        <div style={{
          background: "#fff",
          borderRadius: 12,
          willChange: "transform, opacity",
          border: "1px solid rgba(113,42,226,0.08)",
          padding: "48px 48px",
          boxShadow: "0 4px 40px rgba(113,42,226,0.06)",
        }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 80,
          alignItems: "center",
        }}>

          {/* Left — heading + tab list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            <h2 style={{
              fontSize: "clamp(20px, 2.2vw, 30px)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.15,
              color: "#0a0a0a",
              margin: "0 0 32px",
            }}>
              The tools running your shop<br />
              <span style={{ color: BRAND_PURPLE }}>while you run your craft.</span>
            </h2>
            {FEATURES.map((f, i) => {
              const isActive = i === activeIndex;
              return (
                <button
                  key={f.id}
                  onClick={() => setActiveIndex(i)}
                  style={{
                    all: "unset",
                    display: "flex",
                    gap: 20,
                    cursor: "pointer",
                    padding: "20px 0",
                    minHeight: 88,
                    boxSizing: "border-box",
                    position: "relative",
                  }}
                >
                  {/* Vertical bar */}
                  <div style={{
                    width: 2,
                    flexShrink: 0,
                    background: "rgba(10,10,10,0.08)",
                    position: "relative",
                    borderRadius: 2,
                    alignSelf: "stretch",
                  }}>
                    {isActive && (
                      <div
                        key={activeIndex}
                        onAnimationEnd={handleNext}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "0%",
                          background: BRAND_PURPLE,
                          borderRadius: 2,
                          animation: `fillBar ${TAB_DURATION}s linear forwards`,
                        }}
                      />
                    )}
                  </div>

                  {/* Text */}
                  <div style={{ flex: 1 }}>
                    <p
                      key={isActive ? `title-${activeIndex}` : f.id}
                      style={{
                        fontSize: 15,
                        fontWeight: isActive ? 700 : 400,
                        color: isActive ? BRAND_PURPLE : "rgba(10,10,10,0.6)",
                        letterSpacing: isActive ? "-0.025em" : "-0.02em",
                        margin: "0 0 6px",
                        transition: "color 0.2s ease, letter-spacing 0.3s ease",
                        animation: isActive ? "tabSlideIn 0.7s cubic-bezier(0.16,1,0.3,1) both" : "none",
                      }}
                    >
                      {f.title}
                    </p>
                    {/* Description: opacity only — no max-height, no layout shift */}
                    <p style={{
                      fontSize: 13.5,
                      color: "rgba(10,10,10,0.55)",
                      lineHeight: 1.65,
                      margin: "6px 0 0",
                      opacity: isActive ? 1 : 0,
                      transition: isActive ? "opacity 0.45s ease 0.1s" : "opacity 0.1s ease",
                      animation: isActive ? "tabFadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.1s both" : "none",
                    }}>
                      {f.description}
                    </p>
                  </div>
                </button>
              );
            })}
            {/* Join waitlist button */}
            <div style={{ paddingTop: 32 }}>
              <button style={{
                all: "unset",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: BRAND_PURPLE,
                color: "#fff",
                fontSize: 14,
                fontWeight: 600,
                padding: "13px 24px",
                borderRadius: 10,
                cursor: "pointer",
                letterSpacing: "-0.01em",
              }}>
                Join the waitlist
              </button>
            </div>
          </div>

          {/* Right — image panel */}
          <div style={{
            borderRadius: 10,
            overflow: "hidden",
            aspectRatio: "4 / 5",
            boxShadow: "0 24px 80px rgba(113,42,226,0.12)",
            position: "sticky",
            top: 40,
            background: "#f3f0ff",
          }}>
            <img
              key={feature.id}
              src={feature.image}
              alt={feature.title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
                animation: "tabFadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both",
              }}
            />
          </div>

        </div>
        </div>
      </div>
    </>
  );
}
