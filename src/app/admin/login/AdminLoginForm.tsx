"use client";

import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import Image from "next/image";
import { Eye, EyeOff, Shield } from "lucide-react";
import { adminLogin } from "./actions";

function Form() {
  const searchParams  = useSearchParams();
  const error         = searchParams.get("error");
  const [show, setShow] = useState(false);

  return (
    <div style={{
      minHeight: "100vh",
      background: "rgb(9,9,11)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "0 20px",
    }}>
      <div style={{ width: "100%", maxWidth: 380 }}>

        {/* Logo + badge */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 36 }}>
          <Image src="/main logo.png" alt="Flow" width={38} height={38} style={{ objectFit: "contain", marginBottom: 12 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Shield size={11} color="rgb(239,68,68)" />
            <span style={{
              fontSize: 10, fontWeight: 800, color: "rgb(239,68,68)",
              letterSpacing: "0.14em", textTransform: "uppercase",
            }}>
              Admin Access
            </span>
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(239,68,68,0.15)",
          borderRadius: 18,
          padding: "32px 28px",
        }}>
          <h1 style={{
            color: "rgb(250,250,250)", fontSize: 20, fontWeight: 800,
            letterSpacing: "-0.03em", margin: "0 0 6px",
          }}>
            Sign in
          </h1>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, margin: "0 0 28px" }}>
            Restricted to authorized team members.
          </p>

          {error && (
            <div style={{
              background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: 10, padding: "10px 14px",
              color: "rgb(252,165,165)", fontSize: 13, marginBottom: 20,
            }}>
              {decodeURIComponent(error)}
            </div>
          )}

          <form action={adminLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 600, marginBottom: 7, letterSpacing: "0.03em" }}>
                EMAIL
              </label>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="admin@example.com"
                style={{
                  width: "100%", boxSizing: "border-box",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 10, padding: "12px 14px",
                  color: "rgb(250,250,250)", fontSize: 14,
                  outline: "none", fontFamily: "inherit",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 600, marginBottom: 7, letterSpacing: "0.03em" }}>
                PASSWORD
              </label>
              <div style={{ position: "relative" }}>
                <input
                  name="password"
                  type={show ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  style={{
                    width: "100%", boxSizing: "border-box",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 10, padding: "12px 44px 12px 14px",
                    color: "rgb(250,250,250)", fontSize: 14,
                    outline: "none", fontFamily: "inherit",
                  }}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShow(v => !v)}
                  style={{
                    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    color: "rgba(255,255,255,0.3)", display: "flex", padding: 4,
                  }}
                >
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              style={{
                width: "100%", marginTop: 4,
                background: "rgb(239,68,68)",
                color: "#fff", border: "none", borderRadius: 11,
                padding: "13px 0", fontSize: 14, fontWeight: 700,
                cursor: "pointer", fontFamily: "inherit",
                letterSpacing: "-0.01em",
              }}
            >
              Sign in to Admin
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export function AdminLoginForm() {
  return (
    <Suspense>
      <Form />
    </Suspense>
  );
}
