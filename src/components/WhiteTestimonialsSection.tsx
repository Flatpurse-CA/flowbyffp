"use client";

import { Sparkles } from "lucide-react";

const BRAND_PURPLE = "#712AE2";
const BORDER = "1px solid rgba(0,0,0,0.08)";

const QUOTES = [
  {
    quote: "FlatPurse Flow completely changed how I run my shop. No-shows dropped by 80% in the first month.",
    name: "Ade Williams",
    shop: "Williams Barbershop",
    highlight: false,
  },
  {
    quote: "AutoPilot books clients while I sleep. I wake up to a full calendar every single morning.",
    name: "Temi Okafor",
    shop: "The Curl Studio",
    highlight: false,
  },
  {
    quote: "We used to lose thousands a month to cancellations. That money stays with us now.",
    name: "Femi & Dami",
    shop: "Kings & Queens Cuts",
    highlight: true,
  },
  {
    quote: "The AI front desk handles every DM. I haven't replied to a booking request in weeks.",
    name: "Seun Adeyemi",
    shop: "Fade Factory",
    highlight: false,
  },
  {
    quote: "My clients love the booking page. It's seamless and professional, exactly what we needed.",
    name: "Chioma Eze",
    shop: "Glow Beauty Lounge",
    highlight: false,
  },
  {
    quote: "Revenue up 35% in two months. The win-back flow alone paid for the whole year.",
    name: "Kola Mensah",
    shop: "Precision Cuts",
    highlight: false,
  },
  {
    quote: "I finally feel like a business owner, not just a stylist chasing payments all day.",
    name: "Yetunde Bello",
    shop: "Luxe Locs Studio",
    highlight: false,
  },
  {
    quote: "Setup took 10 minutes. Within a week AutoPilot had already recovered two no-show slots.",
    name: "Emeka Obi",
    shop: "The Clean Fade",
    highlight: false,
  },
  {
    quote: "Zero commission means I actually keep what I earn. No other platform gives you that.",
    name: "Amara Diallo",
    shop: "Amara Beauty Bar",
    highlight: false,
  },
];

export default function WhiteTestimonialsSection() {
  return (
    <section style={{ background: "#fff", paddingTop: 100 }}>
      {/* Header */}
      <div style={{ textAlign: "center", padding: "0 155px 72px" }}>
        {/* Pill */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          background: "rgba(113,42,226,0.07)",
          border: "1px solid rgba(113,42,226,0.18)",
          borderRadius: 999, padding: "6px 14px", marginBottom: 24,
        }}>
          <Sparkles size={12} color={BRAND_PURPLE} />
          <span style={{ fontSize: 12, fontWeight: 600, color: BRAND_PURPLE, letterSpacing: "0.06em", textTransform: "uppercase" }}>Testimonials</span>
        </div>

        <h2 style={{
          fontSize: "clamp(32px, 4vw, 54px)",
          fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.08,
          color: "#0a0a0a", margin: "0 0 18px",
        }}>
          What shop owners<br />are saying.
        </h2>
        <p style={{
          fontSize: 16, color: "rgba(0,0,0,0.45)", lineHeight: 1.7,
          maxWidth: 480, margin: "0 auto",
        }}>
          From barbershops to beauty lounges, real results from real shop owners running on FlatPurse Flow.
        </p>
      </div>

      {/* Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        borderTop: BORDER,
        borderLeft: BORDER,
      }}>
        {QUOTES.map((q, i) => (
          <div key={i} style={{
            padding: "40px 36px",
            borderRight: BORDER,
            borderBottom: BORDER,
            background: q.highlight ? "rgba(113,42,226,0.04)" : "#fff",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: 24,
          }}>
            {/* Quote mark */}
            <div>
              <span style={{ fontSize: 36, lineHeight: 1, color: q.highlight ? BRAND_PURPLE : "rgba(0,0,0,0.12)", fontFamily: "Georgia, serif" }}>"</span>
              <p style={{
                fontSize: 15, color: q.highlight ? "#111" : "rgba(0,0,0,0.7)",
                lineHeight: 1.7, margin: "8px 0 0", fontWeight: q.highlight ? 500 : 400,
              }}>
                {q.quote}
              </p>
            </div>
            {/* Attribution */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 34, height: 34, borderRadius: "50%",
                background: q.highlight ? BRAND_PURPLE : "rgba(0,0,0,0.08)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: q.highlight ? "#fff" : "rgba(0,0,0,0.4)" }}>
                  {q.name.charAt(0)}
                </span>
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#0a0a0a", margin: 0, letterSpacing: "-0.01em" }}>{q.name}</p>
                <p style={{ fontSize: 12, color: "rgba(0,0,0,0.4)", margin: 0 }}>{q.shop}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
