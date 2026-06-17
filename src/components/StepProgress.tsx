"use client";

import { useRouter } from "next/navigation";

export function StepProgress({
  step,
  total = 4,
  backHref,
  title,
}: {
  step: number;
  total?: number;
  backHref?: string;
  title?: string;
}) {
  const router = useRouter();
  const easing = "cubic-bezier(0.16, 1, 0.3, 1)";

  return (
    <div>
      {/* Pill + line indicator */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 28,
          animation: `0.5s ${easing} 0ms 1 normal both running fp-fade-up`,
        }}
      >
        {Array.from({ length: total }).map((_, i) => {
          const isCompleted = i < step - 1;
          const isCurrent = i === step - 1;
          const isLast = i === total - 1;
          const lineColor = isCompleted ? "rgb(107,99,232)" : "rgba(255,255,255,0.1)";

          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div
                  style={{
                    width: isCompleted || isCurrent ? 22 : 8,
                    height: 8,
                    borderRadius: 100,
                    background:
                      isCompleted || isCurrent ? "rgb(107,99,232)" : "rgba(255,255,255,0.1)",
                    transition: "all 0.3s",
                    boxShadow: isCurrent ? "0 0 10px rgb(107,99,232)" : "none",
                  }}
                />
              </div>
              {!isLast && (
                <div style={{ width: 20, height: 1, background: lineColor }} />
              )}
            </div>
          );
        })}
        <span style={{ color: "rgb(113,113,122)", fontSize: 12, marginLeft: 4 }}>
          Step {step} of {total}
        </span>
      </div>

      {/* Title + Back on same row */}
      {title && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 8,
            animation: `0.5s ${easing} 30ms 1 normal both running fp-fade-up`,
          }}
        >
          <h1
            style={{
              color: "rgb(250,250,250)",
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: "-0.025em",
              margin: 0,
            }}
          >
            {title}
          </h1>
          {backHref && (
            <button
              type="button"
              onClick={() => router.push(backHref)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "none",
                border: "1px solid rgb(39,39,42)",
                borderRadius: 8,
                padding: "7px 14px",
                color: "rgb(113,113,122)",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M19 12H5M12 5l-7 7 7 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Back
            </button>
          )}
        </div>
      )}
    </div>
  );
}
