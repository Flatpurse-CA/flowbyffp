"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const field: React.CSSProperties = { background: "var(--dsurface1)", border: "1px solid var(--dsurface3)", borderRadius: 10, padding: "10px 12px", color: "var(--dtext)", fontSize: 18, letterSpacing: 4, width: 160, fontFamily: "inherit" };
const btn: React.CSSProperties = { background: "rgb(109,40,217)", color: "#fff", border: "none", borderRadius: 10, padding: "11px 16px", fontSize: 14, fontWeight: 700, cursor: "pointer" };

/** FL-011: authenticator-app 2-step (Supabase MFA TOTP). */
export function TwoStep() {
  const [supabase] = useState(() => createClient());
  const [factorId, setFactorId] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);
  const [level, setLevel] = useState<string | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const { data } = await supabase.auth.mfa.listFactors();
    const f = data?.totp?.[0] ?? null;
    setFactorId(f?.id ?? null);
    setVerified(f?.status === "verified");
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    setLevel(aal?.currentLevel ?? null);
  }, [supabase]);

  useEffect(() => { void Promise.resolve().then(refresh); }, [refresh]);

  const enroll = async () => {
    setMsg(null);
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: "Flow" });
    if (error) return setMsg(error.message);
    setFactorId(data.id); setQr(data.totp.qr_code); setSecret(data.totp.secret);
  };
  const verify = async () => {
    if (!factorId) return;
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code: code.trim() });
    if (error) return setMsg("That code didn't work. Try the newest one.");
    setQr(null); setSecret(null); setCode(""); setMsg("2-step is on and this session is verified."); refresh();
  };
  const remove = async () => {
    if (!factorId || !window.confirm("Turn off 2-step verification?")) return;
    const { error } = await supabase.auth.mfa.unenroll({ factorId });
    setMsg(error ? error.message : "2-step is off."); refresh();
  };

  return (
    <div style={{ padding: "24px 16px", display: "flex", flexDirection: "column", gap: 14, maxWidth: 560 }}>
      <div>
        <h1 style={{ color: "var(--dtext)", fontSize: 22, fontWeight: 800, margin: 0 }}>Security</h1>
        <p style={{ color: "var(--dw45)", fontSize: 13.5, margin: "4px 0 0" }}>2-step verification uses an authenticator app (Google Authenticator, 1Password, Authy). It&apos;s required to export client data or change payout details.</p>
      </div>
      {verified && level === "aal2" && <p style={{ color: "var(--dtext)", margin: 0, fontWeight: 600 }}>2-step is on. This session is verified.</p>}
      {(qr || (verified && level !== "aal2")) && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {qr && <img src={qr} alt="Scan with your authenticator app" width={180} height={180} style={{ background: "#fff", borderRadius: 8 }} />}
          {secret && <p style={{ color: "var(--dw45)", fontSize: 12.5, margin: 0 }}>Or enter this key: <code>{secret}</code></p>}
          <p style={{ color: "var(--dtext)", margin: 0, fontSize: 14 }}>{qr ? "Scan, then enter the 6-digit code:" : "Enter the 6-digit code from your app to verify this session:"}</p>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" style={field} />
            <button type="button" style={btn} onClick={verify} disabled={code.length !== 6}>Verify</button>
          </div>
        </div>
      )}
      {!verified && !qr && <button type="button" style={{ ...btn, maxWidth: 240 }} onClick={enroll}>Turn on 2-step</button>}
      {verified && <button type="button" style={{ ...btn, background: "var(--dsurface3)", color: "var(--dtext)", maxWidth: 240 }} onClick={remove}>Turn off 2-step</button>}
      {msg && <p style={{ color: "var(--dtext)", margin: 0, fontSize: 14 }}>{msg}</p>}
    </div>
  );
}
