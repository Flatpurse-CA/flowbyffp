import { Inter } from "next/font/google";
import Image from "next/image";
import AutoPilotChip from "@/components/AutoPilotChip";
import LandingNav from "@/components/LandingNav";
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
import GradientWaves from "@/components/GradientWaves";
import { EXTRA_FAQS } from "./extraFaqs";
import { AudienceProvider, HeroAudienceToggle, HeroCopy, PageSwitch, Home5Main, Home5FooterRow } from "./Home5Landing";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-inter" });

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

// home-3, unchanged, with home-4's content added in home-3's style:
// Home5Main after the feature grid, home-4's missing FAQs appended to home-3's FAQ, and
// Home5FooterRow inside the footer.
export default function Home5Page() {
  return (
    <AudienceProvider>
    {/* --font-inter lets home-4's Clients page (rendered by PageSwitch) use Inter too */}
    <div className={inter.variable}>
    <PageSwitch owners={
    <div className={inter.className} style={{ background: H3.bg, color: H3.ink }}>
      {/* ── Nav ── */}
      <LandingNav active="home" />

      {/* ── Hero ── */}
      <section className="h5-hero-section" style={{ padding: "0 20px", position: "relative" }}>
        <div
          className="h3-hero h5-fiber-hero"
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
          {/* Animated wave background (React Bits GradientWaves) in place of hero-bg.png + blob */}
          <div style={{ position: "absolute", inset: 0 }}>
            <GradientWaves
              horizonColor="#5227FF"
              waveColor="#FF9FFC"
              crestColor="#FFFFFF"
              speed={0.4}
              amplitude={2.5}
              waveScale={0.6}
              waveRatio={0.9}
              swell={35}
              turbulence={20}
              tilt={1.11}
              zoom={1.0}
              height={5.5}
              fogDepth={15}
              detail="medium"
              brightness={1.0}
              opacity={1.0}
              mouseInteraction={true}
              parallaxStrength={0.5}
              grain={true}
              grainIntensity={0.05}
            />
          </div>

          <div style={{ position: "relative", maxWidth: 1120, margin: "0 auto", textAlign: "center" }}>
            <HeroAudienceToggle />

            <HeroCopy />
          </div>

          <div
            className="h3-screenshot-wrap"
            style={{
              position: "relative",
              width: "70.6%",
              margin: "56px auto -8%",
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

        {/* Hero bottom divider, recolored to blend into the Value section below (nudged down on home-5) */}
        <div className="h5-hero-divider" style={{ position: "absolute", bottom: 0, left: 0, width: "100%", zIndex: 10, pointerEvents: "none" }}>
          <div className="ff-divider-value" />
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
          <FeatureTabs fitViewport />
        </ScrollZoom>

        <FoundationsGrid />

        {/* ── Added from home-4 ── */}
        <Home5Main />

        <div style={{ position: "absolute", bottom: 0, left: 0, width: "100%", zIndex: 10, pointerEvents: "none" }}>
          <img src="/ffdoe.svg" alt="" style={{ width: "100%", display: "block", filter: "brightness(0.04)" }} />
        </div>

      </section>

      <TestimonialsSection />

      <ChangelogSection />

      <TestimonialsGrid />

      <PricingSection />

      <IntegrationsGrid extraFaqs={EXTRA_FAQS} />

      <Footer>
        <Home5FooterRow />
      </Footer>
    </div>
    } />
    </div>
    </AudienceProvider>
  );
}
