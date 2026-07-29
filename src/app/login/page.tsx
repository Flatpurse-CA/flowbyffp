"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { AuthImagePanel } from "@/components/AuthImagePanel";
import { FlatPurseLogo } from "@/components/FlatPurseLogo";
import { SubmitButton } from "@/components/SubmitButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { loginWithPassword } from "./actions";

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
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--auth-bg)", position: "relative" }}>
      {/* Mobile purple gradient — only visible on small screens in dark mode (CSS controls this) */}
      <div className="auth-mobile-gradient" />

      {/* Logo — mobile only, matches the signup page's mobile logo */}
      <div className="absolute left-5 z-10 lg:hidden" style={{ top: "calc(max(env(safe-area-inset-top, 0px), 44px) + 20px)" }}>
        <FlatPurseLogo className="h-6 w-auto" />
      </div>

      {/* Theme toggle — padded below the iOS status bar/notch now that the page renders full-bleed */}
      <div className="absolute right-5 z-10" style={{ top: "calc(max(env(safe-area-inset-top, 0px), 44px) + 20px)" }}>
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

          <form action={loginWithPassword} style={{ display: "flex", flexDirection: "column", animation: fadeUp(80) }}>
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

            <SubmitButton style={primaryBtnStyle} pendingText="Signing in…">
              Sign in
            </SubmitButton>
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
