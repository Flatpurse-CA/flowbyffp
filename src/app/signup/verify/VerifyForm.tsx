"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { verifyCode, resendCode } from "./actions";

function SuccessModal() {
  const circumference = 2 * Math.PI * 36;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backdropFilter: "blur(20px)",
        background: "rgba(0,0,0,0.75)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 28,
          animation: "fp-success-pop 0.5s cubic-bezier(0.16,1,0.3,1) both",
        }}
      >
        <svg width="96" height="96" viewBox="0 0 80 80" fill="none">
          <circle
            cx="40" cy="40" r="36"
            stroke="white"
            strokeWidth="2.5"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            strokeLinecap="round"
            style={{ animation: "fp-draw-circle 0.7s ease forwards" }}
          />
          <path
            d="M24 41l10 10 22-22"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="50"
            strokeDashoffset="50"
            style={{ animation: "fp-draw-check 0.4s ease 0.65s forwards reverse" }}
          />
        </svg>
        <div style={{ textAlign: "center" }}>
          <p
            style={{
              color: "white",
              fontSize: 26,
              fontWeight: 700,
              margin: 0,
              letterSpacing: "-0.02em",
              animation: "fp-fade-in 0.4s ease 0.8s both",
            }}
          >
            Verification Successful
          </p>
          <p
            style={{
              color: "rgba(255,255,255,0.45)",
              fontSize: 14,
              marginTop: 8,
              animation: "fp-fade-in 0.4s ease 1s both",
            }}
          >
            Setting up your workspace…
          </p>
        </div>
      </div>
    </div>
  );
}

export function VerifyForm({ email, initialError }: { email: string; initialError?: string }) {
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [focusedIdx, setFocusedIdx] = useState(0);
  const [error, setError] = useState(initialError);
  const [shake, setShake] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const router = useRouter();

  useEffect(() => {
    refs.current[0]?.focus();
    intervalRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(intervalRef.current!); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  }, []);

  const submit = (code: string) => {
    setError(undefined);
    // Demo bypass — type 123456 to preview the full success flow
    if (code === "123456") {
      setShowSuccess(true);
      setTimeout(() => router.push("/onboarding"), 2600);
      return;
    }
    startTransition(async () => {
      const result = await verifyCode(email, code);
      if (result.error) {
        setError(result.error);
        setDigits(["", "", "", "", "", ""]);
        setShake(true);
        setTimeout(() => setShake(false), 600);
        setTimeout(() => refs.current[0]?.focus(), 20);
      } else {
        setShowSuccess(true);
        setTimeout(() => router.push("/onboarding"), 2600);
      }
    });
  };

  const handleChange = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[idx] = val;
    setDigits(next);
    if (val && idx < 5) {
      refs.current[idx + 1]?.focus();
      setFocusedIdx(idx + 1);
    }
    if (val && next.every(Boolean)) submit(next.join(""));
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (digits[idx]) {
        const next = [...digits];
        next[idx] = "";
        setDigits(next);
      } else if (idx > 0) {
        const next = [...digits];
        next[idx - 1] = "";
        setDigits(next);
        refs.current[idx - 1]?.focus();
        setFocusedIdx(idx - 1);
      }
    } else if (e.key === "ArrowLeft" && idx > 0) {
      refs.current[idx - 1]?.focus();
    } else if (e.key === "ArrowRight" && idx < 5) {
      refs.current[idx + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = [...digits];
    pasted.split("").forEach((ch, i) => { next[i] = ch; });
    setDigits(next);
    const lastFilled = Math.min(pasted.length, 5);
    refs.current[lastFilled]?.focus();
    setFocusedIdx(lastFilled);
    if (pasted.length === 6) submit(pasted);
  };

  const handleResend = () => {
    if (countdown > 0 || isPending) return;
    startTransition(async () => {
      const result = await resendCode(email);
      if (result.error) { setError(result.error); return; }
      setCountdown(30);
      setDigits(["", "", "", "", "", ""]);
      refs.current[0]?.focus();
      intervalRef.current = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) { clearInterval(intervalRef.current!); return 0; }
          return c - 1;
        });
      }, 1000);
    });
  };

  const mm = String(Math.floor(countdown / 60)).padStart(2, "0");
  const ss = String(countdown % 60).padStart(2, "0");
  const allFilled = digits.every(Boolean);

  // Per-box SVG ring: box is 68×80, SVG extends 5px on each side → 78×90, rx=22
  const boxRingW = 78;
  const boxRingH = 90;
  const boxRingR = 22;
  const boxPerimeter = 2 * (boxRingW - 2 * boxRingR) + 2 * (boxRingH - 2 * boxRingR) + 2 * Math.PI * boxRingR;

  return (
    <>
      {showSuccess && <SuccessModal />}

      {/* Full-page dark background */}
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
          padding: "40px 16px",
        }}
      >
        {/* Radial glow at top */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: 600,
            height: 300,
            background:
              "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(80,60,200,0.12) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Content */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            textAlign: "center",
            animation: "fp-fade-up 0.5s cubic-bezier(0.16,1,0.3,1) both",
          }}
        >
          <h1
            style={{
              color: "white",
              fontSize: "clamp(28px, 5vw, 42px)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              margin: "0 0 14px",
              lineHeight: 1.1,
            }}
          >
            Enter verification code
          </h1>
          <p
            style={{
              color: "rgba(255,255,255,0.45)",
              fontSize: 15,
              margin: "0 0 52px",
              lineHeight: 1.5,
            }}
          >
            We sent a 6-digit code to{" "}
            <span style={{ color: "rgba(255,255,255,0.8)" }}>{email}</span>
          </p>

          {/* Digit boxes */}
          <div
            style={{
              display: "inline-flex",
              gap: 12,
              marginBottom: 48,
              animation: shake ? "fp-shake 0.5s ease both" : "none",
            }}
          >
            {digits.map((d, i) => {
              const isFocused = focusedIdx === i && !allFilled;
              const staggerDelay = `${i * 100}ms`;
              return (
                <div key={i} style={{ position: "relative" }}>
                  {/* Per-box purple ring */}
                  {allFilled && (
                    <svg
                      width={boxRingW}
                      height={boxRingH}
                      viewBox={`0 0 ${boxRingW} ${boxRingH}`}
                      style={{
                        position: "absolute",
                        top: -5,
                        left: -5,
                        pointerEvents: "none",
                        overflow: "visible",
                        animation: `fp-ring-pulse 1.8s ease-in-out ${staggerDelay} infinite`,
                      }}
                    >
                      {/* Glow blur layer */}
                      <rect
                        x={2} y={2}
                        width={boxRingW - 4} height={boxRingH - 4}
                        rx={boxRingR} ry={boxRingR}
                        fill="none"
                        stroke="rgba(167,139,250,0.35)"
                        strokeWidth={7}
                        strokeLinecap="round"
                        strokeDasharray={boxPerimeter}
                        strokeDashoffset={boxPerimeter}
                        style={{ animation: `fp-ring-draw 0.9s cubic-bezier(0.16,1,0.3,1) ${staggerDelay} forwards` }}
                      />
                      {/* Sharp ring */}
                      <rect
                        x={2} y={2}
                        width={boxRingW - 4} height={boxRingH - 4}
                        rx={boxRingR} ry={boxRingR}
                        fill="none"
                        stroke="rgba(139,92,246,0.95)"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeDasharray={boxPerimeter}
                        strokeDashoffset={boxPerimeter}
                        style={{ animation: `fp-ring-draw 0.9s cubic-bezier(0.16,1,0.3,1) ${staggerDelay} forwards` }}
                      />
                    </svg>
                  )}

                  <input
                    ref={(el) => { refs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={2}
                    value={d}
                    onChange={(e) => handleChange(i, e)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onFocus={() => setFocusedIdx(i)}
                    onBlur={() => setFocusedIdx(-1)}
                    onPaste={handlePaste}
                    disabled={isPending}
                    style={{
                      width: 68,
                      height: 80,
                      borderRadius: 18,
                      background: allFilled
                        ? "rgba(109,40,217,0.12)"
                        : isFocused
                        ? "rgba(255,255,255,0.09)"
                        : "rgba(255,255,255,0.05)",
                      border: allFilled
                        ? "1.5px solid rgba(139,92,246,0.5)"
                        : isFocused
                        ? "1.5px solid rgba(255,255,255,0.65)"
                        : "1.5px solid rgba(255,255,255,0.1)",
                      color: allFilled ? "rgb(196,181,253)" : "white",
                      fontSize: 36,
                      fontWeight: 700,
                      textAlign: "center",
                      outline: "none",
                      caretColor: "transparent",
                      boxShadow: isFocused
                        ? "0 0 0 3px rgba(255,255,255,0.07), 0 0 22px 6px rgba(255,255,255,0.22), 0 0 60px 14px rgba(255,255,255,0.07)"
                        : "none",
                      transition: "box-shadow 0.18s, border-color 0.3s, background 0.3s, color 0.3s",
                      cursor: "text",
                      display: "block",
                    }}
                  />
                </div>
              );
            })}
          </div>

          {error && (
            <p
              style={{
                color: "rgb(252,165,165)",
                fontSize: 13,
                marginBottom: 24,
                marginTop: -24,
              }}
            >
              {error}
            </p>
          )}

          {/* Resend */}
          <p
            style={{
              color: "rgba(255,255,255,0.45)",
              fontSize: 14,
              margin: "0 0 20px",
              fontWeight: 500,
            }}
          >
            {countdown > 0 ? (
              <>
                Resend code in{" "}
                <span style={{ color: "white", fontWeight: 700 }}>
                  {mm}:{ss}
                </span>
              </>
            ) : (
              <button
                onClick={handleResend}
                disabled={isPending}
                style={{
                  background: "none",
                  border: "none",
                  color: "white",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  padding: 0,
                  textDecoration: "underline",
                  textUnderlineOffset: 3,
                  opacity: isPending ? 0.5 : 1,
                }}
              >
                Resend code
              </button>
            )}
          </p>

          <button
            onClick={() => router.push("/login")}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.35)",
              fontSize: 13,
              cursor: "pointer",
              padding: 0,
            }}
          >
            Use another method
          </button>
        </div>
      </div>
    </>
  );
}
