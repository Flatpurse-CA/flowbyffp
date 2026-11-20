"use client";

import { useState, useTransition } from "react";
import { tapToBook } from "./actions";

const TZ = "America/Edmonton";
const fmt = (iso: string) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ, weekday: "long", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(iso));

const page: React.CSSProperties = { minHeight: "100vh", background: "#faf9fb", color: "#111", fontFamily: "system-ui, sans-serif", display: "flex", justifyContent: "center", padding: "40px 16px" };
const box: React.CSSProperties = { width: "100%", maxWidth: 420, display: "flex", flexDirection: "column", gap: 12 };
const big: React.CSSProperties = { background: "rgb(109,40,217)", color: "#fff", border: "none", borderRadius: 14, padding: "18px 16px", fontSize: 17, fontWeight: 700, cursor: "pointer", textAlign: "left" };
const sub: React.CSSProperties = { color: "#555", fontSize: 14.5, margin: 0, lineHeight: 1.5 };

/** Client-facing Send Times page: one tap books (FL-046/047). */
export function TapTimes(p: {
  token: string; firstName: string; shopName: string; bookingUrl: string | null; serviceName: string; staffName: string | null;
  slots: string[]; initial: "open" | "mine" | "gone" | "expired"; bookedSlot: string | null;
}) {
  const [state, setState] = useState<"open" | "mine" | "gone" | "expired" | "taken" | "error">(p.slots.length || p.initial !== "open" ? p.initial : "expired");
  const [booked, setBooked] = useState<string | null>(p.bookedSlot);
  const [next, setNext] = useState<string[]>([]);
  const [pending, start] = useTransition();
  const [tapped, setTapped] = useState<string | null>(null);

  const tap = (slot: string) => {
    setTapped(slot);
    start(async () => {
      const r = await tapToBook(p.token, slot);
      setNext(r.nextTimes ?? []);
      if (r.status === "booked") { setBooked(r.startsAt ?? slot); setState(r.mine ? "mine" : "gone"); }
      else if (r.status === "taken" || r.status === "expired") setState(r.status === "taken" ? "taken" : "expired");
      else setState("error");
    });
  };

  const other = p.bookingUrl && (
    <a href={p.bookingUrl} style={{ ...big, background: "#fff", color: "rgb(109,40,217)", border: "2px solid rgb(109,40,217)", textAlign: "center", textDecoration: "none" }}>See all open times</a>
  );
  const nextList = next.length > 0 && <p style={sub}>Next open: {next.map(fmt).join(" · ")}</p>;

  return (
    <main style={page}>
      <div style={box}>
        <p style={{ ...sub, fontWeight: 700, color: "rgb(109,40,217)" }}>{p.shopName}</p>
        {state === "mine" && booked ? (
          <>
            <h1 style={{ fontSize: 24, margin: 0 }}>You&apos;re booked, {p.firstName}!</h1>
            <p style={{ ...sub, color: "#111", fontSize: 17 }}>{p.serviceName}{p.staffName ? ` with ${p.staffName}` : ""}<br />{fmt(booked)}</p>
            <p style={sub}>We&apos;ve texted you a confirmation. Need to change it? Reply to the text or contact {p.shopName}.</p>
          </>
        ) : state === "gone" ? (
          <>
            <h1 style={{ fontSize: 22, margin: 0 }}>These times have been taken</h1>
            <p style={sub}>Someone else booked first.</p>
            {nextList}{other}
          </>
        ) : state === "taken" ? (
          <>
            <h1 style={{ fontSize: 22, margin: 0 }}>That time was just taken</h1>
            {nextList}{other}
          </>
        ) : state === "expired" ? (
          <>
            <h1 style={{ fontSize: 22, margin: 0 }}>These times have passed</h1>
            {other}
          </>
        ) : state === "error" ? (
          <>
            <h1 style={{ fontSize: 22, margin: 0 }}>Something went wrong</h1>
            <p style={sub}>Please try again in a moment.</p>
            {other}
          </>
        ) : (
          <>
            <h1 style={{ fontSize: 24, margin: 0 }}>Hi {p.firstName}, pick a time</h1>
            <p style={sub}>{p.serviceName}{p.staffName ? ` with ${p.staffName}` : ""}. Tap one to book.</p>
            {p.slots.map((s) => (
              <button key={s} type="button" disabled={pending} onClick={() => tap(s)} style={{ ...big, opacity: pending && tapped !== s ? 0.5 : 1 }}>
                {pending && tapped === s ? "Booking..." : fmt(s)}
              </button>
            ))}
          </>
        )}
      </div>
    </main>
  );
}
