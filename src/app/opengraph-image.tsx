import { ImageResponse } from "next/og";

export const alt = "FlatPurse Flow — Booking, Billing & Revenue Autopilot";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#712AE2",
          backgroundImage:
            "radial-gradient(120% 130% at 15% 0%, rgba(255,255,255,0.16) 0%, transparent 55%)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            fontSize: 68,
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: "-0.02em",
          }}
        >
          FlatPurse Flow
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 24,
            fontSize: 30,
            color: "rgba(255,255,255,0.82)",
            letterSpacing: "-0.01em",
          }}
        >
          Booking, Billing &amp; Revenue Autopilot
        </div>
      </div>
    ),
    { ...size }
  );
}
