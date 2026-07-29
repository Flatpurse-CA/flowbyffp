"use client";

import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { Eye, EyeOff, Shield } from "lucide-react";
import { AuthImagePanel } from "@/components/AuthImagePanel";
import { adminLogin } from "./actions";

const easing = "cubic-bezier(0.16, 1, 0.3, 1)";
const fadeUp = (delay: number) =>
  `0.5s ${easing} ${delay}ms 1 normal both running fp-fade-up`;

function Form() {
  const searchParams   = useSearchParams();
  const error          = searchParams.get("error");
  const [show, setShow] = useState(false);

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--auth-bg)", position: "relative" }}>
      <div className="auth-mobile-gradient" />

      <AuthImagePanel />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 32px",
          position: "relative",
          zIndex: 1,
        }}
        className="w-full lg:w-1/2"
      >
        <div
          style={{
            width: "100%",
            maxWidth: 400,
            animation: `0.42s ${easing} 0s 1 normal both running fp-slide-in-r`,
          }}
        >
          {/* Admin badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 20,
              padding: "5px 11px",
              borderRadius: 20,
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.22)",
              animation: fadeUp(0),
            }}
          >
            <Shield size={11} color="rgb(239,68,68)" />
            <span style={{ fontSize: 11, fontWeight: 700, color: "rgb(239,68,68)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Admin Access
            </span>
          </div>

          <h1
            style={{
              color: "var(--auth-text)",
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: "-0.025em",
              margin: 0,
              animation: fadeUp(30),
            }}
          >
            Sign in
          </h1>
          <p
            style={{
              color: "var(--auth-text-sub)",
              fontSize: 14,
              marginBottom: 32,
              marginTop: 6,
              lineHeight: 1.6,
              animation: fadeUp(60),
            }}
          >
            Restricted to authorized team members.
          </p>

          {error && (
            <p style={{ background: "rgb(70,10,10)", color: "rgb(252,165,165)", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 20, animation: fadeUp(80) }}>
              {decodeURIComponent(error)}
            </p>
          )}

          <form
            action={adminLogin}
            style={{ display: "flex", flexDirection: "column", animation: fadeUp(100) }}
          >
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

            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>Password</label>
              <div style={{ position: "relative" }}>
                <input
                  name="password"
                  type={show ? "text" : "password"}
                  required
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  style={{ ...inputStyle, paddingRight: 44 }}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShow(v => !v)}
                  style={{
                    position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    color: "var(--auth-text-sub)", display: "flex", alignItems: "center", padding: 4,
                  }}
                >
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" style={primaryBtnStyle}>
              Sign in to Admin
            </button>
          </form>
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
  fontFamily: "inherit",
};

export function AdminLoginForm() {
  return (
    <Suspense>
      <Form />
    </Suspense>
  );
}
