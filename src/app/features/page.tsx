import { Inter } from "next/font/google";
import LandingNav from "@/components/LandingNav";
import FeatureTabs from "@/components/FeatureTabs";
import FoundationsGrid from "@/components/FoundationsSection";
import IntegrationsGrid from "@/components/IntegrationsGrid";
import ScrollReveal from "@/components/ScrollReveal";
import ScrollZoom from "@/components/ScrollZoom";
import AutoPilotChip from "@/components/AutoPilotChip";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata = {
  title: "Features | FlatPurse Flow",
  description:
    "Smart booking, no-show recovery, AI front desk, win-back automation, rebooking reminders, and zero-commission payments. Everything your shop needs to run itself.",
};

export default function FeaturesPage() {
  return (
    <div className={inter.className} style={{ background: "#ffffff", color: "#342448" }}>
      <LandingNav active="features" />

      {/* ── Page hero ── */}
      <section style={{ padding: "0 20px" }}>
        <div
          className="h3-hero"
          style={{
            position: "relative",
            maxWidth: 1830,
            margin: "0 auto",
            borderRadius: 20,
            overflow: "hidden",
            background: "#f8f4ff",
            padding: "90px 40px 90px",
          }}
        >
          <div style={{ position: "relative", maxWidth: 820, margin: "0 auto", textAlign: "center" }}>
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
              <span style={{ fontSize: 15, fontWeight: 600, color: "rgba(52,16,107,0.9)" }}>Features</span>
            </div>

            <h1
              style={{
                fontSize: "clamp(30px, 4.4vw, 58px)",
                fontWeight: 600,
                lineHeight: 1.1,
                letterSpacing: "-0.01em",
                color: "rgba(17,1,41,0.85)",
                margin: "0 0 24px",
              }}
            >
              Everything your shop needs,
              <br />
              running on AutoPilot.
            </h1>

            <p
              style={{
                fontSize: "clamp(16px, 1.8vw, 20px)",
                lineHeight: 1.6,
                color: "rgba(17,1,41,0.84)",
                maxWidth: 640,
                margin: "0 auto",
              }}
            >
              Six always-on flows handle bookings, reminders, no-shows, and payments, so your calendar
              stays full without you touching your phone.
            </p>
          </div>
        </div>
      </section>

      {/* ── Feature tabs + foundations ── */}
      <section
        className="h3-value-section"
        style={{
          background: "#f8f4ff",
          padding: "80px 155px 120px",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          textAlign: "left",
          marginTop: 20,
        }}
      >
        <ScrollReveal delay={0} style={{ alignSelf: "center" }}>
          <AutoPilotChip theme="light" words={["Your", "shop", "never", "sleeps."]} />
        </ScrollReveal>

        <ScrollZoom>
          <FeatureTabs />
        </ScrollZoom>

        <FoundationsGrid />
      </section>

      <IntegrationsGrid />

      <Footer />
    </div>
  );
}
