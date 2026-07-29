"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { AuthImagePanel } from "@/components/AuthImagePanel";
import { ThemeToggle } from "@/components/ThemeToggle";
import { loginWithMagicLink, loginWithPassword } from "./actions";

const easing = "cubic-bezier(0.16, 1, 0.3, 1)";
const fadeUp = (delay: number) =>
  `0.5s ${easing} ${delay}ms 1 normal both running fp-fade-up`;

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const sent = searchParams.get("sent");
  const [mode, setMode] = useState<"default" | "magic-link">("default");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--auth-bg)", position: "relative" }}>
      {/* Mobile purple gradient — only visible on small screens in dark mode (CSS controls this) */}
      <div className="auth-mobile-gradient" />

      {/* Theme toggle — padded below the iOS status bar/notch now that the page renders full-bleed */}
      <div className="absolute right-5 z-10" style={{ top: "calc(env(safe-area-inset-top, 20px) + 20px)" }}>
        <ThemeToggle />
      </div>

      <AuthImagePanel />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "0 32px", position: "relative", zIndex: 1 }}
        className="w-full lg:w-1/2"
      >
        <div
          style={{
            width: "100%",
            maxWidth: 400,
            animation: `0.42s ${easing} 0s 1 normal both running fp-slide-in-r`,
          }}
        >

          {mode === "magic-link" ? (
            /* ── Magic Link mode ── */
            <>
              <button
                type="button"
                onClick={() => setMode("default")}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  background: "none", border: "none", cursor: "pointer",
                  color: "var(--auth-text-sub)", fontSize: 13, padding: 0, marginBottom: 28,
                  animation: fadeUp(0),
                }}
              >
                <ArrowLeft size={14} /> Back
              </button>

              <h1 style={{
                color: "var(--auth-text)", fontSize: 26, fontWeight: 700,
                letterSpacing: "-0.025em", margin: 0, animation: fadeUp(30),
              }}>
                Magic Link
              </h1>
              <p style={{
                color: "var(--auth-text-sub)", fontSize: 14, marginBottom: 32,
                marginTop: 6, lineHeight: 1.6, animation: fadeUp(60),
              }}>
                Enter your email and we&apos;ll send you a sign-in link.
              </p>

              {error && (
                <p style={{ background: "rgb(70,10,10)", color: "rgb(252,165,165)", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 20 }}>
                  {error}
                </p>
              )}
              {sent && (
                <p style={{ background: "rgb(20,20,23)", color: "rgb(212,212,216)", border: "1px solid rgb(39,39,42)", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 20 }}>
                  Link sent to <strong style={{ color: "rgb(250,250,250)" }}>{sent}</strong> — check your inbox.
                </p>
              )}

              <form action={loginWithMagicLink} style={{ display: "flex", flexDirection: "column", gap: 14, animation: fadeUp(100) }}>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    autoComplete="email"
                    style={inputStyle}
                  />
                </div>
                <button type="submit" style={primaryBtnStyle}>
                  Send Magic Link
                </button>
              </form>
            </>
          ) : (
            /* ── Default mode ── */
            <>
              <h1 style={{
                color: "var(--auth-text)", fontSize: 26, fontWeight: 700,
                letterSpacing: "-0.025em", margin: 0, animation: fadeUp(30),
              }}>
                Welcome back
              </h1>
              <p style={{
                color: "var(--auth-text-sub)", fontSize: 14, marginBottom: 32,
                marginTop: 6, lineHeight: 1.6, animation: fadeUp(60),
              }}>
                Sign in to continue to your dashboard.
              </p>

              {error && (
                <p style={{ background: "rgb(70,10,10)", color: "rgb(252,165,165)", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 20 }}>
                  {error}
                </p>
              )}

              {/* Magic Link */}
              <div style={{ animation: fadeUp(80) }}>
                <button
                  type="button"
                  onClick={() => setMode("magic-link")}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
                    gap: 7, background: "transparent", border: "1px solid var(--auth-input-border)",
                    borderRadius: 10, padding: "12px 10px", color: "var(--auth-text)",
                    fontSize: 13, fontWeight: 500, cursor: "pointer",
                  }}
                >
                  <MagicLinkIcon /> Magic Link
                </button>
              </div>

              {/* Or divider */}
              <div style={{
                display: "flex", alignItems: "center", gap: 12, margin: "24px 0",
                animation: fadeUp(140),
              }}>
                <div style={{ flex: 1, height: 1, background: "var(--auth-input-border)" }} />
                <span style={{ color: "var(--auth-text-sub)", fontSize: 13 }}>Or</span>
                <div style={{ flex: 1, height: 1, background: "var(--auth-input-border)" }} />
              </div>

              {/* Email + password form */}
              <form action={loginWithPassword} style={{ display: "flex", flexDirection: "column", animation: fadeUp(170) }}>
                <div style={{ marginBottom: 18 }}>
                  <label style={labelStyle}>Email</label>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    autoComplete="email"
                    style={inputStyle}
                  />
                </div>

                <div style={{ marginBottom: 8 }}>
                  <label style={labelStyle}>Password</label>
                  <div style={{ position: "relative" }}>
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      style={{ ...inputStyle, paddingRight: 44 }}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword((v) => !v)}
                      style={{
                        position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                        background: "none", border: "none", cursor: "pointer",
                        color: "var(--auth-text-sub)", display: "flex", alignItems: "center", padding: 4,
                      }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div style={{ textAlign: "right", marginBottom: 20 }}>
                  <Link href="/forgot-password" style={{ fontSize: 12, color: "var(--auth-text-sub)", textDecoration: "none" }}>
                    Forgot password?
                  </Link>
                </div>

                <button type="submit" style={primaryBtnStyle}>
                  Sign in
                </button>
              </form>

              <p style={{
                color: "var(--auth-text-sub)", fontSize: 13, textAlign: "center",
                marginTop: 20, animation: fadeUp(260),
              }}>
                Don&apos;t have an account?{" "}
                <Link href="/signup" style={{ color: "rgb(107,99,232)", fontWeight: 600, textDecoration: "none" }}>
                  Sign up
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  color: "var(--auth-text-sub)",
  fontSize: 13,
  fontWeight: 500,
  marginBottom: 8,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--auth-input-bg)",
  border: "1px solid var(--auth-input-border)",
  borderRadius: 10,
  padding: "13px 14px",
  color: "var(--auth-text)",
  // 16px minimum — anything smaller makes iOS Safari zoom the page in on focus
  fontSize: 16,
  outline: "none",
  transition: "border-color 0.15s",
  boxSizing: "border-box",
};

const primaryBtnStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--auth-btn-bg)",
  color: "var(--auth-btn-text)",
  border: "none",
  borderRadius: 12,
  padding: 14,
  fontSize: 15,
  fontWeight: 600,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
};

function MagicLinkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 4V2m0 18v-2M8 12H2m18 0h-2M5.636 5.636l1.414 1.414m9.9 9.9 1.414 1.414M5.636 18.364l1.414-1.414M18.364 5.636l-1.414 1.414" />
      <circle cx="15" cy="12" r="3" />
    </svg>
  );
}
