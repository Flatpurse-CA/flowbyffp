"use client";

import { useState } from "react";
import { CreditCard, MessageCircle, Camera, Calendar, Mail, Smartphone, Zap, Star, ChevronDown } from "lucide-react";

const BRAND_PURPLE = "#712AE2";
const BORDER = "1px solid rgba(0,0,0,0.08)";

const ITEMS = [
  {
    icon: <CreditCard size={22} strokeWidth={1.5} />,
    iconColor: "#2563eb",
    iconBg: "rgba(37,99,235,0.08)",
    title: "Stripe Payments",
    description: "Collect deposits, tips, and full payments in-app. No commission, no surprises.",
  },
  {
    icon: <MessageCircle size={22} strokeWidth={1.5} />,
    iconColor: "#22c55e",
    iconBg: "rgba(34,197,94,0.08)",
    title: "WhatsApp",
    description: "AutoPilot sends booking confirmations, reminders, and win-back messages via WhatsApp.",
  },
  {
    icon: <Camera size={22} strokeWidth={1.5} />,
    iconColor: "#e1306c",
    iconBg: "rgba(225,48,108,0.08)",
    title: "Instagram DMs",
    description: "Clients book directly from your Instagram page. AutoPilot handles the conversation.",
  },
  {
    icon: <Calendar size={22} strokeWidth={1.5} />,
    iconColor: "#7c3aed",
    iconBg: "rgba(124,58,237,0.08)",
    title: "Google Calendar",
    description: "Your bookings sync automatically. Every appointment lands on your calendar in real time.",
  },
  {
    icon: <Mail size={22} strokeWidth={1.5} />,
    iconColor: "#f59e0b",
    iconBg: "rgba(245,158,11,0.08)",
    title: "Email Campaigns",
    description: "Send targeted re-engagement emails to lapsed clients on a schedule you set once.",
  },
  {
    icon: <Smartphone size={22} strokeWidth={1.5} />,
    iconColor: "#06b6d4",
    iconBg: "rgba(6,182,212,0.08)",
    title: "SMS Reminders",
    description: "Automated text reminders reduce no-shows before they happen, hands free.",
  },
  {
    icon: <Zap size={22} strokeWidth={1.5} />,
    iconColor: "#f97316",
    iconBg: "rgba(249,115,22,0.08)",
    title: "Zapier",
    description: "Connect FlatPurse Flow to thousands of tools and build custom automations without code.",
  },
  {
    icon: <Star size={22} strokeWidth={1.5} />,
    iconColor: "#db2777",
    iconBg: "rgba(219,39,119,0.08)",
    title: "Google Reviews",
    description: "AutoPilot prompts happy clients to leave a review right after their visit.",
  },
];

const FAQS = [
  { n: "01", q: "What is FlatPurse Flow?", a: "FlatPurse Flow is an AI-powered booking and revenue management platform built specifically for independent salons and barbershops. It handles your bookings, fills empty slots, wins back lapsed clients, and manages payments, all automatically." },
  { n: "02", q: "How does AutoPilot work?", a: "AutoPilot is a set of six always-on AI flows that run in the background of your shop. It sends reminders, fills cancellations from your waitlist, messages clients who haven't visited in 30+ days, and answers booking DMs, without you lifting a finger." },
  { n: "03", q: "Is there really zero commission?", a: "Yes. FlatPurse Flow never takes a percentage of your revenue. You pay a flat monthly subscription and keep everything you earn. The only fees are standard payment processing fees charged by Stripe." },
  { n: "04", q: "How long does setup take?", a: "Most shops are fully set up in under 15 minutes. You create your booking page, add your services and staff, connect payments, and AutoPilot handles the rest. No complicated onboarding required." },
  { n: "05", q: "Can clients book directly from Instagram or WhatsApp?", a: "Yes. AutoPilot's AI Front Desk reads incoming DMs on Instagram and WhatsApp, responds to booking requests, and confirms appointments, all without you needing to reply manually." },
  { n: "06", q: "What happens when a client no-shows or cancels?", a: "AutoPilot immediately pulls the next client from your waitlist, fills the slot, and sends them a payment link. You recover revenue that would otherwise be lost, with zero effort." },
  { n: "07", q: "Is my client data safe?", a: "Yes. All data is encrypted in transit and at rest. We never sell or share your client data with third parties. FlatPurse Flow is fully compliant with data protection regulations." },
  { n: "08", q: "Can I cancel or change my plan anytime?", a: "Absolutely. There are no contracts or lock-in periods. You can upgrade, downgrade, or cancel at any time. If you cancel, you keep access until the end of your billing period." },
];

export default function IntegrationsGrid() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section style={{ background: "#fff", padding: "100px 155px 120px", position: "relative" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 64 }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          background: "rgba(113,42,226,0.07)",
          border: "1px solid rgba(113,42,226,0.18)",
          borderRadius: 999, padding: "6px 14px", marginBottom: 24,
        }}>
          <span style={{ fontSize: 11, color: BRAND_PURPLE }}>✦</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: BRAND_PURPLE, letterSpacing: "0.06em", textTransform: "uppercase" }}>Integrations</span>
        </div>

        <h2 style={{
          fontSize: "clamp(28px, 3.5vw, 48px)",
          fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.1,
          color: "#0a0a0a", margin: "0 0 16px",
        }}>
          Connect FlatPurse Flow<br />with the tools you already use.
        </h2>
        <p style={{
          fontSize: 16, color: "rgba(0,0,0,0.45)", lineHeight: 1.7,
          maxWidth: 460, margin: "0 auto",
        }}>
          Everything works together out of the box: payments, messaging, calendar, and more.
        </p>
      </div>

      {/* 4×2 Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 0,
      }}>
        {ITEMS.map((item, i) => {
          const isTopRow = i < 4;
          const isLeftCol = i % 4 === 0;
          return (
            <div key={i} className="ig-cell" style={{
              padding: "40px 36px",
              borderTop: isTopRow ? BORDER : "none",
              borderBottom: BORDER,
              borderLeft: isLeftCol ? BORDER : "none",
              borderRight: BORDER,
              display: "flex",
              flexDirection: "column",
              gap: 20,
              transition: "background 0.25s ease, transform 0.25s cubic-bezier(0.16,1,0.3,1)",
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10,
                background: item.iconBg,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: item.iconColor,
              }}>
                {item.icon}
              </div>
              <div>
                <h3 style={{
                  fontSize: 15, fontWeight: 700,
                  color: "#0a0a0a", letterSpacing: "-0.025em",
                  margin: "0 0 8px",
                }}>
                  {item.title}
                </h3>
                <p style={{
                  fontSize: 13, color: "rgba(0,0,0,0.48)",
                  lineHeight: 1.7, margin: 0,
                }}>
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* FAQ */}
      <div style={{ maxWidth: 860, margin: "80px auto 0" }}>
        <h3 style={{ fontSize: "clamp(24px, 2.5vw, 36px)", fontWeight: 800, letterSpacing: "-0.03em", color: "#0a0a0a", margin: "0 0 48px", textAlign: "center" }}>
          Frequently Asked Questions
        </h3>
        {FAQS.map((faq, i) => {
          const isOpen = open === i;
          return (
            <div key={i} className="faq-row" style={{ borderTop: "1px solid rgba(0,0,0,0.08)", transition: "background 0.2s", borderRadius: 6, margin: "0 -16px", padding: "0 16px" }}>
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                style={{ all: "unset", width: "100%", display: "flex", alignItems: "center", gap: 24, padding: "24px 0", cursor: "pointer", boxSizing: "border-box" }}
              >
                <span className="faq-num" style={{ fontSize: 11, fontWeight: 700, color: BRAND_PURPLE, letterSpacing: "0.06em", flexShrink: 0, width: 20, transition: "opacity 0.2s" }}>{faq.n}</span>
                <span className="faq-q" style={{ flex: 1, fontSize: 15, fontWeight: 500, color: isOpen ? "#0a0a0a" : "rgba(0,0,0,0.6)", letterSpacing: "-0.02em", textAlign: "left", transition: "color 0.2s" }}>{faq.q}</span>
                <ChevronDown size={17} color="rgba(0,0,0,0.3)" style={{ flexShrink: 0, transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s cubic-bezier(0.16,1,0.3,1)" }} />
              </button>
              <div style={{ overflow: "hidden", maxHeight: isOpen ? 200 : 0, opacity: isOpen ? 1 : 0, transition: "max-height 0.4s cubic-bezier(0.16,1,0.3,1), opacity 0.3s ease" }}>
                <p style={{ fontSize: 14, color: "rgba(0,0,0,0.45)", lineHeight: 1.75, margin: "0 0 24px", paddingLeft: 44 }}>{faq.a}</p>
              </div>
            </div>
          );
        })}
        <div style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }} />
      </div>

      <div style={{ position: "absolute", bottom: 0, left: 0, width: "100%", zIndex: 10, pointerEvents: "none" }}>
        <img src="/ffdoe.svg" alt="" style={{ width: "100%", display: "block", filter: "brightness(0)" }} />
      </div>

      <style>{`
        .ig-cell:hover {
          background: rgba(113,42,226,0.03);
          transform: translateY(-3px);
        }
        .faq-row:hover {
          background: rgba(113,42,226,0.03);
        }
        .faq-row:hover .faq-q {
          color: #0a0a0a !important;
        }
        .faq-row:hover .faq-num {
          opacity: 1;
          transform: scale(1.15);
        }
      `}</style>
    </section>
  );
}
