"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { customerSetNewPassword } from "../actions";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);
  const [done, setDone]         = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await customerSetNewPassword(password);
    setLoading(false);
    if (res.error) { setError(res.error); return; }
    setDone(true);
    setTimeout(() => { router.push("/customer/account"); router.refresh(); }, 1200);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--cust-bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "DM Sans, system-ui, sans-serif", position: "relative" }}>
      <div style={{ position: "absolute", top: 20, right: 20 }}><ThemeToggle /></div>
      <div style={{ width: "100%", maxWidth: 380, background: "var(--cust-card-bg)", border: "1px solid var(--cust-card-border)", borderRadius: 20, padding: "32px 28px", boxShadow: "var(--cust-shadow)" }}>
        {done ? (
          <>
            <h1 style={{ color: "var(--cust-text)", fontSize: 20, fontWeight: 800, margin: "0 0 8px", letterSpacing: "-0.02em" }}>Password updated</h1>
            <p style={{ color: "var(--cust-text-sub)", fontSize: 13.5, margin: 0 }}>Taking you to your bookings…</p>
          </>
        ) : (
          <form onSubmit={submit}>
            <h1 style={{ color: "var(--cust-text)", fontSize: 22, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.02em" }}>Choose a new password</h1>
            <p style={{ color: "var(--cust-text-sub)", fontSize: 13.5, margin: "0 0 22px" }}>At least 8 characters.</p>

            {error && (
              <div style={{ padding: "10px 13px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "rgb(185,28,28)", fontSize: 12.5, marginBottom: 14 }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: 20 }}>
              <label style={{ color: "var(--cust-text-sub)", fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6 }}>New password</label>
              <input type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} />
            </div>

            <button type="submit" disabled={loading} style={{
              width: "100%", padding: "13px", borderRadius: 12, border: "none",
              background: "rgb(109,40,217)", color: "white", fontSize: 14.5, fontWeight: 700,
              cursor: loading ? "default" : "pointer", opacity: loading ? 0.6 : 1,
            }}>
              {loading ? "Saving…" : "Set new password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "11px 13px", borderRadius: 10,
  border: "1.5px solid var(--cust-input-border)", background: "var(--cust-input-bg)",
  color: "var(--cust-text)", fontSize: 16, outline: "none",
  boxSizing: "border-box", fontFamily: "inherit",
};
