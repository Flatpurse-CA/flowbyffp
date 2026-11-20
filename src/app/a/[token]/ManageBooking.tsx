"use client";

import { useState, useTransition } from "react";
import { cancelByLink, openTimesForLink, rescheduleByLink } from "./actions";

const TZ = "America/Edmonton";
const fmt = (iso: string) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ, weekday: "long", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(iso));
const page: React.CSSProperties = { minHeight: "100vh", background: "#faf9fb", color: "#111", fontFamily: "system-ui, sans-serif", display: "flex", justifyContent: "center", padding: "40px 16px" };
const btn: React.CSSProperties = { background: "rgb(109,40,217)", color: "#fff", border: "none", borderRadius: 12, padding: "14px 16px", fontSize: 16, fontWeight: 700, cursor: "pointer", textAlign: "left" };
const ghost: React.CSSProperties = { ...btn, background: "#fff", color: "rgb(109,40,217)", border: "2px solid rgb(109,40,217)", textAlign: "center" };
const sub: React.CSSProperties = { color: "#555", fontSize: 14.5, margin: 0, lineHeight: 1.5 };

/** Client manage page (FL-041): reschedule or cancel within policy, fee shown first. */
export function ManageBooking(p: {
  token: string; shopName: string; shopPhone: string | null; firstName: string; service: string; staff: string | null;
  startsAt: string; active: boolean; cancelled: boolean; inside: boolean; lateFee: number; policy: string;
}) {
  const [view, setView] = useState<"main" | "times" | "confirmCancel" | "done">(p.cancelled ? "done" : "main");
  const [when, setWhen] = useState(p.startsAt);
  const [times, setTimes] = useState<string[] | null>(null);
  const [msg, setMsg] = useState<string | null>(p.cancelled ? "This booking is cancelled." : null);
  const [pending, start] = useTransition();

  const loadTimes = () => { setView("times"); start(async () => setTimes(await openTimesForLink(p.token))); };
  const move = (t: string) => start(async () => { const r = await rescheduleByLink(p.token, t); if (r.error) setMsg(r.error); else { setWhen(t); setView("main"); setMsg(`Moved to ${fmt(t)}.`); } });
  const cancel = () => start(async () => {
    const r = await cancelByLink(p.token, p.lateFee > 0);
    if (r.error) setMsg(r.error); else { setView("done"); setMsg(r.fee ? `Cancelled. A $${r.fee.toFixed(2)} late-cancel fee was charged.` : "Cancelled. No fee."); }
  });

  return (
    <main style={page}>
      <div style={{ width: "100%", maxWidth: 420, display: "flex", flexDirection: "column", gap: 12 }}>
        <p style={{ ...sub, fontWeight: 700, color: "rgb(109,40,217)" }}>{p.shopName}</p>
        <h1 style={{ fontSize: 23, margin: 0 }}>{view === "done" ? "Booking cancelled" : `Hi ${p.firstName}, here's your booking`}</h1>
        <p style={{ ...sub, color: "#111", fontSize: 17 }}>{p.service}{p.staff ? ` with ${p.staff}` : ""}<br />{fmt(when)}</p>
        {msg && <p style={{ ...sub, color: "#111", fontWeight: 600 }}>{msg}</p>}
        {view === "main" && p.active && (
          <>
            {!p.inside && <button type="button" style={btn} onClick={loadTimes}>Change time</button>}
            <button type="button" style={ghost} onClick={() => p.lateFee > 0 ? setView("confirmCancel") : cancel()} disabled={pending}>{pending ? "Cancelling..." : "Cancel booking"}</button>
            {p.inside && <p style={sub}>Changes inside the cancellation window need a call{p.shopPhone ? ` to ${p.shopPhone}` : ""}.</p>}
          </>
        )}
        {view === "confirmCancel" && (
          <>
            <p style={{ ...sub, color: "#111" }}>You&apos;re inside the cancellation window. Cancelling now charges a <strong>${p.lateFee.toFixed(2)}</strong> fee to your saved card.</p>
            <button type="button" style={btn} disabled={pending} onClick={cancel}>{pending ? "Cancelling..." : `Cancel and pay $${p.lateFee.toFixed(2)}`}</button>
            <button type="button" style={ghost} onClick={() => setView("main")}>Keep my booking</button>
          </>
        )}
        {view === "times" && (
          <>
            {!times ? <p style={sub}>Finding open times...</p> : times.length === 0 ? <p style={sub}>No open times in the next 2 weeks.</p> :
              times.map((t) => <button key={t} type="button" style={btn} disabled={pending} onClick={() => move(t)}>{fmt(t)}</button>)}
            <button type="button" style={ghost} onClick={() => setView("main")}>Back</button>
          </>
        )}
        <p style={{ ...sub, fontSize: 13 }}>{p.policy}</p>
      </div>
    </main>
  );
}
