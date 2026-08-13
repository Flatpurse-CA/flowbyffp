import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CircleUserRound } from "lucide-react";
import AutoPilotChip from "@/components/AutoPilotChip";
import HeroHeading from "@/components/HeroHeading";
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

const BRAND_PURPLE = "#712AE2";

export default function HomeMainPage() {
  return (
    <div style={{ background: "#0a0a0a", color: "rgb(250,250,250)" }}>

      {/* ── Hero block (nav + hero share the purple bg) ── */}
      <div style={{
        background: "#712AE2",
        position: "relative",
        paddingTop: 0,
        overflow: "visible",
        minHeight: "100vh",
      }}>

        {/* Nav */}
        <nav style={{
          height: 83,
          paddingTop: 15,
          position: "relative",
          background: "#712AE2",
          zIndex: 50,
          width: "100%",
          boxSizing: "border-box",
        }}>
          <div style={{
            width: "100%",
            padding: "0 155px",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "relative",
            boxSizing: "border-box",
          }}>
            {/* Logo */}
            <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none", flexShrink: 0 }}>
              <Image src="/group-starter.svg" alt="FlatPurse Flow" width={130} height={37} priority />
            </Link>

            {/* Center nav links */}
            <div style={{ display: "flex", alignItems: "center", gap: 2, position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
              {["Features", "Pricing", "Resources", "Offers"].map((item) => (
                <a
                  key={item}
                  href={item === "Features" ? "#features" : item === "Pricing" ? "#pricing" : "#"}
                  className="nav-link"
                  style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, padding: "8px 16px", textDecoration: "none", whiteSpace: "nowrap" }}
                >
                  {item}
                </a>
              ))}
            </div>

            {/* Right — CTA + user icon */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
              <Link href="/signup" className="cssbuttons-io">
                <span>
                  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 0h24v24H0z" fill="none" />
                    <path d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z" fill="currentColor" />
                  </svg>
                  Get started
                </span>
              </Link>
              <Link href="/login" style={{
                width: 42, height: 42,
                display: "flex", alignItems: "center", justifyContent: "center",
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: 10,
                textDecoration: "none",
                flexShrink: 0,
              }}>
                <CircleUserRound size={20} color="rgba(255,255,255,0.85)" />
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero content — two containers */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          alignItems: "stretch",
          minHeight: "calc(100vh - 83px)",
        }}>

          {/* Left container — text */}
          <div style={{
            padding: "96px 64px 96px 155px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
          }}>
            <AutoPilotChip />

            <HeroHeading />

            <p style={{
              fontSize: 17, color: "rgba(255,255,255,0.7)",
              lineHeight: 1.75, maxWidth: 460, margin: "0 0 44px",
            }}>
              FlatPurse Flow handles your bookings, fills your empty slots, and wins back lost clients automatically, while you focus on the work.
            </p>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link href="/signup" style={{
                background: "#fff", color: BRAND_PURPLE,
                fontSize: 15, fontWeight: 700,
                padding: "14px 28px", borderRadius: 10, textDecoration: "none",
                display: "inline-flex", alignItems: "center", gap: 8,
              }}>
                Get started free <ArrowRight size={15} />
              </Link>
              <Link href="#features" style={{
                background: "rgba(255,255,255,0.1)", color: "#fff",
                border: "1px solid rgba(255,255,255,0.2)",
                fontSize: 15, padding: "14px 28px", borderRadius: 10, textDecoration: "none",
              }}>
                See how it works
              </Link>
            </div>
          </div>

          {/* Right container — image */}
          <div style={{
            overflow: "hidden",
            height: "calc(100vh - 83px)",
            background: "#712AE2",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            paddingTop: 100,
          }}>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
              <Image
                src="/heror.png"
                alt="FlatPurse Flow app"
                width={650}
                height={930}
                style={{ marginBottom: -160 }}
                priority
              />
            </div>
          </div>

        </div>

        {/* Hero bottom divider */}
        <div style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          zIndex: 10,
          pointerEvents: "none",
        }}>
          <img
            src="/ffdoe.svg"
            alt=""
            style={{ width: "100%", display: "block" }}
          />
        </div>
      </div>

      {/* ── Value section ── */}
      <section style={{
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
