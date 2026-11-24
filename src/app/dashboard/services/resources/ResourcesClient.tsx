"use client";

import { useState, useTransition } from "react";
import { addResource, deleteResource, setServiceNeeds } from "./actions";

type R = { id: string; name: string; kind: "room" | "equipment"; capacity: number };
const field: React.CSSProperties = { background: "var(--dsurface1)", border: "1px solid var(--dsurface3)", borderRadius: 10, padding: "9px 11px", color: "var(--dtext)", fontSize: 14, fontFamily: "inherit" };
const chip = (on: boolean): React.CSSProperties => ({ border: `1px solid ${on ? "rgb(109,40,217)" : "var(--dsurface3)"}`, background: on ? "rgb(109,40,217)" : "var(--dsurface1)", color: on ? "#fff" : "var(--dtext)", borderRadius: 999, padding: "6px 11px", fontSize: 12.5, fontWeight: 600, cursor: "pointer" });

/** Rooms and equipment (FL-042): a time is only offered when what the service needs is free. */
export function ResourcesClient({ resources, services, links }: { resources: R[]; services: { id: string; name: string }[]; links: { serviceId: string; resourceId: string }[] }) {
  const [name, setName] = useState("");
  const [kind, setKind] = useState<"room" | "equipment">("room");
  const [cap, setCap] = useState(1);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const needs = (rid: string) => links.filter((l) => l.resourceId === rid).map((l) => l.serviceId);

  return (
    <div style={{ padding: "24px 16px", display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <h1 style={{ color: "var(--dtext)", fontSize: 22, fontWeight: 800, margin: 0 }}>Rooms and equipment</h1>
        <p style={{ color: "var(--dw45)", fontSize: 13.5, margin: "4px 0 0" }}>Link each room or machine to the services that need it. Flow won&apos;t offer a time when it&apos;s in use.</p>
      </div>
      <form style={{ display: "flex", flexWrap: "wrap", gap: 8 }} onSubmit={(e) => { e.preventDefault(); start(async () => { const r = await addResource({ name, kind, capacity: cap }); setErr(r.error ?? null); if (!r.error) setName(""); }); }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Treatment room 1" style={{ ...field, flex: "1 1 200px" }} />
        <select value={kind} onChange={(e) => setKind(e.target.value as "room" | "equipment")} style={field}><option value="room">Room</option><option value="equipment">Equipment</option></select>
        <input type="number" min={1} max={50} value={cap} onChange={(e) => setCap(Number(e.target.value))} style={{ ...field, width: 80 }} aria-label="How many at once" />
        <button type="submit" disabled={pending || !name.trim()} style={{ ...chip(true), borderRadius: 10, padding: "9px 16px" }}>Add</button>
      </form>
      {err && <p style={{ color: "#dc2626", margin: 0, fontSize: 13 }}>{err}</p>}
      {resources.length === 0 && <p style={{ color: "var(--dw45)", margin: 0 }}>No rooms or equipment yet.</p>}
      {resources.map((r) => {
        const on = needs(r.id);
        return (
          <section key={r.id} style={{ background: "var(--dsurface1)", border: "1px solid var(--dsurface3)", borderRadius: 12, padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
              <strong style={{ color: "var(--dtext)" }}>{r.name} <span style={{ color: "var(--dw45)", fontWeight: 500, fontSize: 12.5 }}>{r.kind === "room" ? "Room" : "Equipment"} · {r.capacity} at once</span></strong>
              <button type="button" disabled={pending} onClick={() => confirm(`Delete ${r.name}?`) && start(() => deleteResource(r.id))} style={{ ...chip(false), color: "#dc2626" }}>Delete</button>
            </div>
            <p style={{ color: "var(--dw45)", fontSize: 12, margin: "10px 0 6px" }}>Services that need it</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {services.map((s) => (
                <button key={s.id} type="button" disabled={pending} aria-pressed={on.includes(s.id)} style={chip(on.includes(s.id))}
                  onClick={() => start(async () => { await setServiceNeeds(r.id, on.includes(s.id) ? on.filter((x) => x !== s.id) : [...on, s.id]); })}>{s.name}</button>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
