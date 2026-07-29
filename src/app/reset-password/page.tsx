"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { AuthImagePanel } from "@/components/AuthImagePanel";
import { ThemeToggle } from "@/components/ThemeToggle";
import { setNewPassword } from "../login/actions";

const easing = "cubic-bezier(0.16, 1, 0.3, 1)";
const fadeUp = (delay: number) =>
  `0.5s ${easing} ${delay}ms 1 normal both running fp-fade-up`;

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword]       = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [loading, setLoading]         = useState(false);
  const [done, setDone]               = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await setNewPassword(password);
    setLoading(false);
    if (res.error) { setError(res.error); return; }
    setDone(true);
    setTimeout(() => { router.push("/dashboard"); router.refresh(); }, 1200);
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--auth-bg)", position: "relative" }}>
      <div className="auth-mobile-gradient" />
      <div className="absolute right-5 z-10 lg:hidden" style={{ top: "calc(env(safe-area-inset-top, 20px) + 20px)" }}>
        <ThemeToggle />
      </div>

      <AuthImagePanel />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "0 32px", position: "relative", zIndex: 1 }}
        className="w-full lg:w-1/2"
      >
        <div style={{ width: "100%", maxWidth: 400, animation: `0.42s ${easing} 0s 1 normal both running fp-slide-in-r` }}>
          {done ? (
            <>
              <h1 style={{ color: "var(--auth-text)", fontSize: 26, fontWeight: 700, letterSpacing: "-0.025em", margin: 0, animation: fadeUp(30) }}>
                Password updated
              </h1>
              <p style={{ color: "var(--auth-text-sub)", fontSize: 14, marginTop: 6, lineHeight: 1.6, animation: fadeUp(60) }}>
                Taking you to your dashboard…
              </p>
            </>
          ) : (
            <>
              <h1 style={{ color: "var(--auth-text)", fontSize: 26, fontWeight: 700, letterSpacing: "-0.025em", margin: 0, animation: fadeUp(30) }}>
                Choose a new password
              </h1>
              <p style={{ color: "var(--auth-text-sub)", fontSize: 14, marginBottom: 32, marginTop: 6, lineHeight: 1.6, animation: fadeUp(60) }}>
                At least 8 characters.
              </p>

              {error && (
                <p style={{ background: "rgb(70,10,10)", color: "rgb(252,165,165)", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 20 }}>
                  {error}
                </p>
              )}

              <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 18, animation: fadeUp(100) }}>
                <div>
                  <label style={labelStyle}>New password</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={8}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
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
                <button type="submit" disabled={loading} style={{ ...primaryBtnStyle, opacity: loading ? 0.6 : 1, cursor: loading ? "default" : "pointer" }}>
                  {loading ? "Saving…" : "Set new password"}
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
