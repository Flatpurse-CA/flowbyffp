"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Scissors,
  Users,
  Zap,
  RefreshCw,
  Smartphone,
  MessageCircle,
  Gift,
  Sparkles,
  Palette,
  Droplets,
  Baby,
  ArrowRight,
  Check,
} from "lucide-react";
import { StepProgress } from "@/components/StepProgress";
import { checkHandleAvailability } from "./actions";

const easing = "cubic-bezier(0.16,1,0.3,1)";
const ACCENT = "rgb(109,40,217)";

// ─── Primitives ───────────────────────────────────────────────────────────────

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      onClick={() => onChange(!on)}
      role="switch"
      aria-checked={on}
      style={{
        width: 46,
        height: 26,
        borderRadius: 13,
        background: on ? ACCENT : "rgba(255,255,255,0.12)",
        position: "relative",
        cursor: "pointer",
        transition: "background 0.22s",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: 20,
          height: 20,
          borderRadius: 10,
          background: "white",
          position: "absolute",
          top: 3,
          left: on ? 23 : 3,
          transition: `left 0.22s ${easing}`,
          boxShadow: "0 1px 4px rgba(0,0,0,0.35)",
        }}
      />
    </div>
  );
}


// ─── Data ─────────────────────────────────────────────────────────────────────

type LucideIcon = React.ComponentType<{ size?: number; strokeWidth?: number; color?: string }>;

type Service = { id: string; name: string; price: number };

const SUGGESTIONS = [
  "Signature Cut", "Cut + Beard", "Kids Cut",
  "Hot Towel Shave", "Colour / Balayage", "Treatment / Mask",
  "Blowout", "Braids", "Locs Retwist",
];

const FLOWS: { id: string; Icon: LucideIcon; title: string; sub: string; recommended: boolean; on: boolean }[] = [
  { id: "noshow",    Icon: RefreshCw,      title: "No-show recovery",        sub: "Rebooks cancelled slots with a tap",     recommended: true,  on: true  },
  { id: "react",     Icon: Smartphone,     title: "30-day reactivation",     sub: "Wins back lapsed clients automatically", recommended: true,  on: true  },
  { id: "filler",    Icon: Zap,            title: "Last-minute slot filler", sub: "Fills same-day gaps from your waitlist", recommended: false, on: true  },
  { id: "frontdesk", Icon: MessageCircle,  title: "AI Front Desk",           sub: "Answers DMs and books 24/7",            recommended: false, on: false },
  { id: "birthday",  Icon: Gift,           title: "Birthday campaign",       sub: "Auto-sends birthday offers",            recommended: false, on: true  },
];

const MEMBER_COLORS = [ACCENT, "#DB2777", "#16A34A", "#0891B2", "#D97706"];

// ─── Step 1: Booking Link ─────────────────────────────────────────────────────

function BookingLinkStep({
  handle,
  onHandleChange,
  available,
  reason,
  checking,
  onCheck,
}: {
  handle: string;
  onHandleChange: (v: string) => void;
  available: boolean | null;
  reason: string | null;
  checking: boolean;
  onCheck: () => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h2 style={{ color: "white", fontSize: 28, fontWeight: 800, margin: "0 0 8px", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
          Create your booking link
        </h2>
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 15, margin: 0, lineHeight: 1.6 }}>
          Clients tap this to book with you instantly.
        </p>
      </div>

      {/* Preview */}
      <div
        style={{
          padding: "18px 20px",
          borderRadius: 16,
          background: "linear-gradient(135deg, rgb(16,12,48), rgb(26,16,68))",
          border: "1px solid rgba(139,92,246,0.22)",
        }}
      >
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, fontWeight: 700, letterSpacing: "1.2px", margin: "0 0 8px", textTransform: "uppercase" }}>
          Your Booking Link
        </p>
        <p style={{ color: "white", fontSize: 18, fontWeight: 700, margin: "0 0 6px" }}>
          flow.app/<span style={{ color: "rgb(167,139,250)" }}>{handle || "yourhandle"}</span>
        </p>
        <p style={{ color: "rgba(255,255,255,0.28)", fontSize: 12, margin: 0 }}>
          Share on Instagram · SMS · Email signature
        </p>
      </div>

      {/* Handle input */}
      <div>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 600, margin: "0 0 8px" }}>
          Choose your handle
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              background: "rgba(255,255,255,0.04)",
              border: available === true
                ? "1.5px solid rgb(52,211,153)"
                : available === false
                ? "1.5px solid rgb(248,113,113)"
                : "1.5px solid rgba(255,255,255,0.1)",
              borderRadius: 12,
              overflow: "hidden",
              transition: "border-color 0.2s",
            }}
          >
            <span style={{ padding: "13px 4px 13px 14px", fontSize: 13.5, color: "rgba(255,255,255,0.28)" }}>flow.app/</span>
            <input
              value={handle}
              onChange={(e) => onHandleChange(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
              placeholder="yourhandle"
              style={{ flex: 1, padding: "13px 14px 13px 2px", background: "none", border: "none", outline: "none", color: "white", fontSize: 15, fontWeight: 700 }}
            />
          </div>
          <button
            onClick={onCheck}
            disabled={checking || handle.length < 3}
            style={{
              padding: "0 18px", borderRadius: 12, background: ACCENT, border: "none", color: "white",
              fontSize: 13, fontWeight: 700, flexShrink: 0,
              cursor: checking || handle.length < 3 ? "default" : "pointer",
              opacity: checking || handle.length < 3 ? 0.6 : 1,
            }}
          >
            {checking ? "Checking…" : "Check"}
          </button>
        </div>

        {available === true && (
          <p style={{ color: "rgb(52,211,153)", fontSize: 12, fontWeight: 600, margin: "7px 0 0", display: "flex", alignItems: "center", gap: 6 }}>
            <Check size={13} strokeWidth={2.5} color="rgb(52,211,153)" /> Available — this link is yours!
          </p>
        )}
        {available === false && (
          <p style={{ color: "rgb(248,113,113)", fontSize: 12, fontWeight: 600, margin: "7px 0 0" }}>
            {reason ?? "That handle is taken. Try another."}
          </p>
        )}
      </div>

      {/* What clients see */}
      <div style={{ padding: "16px 18px", borderRadius: 14, background: "rgba(109,40,217,0.08)", border: "1px solid rgba(139,92,246,0.16)" }}>
        <p style={{ color: "rgba(167,139,250,0.75)", fontSize: 10, fontWeight: 700, letterSpacing: "1.1px", margin: "0 0 12px", textTransform: "uppercase" }}>
          What clients will see
        </p>
        {[
          "Your shop name, photos & reviews",
          "Service menu with prices",
          "Available barbers & times",
          "Secure Stripe payment at booking",
        ].map((item) => (
          <div key={item} style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}>
            <Check size={13} strokeWidth={2.5} color="rgb(139,92,246)" />
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Step 2: Services ─────────────────────────────────────────────────────────

function ServicesStep({
  services,
  onAdd,
  onRemove,
  onPriceChange,
}: {
  services: Service[];
  onAdd: (name: string, price: number) => void;
  onRemove: (id: string) => void;
  onPriceChange: (id: string, price: number) => void;
}) {
  const [name, setName]   = useState("");
  const [price, setPrice] = useState("50");

  const handleAdd = (overrideName?: string) => {
    const n = (overrideName ?? name).trim();
    if (!n) return;
    onAdd(n, Number(price) || 0);
    if (!overrideName) { setName(""); setPrice("50"); }
  };

  const visibleSuggestions = SUGGESTIONS.filter(
    (s) => !services.find((sv) => sv.name.toLowerCase() === s.toLowerCase())
  );

  const avg = services.length
    ? Math.round(services.reduce((a, s) => a + s.price, 0) / services.length)
    : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div>
        <h2 style={{ color: "white", fontSize: 28, fontWeight: 800, margin: "0 0 8px", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
          Services & prices
        </h2>
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 15, margin: 0 }}>
          Add the services you offer with their prices.
        </p>
      </div>

      {/* Add row */}
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Service name…"
          style={{
            flex: 1,
            padding: "13px 15px",
            borderRadius: 12,
            border: "1.5px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.04)",
            outline: "none",
            fontSize: 14,
            color: "white",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "rgba(255,255,255,0.04)",
            border: "1.5px solid rgba(255,255,255,0.1)",
            borderRadius: 12,
            overflow: "hidden",
            flexShrink: 0,
            width: 90,
          }}
        >
          <span style={{ padding: "13px 4px 13px 12px", fontSize: 14, color: "rgba(255,255,255,0.35)" }}>$</span>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            style={{ flex: 1, padding: "13px 10px 13px 2px", background: "none", border: "none", outline: "none", color: "white", fontSize: 14, fontWeight: 700, width: "100%" }}
          />
        </div>
        <button
          onClick={() => handleAdd()}
          disabled={!name.trim()}
          style={{
            padding: "0 18px",
            borderRadius: 12,
            background: name.trim() ? ACCENT : "rgba(109,40,217,0.3)",
            border: "none",
            color: "white",
            fontSize: 14,
            fontWeight: 700,
            cursor: name.trim() ? "pointer" : "not-allowed",
            flexShrink: 0,
            opacity: name.trim() ? 1 : 0.55,
            transition: "all 0.2s",
          }}
        >
          Add
        </button>
      </div>

      {/* Added services list */}
      {services.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {services.map((svc) => (
            <div
              key={svc.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 14px",
                borderRadius: 13,
                background: "rgba(109,40,217,0.08)",
                border: "1.5px solid rgba(139,92,246,0.2)",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: "rgba(109,40,217,0.18)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Scissors size={14} strokeWidth={1.8} color="rgb(167,139,250)" />
              </div>
              <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: "rgb(250,250,250)" }}>
                {svc.name}
              </span>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
                <span style={{ padding: "5px 3px 5px 8px", fontSize: 13, color: "rgba(255,255,255,0.4)" }}>$</span>
                <input
                  type="number"
                  value={svc.price}
                  onChange={(e) => onPriceChange(svc.id, Number(e.target.value))}
                  style={{ width: 50, padding: "5px 8px 5px 2px", background: "none", border: "none", outline: "none", color: "white", fontSize: 14, fontWeight: 700 }}
                />
              </div>
              <button
                onClick={() => onRemove(svc.id)}
                style={{ background: "none", border: "none", color: "rgba(255,255,255,0.25)", cursor: "pointer", fontSize: 19, padding: "0 2px", lineHeight: 1 }}
              >
                ×
              </button>
            </div>
          ))}

          {/* Summary */}
          <div
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              background: "rgba(52,211,153,0.07)",
              border: "1px solid rgba(52,211,153,0.18)",
            }}
          >
            <p style={{ color: "rgb(52,211,153)", fontSize: 12.5, fontWeight: 700, margin: 0 }}>
              {services.length} service{services.length > 1 ? "s" : ""} added · avg ${avg} per booking
            </p>
          </div>
        </div>
      )}

      {/* Quick-add suggestions */}
      {visibleSuggestions.length > 0 && (
        <div>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, fontWeight: 600, margin: "0 0 9px", letterSpacing: "0.04em", textTransform: "uppercase" }}>
            Quick add
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {visibleSuggestions.map((s) => (
              <button
                key={s}
                onClick={() => { onAdd(s, Number(price) || 50); }}
                style={{
                  padding: "7px 13px",
                  borderRadius: 20,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.55)",
                  fontSize: 12.5,
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                + {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Step 3: Team ─────────────────────────────────────────────────────────────

function TeamStep({
  members,
  onAdd,
  onRemove,
}: {
  members: { name: string; role: string; color: string }[];
  onAdd: (name: string) => void;
  onRemove: (i: number) => void;
}) {
  const [input, setInput] = useState("");

  const handleAdd = () => {
    const t = input.trim();
    if (!t) return;
    onAdd(t);
    setInput("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <h2 style={{ color: "white", fontSize: 28, fontWeight: 800, margin: "0 0 8px", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
          Add your team
        </h2>
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 15, margin: 0 }}>
          Clients can choose who they book with.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {members.map((m, i) => {
          const initials = m.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 14px",
                borderRadius: 14,
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 19,
                  background: m.color,
                  color: "white",
                  fontSize: 13,
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {initials}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ color: "rgb(250,250,250)", fontSize: 14, fontWeight: 700, margin: 0 }}>{m.name}</p>
                <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, margin: "2px 0 0" }}>{m.role}</p>
              </div>
              {i > 0 && (
                <button onClick={() => onRemove(i)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.22)", cursor: "pointer", fontSize: 20, padding: "0 4px", lineHeight: 1 }}>
                  ×
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Add team member name…"
          style={{
            flex: 1,
            padding: "13px 15px",
            borderRadius: 12,
            border: "1.5px dashed rgba(139,92,246,0.3)",
            background: "rgba(255,255,255,0.025)",
            outline: "none",
            fontSize: 14,
            color: "white",
          }}
        />
        <button
          onClick={handleAdd}
          style={{ padding: "13px 18px", borderRadius: 12, background: ACCENT, border: "none", color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}
        >
          Add
        </button>
      </div>

      <div style={{ padding: "13px 16px", borderRadius: 12, background: "rgba(109,40,217,0.08)", border: "1px solid rgba(139,92,246,0.15)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5 }}>
          <Users size={13} strokeWidth={2} color="rgb(167,139,250)" />
          <p style={{ color: "rgb(167,139,250)", fontSize: 12, fontWeight: 700, margin: 0 }}>AutoPilot will track</p>
        </div>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, margin: 0, lineHeight: 1.65 }}>
          Rebooking rates · Revenue per stylist · Upsell performance · Schedule optimisation
        </p>
      </div>
    </div>
  );
}

// ─── Step 4: AutoPilot ────────────────────────────────────────────────────────

function AutoPilotStep({
  flows,
  onToggle,
}: {
  flows: typeof FLOWS;
  onToggle: (id: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <h2 style={{ color: "white", fontSize: 28, fontWeight: 800, margin: "0 0 8px", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
          Activate AutoPilot
        </h2>
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 15, margin: 0 }}>
          Choose which flows run automatically for you.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {flows.map(({ id, Icon, title, sub, recommended, on }) => (
          <div
            key={id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "14px 16px",
              borderRadius: 14,
              background: on ? "rgba(109,40,217,0.09)" : "rgba(255,255,255,0.025)",
              border: on ? "1.5px solid rgba(139,92,246,0.25)" : "1.5px solid rgba(255,255,255,0.07)",
              transition: "all 0.2s",
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 11,
                background: on ? "rgba(109,40,217,0.2)" : "rgba(255,255,255,0.06)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "background 0.2s",
              }}
            >
              <Icon size={17} strokeWidth={1.8} color={on ? "rgb(167,139,250)" : "rgba(255,255,255,0.35)"} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                <span style={{ color: "rgb(250,250,250)", fontSize: 14, fontWeight: 700 }}>{title}</span>
                {recommended && (
                  <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 20, background: "rgba(245,158,11,0.13)", color: "rgb(251,191,36)", letterSpacing: "0.03em" }}>
                    Recommended
                  </span>
                )}
              </div>
              <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, margin: 0 }}>{sub}</p>
            </div>
            <Toggle on={on} onChange={() => onToggle(id)} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Complete screen ──────────────────────────────────────────────────────────

function CompleteScreen({
  displayName,
  handle,
  serviceCount,
  teamCount,
  flowCount,
  onDashboard,
}: {
  displayName: string;
  handle: string;
  serviceCount: number;
  teamCount: number;
  flowCount: number;
  onDashboard: () => void;
}) {
  const summary = [
    { label: "Booking link", value: `flow.app/${handle}`                                  },
    { label: "Services",      value: `${serviceCount} added`                              },
    { label: "Team",          value: `${teamCount} member${teamCount !== 1 ? "s" : ""}`   },
    { label: "AutoPilot",     value: `${flowCount} flow${flowCount !== 1 ? "s" : ""} active` },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, textAlign: "center" }}>
      <div
        style={{
          width: 68,
          height: 68,
          borderRadius: 34,
          background: "linear-gradient(135deg, rgb(22,197,94), rgb(15,128,60))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 8px 32px rgba(34,197,94,0.32)",
          animation: `fp-success-pop 0.55s ${easing} both`,
        }}
      >
        <Check size={28} strokeWidth={2.8} color="white" />
      </div>

      <div style={{ animation: `fp-fade-up 0.4s ${easing} 0.25s both` }}>
        <h1 style={{ color: "white", fontSize: 30, fontWeight: 800, margin: "0 0 8px", letterSpacing: "-0.03em" }}>
          You&apos;re all set, {displayName}!
        </h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 15, margin: 0, lineHeight: 1.6 }}>
          Your shop is live and AutoPilot is running.
        </p>
      </div>

      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 7, animation: `fp-fade-up 0.4s ${easing} 0.4s both` }}>
        {summary.map(({ label, value }) => (
          <div
            key={label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "13px 16px",
              borderRadius: 13,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              textAlign: "left",
            }}
          >
            <div style={{ flex: 1 }}>
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, fontWeight: 600, margin: "0 0 2px" }}>{label}</p>
              <p style={{ color: "rgb(250,250,250)", fontSize: 13, fontWeight: 700, margin: 0 }}>{value}</p>
            </div>
            <Check size={14} strokeWidth={2.5} color="rgb(52,211,153)" />
          </div>
        ))}
      </div>

      <button
        onClick={onDashboard}
        style={{
          width: "100%",
          padding: "15px 0",
          borderRadius: 14,
          background: ACCENT,
          border: "none",
          color: "white",
          fontSize: 15,
          fontWeight: 700,
          cursor: "pointer",
          boxShadow: "0 4px 24px rgba(109,40,217,0.35)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          animation: `fp-fade-up 0.4s ${easing} 0.6s both`,
        }}
      >
        Open your dashboard
        <ArrowRight size={16} strokeWidth={2.5} />
      </button>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export function OnboardingFlow({ displayName }: { displayName: string }) {
  const router = useRouter();

  const [step, setStep]                       = useState(1);
  const [handle, setHandle]                   = useState(displayName.toLowerCase().replace(/[^a-z0-9]/g, ""));
  const [handleAvailable, setHandleAvailable] = useState<boolean | null>(null);
  const [handleReason, setHandleReason]       = useState<string | null>(null);
  const [checkingHandle, setCheckingHandle]   = useState(false);
  const [services, setServices]               = useState<Service[]>([]);
  const [members, setMembers]                 = useState([{ name: displayName, role: "Owner", color: MEMBER_COLORS[0] }]);
  const [flows, setFlows]                     = useState(FLOWS);

  const checkHandle = async () => {
    setCheckingHandle(true);
    const result = await checkHandleAvailability(handle);
    setHandleAvailable(result.available);
    setHandleReason(result.reason ?? null);
    setCheckingHandle(false);
  };
  const addService       = (name: string, price: number) =>
    setServices((prev) => [...prev, { id: `${Date.now()}`, name, price }]);
  const removeService    = (id: string) =>
    setServices((prev) => prev.filter((s) => s.id !== id));
  const updateSvcPrice   = (id: string, price: number) =>
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, price } : s)));
  const addMember        = (name: string) =>
    setMembers((prev) => [...prev, { name, role: "Staff", color: MEMBER_COLORS[prev.length % MEMBER_COLORS.length] }]);
  const removeMember     = (i: number) =>
    setMembers((prev) => prev.filter((_, idx) => idx !== i));
  const toggleFlow       = (id: string) =>
    setFlows((prev) => prev.map((f) => (f.id === id ? { ...f, on: !f.on } : f)));

  const isContinueDisabled =
    (step === 1 && !handle) ||
    (step === 2 && services.length === 0) ||
    (step === 4 && flows.filter((f) => f.on).length === 0);

  const activeFlows = flows.filter((f) => f.on).length;
  const btnLabel    = step === 4 ? "Launch your flow" : "Continue";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "rgb(6,6,8)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        padding: "60px 24px",
      }}
    >
      {/* Radial glow */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: 700,
          height: 380,
          background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(80,60,200,0.13) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 480,
          animation: `fp-fade-up 0.5s ${easing} both`,
        }}
      >
        {/* Logo */}
        <div style={{ marginBottom: 32 }}>
          <Image src="/group-starter.svg" alt="FlatPurse Flow" width={130} height={37} style={{ objectFit: "contain" }} priority />
        </div>

        {/* Step indicator */}
        {step <= 4 && (
          <StepProgress
            step={step}
            total={4}
            onBack={step > 1 ? () => setStep((s) => s - 1) : undefined}
          />
        )}

        {/* Step content */}
        <div key={step} style={{ animation: `fp-fade-up 0.35s ${easing} both` }}>
          {step === 1 && (
            <BookingLinkStep
              handle={handle}
              onHandleChange={(v) => { setHandle(v); setHandleAvailable(null); setHandleReason(null); }}
              available={handleAvailable}
              reason={handleReason}
              checking={checkingHandle}
              onCheck={checkHandle}
            />
          )}
          {step === 2 && (
            <ServicesStep
              services={services}
              onAdd={addService}
              onRemove={removeService}
              onPriceChange={updateSvcPrice}
            />
          )}
          {step === 3 && (
            <TeamStep members={members} onAdd={addMember} onRemove={removeMember} />
          )}
          {step === 4 && (
            <AutoPilotStep flows={flows} onToggle={toggleFlow} />
          )}
          {step === 5 && (
            <CompleteScreen
              displayName={displayName}
              handle={handle}
              serviceCount={services.length}
              teamCount={members.length}
              flowCount={activeFlows}
              onDashboard={() => router.push("/dashboard")}
            />
          )}
        </div>

        {/* CTA */}
        {step <= 4 && (
          <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 12 }}>
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={isContinueDisabled}
              style={{
                width: "100%",
                padding: "15px 0",
                borderRadius: 14,
                background: isContinueDisabled ? "rgba(109,40,217,0.35)" : ACCENT,
                border: "none",
                color: "white",
                fontSize: 15,
                fontWeight: 700,
                cursor: isContinueDisabled ? "not-allowed" : "pointer",
                opacity: isContinueDisabled ? 0.6 : 1,
                boxShadow: isContinueDisabled ? "none" : "0 4px 24px rgba(109,40,217,0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "all 0.2s",
                letterSpacing: "-0.01em",
              }}
            >
              {btnLabel}
              <ArrowRight size={16} strokeWidth={2.5} />
            </button>

            {step < 4 && (
              <button
                onClick={() => setStep((s) => s + 1)}
                style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", fontSize: 13, cursor: "pointer", padding: "4px 0" }}
              >
                Skip for now
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
