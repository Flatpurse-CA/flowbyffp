"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { customerSignup } from "../actions";

export default function CustomerSignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/customer/account";

  const [fullName, setFullName] = useState("");
  const [email, setEmail]       = useState("");
  const [phone, setPhone]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await customerSignup({ fullName, email, phone, password });
    setLoading(false);
    if (res.error) { setError(res.error); return; }
    router.push(next);
    router.refresh();
  };

  return (
    <div style={{ minHeight: "100vh", background: "rgb(246,246,250)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "DM Sans, system-ui, sans-serif" }}>
      <form onSubmit={submit} style={{ width: "100%", maxWidth: 380, background: "white", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 20, padding: "32px 28px", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
        <h1 style={{ color: "rgb(20,20,30)", fontSize: 22, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.02em" }}>Create an account</h1>
        <p style={{ color: "rgba(0,0,0,0.4)", fontSize: 13.5, margin: "0 0 22px" }}>Book faster next time and keep track of your appointments.</p>

        {error && (
          <div style={{ padding: "10px 13px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "rgb(185,28,28)", fontSize: 12.5, marginBottom: 14 }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Full name</label>
          <input required value={fullName} onChange={e => setFullName(e.target.value)} style={inputStyle} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Email</label>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Phone (optional)</label>
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} style={inputStyle} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Password</label>
          <input type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} />
          <p style={{ color: "rgba(0,0,0,0.35)", fontSize: 11.5, margin: "5px 0 0" }}>At least 8 characters</p>
        </div>

        <button type="submit" disabled={loading} style={{
          width: "100%", padding: "13px", borderRadius: 12, border: "none",
          background: "rgb(109,40,217)", color: "white", fontSize: 14.5, fontWeight: 700,
          cursor: loading ? "default" : "pointer", opacity: loading ? 0.6 : 1,
        }}>
          {loading ? "Creating account…" : "Create account"}
        </button>

        <p style={{ color: "rgba(0,0,0,0.4)", fontSize: 13, textAlign: "center", margin: "18px 0 0" }}>
          Already have an account? <Link href={`/customer/login?next=${encodeURIComponent(next)}`} style={{ color: "rgb(109,40,217)", fontWeight: 700, textDecoration: "none" }}>Sign in</Link>
        </p>
      </form>
    </div>
  );
}

const labelStyle: React.CSSProperties = { color: "rgba(0,0,0,0.45)", fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6 };
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "11px 13px", borderRadius: 10,
  border: "1.5px solid rgba(0,0,0,0.12)", background: "white",
  color: "rgb(20,20,30)", fontSize: 14, outline: "none",
  boxSizing: "border-box", fontFamily: "inherit",
};
