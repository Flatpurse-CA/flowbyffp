"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { customerLogin } from "../actions";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function CustomerLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/customer/account";

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await customerLogin({ email, password });
    setLoading(false);
    if (res.error) { setError(res.error); return; }
    router.push(next);
    router.refresh();
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--cust-bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "DM Sans, system-ui, sans-serif", position: "relative" }}>
      <div style={{ position: "absolute", top: 20, right: 20 }}><ThemeToggle /></div>
      <form onSubmit={submit} style={{ width: "100%", maxWidth: 380, background: "var(--cust-card-bg)", border: "1px solid var(--cust-card-border)", borderRadius: 20, padding: "32px 28px", boxShadow: "var(--cust-shadow)" }}>
        <h1 style={{ color: "var(--cust-text)", fontSize: 22, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.02em" }}>Sign in</h1>
        <p style={{ color: "var(--cust-text-sub)", fontSize: 13.5, margin: "0 0 22px" }}>View and manage your bookings.</p>

        {error && (
          <div style={{ padding: "10px 13px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "rgb(185,28,28)", fontSize: 12.5, marginBottom: 14 }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Email</label>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label style={labelStyle}>Password</label>
          <input type="password" required value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} />
        </div>
        <p style={{ textAlign: "right", margin: "0 0 20px" }}>
          <Link href="/customer/forgot-password" style={{ color: "var(--cust-text-sub)", fontSize: 12.5, textDecoration: "none" }}>Forgot password?</Link>
        </p>

        <button type="submit" disabled={loading} style={{
          width: "100%", padding: "13px", borderRadius: 12, border: "none",
          background: "rgb(109,40,217)", color: "white", fontSize: 14.5, fontWeight: 700,
          cursor: loading ? "default" : "pointer", opacity: loading ? 0.6 : 1,
        }}>
          {loading ? "Signing in…" : "Sign in"}
        </button>

        <p style={{ color: "var(--cust-text-sub)", fontSize: 13, textAlign: "center", margin: "18px 0 0" }}>
          New here? <Link href={`/customer/signup?next=${encodeURIComponent(next)}`} style={{ color: "rgb(109,40,217)", fontWeight: 700, textDecoration: "none" }}>Create an account</Link>
        </p>
      </form>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  color: "var(--cust-text-sub)", fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "11px 13px", borderRadius: 10,
  border: "1.5px solid var(--cust-input-border)", background: "var(--cust-input-bg)",
  color: "var(--cust-text)", fontSize: 16, outline: "none",
  boxSizing: "border-box", fontFamily: "inherit",
};
