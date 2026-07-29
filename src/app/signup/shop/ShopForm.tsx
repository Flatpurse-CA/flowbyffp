"use client";

import { useState } from "react";
import { StepProgress } from "@/components/StepProgress";
import { setupShop } from "./actions";

const BUSINESS_TYPES = [
  "Barbershop", "Hair Salon", "Nail Studio",
  "Lash Studio", "Brow Bar", "Spa/Wellness",
  "Beauty Studio", "Multi-service",
];

const PROVINCES = [
  "Alberta", "British Columbia", "Manitoba", "New Brunswick",
  "Newfoundland and Labrador", "Nova Scotia", "Ontario",
  "Prince Edward Island", "Quebec", "Saskatchewan",
];

const COUNTRIES = [
  "Canada", "United States", "United Kingdom", "Australia",
  "Nigeria", "Ghana", "Kenya", "South Africa",
  "France", "Germany", "Netherlands", "Sweden",
  "UAE", "India", "Jamaica", "Trinidad and Tobago",
  "Other",
];

const easing = "cubic-bezier(0.16, 1, 0.3, 1)";
const fadeUp = (delay: number) =>
  `0.5s ${easing} ${delay}ms 1 normal both running fp-fade-up`;

const labelStyle: React.CSSProperties = {
  display: "block",
  color: "var(--auth-text-sub)",
  fontSize: 12,
  fontWeight: 500,
  marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--auth-input-bg)",
  border: "1px solid var(--auth-input-border)",
  borderRadius: 8,
  padding: "11px 12px",
  color: "var(--auth-text)",
  // 16px minimum — anything smaller makes iOS Safari zoom the whole page in on focus
  fontSize: 16,
  outline: "none",
  transition: "border-color 0.15s",
  boxSizing: "border-box",
};

export function ShopForm({ error }: { error?: string }) {
  const [businessType, setBusinessType] = useState("");

  return (
    <div style={{ width: "100%", maxWidth: 480 }}>
      <StepProgress step={2} backHref="/signup" title="Set Up Your Shop" />

      <p style={{ color: "var(--auth-text-sub)", fontSize: 13, marginBottom: 22, lineHeight: 1.6, marginTop: 6, animation: fadeUp(40) }}>
        Tell us a bit about your business.
      </p>

      {error && (
        <p style={{ background: "rgb(70,10,10)", color: "rgb(252,165,165)", borderRadius: 8, padding: "9px 12px", fontSize: 13, marginBottom: 16 }}>
          {error}
        </p>
      )}

      <form action={setupShop} style={{ display: "flex", flexDirection: "column", gap: 14, paddingBottom: 90 }}>

        {/* Shop Name */}
        <div style={{ animation: fadeUp(60) }}>
          <label style={labelStyle}>Shop Name</label>
          <input name="name" required placeholder="eg. Compound Cut Club" style={inputStyle} />
        </div>

        {/* Business Type */}
        <div style={{ animation: fadeUp(80) }}>
          <label style={labelStyle}>Business Type</label>
          <input type="hidden" name="businessType" value={businessType} />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {BUSINESS_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setBusinessType(type)}
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  border: "1px solid",
                  borderColor: businessType === type ? "rgb(107,99,232)" : "var(--auth-input-border)",
                  background: businessType === type ? "rgba(107,99,232,0.12)" : "transparent",
                  color: businessType === type ? "rgb(196,181,253)" : "var(--auth-text-sub)",
                  transition: "all 0.15s",
                }}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Street Address */}
        <div style={{ animation: fadeUp(100) }}>
          <label style={labelStyle}>Street Address</label>
          <input name="streetAddress" required placeholder="eg. 123 Main St, Unit 4" style={inputStyle} />
        </div>

        {/* City / Province */}
        <div style={{ display: "flex", gap: 10, animation: fadeUp(120) }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>City</label>
            <input name="city" required placeholder="eg. Edmonton" style={inputStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Province / State</label>
            <input name="province" placeholder="eg. Ontario" style={inputStyle} />
          </div>
        </div>

        {/* Postal Code / Country */}
        <div style={{ display: "flex", gap: 10, animation: fadeUp(140) }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Postal / ZIP Code</label>
            <input name="postalCode" required placeholder="eg. M5V 2T6" style={inputStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Country</label>
            <select
              name="country"
              required
              defaultValue=""
              style={{ ...inputStyle, appearance: "none" }}
            >
              <option value="" disabled>Select...</option>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* CTA — fixed to the bottom of the viewport so it's always reachable
            without scrolling, like a native app's action bar */}
        <div
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 20,
            display: "flex",
            justifyContent: "center",
            padding: "16px 16px calc(env(safe-area-inset-bottom, 16px) + 16px)",
            background: "linear-gradient(180deg, transparent 0%, var(--auth-bg) 45%)",
          }}
        >
          <button
            type="submit"
            style={{
              width: "100%",
              maxWidth: 480,
              background: "var(--auth-btn-bg)",
              color: "var(--auth-btn-text)",
              border: "none",
              borderRadius: 10,
              padding: "13px 0",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              boxShadow: "0 8px 28px rgba(0,0,0,0.25)",
            }}
          >
            Next Step <ArrowRight />
          </button>
        </div>
      </form>
    </div>
  );
}

function ArrowRight() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
