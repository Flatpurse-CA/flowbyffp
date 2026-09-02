"use client";

import { ArrowRight } from "lucide-react";
import AutoPilotChip from "@/components/AutoPilotChip";
import ScrollZoom from "@/components/ScrollZoom";

const BRAND_PURPLE = "#712AE2";

const ITEMS = [
  {
    title: "Zero commission, always",
    description: "Every other platform takes a cut of your revenue. FlatPurse Flow never does. What you earn is yours, every single time.",
  },
  {
    title: "AI that actually works while you sleep",
    description: "AutoPilot fills your slots, answers your DMs, and wins back lapsed clients overnight, without you touching your phone.",
  },
  {
    title: "Built for independent shops, not enterprises",
    description: "No complicated setup, no bloated features you will never use. FlatPurse Flow is designed specifically for owner-operated salons and barbershops.",
  },
  {
    title: "One link does everything",
    description: "Your booking page, your payments, your client management, all living on one shareable link your clients can use from anywhere, anytime.",
  },
];

export default function ChangelogSection() {
  return (
    <section className="cl-section" style={{ background: "#000", padding: "100px 155px 120px" }}>
      <style>{`
        @keyframes sweepLine {
          0%   { transform: translateX(-101%); }
          40%  { transform: translateX(0%); }
          60%  { transform: translateX(0%); }
          100% { transform: translateX(101%); }
        }
        .cl-fill {
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          background: ${BRAND_PURPLE};
          animation: sweepLine 2.8s ease-in-out infinite;
        }
        .cl-col:nth-child(1) .cl-fill { animation-delay: 0s; }
        .cl-col:nth-child(2) .cl-fill { animation-delay: 0.3s; }
        .cl-col:nth-child(3) .cl-fill { animation-delay: 0.6s; }
        .cl-col:nth-child(4) .cl-fill { animation-delay: 0.9s; }
        @media (max-width: 900px) {
          .cl-section { padding: 60px 24px 80px !important; }
          .cl-header-row { flex-direction: column !important; align-items: flex-start !important; gap: 20px !important; }
          .cl-grid { grid-template-columns: 1fr 1fr !important; gap: 32px 24px !important; }
          .cl-col { padding-right: 0 !important; }
        }
        @media (max-width: 560px) {
          .cl-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Header row */}
      <div className="cl-header-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 64 }}>
        <div>
          <AutoPilotChip theme="dark" words={["Why", "FlatPurse", "Flow"]} />

          <h2 style={{
            fontSize: "clamp(32px, 4vw, 54px)",
            fontWeight: 800,
            letterSpacing: "-0.04em",
            lineHeight: 1.08,
            color: "#fff",
            margin: 0,
          }}>
            Why shop owners choose<br />
            FlatPurse Flow.
          </h2>
        </div>

        <a href="#" style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: 14,
          fontWeight: 500,
          color: "rgba(255,255,255,0.55)",
          textDecoration: "none",
          whiteSpace: "nowrap",
          transition: "color 0.2s",
        }}
          onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
          onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}
        >
          See all features <ArrowRight size={14} />
        </a>
      </div>

      {/* Timeline + items */}
      <div className="cl-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0 }}>
        {ITEMS.map((item, i) => (
          <div key={i} className="cl-col" style={{ paddingRight: i < 3 ? 40 : 0 }}>
            {/* Dot + line */}
            <div style={{ display: "flex", alignItems: "center", marginBottom: 28 }}>
              <div style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: BRAND_PURPLE,
                flexShrink: 0,
                zIndex: 1,
              }} />
              {/* Line with purple fill overlay */}
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)", position: "relative", overflow: "hidden" }}>
                <div className="cl-fill" />
              </div>
            </div>

            {/* Content */}
            <h3 style={{
              fontSize: 15,
              fontWeight: 700,
              color: "#fff",
              letterSpacing: "-0.025em",
              margin: "0 0 10px",
            }}>
              {item.title}
            </h3>
            <p style={{
              fontSize: 13.5,
              color: "rgba(255,255,255,0.45)",
              lineHeight: 1.65,
              margin: 0,
            }}>
              {item.description}
            </p>
          </div>
        ))}
      </div>

      {/* Video box */}
      <div style={{ marginTop: 80 }} />
      <ScrollZoom minScale={0.82}>
        <div style={{ position: "relative", borderRadius: 10, overflow: "hidden", aspectRatio: "16/9", border: "1px solid rgba(255,255,255,0.08)" }}>
          <iframe
            src="https://drive.google.com/file/d/16kEw9y92fjrpefWpY39HA_DjDehmx9oU/preview"
            style={{ width: "100%", height: "100%", border: "none", display: "block" }}
            allow="autoplay"
            allowFullScreen
          />
        </div>
      </ScrollZoom>
    </section>
  );
}
