"use client";

import { useState, useTransition } from "react";
import { getBestTimes, quickBook, type BestTime, type DueClient } from "./actions";

const TZ = "America/Edmonton";
const fmt = (iso: string) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ, weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(iso));
const card: React.CSSProperties = { display: "block", width: "100%", textAlign: "left", background: "var(--dsurface1)", border: "1px solid var(--dsurface3)", borderRadius: 12, padding: "12px 14px", color: "var(--dtext)", fontSize: 14, cursor: "pointer" };
const tagStyle: React.CSSProperties = { background: "rgb(109,40,217)", color: "#fff", borderRadius: 999, padding: "2px 8px", fontSize: 11, fontWeight: 700, marginLeft: 8 };

/** 3-tap staff booking (FL-045): due client -> usual service -> best time. */
export function QuickBookClient({ due }: { due: DueClient[] }) {
  const [client, setClient] = useState<DueClient | null>(null);
  const [times, setTimes] = useState<BestTime[] | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const pick = (c: DueClient) => { setClient(c); setTimes(null); setMsg(null); start(async () => setTimes((await getBestTimes({ serviceName: c.serviceName, staffId: c.staffId, usual: c.usual })).times)); };
  const book = (t: string) => client && start(async () => {
    const r = await quickBook({ client, startsAt: t });
    setMsg(r.error ?? `Booked ${client.name} for ${fmt(t)}.`);
    if (!r.error) { setClient(null); setTimes(null); }
  });

  return (
    <div style={{ padding: "24px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <h1 style={{ color: "var(--dtext)", fontSize: 22, fontWeight: 800, margin: 0 }}>Quick book</h1>
        <p style={{ color: "var(--dw45)", fontSize: 13.5, margin: "4px 0 0" }}>Regulars who are due. Tap a client, then a time.</p>
      </div>
      {msg && <p style={{ color: "var(--dtext)", fontSize: 14, margin: 0, fontWeight: 600 }}>{msg}</p>}
      {client ? (
        <>
          <button type="button" style={{ ...card, fontWeight: 700 }} onClick={() => setClient(null)}>← {client.name} · {client.serviceName}</button>
          {!times ? <p style={{ color: "var(--dw45)" }}>Finding best times...</p> : times.length === 0 ? <p style={{ color: "var(--dw45)" }}>No open times this week for {client.serviceName}.</p> : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 8 }}>
              {times.map((t) => (
                <button key={t.startsAt} type="button" disabled={pending} style={card} onClick={() => book(t.startsAt)}>
                  {fmt(t.startsAt)}{t.tag && <span style={tagStyle}>{t.tag}</span>}
                </button>
              ))}
            </div>
          )}
        </>
      ) : due.length === 0 ? <p style={{ color: "var(--dw45)" }}>No regulars are due right now.</p> : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 8 }}>
          {due.map((c) => (
            <button key={c.key} type="button" style={card} onClick={() => pick(c)}>
              <strong>{c.name}</strong>
              <span style={{ display: "block", color: "var(--dw45)", fontSize: 12.5, marginTop: 2 }}>{c.serviceName} · {c.daysOver === 0 ? "due today" : `${c.daysOver}d overdue`}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
