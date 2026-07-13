"use client";

import { useState } from "react";
import Link from "next/link";
import { customerRequestPasswordReset } from "../actions";

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await customerRequestPasswordReset(email);
    setLoading(false);
    setSent(true);
  };

  return (
    <div style={{ minHeight: "100vh", background: "rgb(246,246,250)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "DM Sans, system-ui, sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 380, background: "white", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 20, padding: "32px 28px", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
        {sent ? (
          <>
            <h1 style={{ color: "rgb(20,20,30)", fontSize: 20, fontWeight: 800, margin: "0 0 8px", letterSpacing: "-0.02em" }}>Check your email</h1>
            <p style={{ color: "rgba(0,0,0,0.45)", fontSize: 13.5, margin: 0, lineHeight: 1.6 }}>
              If an account exists for {email}, we&apos;ve sent a link to reset your password.
            </p>
          </>
        ) : (
          <form onSubmit={submit}>
            <h1 style={{ color: "rgb(20,20,30)", fontSize: 22, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.02em" }}>Reset your password</h1>
            <p style={{ color: "rgba(0,0,0,0.4)", fontSize: 13.5, margin: "0 0 22px" }}>We&apos;ll email you a link to set a new one.</p>

            <div style={{ marginBottom: 20 }}>
              <label style={{ color: "rgba(0,0,0,0.45)", fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6 }}>Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
            </div>

            <button type="submit" disabled={loading} style={{
              width: "100%", padding: "13px", borderRadius: 12, border: "none",
              background: "rgb(109,40,217)", color: "white", fontSize: 14.5, fontWeight: 700,
              cursor: loading ? "default" : "pointer", opacity: loading ? 0.6 : 1,
            }}>
              {loading ? "Sending…" : "Send reset link"}
            </button>
          </form>
        )}

        <p style={{ color: "rgba(0,0,0,0.4)", fontSize: 13, textAlign: "center", margin: "18px 0 0" }}>
          <Link href="/customer/login" style={{ color: "rgb(109,40,217)", fontWeight: 700, textDecoration: "none" }}>Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "11px 13px", borderRadius: 10,
  border: "1.5px solid rgba(0,0,0,0.12)", background: "white",
  color: "rgb(20,20,30)", fontSize: 14, outline: "none",
  boxSizing: "border-box", fontFamily: "inherit",
};
