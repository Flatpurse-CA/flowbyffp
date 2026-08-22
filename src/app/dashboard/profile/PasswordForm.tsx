"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { updateOwnPassword } from "./actions";

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--dsurface3)",
  border: "1px solid var(--dw09)",
  borderRadius: 10,
  padding: "10px 14px",
  color: "var(--dtext)",
  fontSize: 13,
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  color: "var(--dw38)",
  fontSize: 12,
  fontWeight: 600,
  marginBottom: 6,
};

function Form() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const success = searchParams.get("success");

  return (
    <form action={updateOwnPassword} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {error && (
        <p style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "rgb(248,113,113)", borderRadius: 10, padding: "10px 14px", fontSize: 12.5, margin: 0 }}>
          {decodeURIComponent(error)}
        </p>
      )}
      {success && (
        <p style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(52,211,153,0.2)", color: "rgb(52,211,153)", borderRadius: 10, padding: "10px 14px", fontSize: 12.5, margin: 0 }}>
          Password updated.
        </p>
      )}
      <div>
        <label style={labelStyle}>New password</label>
        <input type="password" name="password" required minLength={10} autoComplete="new-password" style={inputStyle} />
      </div>
      <div>
        <label style={labelStyle}>Confirm new password</label>
        <input type="password" name="confirm" required minLength={10} autoComplete="new-password" style={inputStyle} />
      </div>
      <button
        type="submit"
        style={{
          alignSelf: "flex-start",
          padding: "9px 18px", borderRadius: 10, cursor: "pointer",
          background: "rgb(109,40,217)", border: "none",
          color: "#fff", fontSize: 13, fontWeight: 700, fontFamily: "inherit",
        }}
      >
        Update password
      </button>
    </form>
  );
}

export function PasswordForm() {
  return (
    <Suspense>
      <Form />
    </Suspense>
  );
}
