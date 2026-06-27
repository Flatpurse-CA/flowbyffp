"use client";

import { useRef } from "react";
import { Sparkles } from "lucide-react";

const DEFAULT_WORDS = ["Track", "More", "Bookings"];

export default function AutoPilotChip({ theme = "dark", words = DEFAULT_WORDS }: { theme?: "dark" | "light"; words?: string[] }) {
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const isLight = theme === "light";

  const handleMouseEnter = () => {
    wordRefs.current.forEach((w, i) => {
      if (!w) return;

      // fly out upward
      w.style.transition = "transform 0.25s ease, opacity 0.25s ease";
      w.style.transitionDelay = `${i * 45}ms`;
      w.style.transform = "translateY(-18px)";
      w.style.opacity = "0";

      // after flying out, reset from below and bounce back in
      const bounceIn = () => {
        w.style.transition = "none";
        w.style.transitionDelay = "0ms";
        w.style.transform = "translateY(18px)";

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            w.style.transition =
              "transform 0.4s cubic-bezier(0.34,1.56,0.64,1), opacity 0.35s ease";
            w.style.transitionDelay = `${i * 55}ms`;
            w.style.transform = "translateY(0px)";
            w.style.opacity = "1";
          });
        });

        w.removeEventListener("transitionend", bounceIn);
      };

      w.addEventListener("transitionend", bounceIn);
    });
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 9,
        background: isLight ? "rgba(113,42,226,0.08)" : "rgba(250,219,229,0.07)",
        border: isLight ? "0.5px solid rgba(113,42,226,0.22)" : "0.5px solid rgba(250,219,229,0.22)",
        borderRadius: 7,
        padding: "10px 15px",
        cursor: "pointer",
        userSelect: "none",
        marginBottom: 32,
      }}
    >
      <Sparkles size={14} color={isLight ? "#712AE2" : "rgb(216,200,255)"} style={{ flexShrink: 0 }} />

      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
        <span style={{
          fontSize: 12.5,
          fontWeight: 500,
          color: isLight ? "#712AE2" : "rgb(216,200,255)",
          letterSpacing: "0.01em",
          whiteSpace: "nowrap",
        }}>
          Auto Pilot
        </span>
        <span style={{ fontSize: 11.5, color: isLight ? "rgba(113,42,226,0.3)" : "rgba(250,219,229,0.25)" }}>·</span>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          {words.map((word, i) => (
            <span
              key={word}
              ref={(el) => { wordRefs.current[i] = el; }}
              style={{
                display: "inline-block",
                fontSize: 11.5,
                color: isLight ? "rgba(113,42,226,0.7)" : "#fff",
                whiteSpace: "nowrap",
              }}
            >
              {word}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
