import { Inter } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import AutoPilotChip from "@/components/AutoPilotChip";
import ScrollFillText from "@/components/ScrollFillText";
import FeatureTabs from "@/components/FeatureTabs";
import ScrollReveal from "@/components/ScrollReveal";
import ScrollZoom from "@/components/ScrollZoom";
import FoundationsGrid from "@/components/FoundationsSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import ChangelogSection from "@/components/ChangelogSection";
import TestimonialsGrid from "@/components/TestimonialsGrid";
import PricingSection from "@/components/PricingSection";
import IntegrationsGrid from "@/components/IntegrationsGrid";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

const H3 = {
  bg: "#ffffff",
  cardBg: "#f1edff",
  ink: "#342448",
  heading: "rgba(17,1,41,0.85)",
  body: "rgba(17,1,41,0.84)",
  bodyMuted: "#584646",
  bodyMuted2: "#464040",
  border: "rgba(52,36,72,0.12)",
  navMuted: "#5b5b5b",
  accent: "#5406ce",
  purple: "#33067a",
};

const NAV_LINKS = [
  { label: "Home", href: "/home-3" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Resources", href: "#resources" },
];

export default function Home3Page() {
  return (
    <div className={inter.className} style={{ background: H3.bg, color: H3.ink }}>
      {/* ── Nav ── */}
      <nav
        style={{
          position: "relative",
          height: 90,
          display: "flex",
          alignItems: "center",
          background: H3.bg,
        }}
      >
        <div
          className="h3-shell"
          style={{
            width: "100%",
            maxWidth: 1240,
            margin: "0 auto",
            padding: "0 40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Link href="/home-3" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <img src="/home3/logo-mark.svg" alt="" width={28} height={28} />
            <span style={{ fontSize: 16, fontWeight: 700, color: H3.ink }}>
              FlatPurse<span style={{ fontWeight: 400 }}> Flow</span>
            </span>
          </Link>

          <div className="h3-nav-links" style={{ display: "flex", alignItems: "center", gap: 32 }}>
            {NAV_LINKS.map((l, i) => (
              <a
                key={l.label}
                href={l.href}
                style={{
                  fontSize: 16,
                  fontWeight: 500,
                  color: i === 0 ? "#000" : H3.navMuted,
                  textDecoration: "none",
                }}
              >
                {l.label}
              </a>
            ))}
          </div>

          <Link
            href="/login"
            className="h3-account-btn"
            style={{
              position: "relative",
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              background: H3.purple,
              color: "#fff",
              fontSize: 15,
              padding: "10px 20px",
              borderRadius: 100,
              textDecoration: "none",
            }}
          >
            <img
              src="/home3/btn-glow.svg"
              alt=""
              style={{
                position: "absolute",
                top: -14,
                left: "50%",
                transform: "translateX(-50%)",
                width: "148%",
                pointerEvents: "none",
              }}
            />
            <img src="/home3/lock-icon.svg" alt="" width={18} height={18} style={{ position: "relative" }} />
            <span style={{ position: "relative" }}>Account</span>
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ padding: "0 20px" }}>
        <div
          className="h3-hero"
          style={{
            position: "relative",
            maxWidth: 1830,
            margin: "0 auto",
            borderRadius: 20,
            overflow: "hidden",
            background: H3.bg,
            padding: "80px 40px 0",
          }}
        >
          <div style={{ position: "absolute", inset: 0 }}>
            <Image
              src="/home3/hero-bg.png"
              alt=""
              fill
              style={{ objectFit: "cover", objectPosition: "center top" }}
              priority
            />
          </div>
          <img
            src="/home3/bg-blob.svg"
            alt=""
            className="h3-bg-blob"
            style={{
              position: "absolute",
              left: "50%",
              top: "-38%",
              width: "152%",
              maxWidth: "none",
              transform: "translateX(-50%)",
              pointerEvents: "none",
            }}
          />

          <div style={{ position: "relative", maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
            <div
              className="h3-hero-chip"
              style={{
                display: "inline-flex",
                alignItems: "center",
                background: "rgba(255,255,255,0.48)",
                borderRadius: 29,
                padding: "10px 22px",
                marginBottom: 28,
              }}
            >
              <span style={{ fontSize: 15, fontWeight: 600, color: "rgba(52,16,107,0.9)" }}>
                Booking, Billing &amp; Revenue Autopilot
              </span>
            </div>

            <h1
              className="h3-hero-h1"
              style={{
                fontSize: "clamp(34px, 5vw, 64px)",
                fontWeight: 600,
                lineHeight: 1.1,
                letterSpacing: "-0.01em",
                color: H3.heading,
                margin: "0 0 24px",
              }}
            >
              The booking <br className="h3-br-mobile" />
              platform,
              <br className="h3-br-desktop" /> built to <br className="h3-br-mobile" />
              fill every chair.
            </h1>

            <p
              style={{
                fontSize: "clamp(16px, 1.8vw, 22px)",
                lineHeight: 1.6,
                color: H3.body,
                maxWidth: 680,
                margin: "0 auto 36px",
              }}
            >
              Booking, reminders, no-shows, and rebooking, all handled automatically, so your calendar stays full and fast.
            </p>

            <Link href="/signup" className="h3-cta-btn">
              <svg viewBox="0 0 24 24" className="h3-cta-sparkle">
                <path d="M10,21.236,6.755,14.745.264,11.5,6.755,8.255,10,1.764l3.245,6.491L19.736,11.5l-6.491,3.245ZM18,21l1.5,3L21,21l3-1.5L21,18l-1.5-3L18,18l-3,1.5ZM19.333,4.667,20.5,7l1.167-2.333L24,3.5,21.667,2.333,20.5,0,19.333,2.333,17,3.5Z" />
              </svg>
              <span className="h3-cta-text">Start Free Trial</span>
            </Link>
          </div>

          <div
            className="h3-screenshot-wrap"
            style={{
              position: "relative",
              width: "70.6%",
              margin: "56px auto -20%",
              aspectRatio: "2790 / 1584",
            }}
          >
            <div
              className="h3-screenshot-clip"
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: 15,
                overflow: "hidden",
                border: "10px solid rgba(155,133,220,0.14)",
              }}
            >
              <Image
                src="/home3/app-screenshot.png"
                alt="FlatPurse Flow dashboard"
                fill
                sizes="(max-width: 900px) 100vw, 70vw"
                style={{ objectFit: "cover", objectPosition: "top" }}
              />
            </div>

            <span
              className="h3-float-tag"
              style={{
                position: "absolute",
                left: "90.8%",
                top: "13.1%",
                borderRadius: 25,
                padding: "12px 22px",
                fontSize: 13,
                fontWeight: 600,
                color: "rgba(52,16,107,0.9)",
                whiteSpace: "nowrap",
              }}
            >
              Built by salon owners, for salon owners.
            </span>

            <span
              className="h3-float-tag"
              style={{
                position: "absolute",
                left: "-13.1%",
                top: "38%",
                borderRadius: 25,
                padding: "12px 22px",
                fontSize: 13,
                fontWeight: 600,
                color: "rgba(52,16,107,0.9)",
                whiteSpace: "nowrap",
              }}
            >
              No contracts. No per-booking fees. Cancel anytime
            </span>
          </div>
        </div>
      </section>

      {/* ── Everything below copied verbatim from /home-main (post-hero) ── */}

      {/* ── Value section ── */}
      <section className="h3-value-section" style={{
        background: "#f8f4ff",
        padding: "100px 155px 120px",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        textAlign: "left",
      }}>
        <ScrollReveal delay={0} style={{ alignSelf: "center" }}>
          <AutoPilotChip theme="light" words={["Your", "shop", "never", "sleeps."]} />
        </ScrollReveal>

        <ScrollReveal delay={80} style={{ width: "100%", display: "flex", justifyContent: "center" }}>
          <ScrollFillText />
        </ScrollReveal>

        <ScrollZoom>
          <FeatureTabs />
        </ScrollZoom>

        <FoundationsGrid />

        <div style={{ position: "absolute", bottom: 0, left: 0, width: "100%", zIndex: 10, pointerEvents: "none" }}>
          <img src="/ffdoe.svg" alt="" style={{ width: "100%", display: "block", filter: "brightness(0.04)" }} />
        </div>

      </section>

      <TestimonialsSection />

      <ChangelogSection />

      <TestimonialsGrid />

      <PricingSection />

      <IntegrationsGrid />

      <Footer />
    </div>
  );
}
