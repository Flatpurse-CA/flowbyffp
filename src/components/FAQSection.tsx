"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const BRAND_PURPLE = "#712AE2";

const FAQS = [
  {
    n: "01",
    q: "What is FlatPurse Flow?",
    a: "FlatPurse Flow is an AI-powered booking and revenue management platform built specifically for independent salons and barbershops. It handles your bookings, fills empty slots, wins back lapsed clients, and manages payments, all automatically.",
  },
  {
    n: "02",
    q: "How does AutoPilot work?",
    a: "AutoPilot is a set of six always-on AI flows that run in the background of your shop. It sends reminders, fills cancellations from your waitlist, messages clients who haven't visited in 30+ days, and answers booking DMs, without you lifting a finger.",
  },
  {
    n: "03",
    q: "Is there really zero commission?",
    a: "Yes. FlatPurse Flow never takes a percentage of your revenue. You pay a flat monthly subscription and keep everything you earn. The only fees are standard payment processing fees charged by Stripe.",
  },
  {
    n: "04",
    q: "How long does setup take?",
    a: "Most shops are fully set up in under 15 minutes. You create your booking page, add your services and staff, connect payments, and AutoPilot handles the rest. No complicated onboarding or technical knowledge required.",
  },
  {
    n: "05",
    q: "Can clients book directly from Instagram or WhatsApp?",
    a: "Yes. AutoPilot's AI Front Desk reads incoming DMs on Instagram and WhatsApp, responds to booking requests, and confirms appointments, all without you needing to reply manually.",
  },
  {
    n: "06",
    q: "What happens when a client no-shows or cancels?",
    a: "AutoPilot immediately pulls the next client from your waitlist, fills the slot, and sends them a payment link. You recover revenue that would otherwise be lost, with zero effort on your part.",
  },
  {
    n: "07",
    q: "Is my client data safe?",
    a: "Yes. All data is encrypted in transit and at rest. We never sell or share your client data with third parties. FlatPurse Flow is fully compliant with data protection regulations.",
  },
  {
    n: "08",
    q: "Can I cancel or change my plan anytime?",
    a: "Absolutely. There are no contracts or lock-in periods. You can upgrade, downgrade, or cancel your plan at any time from your dashboard. If you cancel, you keep access until the end of your billing period.",
  },
];

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section style={{ background: "#0a0a0a", padding: "100px 155px 120px" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 72 }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          background: "rgba(113,42,226,0.12)",
          border: "1px solid rgba(113,42,226,0.25)",
          borderRadius: 999, padding: "6px 14px", marginBottom: 28,
        }}>
          <span style={{ fontSize: 11, color: BRAND_PURPLE }}>✦</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)", letterSpacing: "0.06em", textTransform: "uppercase" }}>FAQ</span>
        </div>

        <h2 style={{
          fontSize: "clamp(32px, 4vw, 56px)",
          fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.08,
          color: "#fff", margin: 0,
        }}>
          Frequently asked questions.
        </h2>
      </div>

      {/* List */}
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        {FAQS.map((faq, i) => {
          const isOpen = open === i;
          return (
            <div
              key={i}
              style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
            >
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                style={{
                  all: "unset",
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 24,
                  padding: "28px 0",
                  cursor: "pointer",
                  boxSizing: "border-box",
                }}
              >
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  color: BRAND_PURPLE,
                  letterSpacing: "0.06em",
                  fontVariantNumeric: "tabular-nums",
                  flexShrink: 0,
                  width: 20,
                }}>
                  {faq.n}
                </span>
                <span style={{
                  flex: 1, fontSize: 16, fontWeight: 500,
                  color: isOpen ? "#fff" : "rgba(255,255,255,0.75)",
                  letterSpacing: "-0.02em",
                  textAlign: "left",
                  transition: "color 0.2s",
                }}>
                  {faq.q}
                </span>
                <ChevronDown
                  size={18}
                  color="rgba(255,255,255,0.35)"
                  style={{
                    flexShrink: 0,
                    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.3s cubic-bezier(0.16,1,0.3,1)",
                  }}
                />
              </button>

              {/* Answer */}
              <div style={{
                overflow: "hidden",
                maxHeight: isOpen ? 200 : 0,
                opacity: isOpen ? 1 : 0,
                transition: "max-height 0.4s cubic-bezier(0.16,1,0.3,1), opacity 0.3s ease",
              }}>
                <p style={{
                  fontSize: 14.5,
                  color: "rgba(255,255,255,0.45)",
                  lineHeight: 1.75,
                  margin: "0 0 28px",
                  paddingLeft: 44,
                }}>
                  {faq.a}
                </p>
              </div>
            </div>
          );
        })}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }} />
      </div>
    </section>
  );
}
