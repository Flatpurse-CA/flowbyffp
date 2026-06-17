"use client";

import { useState } from "react";
import { Plus, Search, Edit2, Trash2 } from "lucide-react";

type Service = { id: number; name: string; price: number; duration: string; category: string; active: boolean };

const INITIAL: Service[] = [
  { id: 1,  name: "Signature Cut",       price: 65,  duration: "45 min", category: "Cuts",       active: true  },
  { id: 2,  name: "Cut + Beard",         price: 80,  duration: "1h",     category: "Cuts",       active: true  },
  { id: 3,  name: "Kids Cut",            price: 40,  duration: "30 min", category: "Cuts",       active: true  },
  { id: 4,  name: "Trim + Blowout",      price: 65,  duration: "1h",     category: "Cuts",       active: true  },
  { id: 5,  name: "Full Highlights",     price: 140, duration: "2.5h",   category: "Colour",     active: true  },
  { id: 6,  name: "Balayage",            price: 280, duration: "4h",     category: "Colour",     active: true  },
  { id: 7,  name: "Colour + Gloss",      price: 160, duration: "2.5h",   category: "Colour",     active: true  },
  { id: 8,  name: "Root Tint",           price: 90,  duration: "1.5h",   category: "Colour",     active: false },
  { id: 9,  name: "Silk Press",          price: 85,  duration: "1.5h",   category: "Treatments", active: true  },
  { id: 10, name: "Deep Condition + Set",price: 90,  duration: "1.5h",   category: "Treatments", active: true  },
  { id: 11, name: "Knotless Braids",     price: 180, duration: "3h",     category: "Braids",     active: true  },
  { id: 12, name: "Loc Retwist",         price: 110, duration: "2h",     category: "Braids",     active: true  },
  { id: 13, name: "Cornrows",            price: 70,  duration: "1.5h",   category: "Braids",     active: false },
];

const CATEGORIES = ["All", "Cuts", "Colour", "Treatments", "Braids"];
const CATEGORY_COLORS: Record<string, string> = {
  Cuts: "rgba(96,165,250,0.12)", Colour: "rgba(251,146,60,0.12)", Treatments: "rgba(52,211,153,0.12)", Braids: "rgba(167,139,250,0.12)",
};
const CATEGORY_TEXT: Record<string, string> = {
  Cuts: "rgb(96,165,250)", Colour: "rgb(251,146,60)", Treatments: "rgb(52,211,153)", Braids: "rgb(167,139,250)",
};

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>(INITIAL);
  const [cat, setCat]           = useState("All");
  const [query, setQuery]       = useState("");
  const [adding, setAdding]     = useState(false);
  const [newName, setNewName]   = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newDur, setNewDur]     = useState("");
  const [newCat, setNewCat]     = useState("Cuts");

  const filtered = services.filter((s) => {
    const matchCat = cat === "All" || s.category === cat;
    const matchQ   = query === "" || s.name.toLowerCase().includes(query.toLowerCase());
    return matchCat && matchQ;
  });

  const toggleActive = (id: number) =>
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s)));

  const remove = (id: number) => setServices((prev) => prev.filter((s) => s.id !== id));

  const addService = () => {
    if (!newName.trim() || !newPrice) return;
    setServices((prev) => [...prev, { id: Date.now(), name: newName.trim(), price: Number(newPrice), duration: newDur || "1h", category: newCat, active: true }]);
    setNewName(""); setNewPrice(""); setNewDur(""); setAdding(false);
  };

  const card: React.CSSProperties = { background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16 };

  const grouped = CATEGORIES.slice(1).reduce<Record<string, Service[]>>((acc, c) => {
    const list = filtered.filter((s) => s.category === c);
    if (list.length) acc[c] = list;
    return acc;
  }, {});

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", flexDirection: "column", gap: 22 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ color: "rgb(250,250,250)", fontSize: 22, fontWeight: 800, margin: "0 0 3px", letterSpacing: "-0.03em" }}>Services</h1>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, margin: 0 }}>{services.length} services · {services.filter(s => s.active).length} active</p>
        </div>
        <button onClick={() => setAdding(true)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 18px", borderRadius: 11, background: "rgb(109,40,217)", border: "none", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          <Plus size={15} strokeWidth={2.5} />
          Add service
        </button>
      </div>

      {/* Add form */}
      {adding && (
        <div style={{ ...card, padding: "20px 22px" }}>
          <p style={{ color: "rgb(250,250,250)", fontSize: 14, fontWeight: 700, margin: "0 0 16px" }}>New service</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 120px 140px", gap: 10, marginBottom: 14 }}>
            {[
              { label: "Service name", value: newName, set: setNewName, ph: "e.g. Silk Press" },
              { label: "Price (C$)",   value: newPrice, set: setNewPrice, ph: "85" },
              { label: "Duration",     value: newDur,   set: setNewDur,   ph: "1h 30m" },
            ].map(({ label, value, set, ph }) => (
              <div key={label}>
                <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, display: "block", marginBottom: 5 }}>{label}</label>
                <input value={value} onChange={(e) => set(e.target.value)} placeholder={ph} style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 9, padding: "8px 11px", color: "rgb(250,250,250)", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
              </div>
            ))}
            <div>
              <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, display: "block", marginBottom: 5 }}>Category</label>
              <select value={newCat} onChange={(e) => setNewCat(e.target.value)} style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 9, padding: "8px 11px", color: "rgb(250,250,250)", fontSize: 13, outline: "none" }}>
                {CATEGORIES.slice(1).map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={addService} style={{ padding: "8px 20px", borderRadius: 9, background: "rgb(109,40,217)", border: "none", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Add</button>
            <button onClick={() => setAdding(false)} style={{ padding: "8px 16px", borderRadius: 9, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", fontSize: 13, cursor: "pointer" }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ display: "flex", gap: 2, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 11, padding: 3 }}>
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setCat(c)} style={{ padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: cat === c ? 700 : 500, background: cat === c ? "rgba(109,40,217,0.45)" : "transparent", color: cat === c ? "rgb(210,196,254)" : "rgba(255,255,255,0.4)", transition: "all 0.15s" }}>
              {c}
            </button>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "8px 12px", width: 220 }}>
          <Search size={13} color="rgba(255,255,255,0.3)" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search services…" style={{ background: "none", border: "none", outline: "none", color: "rgb(250,250,250)", fontSize: 12.5, flex: 1 }} />
        </div>
      </div>

      {/* Service groups */}
      {cat === "All" ? (
        Object.entries(grouped).map(([category, list]) => (
          <div key={category}>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 10px" }}>{category}</p>
            <ServiceTable rows={list} onToggle={toggleActive} onRemove={remove} />
          </div>
        ))
      ) : (
        <ServiceTable rows={filtered} onToggle={toggleActive} onRemove={remove} />
      )}
    </div>
  );
}

function ServiceTable({ rows, onToggle, onRemove }: { rows: Service[]; onToggle: (id: number) => void; onRemove: (id: number) => void }) {
  const CATEGORY_COLORS: Record<string, string> = {
    Cuts: "rgba(96,165,250,0.12)", Colour: "rgba(251,146,60,0.12)", Treatments: "rgba(52,211,153,0.12)", Braids: "rgba(167,139,250,0.12)",
  };
  const CATEGORY_TEXT: Record<string, string> = {
    Cuts: "rgb(96,165,250)", Colour: "rgb(251,146,60)", Treatments: "rgb(52,211,153)", Braids: "rgb(167,139,250)",
  };

  return (
    <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, overflow: "hidden", marginBottom: 16 }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          {rows.map((s, i) => (
            <tr key={s.id} style={{ borderBottom: i < rows.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", opacity: s.active ? 1 : 0.45 }}>
              <td style={{ padding: "14px 18px", width: 36 }}>
                <button
                  onClick={() => onToggle(s.id)}
                  style={{
                    width: 36, height: 20, borderRadius: 10, border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s",
                    background: s.active ? "rgb(109,40,217)" : "rgba(255,255,255,0.12)",
                  }}
                >
                  <span style={{ position: "absolute", top: 3, left: s.active ? 18 : 3, width: 14, height: 14, borderRadius: "50%", background: "white", transition: "left 0.2s" }} />
                </button>
              </td>
              <td style={{ padding: "14px 8px", color: "rgb(250,250,250)", fontSize: 13.5, fontWeight: 600 }}>{s.name}</td>
              <td style={{ padding: "14px 8px" }}>
                <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 20, background: CATEGORY_COLORS[s.category] || "rgba(255,255,255,0.07)", color: CATEGORY_TEXT[s.category] || "rgba(255,255,255,0.4)" }}>
                  {s.category}
                </span>
              </td>
              <td style={{ padding: "14px 8px", color: "rgba(255,255,255,0.4)", fontSize: 12.5 }}>{s.duration}</td>
              <td style={{ padding: "14px 18px", color: "rgb(250,250,250)", fontSize: 14, fontWeight: 800, letterSpacing: "-0.02em" }}>C${s.price}</td>
              <td style={{ padding: "14px 18px", textAlign: "right" }}>
                <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                  <button style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", padding: 5, borderRadius: 7 }}><Edit2 size={13} /></button>
                  <button onClick={() => onRemove(s.id)} style={{ background: "none", border: "none", color: "rgba(239,68,68,0.5)", cursor: "pointer", padding: 5, borderRadius: 7 }}><Trash2 size={13} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
