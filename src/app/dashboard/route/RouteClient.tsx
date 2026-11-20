"use client";

import { useState, useTransition } from "react";
import { sendTravelText } from "./actions";

type Stop = { id: string; startsAt: string; client: string; service: string; address: string; etaSent: boolean };
const fmt = (iso: string) => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Edmonton", hour: "numeric", minute: "2-digit" }).format(new Date(iso));
const btn: React.CSSProperties = { background: "rgb(109,40,217)", color: "#fff", border: "none", borderRadius: 10, padding: "9px 12px", fontSize: 13, fontWeight: 700, cursor: "pointer" };
const ghost: React.CSSProperties = { ...btn, background: "var(--dsurface3)", color: "var(--dtext)" };

/** Today's route with one-tap ETA and running-late texts (FL-059). */
export function RouteClient({ stops }: { stops: Stop[] }) {
  const [msg, setMsg] = useState<Record<string, string>>({});
  const [pending, start] = useTransition();
  const mapsUrl = stops.length ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(stops[stops.length - 1].address)}${stops.length > 1 ? `&waypoints=${encodeURIComponent(stops.slice(0, -1).map((s) => s.address).join("|"))}` : ""}&travelmode=driving` : null;
  const send = (id: string, kind: "eta" | "late") => {
    const raw = window.prompt(kind === "eta" ? "ETA in minutes?" : "How many minutes late?", kind === "eta" ? "20" : "10");
    if (!raw) return;
    start(async () => { const r = await sendTravelText({ appointmentId: id, kind, minutes: Number(raw) }); setMsg({ ...msg, [id]: r.error ?? "Text sent." }); });
  };
  return (
    <div style={{ padding: "24px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
      <h1 style={{ color: "var(--dtext)", fontSize: 22, fontWeight: 800, margin: 0 }}>Today&apos;s route</h1>
      {mapsUrl && <a href={mapsUrl} target="_blank" rel="noreferrer" style={{ ...btn, textAlign: "center", textDecoration: "none", maxWidth: 260 }}>Open route in Maps</a>}
      {stops.length === 0 && <p style={{ color: "var(--dw45)" }}>No mobile visits today.</p>}
      {stops.map((s, i) => (
        <section key={s.id} style={{ background: "var(--dsurface1)", border: "1px solid var(--dsurface3)", borderRadius: 12, padding: 14 }}>
          <strong style={{ color: "var(--dtext)" }}>{i + 1}. {fmt(s.startsAt)} · {s.client}</strong>
          <p style={{ color: "var(--dw45)", fontSize: 13, margin: "3px 0 10px" }}>{s.service} · {s.address}</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button type="button" disabled={pending} style={btn} onClick={() => send(s.id, "eta")}>{s.etaSent ? "Resend ETA" : "Start driving"}</button>
            <button type="button" disabled={pending} style={ghost} onClick={() => send(s.id, "late")}>Running late</button>
          </div>
          {msg[s.id] && <p style={{ color: "var(--dtext)", fontSize: 12.5, margin: "8px 0 0" }}>{msg[s.id]}</p>}
        </section>
      ))}
    </div>
  );
}
