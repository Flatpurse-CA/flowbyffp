"use client";

import { useMemo, useState, useTransition } from "react";
import { sendTimes, suggestSlots } from "./actions";

type Client = { id: string; name: string; phone: string | null; email: string | null };
const TZ = "America/Edmonton";
const fmt = (iso: string) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ, weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(iso));

const label: React.CSSProperties = { color: "var(--dw45)", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, margin: "0 0 6px" };
const field: React.CSSProperties = { width: "100%", boxSizing: "border-box", background: "var(--dsurface1)", border: "1px solid var(--dsurface3)", borderRadius: 10, padding: "10px 12px", color: "var(--dtext)", fontSize: 14, fontFamily: "inherit" };
const chip = (on: boolean): React.CSSProperties => ({ border: `1px solid ${on ? "rgb(109,40,217)" : "var(--dsurface3)"}`, background: on ? "rgb(109,40,217)" : "var(--dsurface1)", color: on ? "#fff" : "var(--dtext)", borderRadius: 999, padding: "8px 12px", fontSize: 13, fontWeight: 600, cursor: "pointer" });

/** Send Times (FL-046): pick clients, Flow suggests openings, tap Send. */
export function SendTimesClient(props: {
  clients: Client[]; services: { id: string; name: string }[]; staff: { id: string; full_name: string }[];
  shopName: string; defaultStaffId: string | null; preselectClientId: string | null;
}) {
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<Client[]>(() => props.clients.filter((c) => c.id === props.preselectClientId));
  const [serviceId, setServiceId] = useState(props.services[0]?.id ?? "");
  const [staffId, setStaffId] = useState<string>(props.defaultStaffId ?? (props.staff.length === 1 ? props.staff[0].id : "any"));
  const [options, setOptions] = useState<string[]>([]);
  const [chosen, setChosen] = useState<string[]>([]);
  const staffFirst = staffId === "any" ? "us" : props.staff.find((s) => s.id === staffId)?.full_name.split(" ")[0] ?? "us";
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return props.clients.filter((c) => !picked.some((p) => p.id === c.id) && (c.name.toLowerCase().includes(q) || (c.phone ?? "").includes(q))).slice(0, 8);
  }, [query, picked, props.clients]);

  const template = (slots: string[]) =>
    `Hey {first_name}, here are my next openings with ${staffFirst}: ${slots.map(fmt).join(" · ")}. Tap one to book: {link} - ${props.shopName}`;

  const findTimes = () => start(async () => {
    const s = await suggestSlots({ serviceId, staffId });
    setOptions(s);
    const first = s.slice(0, 3);
    setChosen(first);
    setMessage(template(first));
    setResult(s.length ? null : "No open times in the next 14 days for that service.");
  });

  const toggleSlot = (s: string) => {
    const next = chosen.includes(s) ? chosen.filter((x) => x !== s) : chosen.length >= 5 ? chosen : [...chosen, s].sort();
    setChosen(next);
    setMessage(template(next));
  };

  const send = () => start(async () => {
    const r = await sendTimes({ recipients: picked.map(({ name, phone, email }) => ({ name, phone, email })), serviceId, staffId, slots: chosen, message });
    setResult(r.error ?? `Sent to ${r.sent} client${r.sent === 1 ? "" : "s"}${r.skipped ? `, ${r.skipped} skipped (no consent, opted out or no contact)` : ""}.`);
  });

  const preview = message.replaceAll("{first_name}", picked[0]?.name.split(" ")[0] ?? "Sam").replaceAll("{link}", "flow.flatpurse.com/t/...");

  return (
    <div style={{ maxWidth: 640, margin: "24px auto", padding: "0 16px", display: "flex", flexDirection: "column", gap: 18 }}>
      <div>
        <h1 style={{ color: "var(--dtext)", fontSize: 22, fontWeight: 800, margin: 0 }}>Send times</h1>
        <p style={{ color: "var(--dw45)", fontSize: 13.5, margin: "4px 0 0" }}>Text clients your next openings. They tap one to book.</p>
      </div>

      <section>
        <p style={label}>Client{picked.length > 1 ? `s (${picked.length}/20)` : ""}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
          {picked.map((c) => (
            <button key={c.id} type="button" style={chip(true)} onClick={() => setPicked(picked.filter((p) => p.id !== c.id))} aria-label={`Remove ${c.name}`}>{c.name} ×</button>
          ))}
        </div>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search clients by name or phone" style={field} />
        {matches.length > 0 && (
          <div style={{ border: "1px solid var(--dsurface3)", borderRadius: 10, marginTop: 6, overflow: "hidden" }}>
            {matches.map((c) => (
              <button key={c.id} type="button" disabled={picked.length >= 20} onClick={() => { setPicked([...picked, c]); setQuery(""); }}
                style={{ display: "block", width: "100%", textAlign: "left", background: "var(--dsurface1)", border: "none", borderBottom: "1px solid var(--dsurface3)", padding: "10px 12px", color: "var(--dtext)", fontSize: 14, cursor: "pointer" }}>
                {c.name} <span style={{ color: "var(--dw45)", fontSize: 12 }}>{c.phone ?? c.email ?? "no contact"}</span>
              </button>
            ))}
          </div>
        )}
        {picked.length > 1 && <p style={{ color: "var(--dw45)", fontSize: 12, margin: "6px 0 0" }}>Group sends count as marketing: only clients who opted in or visited in the last 2 years get it, with STOP to opt out. First to tap a time gets it.</p>}
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
        <section>
          <p style={label}>Service</p>
          <select value={serviceId} onChange={(e) => setServiceId(e.target.value)} style={field}>
            {props.services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </section>
        <section>
          <p style={label}>Staff</p>
          <select value={staffId} onChange={(e) => setStaffId(e.target.value)} style={field}>
            <option value="any">Anyone</option>
            {props.staff.map((s) => <option key={s.id} value={s.id}>{s.full_name}</option>)}
          </select>
        </section>
      </div>

      <button type="button" onClick={findTimes} disabled={pending || !serviceId} style={{ ...chip(false), borderRadius: 10, padding: "11px 0" }}>{pending && options.length === 0 ? "Finding times..." : "Find open times"}</button>

      {options.length > 0 && (
        <>
          <section>
            <p style={label}>Times ({chosen.length}/5)</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {options.map((s) => <button key={s} type="button" aria-pressed={chosen.includes(s)} onClick={() => toggleSlot(s)} style={chip(chosen.includes(s))}>{fmt(s)}</button>)}
            </div>
          </section>
          <section>
            <p style={label}>Message</p>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} style={field} />
            <p style={{ color: "var(--dw45)", fontSize: 12.5, margin: "6px 0 0" }}>Preview: {preview}</p>
          </section>
          <button type="button" onClick={send} disabled={pending || picked.length === 0 || chosen.length === 0}
            style={{ background: "rgb(109,40,217)", color: "#fff", border: "none", borderRadius: 10, padding: "13px 0", fontSize: 15, fontWeight: 700, cursor: "pointer", opacity: picked.length && chosen.length ? 1 : 0.5 }}>
            {pending ? "Sending..." : `Send to ${picked.length || 0} client${picked.length === 1 ? "" : "s"}`}
          </button>
        </>
      )}
      {result && <p style={{ color: "var(--dtext)", fontSize: 14, margin: 0 }}>{result}</p>}
    </div>
  );
}
