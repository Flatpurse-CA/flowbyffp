"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { customerSetNewPassword } from "../actions";

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
    <div style={{ minHeight: "100vh", background: "rgb(246,246,250)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "DM Sans, system-ui, sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 380, background: "white", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 20, padding: "32px 28px", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
        {done ? (
          <>
            <h1 style={{ color: "rgb(20,20,30)", fontSize: 20, fontWeight: 800, margin: "0 0 8px", letterSpacing: "-0.02em" }}>Password updated</h1>
            <p style={{ color: "rgba(0,0,0,0.45)", fontSize: 13.5, margin: 0 }}>Taking you to your bookings…</p>
          </>
        ) : (
          <form onSubmit={submit}>
            <h1 style={{ color: "rgb(20,20,30)", fontSize: 22, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.02em" }}>Choose a new password</h1>
            <p style={{ color: "rgba(0,0,0,0.4)", fontSize: 13.5, margin: "0 0 22px" }}>At least 8 characters.</p>

            {error && (
              <div style={{ padding: "10px 13px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "rgb(185,28,28)", fontSize: 12.5, marginBottom: 14 }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: 20 }}>
              <label style={{ color: "rgba(0,0,0,0.45)", fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6 }}>New password</label>
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
  border: "1.5px solid rgba(0,0,0,0.12)", background: "white",
  color: "rgb(20,20,30)", fontSize: 14, outline: "none",
  boxSizing: "border-box", fontFamily: "inherit",
};
