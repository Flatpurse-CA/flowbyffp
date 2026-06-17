"use client";

import { useRouter } from "next/navigation";

export function StepProgress({
  step,
  total = 4,
  backHref,
  onBack,
  title,
}: {
  step: number;
  total?: number;
  backHref?: string;
  onBack?: () => void;
  title?: string;
}) {
  const router = useRouter();
  const easing = "cubic-bezier(0.16, 1, 0.3, 1)";
  const handleBack = onBack ?? (backHref ? () => router.push(backHref) : undefined);

  return (
    <div>
      {/* Pill + line indicator + back button — all on one row */}
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
                    background: isCompleted || isCurrent ? "rgb(107,99,232)" : "rgba(255,255,255,0.1)",
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

        <span style={{ color: "rgb(113,113,122)", fontSize: 12, marginLeft: 4, flex: 1 }}>
          Step {step} of {total}
        </span>

        {handleBack && (
          <button
            type="button"
            onClick={handleBack}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              background: "none",
              border: "1px solid rgb(39,39,42)",
              borderRadius: 8,
              padding: "5px 12px",
              color: "rgb(113,113,122)",
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back
          </button>
        )}
      </div>

      {/* Title row (only if title provided) */}
      {title && (
        <div
          style={{
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
        </div>
      )}
    </div>
  );
}
