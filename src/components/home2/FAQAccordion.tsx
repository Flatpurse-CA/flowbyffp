"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

const INK = "#251F19";
const BORDER = "#E4E0DD";
const MUTED = "#6B615A";

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
    a: "Most shops are fully set up in under 15 minutes. You create your booking page, add your services and staff, connect payments, and AutoPilot handles the rest. No complicated onboarding required.",
  },
  {
    n: "05",
    q: "Can clients book directly from Instagram or WhatsApp?",
    a: "Yes. AutoPilot's AI Front Desk reads incoming DMs on Instagram and WhatsApp, responds to booking requests, and confirms appointments, all without you needing to reply manually.",
  },
  {
    n: "06",
    q: "What happens when a client no-shows or cancels?",
    a: "AutoPilot immediately pulls the next client from your waitlist, fills the slot, and sends them a payment link. You recover revenue that would otherwise be lost, with zero effort.",
  },
  {
    n: "07",
    q: "Is my client data safe?",
    a: "Yes. All data is encrypted in transit and at rest. We never sell or share your client data with third parties. FlatPurse Flow is fully compliant with data protection regulations.",
  },
  {
    n: "08",
    q: "Can I cancel or change my plan anytime?",
    a: "Absolutely. There are no contracts or lock-in periods. You can upgrade, downgrade, or cancel at any time. If you cancel, you keep access until the end of your billing period.",
  },
];

export default function FAQAccordion() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div style={{ borderTop: `1px solid ${BORDER}` }}>
      {FAQS.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={f.n} style={{ borderBottom: `1px solid ${BORDER}` }}>
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 20,
                padding: "26px 4px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <span style={{ fontSize: 13, color: "#712AE2", fontWeight: 600, flexShrink: 0, width: 22 }}>
                {f.n}
              </span>
              <span style={{ flex: 1, fontSize: 17, fontWeight: 500, color: INK }}>
                {f.q}
              </span>
              <Plus
                size={18}
                color={INK}
                style={{
                  flexShrink: 0,
                  transition: "transform 0.25s ease",
                  transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                }}
              />
            </button>
            <div
              style={{
                maxHeight: isOpen ? 240 : 0,
                overflow: "hidden",
                transition: "max-height 0.3s ease",
              }}
            >
              <p style={{
                margin: "0 0 26px",
                paddingLeft: 42,
                paddingRight: 40,
                fontSize: 15,
                lineHeight: 1.7,
                color: MUTED,
                maxWidth: 620,
              }}>
                {f.a}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
