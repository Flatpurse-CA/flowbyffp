import { ArrowRight, MessageCircle, CalendarCheck, ShieldAlert, Banknote, RefreshCw } from "lucide-react";
import Link from "next/link";

const BRAND_PURPLE = "#712AE2";
const BORDER = "1px solid rgba(113,42,226,0.12)";

const FEATURES = [
  {
    icon: <CalendarCheck size={22} strokeWidth={1.5} />,
    iconColor: "#2563eb",
    iconBg: "rgba(37,99,235,0.08)",
    iconHoverBg: "rgba(37,99,235,0.16)",
    title: "Online Booking",
    description: "Your shop gets a live booking page clients can access anytime, from any device, no calls needed.",
  },
  {
    icon: <RefreshCw size={22} strokeWidth={1.5} />,
    iconColor: "#7c3aed",
    iconBg: "rgba(124,58,237,0.08)",
    iconHoverBg: "rgba(124,58,237,0.16)",
    title: "AutoPilot Engine",
    description: "Six always-on AI flows working in the background, filling slots, sending reminders, and recovering revenue.",
  },
  {
    icon: <MessageCircle size={22} strokeWidth={1.5} />,
    iconColor: "#059669",
    iconBg: "rgba(5,150,105,0.08)",
    iconHoverBg: "rgba(5,150,105,0.16)",
    title: "AI Front Desk",
    description: "AutoPilot answers client messages, books appointments, and only escalates to you when it truly needs a human.",
  },
  {
    icon: <ShieldAlert size={22} strokeWidth={1.5} />,
    iconColor: "#d97706",
    iconBg: "rgba(217,119,6,0.08)",
    iconHoverBg: "rgba(217,119,6,0.16)",
    title: "Revenue Intelligence",
    description: "See exactly what you earned, what you lost, and what AutoPilot recovered, all in one clean dashboard.",
  },
  {
    icon: <Banknote size={22} strokeWidth={1.5} />,
    iconColor: "#db2777",
    iconBg: "rgba(219,39,119,0.08)",
    iconHoverBg: "rgba(219,39,119,0.16)",
    title: "Payments, Zero Commission",
    description: "Collect deposits, tips, and full payments in-app through Stripe. You keep every dollar, no cuts, no fees beyond processing.",
  },
];

export default function FoundationsGrid() {
  return (
    <>
      <style>{`
        @keyframes iconPing {
          0%   { transform: scale(1);   opacity: 0.6; }
          100% { transform: scale(2);   opacity: 0; }
        }
        .fg-cell {
          transition: background 0.3s ease, transform 0.3s cubic-bezier(0.16,1,0.3,1);
        }
        .fg-cell:hover {
          background: rgba(113,42,226,0.04);
          transform: translateY(-4px);
        }
        .fg-cell:hover .fg-icon {
          background: rgba(113,42,226,0.14);
          transform: scale(1.08);
        }
        .fg-cell:hover .fg-icon::after {
          animation: iconPing 0.75s cubic-bezier(0, 0, 0.2, 1) forwards;
        }
        .fg-cell:hover .fg-title {
          color: ${BRAND_PURPLE};
        }
        .fg-icon {
          position: relative;
          transition: background 0.3s ease, transform 0.3s cubic-bezier(0.16,1,0.3,1);
        }
        .fg-icon::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 8px;
          border: 1.5px solid rgba(113,42,226,0.5);
          opacity: 0;
          pointer-events: none;
        }
        .fg-title {
          transition: color 0.25s ease;
        }
        @media (max-width: 900px) {
          .fg-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 640px) {
          .fg-grid { grid-template-columns: 1fr !important; }
          .fg-grid > div { padding: 32px 24px !important; min-height: auto !important; }
        }
      `}</style>

      <div className="fg-grid" style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: 12,
        marginTop: 64,
        width: "100%",
      }}>

        {/* Slot 0 — heading: no border, lighter bg */}
        <div style={{
          padding: "44px 40px",
          border: "none",
          borderRadius: 0,
          background: "rgba(255,255,255,0.55)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          minHeight: 260,
          boxSizing: "border-box",
        }}>
          <div>
            <h2 style={{
              fontSize: "clamp(20px, 1.9vw, 26px)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.18,
              color: BRAND_PURPLE,
              margin: "0 0 14px",
            }}>
              Built for shops that refuse to lose money.
            </h2>
            <p style={{
              fontSize: 13.5,
              color: "rgba(0,0,0,0.45)",
              lineHeight: 1.75,
              margin: 0,
            }}>
              The core of smart booking, automated recovery, and real-time client intelligence, all powered by FlatPurse Flow's AutoPilot engine.
            </p>
          </div>
          <Link href="#" style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            fontWeight: 600,
            color: BRAND_PURPLE,
            textDecoration: "none",
            marginTop: 24,
          }}>
            See AutoPilot in action <ArrowRight size={13} />
          </Link>
        </div>

        {/* Slots 1–5 — feature cells */}
        {FEATURES.map((f, i) => (
          <div key={i} className="fg-cell" style={{
            padding: "44px 40px",
            borderTop: i < 2 ? "none" : BORDER,
            borderRight: i === 1 || i === 4 ? "none" : BORDER,
            borderBottom: i === 2 || i === 3 || i === 4 ? "none" : BORDER,
            borderLeft: i === 2 ? "none" : BORDER,
            borderRadius: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            minHeight: 260,
            boxSizing: "border-box",
          }}>
            <div className="fg-icon" style={{
              width: 44,
              height: 44,
              borderRadius: 8,
              background: f.iconBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: f.iconColor,
            }}>
              <span style={{ color: f.iconColor, display: "flex" }}>{f.icon}</span>
            </div>
            <div>
              <h3 className="fg-title" style={{
                fontSize: 15,
                fontWeight: 700,
                color: "#0a0a0a",
                letterSpacing: "-0.025em",
                margin: "0 0 8px",
              }}>
                {f.title}
              </h3>
              <p style={{
                fontSize: 13,
                color: "rgba(0,0,0,0.48)",
                lineHeight: 1.7,
                margin: 0,
              }}>
                {f.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
