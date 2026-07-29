"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AuthImagePanel } from "@/components/AuthImagePanel";
import { ThemeToggle } from "@/components/ThemeToggle";
import { requestPasswordReset } from "../login/actions";

const easing = "cubic-bezier(0.16, 1, 0.3, 1)";
const fadeUp = (delay: number) =>
  `0.5s ${easing} ${delay}ms 1 normal both running fp-fade-up`;

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await requestPasswordReset(email);
    setLoading(false);
    setSent(true);
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--auth-bg)", position: "relative" }}>
      <div className="auth-mobile-gradient" />
      <div className="absolute right-5 z-10 lg:hidden" style={{ top: "calc(max(env(safe-area-inset-top, 0px), 44px) + 20px)" }}>
        <ThemeToggle />
      </div>

      <AuthImagePanel />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "0 32px", position: "relative", zIndex: 1 }}
        className="w-full lg:w-1/2"
      >
        <div style={{ width: "100%", maxWidth: 400, animation: `0.42s ${easing} 0s 1 normal both running fp-slide-in-r` }}>
          <Link href="/login" style={{
            display: "flex", alignItems: "center", gap: 6,
            color: "var(--auth-text-sub)", fontSize: 13, textDecoration: "none", marginBottom: 28,
            animation: fadeUp(0),
          }}>
            <ArrowLeft size={14} /> Back to sign in
          </Link>

          {sent ? (
            <>
              <h1 style={{ color: "var(--auth-text)", fontSize: 26, fontWeight: 700, letterSpacing: "-0.025em", margin: 0, animation: fadeUp(30) }}>
                Check your email
              </h1>
              <p style={{ color: "var(--auth-text-sub)", fontSize: 14, marginTop: 6, lineHeight: 1.6, animation: fadeUp(60) }}>
                If an account exists for <strong style={{ color: "var(--auth-text)" }}>{email}</strong>, we&apos;ve sent a link to reset your password.
              </p>
            </>
          ) : (
            <>
              <h1 style={{ color: "var(--auth-text)", fontSize: 26, fontWeight: 700, letterSpacing: "-0.025em", margin: 0, animation: fadeUp(30) }}>
                Reset your password
              </h1>
              <p style={{ color: "var(--auth-text-sub)", fontSize: 14, marginBottom: 32, marginTop: 6, lineHeight: 1.6, animation: fadeUp(60) }}>
                Enter your email and we&apos;ll send you a link to set a new one.
              </p>

              <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 18, animation: fadeUp(100) }}>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    style={inputStyle}
                  />
                </div>
                <button type="submit" disabled={loading} style={{ ...primaryBtnStyle, opacity: loading ? 0.6 : 1, cursor: loading ? "default" : "pointer" }}>
                  {loading ? "Sending…" : "Send reset link"}
                </button>
              </form>
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
};
