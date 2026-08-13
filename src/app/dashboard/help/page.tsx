"use client";

import { useState } from "react";
import { Search, ChevronDown, ChevronUp, MessageCircle, BookOpen, Zap, ExternalLink } from "lucide-react";

const FAQS = [
  {
    q: "How do I share my booking link with clients?",
    a: "Go to Settings → Business to find your personal booking link (e.g. flow.flatpurse.com/book/yourname). Copy it and share it via Instagram bio, WhatsApp, or any channel your clients use.",
  },
  {
    q: "What does AutoPilot actually do?",
    a: "AutoPilot runs AI-powered flows in the background: it sends reminders before appointments, follows up with clients who haven't booked in 30 days, fills last-minute gaps, and recovers no-shows, all without you lifting a finger.",
  },
  {
    q: "Can I add multiple team members / stylists?",
    a: "Yes. During onboarding (or in Settings) you can add team members. Each stylist gets their own schedule and can be assigned to specific services.",
  },
  {
    q: "How do clients pay for their bookings?",
    a: "Clients can pay a deposit or full amount at booking via Stripe. You can configure whether payments are required, optional, or disabled in the Settings → Business tab.",
  },
  {
    q: "Can I customise the reminder messages AutoPilot sends?",
    a: "Coming soon: custom message templates. Currently AutoPilot uses proven default copy that converts well. The upgrade to Elite unlocks fully custom templates.",
  },
  {
    q: "How does the no-show recovery flow work?",
    a: "When a client misses their appointment, AutoPilot automatically sends a follow-up within 30 minutes offering to rebook at the next available slot. On average this recovers ~25% of no-shows.",
  },
  {
    q: "Is my client data safe?",
    a: "Yes. All data is encrypted at rest and in transit. We're hosted on Supabase (SOC 2 compliant). We never sell your data or your clients' data.",
  },
  {
    q: "How do I cancel my subscription?",
    a: "Go to Settings → Billing → Manage plan. You can cancel at any time and keep access until the end of your billing period.",
  },
];

const DOCS = [
  { title: "Getting started guide",     desc: "Set up your flow in 10 minutes",    Icon: BookOpen },
  { title: "AutoPilot deep dive",       desc: "How each flow works, with examples", Icon: Zap      },
  { title: "Booking link walkthrough",  desc: "What clients see when they book",    Icon: ExternalLink },
];

export default function HelpPage() {
  const [query,  setQuery]  = useState("");
  const [open,   setOpen]   = useState<number | null>(null);

  const filtered = FAQS.filter(
    (f) => query === "" || f.q.toLowerCase().includes(query.toLowerCase()) || f.a.toLowerCase().includes(query.toLowerCase())
  );

  const card: React.CSSProperties = { background: "var(--dsurface1)", border: "1px solid var(--dw07)", borderRadius: 16 };

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", gap: 28 }}>

      {/* Header */}
      <div style={{ textAlign: "center", padding: "10px 0 0" }}>
        <h1 style={{ color: "var(--dtext)", fontSize: 26, fontWeight: 800, margin: "0 0 8px", letterSpacing: "-0.035em" }}>How can we help?</h1>
        <p style={{ color: "var(--dw35)", fontSize: 14, margin: "0 0 22px" }}>Search the FAQ or browse common questions below</p>

        {/* Search */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--dsurface3)", border: "1px solid var(--dw09)", borderRadius: 13, padding: "11px 16px", maxWidth: 500, margin: "0 auto" }}>
          <Search size={16} color="var(--dw3)" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for an answer…"
            style={{ flex: 1, background: "none", border: "none", outline: "none", color: "var(--dtext)", fontSize: 14 }}
          />
        </div>
      </div>

      {/* Quick docs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {DOCS.map(({ title, desc, Icon }) => (
          <button
            key={title}
            style={{ ...card, padding: "18px 18px", textAlign: "left", cursor: "pointer", transition: "border-color 0.15s" }}
          >
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(109,40,217,0.18)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
              <Icon size={16} strokeWidth={1.8} color="rgb(167,139,250)" />
            </div>
            <p style={{ color: "var(--dtext)", fontSize: 13.5, fontWeight: 700, margin: "0 0 4px" }}>{title}</p>
            <p style={{ color: "var(--dw35)", fontSize: 12, margin: 0 }}>{desc}</p>
          </button>
        ))}
      </div>

      {/* FAQ accordion */}
      <div>
        <p style={{ color: "var(--dw35)", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 12px" }}>
          {query ? `${filtered.length} result${filtered.length !== 1 ? "s" : ""}` : "Frequently asked questions"}
        </p>

        <div style={{ ...card, overflow: "hidden" }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--dw25)", fontSize: 13 }}>
              No results for &quot;{query}&quot;
            </div>
          ) : filtered.map((f, i) => (
            <div key={i} style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--dw05)" : "none" }}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "17px 22px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
              >
                <span style={{ color: open === i ? "var(--dpurple-text)" : "var(--dtext)", fontSize: 14, fontWeight: 600, lineHeight: 1.4, paddingRight: 20 }}>{f.q}</span>
                {open === i
                  ? <ChevronUp size={16} color="rgba(167,139,250,0.7)" style={{ flexShrink: 0 }} />
                  : <ChevronDown size={16} color="var(--dw3)" style={{ flexShrink: 0 }} />
                }
              </button>
              {open === i && (
                <div style={{ padding: "0 22px 18px" }}>
                  <p style={{ color: "var(--dw5)", fontSize: 13.5, lineHeight: 1.7, margin: 0 }}>{f.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact support */}
      <div style={{ ...card, padding: "24px 26px", display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(109,40,217,0.2)", border: "1px solid rgba(139,92,246,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <MessageCircle size={22} strokeWidth={1.6} color="rgb(167,139,250)" />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ color: "var(--dtext)", fontSize: 14, fontWeight: 700, margin: "0 0 3px" }}>Still need help?</p>
          <p style={{ color: "var(--dw38)", fontSize: 13, margin: 0 }}>Our team typically replies within a few hours</p>
        </div>
        <button style={{ padding: "10px 20px", borderRadius: 10, background: "rgb(109,40,217)", border: "none", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
          Message support
        </button>
      </div>
    </div>
  );
}
