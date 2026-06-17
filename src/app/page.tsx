import Link from "next/link";
import { Sparkles, Calendar, Users, FileText, ArrowRight, Check } from "lucide-react";

const PLANS = [
  {
    id: "starter",
    label: "Starter",
    badge: null,
    price: "$0",
    description: "Ideal for solo operators and small salons",
    features: ["50 appointments/mo", "1 staff member", "Booking page", "AutoPilot basic", "Tap to Pay"],
    cta: "Start for Free",
    highlight: false,
    amber: false,
  },
  {
    id: "founders",
    label: "Founders",
    badge: "50 spots left",
    price: "C$29",
    description: "Pro at half price — locked in forever.",
    features: ["Everything in Pro", "Price locked forever", "Founding member badge", "Early access features"],
    cta: "Claim Founders",
    highlight: false,
    amber: true,
  },
  {
    id: "pro",
    label: "Pro",
    badge: "Most Popular",
    price: "C$49",
    description: "Best for growing salons and studios",
    features: ["Unlimited appointments", "Full AutoPilot", "Client Intelligence", "SMS + Email", "Daily Brief"],
    cta: "Get Pro",
    highlight: true,
    amber: false,
  },
  {
    id: "unlimited",
    label: "Unlimited",
    badge: null,
    price: "C$274",
    description: "For large studios and multi-location shops",
    features: ["Everything in Pro+", "Multi-location", "Custom integrations", "White-glove onboarding", "SLA guarantee"],
    cta: "Get Unlimited",
    highlight: false,
    amber: false,
  },
];

const FEATURES = [
  {
    Icon: Sparkles,
    title: "AutoPilot AI",
    desc: "Automatically confirm, reschedule, and follow up with clients. Your salon keeps running even when you step away.",
  },
  {
    Icon: Calendar,
    title: "Smart Booking",
    desc: "A beautiful booking page your clients actually use. Mobile-first, customizable, and available 24/7.",
  },
  {
    Icon: Users,
    title: "Client Intelligence",
    desc: "Know which clients are at risk of churning before it happens. Track spend, visit frequency, and preferences.",
  },
  {
    Icon: FileText,
    title: "Daily Brief",
    desc: "Start every morning with a smart summary of your schedule, revenue, and what needs your attention today.",
  },
];

export default function Home() {
  return (
    <div style={{ background: "#0a0a0a", color: "rgb(250,250,250)" }}>

      {/* ── Nav ── */}
      <nav style={{
        borderBottom: "1px solid rgb(39,39,42)",
        padding: "0 32px",
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        background: "rgba(10,10,10,0.9)",
        backdropFilter: "blur(14px)",
        zIndex: 50,
      }}>
        <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-0.02em" }}>FLOWBYFFP</span>

        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <a href="#features" style={{ color: "rgb(113,113,122)", fontSize: 14, padding: "8px 14px", textDecoration: "none" }}>
            Features
          </a>
          <a href="#pricing" style={{ color: "rgb(113,113,122)", fontSize: 14, padding: "8px 14px", textDecoration: "none" }}>
            Pricing
          </a>
          <Link href="/login" style={{
            color: "rgb(250,250,250)", fontSize: 14, padding: "8px 16px", textDecoration: "none",
            borderRadius: 8, border: "1px solid rgb(39,39,42)", marginLeft: 8,
          }}>
            Sign in
          </Link>
          <Link href="/signup" style={{
            color: "rgb(9,9,11)", fontSize: 14, fontWeight: 700, padding: "9px 20px",
            textDecoration: "none", borderRadius: 8, background: "rgb(250,250,250)",
          }}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ textAlign: "center", padding: "110px 32px 90px", maxWidth: 780, margin: "0 auto" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.3)",
          borderRadius: 100, padding: "5px 14px", fontSize: 11, fontWeight: 700,
          color: "rgb(196,181,253)", letterSpacing: "0.06em", textTransform: "uppercase",
          marginBottom: 32,
        }}>
          <Sparkles size={11} /> AI-Powered Salon Management
        </div>

        <h1 style={{
          fontSize: "clamp(42px, 6.5vw, 76px)", fontWeight: 800, letterSpacing: "-0.04em",
          lineHeight: 1.06, margin: "0 0 24px",
        }}>
          Your Salon on{" "}
          <span style={{
            background: "linear-gradient(135deg, rgb(167,139,250) 0%, rgb(109,40,217) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            AutoPilot.
          </span>
        </h1>

        <p style={{
          fontSize: 18, color: "rgb(113,113,122)", lineHeight: 1.7,
          maxWidth: 520, margin: "0 auto 44px",
        }}>
          FLOWBYFFP handles bookings, follow-ups, and scheduling — so you can focus on doing what you do best.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/signup" style={{
            background: "rgb(250,250,250)", color: "rgb(9,9,11)", fontSize: 15, fontWeight: 700,
            padding: "14px 28px", borderRadius: 12, textDecoration: "none",
            display: "inline-flex", alignItems: "center", gap: 8,
          }}>
            Start for Free <ArrowRight size={15} />
          </Link>
          <Link href="/login" style={{
            background: "transparent", color: "rgb(250,250,250)", fontSize: 15,
            padding: "14px 28px", borderRadius: 12, textDecoration: "none",
            border: "1px solid rgb(39,39,42)",
          }}>
            Sign in
          </Link>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <div style={{ borderTop: "1px solid rgb(39,39,42)", borderBottom: "1px solid rgb(39,39,42)" }}>
        <div style={{
          maxWidth: 960, margin: "0 auto", padding: "28px 32px",
          display: "flex", justifyContent: "center", gap: 64, flexWrap: "wrap",
        }}>
          {[
            { value: "500+", label: "Salons on AutoPilot" },
            { value: "98%", label: "Booking uptime" },
            { value: "3×", label: "Fewer no-shows" },
            { value: "C$29", label: "Founders price, locked in" },
          ].map(({ value, label }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <p style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.04em", margin: 0 }}>{value}</p>
              <p style={{ fontSize: 13, color: "rgb(113,113,122)", margin: "4px 0 0" }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Features ── */}
      <section id="features" style={{ padding: "96px 32px", maxWidth: 960, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <h2 style={{ fontSize: 38, fontWeight: 800, letterSpacing: "-0.035em", margin: "0 0 14px" }}>
            Everything your salon needs
          </h2>
          <p style={{ color: "rgb(113,113,122)", fontSize: 16, lineHeight: 1.6, margin: 0 }}>
            Built for salon owners who want to grow without the chaos.
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
          border: "1px solid rgb(39,39,42)",
        }}>
          {FEATURES.map(({ Icon, title, desc }, i) => (
            <div key={title} style={{
              padding: "32px 26px",
              background: "rgba(255,255,255,0.015)",
              borderRight: i < FEATURES.length - 1 ? "1px solid rgb(39,39,42)" : undefined,
            }}>
              <div style={{
                width: 42, height: 42, background: "rgba(124,58,237,0.14)", borderRadius: 10,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "rgb(167,139,250)", marginBottom: 18,
              }}>
                <Icon size={18} />
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 10px" }}>{title}</h3>
              <p style={{ fontSize: 14, color: "rgb(113,113,122)", lineHeight: 1.65, margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" style={{ padding: "0 32px 96px", maxWidth: 960, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <h2 style={{ fontSize: 38, fontWeight: 800, letterSpacing: "-0.035em", margin: "0 0 14px" }}>
            Simple, transparent pricing
          </h2>
          <p style={{ color: "rgb(113,113,122)", fontSize: 16, margin: 0 }}>
            Start free. Upgrade when you&apos;re ready.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
          {PLANS.map((plan) => (
            <div key={plan.id} style={{
              background: plan.highlight ? "rgba(124,58,237,0.07)" : "rgba(255,255,255,0.02)",
              border: plan.highlight
                ? "1px solid rgba(124,58,237,0.5)"
                : plan.amber
                ? "1px solid rgba(245,158,11,0.28)"
                : "1px solid rgb(39,39,42)",
              borderRadius: 12,
              padding: "30px 22px 24px",
              position: "relative",
              display: "flex",
              flexDirection: "column",
            }}>
              {plan.badge && (
                <div style={{
                  position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)",
                  background: plan.highlight
                    ? "rgb(76,29,149)"
                    : plan.amber ? "rgb(92,46,12)" : "rgb(24,24,27)",
                  border: plan.highlight
                    ? "1px solid rgba(139,92,246,0.55)"
                    : plan.amber ? "1px solid rgba(245,158,11,0.4)" : "1px solid rgb(39,39,42)",
                  borderRadius: 100, padding: "3px 12px", fontSize: 10, fontWeight: 700,
                  color: plan.highlight ? "rgb(233,213,255)" : plan.amber ? "rgb(253,230,138)" : "rgb(113,113,122)",
                  letterSpacing: "0.07em", textTransform: "uppercase", whiteSpace: "nowrap",
                }}>
                  {plan.badge}
                </div>
              )}

              <p style={{
                fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase",
                color: plan.highlight ? "rgb(196,181,253)" : "rgb(113,113,122)", margin: "0 0 12px",
              }}>
                {plan.label}
              </p>

              <div style={{ marginBottom: 8 }}>
                <span style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-0.04em" }}>{plan.price}</span>
                <span style={{ fontSize: 13, color: "rgb(113,113,122)", marginLeft: 3 }}>/month</span>
              </div>

              <p style={{ fontSize: 13, color: "rgb(113,113,122)", lineHeight: 1.6, margin: "0 0 18px" }}>
                {plan.description}
              </p>

              <div style={{
                height: 1,
                background: plan.highlight ? "rgba(124,58,237,0.22)" : "rgb(39,39,42)",
                marginBottom: 18,
              }} />

              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
                {plan.features.map((f) => (
                  <li key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "rgb(161,161,170)" }}>
                    <Check
                      size={13}
                      style={{
                        flexShrink: 0,
                        color: plan.highlight
                          ? "rgb(167,139,250)"
                          : plan.amber ? "rgb(251,191,36)" : "rgb(82,82,91)",
                      }}
                    />
                    {f}
                  </li>
                ))}
              </ul>

              <Link href="/signup" style={{
                display: "block", textAlign: "center", textDecoration: "none",
                background: plan.highlight ? "rgba(109,40,217,0.45)" : "rgba(255,255,255,0.05)",
                border: plan.highlight
                  ? "1px solid rgba(139,92,246,0.6)"
                  : plan.amber ? "1px solid rgba(245,158,11,0.35)" : "1px solid rgb(39,39,42)",
                color: plan.highlight ? "rgb(233,213,255)" : plan.amber ? "rgb(253,230,138)" : "rgb(250,250,250)",
                borderRadius: 8, padding: "11px 0", fontSize: 13, fontWeight: 700,
              }}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section style={{ padding: "0 32px 96px", maxWidth: 960, margin: "0 auto" }}>
        <div style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 120%, rgba(109,40,217,0.22) 0%, transparent 70%)",
          border: "1px solid rgb(39,39,42)", borderRadius: 16, padding: "72px 32px", textAlign: "center",
        }}>
          <h2 style={{ fontSize: 38, fontWeight: 800, letterSpacing: "-0.035em", margin: "0 0 16px" }}>
            Ready to grow your salon?
          </h2>
          <p style={{ color: "rgb(113,113,122)", fontSize: 16, margin: "0 0 40px" }}>
            Join hundreds of salon owners already on AutoPilot.
          </p>
          <Link href="/signup" style={{
            background: "rgb(250,250,250)", color: "rgb(9,9,11)", fontSize: 15, fontWeight: 700,
            padding: "15px 36px", borderRadius: 12, textDecoration: "none",
            display: "inline-flex", alignItems: "center", gap: 8,
          }}>
            Get Started Free <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: "1px solid rgb(39,39,42)" }}>
        <div style={{
          maxWidth: 960, margin: "0 auto", padding: "28px 32px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span style={{ fontSize: 14, fontWeight: 800 }}>FLOWBYFFP</span>
          <p style={{ fontSize: 13, color: "rgb(113,113,122)", margin: 0 }}>
            © {new Date().getFullYear()} FLOWBYFFP. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  );
}
