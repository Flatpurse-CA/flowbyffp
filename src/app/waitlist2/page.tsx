import Image from "next/image";
import Link from "next/link";
import { ArrowRight, User } from "lucide-react";

const PURPLE = "#712AE2";

const NAV_LINKS = ["Features", "Pricing", "Resources", "Offers"];

export default function Waitlist2Page() {
  return (
    <div style={{ background: PURPLE, color: "#fff", minHeight: "100vh", fontFamily: "var(--font-geist-sans, system-ui, sans-serif)", overflow: "hidden" }}>

      {/* ── Nav ── */}
      <nav style={{
        padding: "0 48px",
        height: 68,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "relative", zIndex: 20,
      }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <Image src="/logo-white.svg" alt="FlatPurse Flow" width={110} height={36} priority />
        </Link>

        {/* Center links */}
        <div className="wl2-nav-links" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {NAV_LINKS.map((l) => (
            <Link key={l} href="#" style={{
              fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.75)",
              textDecoration: "none", padding: "8px 14px", borderRadius: 8,
              transition: "color 0.15s, background 0.15s",
            }}
              onMouseEnter={undefined}
              className="wl2-nav-link"
            >
              {l}
            </Link>
          ))}
        </div>

        {/* Right actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link href="/signup" style={{
            display: "flex", alignItems: "center", gap: 8,
            fontSize: 14, fontWeight: 600, color: "#fff",
            textDecoration: "none",
            border: "1.5px solid rgba(255,255,255,0.35)",
            borderRadius: 10, padding: "9px 18px",
            transition: "background 0.15s, border-color 0.15s",
          }}
            className="wl2-cta-btn"
          >
            <ArrowRight size={14} /> Get started
          </Link>
          <Link href="/login" style={{
            width: 38, height: 38, borderRadius: 10,
            border: "1.5px solid rgba(255,255,255,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "rgba(255,255,255,0.8)", textDecoration: "none",
            transition: "background 0.15s",
          }}
            className="wl2-icon-btn"
          >
            <User size={16} />
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        alignItems: "center",
        minHeight: "calc(100vh - 68px)",
        padding: "0 48px 0 72px",
        gap: 40,
        position: "relative",
      }}>

        {/* LEFT */}
        <div style={{ paddingBottom: 80 }}>

          {/* Chip */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 9,
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.22)",
            borderRadius: 999, padding: "8px 16px",
            marginBottom: 36,
          }}>
            <span style={{ fontSize: 14 }}>⚡</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.85)", letterSpacing: "0.02em" }}>
              Auto Pilot &nbsp;·&nbsp; Track More Bookings
            </span>
          </div>

          {/* Heading */}
          <h1 style={{
            fontSize: "clamp(42px, 5.5vw, 74px)",
            fontWeight: 900, letterSpacing: "-0.045em", lineHeight: 1.04,
            margin: "0 0 28px", color: "#fff",
          }}>
            Book More.<br />
            Lose Nothing.<br />
            Keep Every Dollar.
          </h1>

          {/* Sub */}
          <p style={{
            fontSize: 17, color: "rgba(255,255,255,0.7)", lineHeight: 1.75,
            margin: "0 0 44px", maxWidth: 440,
          }}>
            FlatPurse Flow handles your bookings, fills your empty slots,
            and wins back lost clients automatically, while you focus on the work.
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <Link href="/signup" style={{
              display: "inline-flex", alignItems: "center", gap: 9,
              padding: "14px 26px",
              background: "#fff", color: PURPLE,
              fontSize: 15, fontWeight: 800, letterSpacing: "-0.025em",
              textDecoration: "none", borderRadius: 12,
              transition: "opacity 0.15s",
            }}
              className="wl2-primary-btn"
            >
              Get started free <ArrowRight size={16} />
            </Link>
            <Link href="#how" style={{
              display: "inline-flex", alignItems: "center",
              padding: "14px 26px",
              background: "rgba(255,255,255,0.1)",
              border: "1.5px solid rgba(255,255,255,0.2)",
              color: "#fff",
              fontSize: 15, fontWeight: 600, letterSpacing: "-0.02em",
              textDecoration: "none", borderRadius: 12,
              transition: "background 0.15s",
            }}
              className="wl2-ghost-btn"
            >
              See how it works
            </Link>
          </div>
        </div>

        {/* RIGHT — phone mockup */}
        <div style={{
          display: "flex", justifyContent: "center", alignItems: "flex-end",
          height: "100%",
          position: "relative",
        }}>
          <div style={{
            position: "relative",
            width: "100%",
            maxWidth: 520,
            marginBottom: -2,
          }}>
            <Image
              src="/herorightimg.png"
              alt="FlatPurse Flow app"
              width={520}
              height={640}
              style={{
                width: "100%",
                height: "auto",
                objectFit: "contain",
                objectPosition: "bottom",
                filter: "drop-shadow(0 32px 64px rgba(0,0,0,0.35))",
              }}
              priority
            />
          </div>
        </div>
      </section>

      {/* ── Bottom peek cards ── */}
      <div className="wl2-bottom-cards" style={{
        position: "fixed",
        bottom: 0, left: 0, right: 0,
        display: "flex", gap: 12,
        padding: "0 48px",
        zIndex: 5,
        pointerEvents: "none",
      }}>
        {["AutoPilot", "No-Show Recovery", "Smart Rebooking", "Stripe Payments", "Client Messaging"].map((label, i) => (
          <div key={i} style={{
            background: "#fff",
            borderRadius: "14px 14px 0 0",
            padding: "14px 22px 0",
            fontSize: 12.5, fontWeight: 600, color: PURPLE,
            whiteSpace: "nowrap",
            letterSpacing: "-0.01em",
            opacity: 0.92,
          }}>
            {label}
          </div>
        ))}
      </div>

      <style>{`
        .wl2-nav-link:hover { color: #fff !important; background: rgba(255,255,255,0.1) !important; }
        .wl2-cta-btn:hover  { background: rgba(255,255,255,0.12) !important; border-color: rgba(255,255,255,0.6) !important; }
        .wl2-icon-btn:hover { background: rgba(255,255,255,0.12) !important; }
        .wl2-primary-btn:hover { opacity: 0.88 !important; }
        .wl2-ghost-btn:hover   { background: rgba(255,255,255,0.18) !important; }

        @media (max-width: 860px) {
          section {
            grid-template-columns: 1fr !important;
            padding: 40px 24px 0 !important;
            min-height: auto !important;
          }
          .wl2-bottom-cards { display: none !important; }
          .wl2-nav-links { display: none !important; }
          nav { padding: 0 20px !important; }
        }
      `}</style>
    </div>
  );
}
