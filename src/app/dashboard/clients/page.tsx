"use client";

import { useState } from "react";
import { Plus, Search, Mail, Phone, Zap, MoreHorizontal, Star } from "lucide-react";

const CLIENTS = [
  { id: 1,  name: "Amara Obi",     email: "amara@gmail.com",    phone: "+1 647 201 3344", visits: 12, lastVisit: "Today",     spent: "$1,240", autopilot: true,  rating: 5 },
  { id: 2,  name: "Lola Adeyemi",  email: "lola@icloud.com",    phone: "+1 416 882 7701", visits: 8,  lastVisit: "Today",     spent: "$960",   autopilot: true,  rating: 5 },
  { id: 3,  name: "Temi Bello",    email: "temi@gmail.com",     phone: "+1 905 334 2299", visits: 5,  lastVisit: "Today",     spent: "$510",   autopilot: true,  rating: 4 },
  { id: 4,  name: "Zara Johnson",  email: "zara@yahoo.com",     phone: "+1 647 553 8812", visits: 3,  lastVisit: "Today",     spent: "$340",   autopilot: false, rating: 4 },
  { id: 5,  name: "Chisom Eze",    email: "chisom@gmail.com",   phone: "+1 416 772 0091", visits: 7,  lastVisit: "Today",     spent: "$620",   autopilot: true,  rating: 5 },
  { id: 6,  name: "Bisola Akin",   email: "bisola@icloud.com",  phone: "+1 416 334 5567", visits: 4,  lastVisit: "Yesterday", spent: "$430",   autopilot: true,  rating: 4 },
  { id: 7,  name: "Ngozi Chukwu",  email: "ngozi@gmail.com",    phone: "+1 647 881 2230", visits: 9,  lastVisit: "Jun 14",    spent: "$1,100", autopilot: true,  rating: 5 },
  { id: 8,  name: "Funmi Alabi",   email: "funmi@hotmail.com",  phone: "+1 416 229 4410", visits: 2,  lastVisit: "Jun 12",    spent: "$200",   autopilot: false, rating: 3 },
  { id: 9,  name: "Adaeze Nwosu",  email: "adaeze@gmail.com",   phone: "+1 647 990 3317", visits: 6,  lastVisit: "Jun 10",    spent: "$780",   autopilot: true,  rating: 5 },
  { id: 10, name: "Yemi Okafor",   email: "yemi@icloud.com",    phone: "+1 905 441 6688", visits: 1,  lastVisit: "Jun 08",    spent: "$65",    autopilot: false, rating: 3 },
  { id: 11, name: "Sola Dada",     email: "sola@gmail.com",     phone: "+1 416 773 2290", visits: 11, lastVisit: "Jun 05",    spent: "$1,380", autopilot: true,  rating: 5 },
  { id: 12, name: "Kemi Adesanya", email: "kemi@yahoo.com",     phone: "+1 647 332 8815", visits: 4,  lastVisit: "Jun 03",    spent: "$450",   autopilot: true,  rating: 4 },
];

export default function ClientsPage() {
  const [query, setQuery] = useState("");
  const [view, setView]   = useState<"grid" | "list">("grid");

  const filtered = CLIENTS.filter(
    (c) => query === "" || c.name.toLowerCase().includes(query.toLowerCase()) || c.email.toLowerCase().includes(query.toLowerCase())
  );

  const card: React.CSSProperties = {
    background: "rgba(255,255,255,0.025)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 16,
  };

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", flexDirection: "column", gap: 22 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ color: "rgb(250,250,250)", fontSize: 22, fontWeight: 800, margin: "0 0 3px", letterSpacing: "-0.03em" }}>Clients</h1>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, margin: 0 }}>{CLIENTS.length} clients · {CLIENTS.filter(c => c.autopilot).length} on AutoPilot</p>
        </div>
        <button style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 18px", borderRadius: 11, background: "rgb(109,40,217)", border: "none", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          <Plus size={15} strokeWidth={2.5} />
          Add client
        </button>
      </div>

      {/* Summary strips */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {[
          { label: "Total clients", value: CLIENTS.length.toString(), sub: "+3 this week" },
          { label: "Avg visits/client", value: (CLIENTS.reduce((s, c) => s + c.visits, 0) / CLIENTS.length).toFixed(1), sub: "per client" },
          { label: "Total spent", value: "$7,075", sub: "this month" },
        ].map((s) => (
          <div key={s.label} style={{ ...card, padding: "16px 20px" }}>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, margin: "0 0 6px" }}>{s.label}</p>
            <p style={{ color: "rgb(250,250,250)", fontSize: 26, fontWeight: 800, margin: "0 0 2px", letterSpacing: "-0.04em" }}>{s.value}</p>
            <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 11, margin: 0 }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "8px 12px", flex: 1, maxWidth: 340 }}>
          <Search size={13} color="rgba(255,255,255,0.3)" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search clients…" style={{ background: "none", border: "none", outline: "none", color: "rgb(250,250,250)", fontSize: 12.5, flex: 1 }} />
        </div>
        <div style={{ flex: 1 }} />
        {/* View toggle */}
        <div style={{ display: "flex", gap: 2, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 9, padding: 3 }}>
          {(["grid", "list"] as const).map((v) => (
            <button key={v} onClick={() => setView(v)} style={{ padding: "6px 14px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 12, fontWeight: view === v ? 700 : 500, background: view === v ? "rgba(109,40,217,0.4)" : "transparent", color: view === v ? "rgb(210,196,254)" : "rgba(255,255,255,0.4)", textTransform: "capitalize" }}>
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Grid view */}
      {view === "grid" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
          {filtered.map((c) => (
            <div key={c.id} style={{ ...card, padding: "20px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: "50%", background: `hsl(${(c.id * 53 + 240) % 360},40%,26%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.85)", flexShrink: 0 }}>
                    {c.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p style={{ color: "rgb(250,250,250)", fontSize: 14, fontWeight: 700, margin: "0 0 2px" }}>{c.name}</p>
                    <div style={{ display: "flex", gap: 2 }}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={10} strokeWidth={0} fill={i < c.rating ? "rgb(251,191,36)" : "rgba(255,255,255,0.1)"} />
                      ))}
                    </div>
                  </div>
                </div>
                <button style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", padding: 2 }}>
                  <MoreHorizontal size={15} />
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, color: "rgba(255,255,255,0.38)", fontSize: 12 }}>
                  <Mail size={11} strokeWidth={1.8} />
                  {c.email}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 7, color: "rgba(255,255,255,0.38)", fontSize: 12 }}>
                  <Phone size={11} strokeWidth={1.8} />
                  {c.phone}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, padding: "12px 0", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                {[
                  { label: "Visits",      value: c.visits.toString() },
                  { label: "Last visit",  value: c.lastVisit },
                  { label: "Spent",       value: c.spent },
                ].map((s) => (
                  <div key={s.label} style={{ textAlign: "center" }}>
                    <p style={{ color: "rgb(250,250,250)", fontSize: 13, fontWeight: 700, margin: "0 0 2px" }}>{s.value}</p>
                    <p style={{ color: "rgba(255,255,255,0.28)", fontSize: 10, margin: 0 }}>{s.label}</p>
                  </div>
                ))}
              </div>

              {c.autopilot && (
                <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 8, background: "rgba(109,40,217,0.1)", border: "1px solid rgba(139,92,246,0.2)" }}>
                  <Zap size={11} strokeWidth={2} color="rgb(167,139,250)" />
                  <span style={{ color: "rgb(167,139,250)", fontSize: 11, fontWeight: 600 }}>AutoPilot active</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* List view */}
      {view === "list" && (
        <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Client", "Contact", "Visits", "Last visit", "Total spent", "AutoPilot", ""].map((h, i) => (
                  <th key={i} style={{ padding: "11px 18px", textAlign: "left", color: "rgba(255,255,255,0.28)", fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", background: "rgba(255,255,255,0.015)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr key={c.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                  <td style={{ padding: "12px 18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: `hsl(${(c.id * 53 + 240) % 360},40%,26%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.85)", flexShrink: 0 }}>
                        {c.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <span style={{ color: "rgb(250,250,250)", fontSize: 13, fontWeight: 600 }}>{c.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px 18px", color: "rgba(255,255,255,0.4)", fontSize: 12.5 }}>{c.email}</td>
                  <td style={{ padding: "12px 18px", color: "rgba(255,255,255,0.5)", fontSize: 13 }}>{c.visits}</td>
                  <td style={{ padding: "12px 18px", color: "rgba(255,255,255,0.5)", fontSize: 13 }}>{c.lastVisit}</td>
                  <td style={{ padding: "12px 18px", color: "rgb(52,211,153)", fontSize: 13, fontWeight: 600 }}>{c.spent}</td>
                  <td style={{ padding: "12px 18px" }}>
                    {c.autopilot ? (
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, color: "rgb(167,139,250)", background: "rgba(109,40,217,0.12)" }}>ON</span>
                    ) : (
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, color: "rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.05)" }}>OFF</span>
                    )}
                  </td>
                  <td style={{ padding: "12px 18px" }}><button style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer" }}><MoreHorizontal size={15} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
