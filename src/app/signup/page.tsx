"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { AuthImagePanel } from "@/components/AuthImagePanel";
import { FlatPurseLogo } from "@/components/FlatPurseLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { createAccount } from "./actions";

const easing = "cubic-bezier(0.16, 1, 0.3, 1)";
const fadeUp = (delay: number) =>
  `0.5s ${easing} ${delay}ms 1 normal both running fp-fade-up`;

export default function SignupPage() {
  return (
    <Suspense>
      <SignupStep1 />
    </Suspense>
  );
}

function SignupStep1() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [showPassword, setShowPassword] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--auth-bg)", position: "relative" }}>
      {/* Mobile purple gradient */}
      <div className="auth-mobile-gradient" />

      {/* Logo — mobile only, padded below the iOS status bar/notch */}
      <div className="absolute left-5 z-10 lg:hidden" style={{ top: "calc(env(safe-area-inset-top, 20px) + 20px)" }}>
        <FlatPurseLogo className="h-6 w-auto" />
      </div>

      {/* Theme toggle */}
      <div className="absolute right-5 z-10" style={{ top: "calc(env(safe-area-inset-top, 20px) + 20px)" }}>
        <ThemeToggle />
      </div>

      <AuthImagePanel isExiting={isExiting} />

      <div
        className="flex w-full items-center justify-center px-8 lg:w-1/2"
        style={{
          position: "relative",
          zIndex: 1,
          transition: "transform 0.44s cubic-bezier(0.16,1,0.3,1)",
          transform: isExiting ? "scale(1.015)" : "scale(1)",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 400,
            animation: `0.42s ${easing} 0s 1 normal both running fp-slide-in-r`,
          }}
        >
          {/* Heading */}
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
            Create an Account
          </h1>

          {/* Subtitle */}
          <p
            style={{
              color: "rgb(113,113,122)",
              fontSize: 14,
              marginBottom: 32,
              marginTop: 6,
              lineHeight: 1.6,
              animation: fadeUp(60),
            }}
          >
            Enter your personal data to create your account.
          </p>

          {error && (
            <p className="mb-4 rounded-lg bg-red-950 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}

          <form action={createAccount} style={{ display: "flex", flexDirection: "column", animation: fadeUp(80) }}>
            {/* First / Last name */}
            <div
              style={{
                display: "flex",
                gap: 12,
                marginBottom: 18,
                animation: fadeUp(160),
              }}
            >
              <Field
                label="First Name"
                name="firstName"
                placeholder="eg. John"
                autoComplete="given-name"
              />
              <Field
                label="Last Name"
                name="lastName"
                placeholder="eg. Francisco"
                autoComplete="family-name"
              />
            </div>

            {/* Email */}
            <div style={{ marginBottom: 18, animation: fadeUp(200) }}>
              <Field
                label="Email"
                name="email"
                type="email"
                placeholder="eg. johnfrans@gmail.com"
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 18, animation: fadeUp(280) }}>
              <label style={labelStyle}>Password</label>
              <div style={{ position: "relative" }}>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="Enter your password"
                  style={{ ...inputStyle, paddingRight: 44 }}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  style={{
                    position: "absolute",
                    right: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--auth-text-sub)",
                    display: "flex",
                    alignItems: "center",
                    padding: 4,
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p style={{ color: "rgb(113,113,122)", fontSize: 12, marginTop: 6 }}>
                Must be at least 8 characters.
              </p>
            </div>

            {/* CTA */}
            <div style={{ animation: fadeUp(320) }}>
              <button
                type="submit"
                onClick={() => setIsExiting(true)}
                style={{
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
                }}
              >
                Next Step <ArrowRight />
              </button>
            </div>
          </form>

          {/* Footer */}
          <p
            style={{
              color: "rgb(113,113,122)",
              fontSize: 13,
              textAlign: "center",
              marginTop: 20,
              animation: fadeUp(360),
            }}
          >
            Already have an account?{" "}
            <Link
              href="/login"
              style={{ color: "rgb(107,99,232)", fontWeight: 600 }}
            >
              Log in
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

function Field({
  label,
  name,
  type = "text",
  placeholder,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder: string;
  autoComplete?: string;
}) {
  return (
    <div style={{ flex: 1 }}>
      <label style={labelStyle}>{label}</label>
      <input
        name={name}
        type={type}
        required
        placeholder={placeholder}
        autoComplete={autoComplete}
        style={inputStyle}
      />
    </div>
  );
}

function ArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M5 12h14M12 5l7 7-7 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
