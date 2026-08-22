"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { SubmitButton } from "@/components/SubmitButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { setStaffPassword } from "./actions";

export default function SetStaffPasswordPage() {
  return (
    <Suspense>
      <SetPasswordForm />
    </Suspense>
  );
}

function SetPasswordForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", background: "var(--auth-bg)", padding: "0 24px", position: "relative" }}>
      <div className="absolute right-5" style={{ top: "calc(max(env(safe-area-inset-top, 0px), 44px) + 20px)" }}>
        <ThemeToggle />
      </div>

      <div style={{ width: "100%", maxWidth: 380 }}>
        <h1 style={{ color: "var(--auth-text)", fontSize: 24, fontWeight: 700, letterSpacing: "-0.025em", margin: 0 }}>
          Set your password
        </h1>
        <p style={{ color: "var(--auth-text-sub)", fontSize: 14, marginTop: 6, marginBottom: 28, lineHeight: 1.6 }}>
          You&apos;ve been added to the team. Set a password to access your dashboard.
        </p>

        {error && (
          <p style={{ background: "rgb(70,10,10)", color: "rgb(252,165,165)", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 20 }}>
            {error}
          </p>
        )}

        <form action={setStaffPassword} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <label style={labelStyle}>Password</label>
            <div style={{ position: "relative" }}>
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                minLength={10}
                placeholder="At least 10 characters"
                autoComplete="new-password"
                style={{ ...inputStyle, paddingRight: 44 }}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(v => !v)}
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

          <SubmitButton style={primaryBtnStyle} pendingText="Setting password…">
            Set password &amp; continue
          </SubmitButton>
        </form>
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
};
