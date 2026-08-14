"use client";

import { useState } from "react";

type MonthDatum = { label: string; year: number; count: number };

// Monthly counts are discrete, not continuous — a line/area chart implies
// interpolation between points that isn't real, and reads as a harsh
// sawtooth on sparse data (mostly zero months with one spike). A bar chart
// is the honest form here: each month is its own independent value.
export function MemberGrowthChart({ months }: { months: MonthDatum[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const chartMax = Math.max(...months.map(m => m.count), 1);
  const ticks = [chartMax, Math.round(chartMax * 0.75), Math.round(chartMax * 0.5), Math.round(chartMax * 0.25), 0];

  return (
    <div style={{ display: "flex", gap: 0, marginTop: 20 }}>
      {/* Y axis */}
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", paddingRight: 10, paddingBottom: 22, width: 30, flexShrink: 0 }}>
        {ticks.map((v, i) => (
          <span key={i} style={{ color: "var(--aw18)", fontSize: 10, lineHeight: 1 }}>{v}</span>
        ))}
      </div>

      {/* Chart + X axis */}
      <div style={{ flex: 1 }}>
        <div style={{ height: 200, position: "relative", borderLeft: "1px solid var(--aw06)", borderBottom: "1px solid var(--aw06)" }}>
          {[25, 50, 75].map(pct => (
            <div key={pct} style={{ position: "absolute", top: `${pct}%`, left: 0, right: 0, borderTop: "1px solid var(--aw04)" }} />
          ))}

          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "flex-end" }}>
            {months.map((m, i) => {
              const isHovered = hovered === i;
              const barHeightPct = (m.count / chartMax) * 100;
              return (
                // The slot (not just the bar) is the hit target — full column
                // width and height, so a zero-count month is still easy to
                // hover/focus and reachable by keyboard.
                <div
                  key={i}
                  tabIndex={0}
                  role="img"
                  aria-label={`${m.label} ${m.year}: ${m.count} member${m.count === 1 ? "" : "s"}`}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(i)}
                  onBlur={() => setHovered(null)}
                  style={{
                    flex: 1, height: "100%", position: "relative",
                    display: "flex", alignItems: "flex-end", justifyContent: "center",
                    cursor: "default", outline: "none",
                  }}
                >
                  {isHovered && (
                    <div style={{
                      position: "absolute", bottom: `calc(${barHeightPct}% + 10px)`, left: "50%", transform: "translateX(-50%)",
                      background: "var(--am2)", border: "1px solid var(--aw12)", borderRadius: 8,
                      padding: "6px 10px", whiteSpace: "nowrap", zIndex: 2,
                      boxShadow: "0 4px 16px rgba(0,0,0,0.35)",
                    }}>
                      <div style={{ color: "var(--atext2)", fontSize: 13, fontWeight: 800, lineHeight: 1.2 }}>
                        {m.count} member{m.count === 1 ? "" : "s"}
                      </div>
                      <div style={{ color: "var(--aw35)", fontSize: 10.5, lineHeight: 1.2 }}>{m.label} {m.year}</div>
                    </div>
                  )}
                  <div style={{
                    width: "min(24px, 60%)",
                    height: m.count === 0 ? 2 : `${Math.max(barHeightPct, 2)}%`,
                    borderRadius: m.count === 0 ? 1 : "4px 4px 0 0",
                    background: m.count === 0 ? "var(--aw08)" : (isHovered ? "rgb(167,139,250)" : "rgb(139,92,246)"),
                    transition: "background 0.12s, height 0.2s",
                  }} />
                </div>
              );
            })}
          </div>
        </div>

        {/* X axis labels */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
          {months.map((m, i) => (
            <span key={i} style={{ color: hovered === i ? "var(--aw5)" : "var(--aw2)", fontSize: 10, transition: "color 0.12s" }}>{m.label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
