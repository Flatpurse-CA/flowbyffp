"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { X, Check } from "lucide-react";
import type { TrialNotice } from "@/lib/billing/trialNotice";
import { extendTrial } from "./trialActions";

const BILLING = "/dashboard/settings?tab=billing";
const money = (n: number) => `C$${n.toFixed(2)}`;
const todayKey = () => `flow-trial-notice-${new Date().toISOString().slice(0, 10)}`;

const btn: React.CSSProperties = { width: "100%", background: "rgb(109,40,217)", color: "#fff", border: "none", borderRadius: 10, padding: "14px 0", fontSize: 15, fontWeight: 700, cursor: "pointer" };
const sub: React.CSSProperties = { color: "var(--dw45)", fontSize: 13, margin: 0, lineHeight: 1.5 };

/** Day 11 full-screen trial-end flow (3 screens) and Day 12-13 Home banner (FL-070/071). */
export function TrialEndNotice({ notice }: { notice: TrialNotice }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  // First app open of Day 11 only; closing it hides it for the rest of the day.
  useEffect(() => {
    if (notice.day !== 11) return;
    let seen = false;
    try { seen = localStorage.getItem(todayKey()) === "1"; } catch { /* storage blocked */ }
    if (!seen) setOpen(true); // eslint-disable-line react-hooks/set-state-in-effect
  }, [notice.day]);

  const close = () => {
    try { localStorage.setItem(todayKey(), "1"); } catch { /* storage blocked */ }
    setOpen(false);
  };

  if (notice.day !== 11) {
    return (
      <div style={{ background: "rgb(109,40,217)", color: "#fff", padding: "10px 16px", fontSize: 13.5, fontWeight: 600, display: "flex", gap: 12, alignItems: "center", justifyContent: "center", flexWrap: "wrap" }}>
        <span>Your {notice.planLabel} plan starts on {notice.chargeDate}.</span>
        <Link href={BILLING} style={{ color: "#fff", textDecoration: "underline" }}>Manage plan</Link>
      </div>
    );
  }
  if (!open) return null;

  const rows = [
    ["No-shows recovered", notice.byFlow.noshow],
    ["Last-minute slots filled", notice.byFlow.filler],
    ["Win-backs", notice.byFlow.winback],
  ].filter(([, v]) => Number(v) > 0) as [string, number][];

  const screens = [
    // 1. Value (never shows zero: falls back to bookings, then to a setup offer)
    <div key="v" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <p style={{ ...sub, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6, fontSize: 11.5 }}>Your trial so far · Day 11 of 14</p>
      {notice.recovered > 0 ? (
        <>
          <h2 style={{ color: "var(--dtext)", fontSize: 24, margin: 0 }}>Flow recovered {money(notice.recovered)} for you.</h2>
          {rows.map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", color: "var(--dtext)", fontSize: 14, borderBottom: "1px solid var(--dsurface3)", paddingBottom: 8 }}><span>{k}</span><strong>{money(v)}</strong></div>
          ))}
        </>
      ) : notice.bookings > 0 ? (
        <>
          <h2 style={{ color: "var(--dtext)", fontSize: 24, margin: 0 }}>You took {notice.bookings} bookings with Flow.</h2>
          <p style={sub}>Once you have more clients on file, AutoPilot starts recovering no-shows, filling last-minute gaps and winning back regulars on its own.</p>
        </>
      ) : (
        <>
          <h2 style={{ color: "var(--dtext)", fontSize: 24, margin: 0 }}>You haven&apos;t seen Flow at full power yet.</h2>
          <p style={sub}>Book a free 20-minute setup call with George and we&apos;ll get your services, clients and AutoPilot running together.</p>
          <a href="mailto:george@flatpurse.com?subject=Flow%20setup%20call" style={{ color: "var(--dpurple-text)", fontSize: 14, fontWeight: 600 }}>Book my setup call</a>
          {notice.canExtend && (
            <button type="button" disabled={pending} onClick={() => start(async () => { const r = await extendTrial(); setMsg(r.error ?? "Done: your trial now runs 7 more days."); })} style={{ ...btn, background: "var(--dsurface2)", color: "var(--dtext)" }}>
              {pending ? "Extending..." : "Extend my trial 7 days"}
            </button>
          )}
          {msg && <p style={sub}>{msg}</p>}
        </>
      )}
      <p style={{ ...sub, color: "var(--dtext)" }}>Your {notice.planLabel} plan starts on {notice.chargeDate}.</p>
      <button type="button" style={btn} onClick={() => setStep(1)}>Keep Flow working</button>
    </div>,
    // 2. Trust: no surprises
    <div key="t" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <h2 style={{ color: "var(--dtext)", fontSize: 22, margin: 0 }}>No surprises</h2>
      <p style={{ ...sub, color: "var(--dtext)", fontSize: 15 }}>
        Your card{notice.last4 ? ` ending ${notice.last4}` : " on file"} will be charged {notice.price} plus tax on {notice.chargeDate}. Cancel anytime in Settings before then and you won&apos;t pay a cent.
      </p>
      {["Your data stays in Canada", "No hardware needed: Tap to Pay on your phone", "0% commission on new clients"].map((t) => (
        <p key={t} style={{ ...sub, display: "flex", gap: 8, alignItems: "center", color: "var(--dtext)" }}><Check size={16} style={{ color: "var(--dpurple-text)" }} />{t}</p>
      ))}
      <button type="button" style={btn} onClick={() => setStep(2)}>Continue</button>
    </div>,
    // 3. Confirm or change plan
    <div key="c" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <h2 style={{ color: "var(--dtext)", fontSize: 22, margin: 0 }}>Confirm your plan</h2>
      <ol style={{ ...sub, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 4 }}>
        <li>Day 1: trial started</li>
        <li>Day 7: first AutoPilot recap</li>
        <li style={{ color: "var(--dtext)", fontWeight: 700 }}>Day 11: today (reminder sent)</li>
        <li>Day 14: first charge on {notice.chargeDate}</li>
      </ol>
      <button type="button" style={btn} onClick={close}>Keep {notice.planLabel} · {notice.price}/{notice.per === "year" ? "yr" : "mo"}</button>
      <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap", fontSize: 13 }}>
        <Link href={BILLING} onClick={close} style={{ color: "var(--dpurple-text)" }}>Change card</Link>
        <Link href={BILLING} onClick={close} style={{ color: "var(--dpurple-text)" }}>See all plans</Link>
        <Link href={BILLING} onClick={close} style={{ color: "var(--dpurple-text)" }}>Cancel trial</Link>
      </div>
    </div>,
  ];

  return (
    <div role="dialog" aria-modal="true" aria-label="Your trial is ending" style={{ position: "fixed", inset: 0, zIndex: 100, background: "var(--dsurface1)", overflowY: "auto", display: "flex", justifyContent: "center", padding: "56px 16px 32px" }}>
      <button type="button" aria-label="Close" onClick={close} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", color: "var(--dtext)", cursor: "pointer" }}><X size={22} /></button>
      <div style={{ width: "100%", maxWidth: 440 }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
          {[0, 1, 2].map((i) => <span key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= step ? "rgb(109,40,217)" : "var(--dsurface3)" }} />)}
        </div>
        {screens[step]}
      </div>
    </div>
  );
}
