"use client";

import { useState } from "react";
import Link from "next/link";
import { customerRequestPasswordReset } from "../actions";
import { ThemeToggle } from "@/components/ThemeToggle";

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
    <div style={{ minHeight: "100vh", background: "var(--cust-bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "DM Sans, system-ui, sans-serif", position: "relative" }}>
      <div style={{ position: "absolute", top: 20, right: 20 }}><ThemeToggle /></div>
      <div style={{ width: "100%", maxWidth: 380, background: "var(--cust-card-bg)", border: "1px solid var(--cust-card-border)", borderRadius: 20, padding: "32px 28px", boxShadow: "var(--cust-shadow)" }}>
        {sent ? (
          <>
            <h1 style={{ color: "var(--cust-text)", fontSize: 20, fontWeight: 800, margin: "0 0 8px", letterSpacing: "-0.02em" }}>Check your email</h1>
            <p style={{ color: "var(--cust-text-sub)", fontSize: 13.5, margin: 0, lineHeight: 1.6 }}>
              If an account exists for {email}, we&apos;ve sent a link to reset your password.
            </p>
          </>
        ) : (
          <form onSubmit={submit}>
            <h1 style={{ color: "var(--cust-text)", fontSize: 22, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.02em" }}>Reset your password</h1>
            <p style={{ color: "var(--cust-text-sub)", fontSize: 13.5, margin: "0 0 22px" }}>We&apos;ll email you a link to set a new one.</p>

            <div style={{ marginBottom: 20 }}>
              <label style={{ color: "var(--cust-text-sub)", fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6 }}>Email</label>
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

        <p style={{ color: "var(--cust-text-sub)", fontSize: 13, textAlign: "center", margin: "18px 0 0" }}>
          <Link href="/customer/login" style={{ color: "rgb(109,40,217)", fontWeight: 700, textDecoration: "none" }}>Back to sign in</Link>
        </p>
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
