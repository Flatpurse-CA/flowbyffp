"use client";

const LINES = ["Book More.", "Lose Nothing.", "Keep Every Dollar."];

export default function HeroHeading() {
  return (
    <>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(56px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
      <h1 style={{
        fontSize: "clamp(42px, 5.5vw, 68px)",
        fontWeight: 800,
        letterSpacing: "-0.04em",
        lineHeight: 1.06,
        color: "#fff",
        margin: "0 0 24px",
      }}>
        {LINES.map((line, i) => (
          <span key={i} style={{ display: "block", overflow: "hidden" }}>
            <span style={{
              display: "block",
              animation: `slideUp 1.1s cubic-bezier(0.16,1,0.3,1) both`,
              animationDelay: `${0.1 + i * 0.2}s`,
            }}>
              {line}
            </span>
          </span>
        ))}
      </h1>
    </>
  );
}
