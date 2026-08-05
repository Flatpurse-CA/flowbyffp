"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Trash2 } from "lucide-react";
import { createService, toggleServiceActive, deleteService, type ServiceRow } from "./actions";

const CATEGORY_SUGGESTIONS = ["Cuts", "Colour", "Treatments", "Braids"];

const CATEGORY_PALETTE = [
  { bg: "rgba(96,165,250,0.12)",  text: "rgb(96,165,250)"  },
  { bg: "rgba(251,146,60,0.12)",  text: "rgb(251,146,60)"  },
  { bg: "rgba(52,211,153,0.12)",  text: "rgb(52,211,153)"  },
  { bg: "rgba(167,139,250,0.12)", text: "rgb(167,139,250)" },
];
function colorForCategory(cat: string) {
  let hash = 0;
  for (let i = 0; i < cat.length; i++) hash = (hash * 31 + cat.charCodeAt(i)) >>> 0;
  return CATEGORY_PALETTE[hash % CATEGORY_PALETTE.length];
}

function parseDuration(input: string): number {
  const s = input.trim().toLowerCase();
  const hMatch = s.match(/(\d+(?:\.\d+)?)\s*h/);
  const mMatch = s.match(/(\d+)\s*m/);
  let total = 0;
  if (hMatch) total += parseFloat(hMatch[1]) * 60;
  if (mMatch) total += parseInt(mMatch[1], 10);
  if (!hMatch && !mMatch) {
    const bare = parseInt(s, 10);
    if (!isNaN(bare)) total = bare;
  }
  return Math.round(total) || 30;
}

function formatMinutes(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

const card: React.CSSProperties = { background: "var(--dsurface1)", border: "1px solid var(--dw07)", borderRadius: 16 };

export function ServicesClient({ services }: { services: ServiceRow[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const categories = Array.from(new Set(services.map(s => s.category || "Other"))).sort();
  const CATEGORIES = ["All", ...categories];

  const [cat, setCat]           = useState("All");
  const [query, setQuery]       = useState("");
  const [adding, setAdding]     = useState(false);
  const [newName, setNewName]   = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newDur, setNewDur]     = useState("");
  const [newCat, setNewCat]     = useState(CATEGORY_SUGGESTIONS[0]);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const refresh = () => startTransition(() => router.refresh());

  const filtered = services.filter((s) => {
    const svcCat = s.category || "Other";
    const matchCat = cat === "All" || svcCat === cat;
    const matchQ   = query === "" || s.name.toLowerCase().includes(query.toLowerCase());
    return matchCat && matchQ;
  });

  const handleToggle = async (s: ServiceRow) => {
    try {
      await toggleServiceActive(s.id, !s.active);
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't update that service");
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await deleteService(id);
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't remove that service");
    }
  };

  const addService = async () => {
    if (!newName.trim() || !newPrice) return;
    setSaving(true);
    setError(null);
    try {
      await createService({
        name: newName.trim(),
        price: Number(newPrice),
        durationMinutes: parseDuration(newDur || "1h"),
        category: newCat,
      });
      setNewName(""); setNewPrice(""); setNewDur(""); setAdding(false);
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't add that service");
    } finally {
      setSaving(false);
    }
  };

  const grouped = categories.reduce<Record<string, ServiceRow[]>>((acc, c) => {
    const list = filtered.filter((s) => (s.category || "Other") === c);
    if (list.length) acc[c] = list;
    return acc;
  }, {});

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", flexDirection: "column", gap: 22 }}>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", rowGap: 12 }}>
        <div>
          <h1 style={{ color: "var(--dtext)", fontSize: 22, fontWeight: 800, margin: "0 0 3px", letterSpacing: "-0.03em" }}>Services</h1>
          <p style={{ color: "var(--dw35)", fontSize: 13, margin: 0 }}>{services.length} service{services.length === 1 ? "" : "s"} · {services.filter(s => s.active).length} active</p>
        </div>
        <button onClick={() => setAdding(true)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 18px", borderRadius: 11, background: "rgb(109,40,217)", border: "none", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          <Plus size={15} strokeWidth={2.5} />
          Add service
        </button>
      </div>

      {error && (
        <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "rgb(248,113,113)", fontSize: 12.5 }}>
          {error}
        </div>
      )}

      {adding && (
        <div style={{ ...card, padding: "20px 22px" }}>
          <p style={{ color: "var(--dtext)", fontSize: 14, fontWeight: 700, margin: "0 0 16px" }}>New service</p>
          <div className="services-add-grid" style={{ display: "grid", gridTemplateColumns: "1fr 120px 120px 140px", gap: 10, marginBottom: 14 }}>
            {[
              { label: "Service name", value: newName, set: setNewName, ph: "e.g. Silk Press" },
              { label: "Price (C$)",   value: newPrice, set: setNewPrice, ph: "85" },
              { label: "Duration",     value: newDur,   set: setNewDur,   ph: "1h 30m" },
            ].map(({ label, value, set, ph }) => (
              <div key={label}>
                <label style={{ color: "var(--dw4)", fontSize: 11, display: "block", marginBottom: 5 }}>{label}</label>
                <input value={value} onChange={(e) => set(e.target.value)} placeholder={ph} style={{ width: "100%", background: "var(--dsurface3)", border: "1px solid var(--dw1)", borderRadius: 9, padding: "8px 11px", color: "var(--dtext)", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
              </div>
            ))}
            <div>
              <label style={{ color: "var(--dw4)", fontSize: 11, display: "block", marginBottom: 5 }}>Category</label>
              <input list="category-suggestions" value={newCat} onChange={(e) => setNewCat(e.target.value)} style={{ width: "100%", background: "var(--dsurface3)", border: "1px solid var(--dw1)", borderRadius: 9, padding: "8px 11px", color: "var(--dtext)", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
              <datalist id="category-suggestions">
                {CATEGORY_SUGGESTIONS.map((c) => <option key={c} value={c} />)}
              </datalist>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={addService} disabled={saving} style={{ padding: "8px 20px", borderRadius: 9, background: "rgb(109,40,217)", border: "none", color: "white", fontSize: 13, fontWeight: 700, cursor: saving ? "default" : "pointer", opacity: saving ? 0.6 : 1 }}>
              {saving ? "Adding…" : "Add"}
            </button>
            <button onClick={() => setAdding(false)} style={{ padding: "8px 16px", borderRadius: 9, background: "var(--dsurface3)", border: "1px solid var(--dw1)", color: "var(--dw5)", fontSize: 13, cursor: "pointer" }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 2, background: "var(--dsurface2)", border: "1px solid var(--dw07)", borderRadius: 11, padding: 3, flexWrap: "wrap" }}>
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setCat(c)} style={{ padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: cat === c ? 700 : 500, background: cat === c ? "rgba(109,40,217,0.45)" : "transparent", color: cat === c ? "var(--dpurple-text)" : "var(--dw4)", transition: "all 0.15s" }}>
              {c}
            </button>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--dsurface2)", border: "1px solid var(--dw07)", borderRadius: 10, padding: "8px 12px", width: 220, flex: "0 1 220px" }}>
          <Search size={13} color="var(--dw3)" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search services…" style={{ background: "none", border: "none", outline: "none", color: "var(--dtext)", fontSize: 12.5, flex: 1, minWidth: 0 }} />
        </div>
      </div>

      {services.length === 0 ? (
        <div style={{ ...card, padding: "50px 20px", textAlign: "center", color: "var(--dw3)", fontSize: 13.5 }}>
          No services yet — add your first one to start building your booking page.
        </div>
      ) : cat === "All" ? (
        Object.entries(grouped).map(([category, list]) => (
          <div key={category}>
            <p style={{ color: "var(--dw35)", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 10px" }}>{category}</p>
            <ServiceTable rows={list} onToggle={handleToggle} onRemove={handleRemove} />
          </div>
        ))
      ) : (
        <ServiceTable rows={filtered} onToggle={handleToggle} onRemove={handleRemove} />
      )}
    </div>
  );
}

function ServiceTable({ rows, onToggle, onRemove }: { rows: ServiceRow[]; onToggle: (s: ServiceRow) => void; onRemove: (id: string) => void }) {
  return (
    <>
      <div className="services-table-wrap" style={{ background: "var(--dsurface1)", border: "1px solid var(--dw07)", borderRadius: 14, overflow: "hidden", marginBottom: 16 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          {rows.map((s, i) => {
            const cat = s.category || "Other";
            const c = colorForCategory(cat);
            return (
              <tr key={s.id} style={{ borderBottom: i < rows.length - 1 ? "1px solid var(--dw04)" : "none", opacity: s.active ? 1 : 0.45 }}>
                <td style={{ padding: "14px 18px", width: 36 }}>
                  <button
                    onClick={() => onToggle(s)}
                    style={{
                      width: 36, height: 20, borderRadius: 10, border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s",
                      background: s.active ? "rgb(109,40,217)" : "var(--dw12)",
                    }}
                  >
                    <span style={{ position: "absolute", top: 3, left: s.active ? 18 : 3, width: 14, height: 14, borderRadius: "50%", background: "white", transition: "left 0.2s" }} />
                  </button>
                </td>
                <td style={{ padding: "14px 8px", color: "var(--dtext)", fontSize: 13.5, fontWeight: 600 }}>{s.name}</td>
                <td style={{ padding: "14px 8px" }}>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 20, background: c.bg, color: c.text }}>
                    {cat}
                  </span>
                </td>
                <td style={{ padding: "14px 8px", color: "var(--dw4)", fontSize: 12.5 }}>{formatMinutes(s.duration_minutes)}</td>
                <td style={{ padding: "14px 18px", color: "var(--dtext)", fontSize: 14, fontWeight: 800, letterSpacing: "-0.02em" }}>C${s.price}</td>
                <td style={{ padding: "14px 18px", textAlign: "right" }}>
                  <button onClick={() => onRemove(s.id)} style={{ background: "none", border: "none", color: "rgba(239,68,68,0.5)", cursor: "pointer", padding: 5, borderRadius: 7 }}><Trash2 size={13} /></button>
                </td>
              </tr>
            );
          })}
        </tbody>
        </table>
      </div>

      <div className="services-card-list" style={{ display: "none", flexDirection: "column", gap: 8, marginBottom: 16 }}>
        {rows.map((s) => {
          const cat = s.category || "Other";
          const c = colorForCategory(cat);
          return (
            <div key={s.id} style={{ background: "var(--dsurface1)", border: "1px solid var(--dw07)", borderRadius: 14, padding: "14px 16px", opacity: s.active ? 1 : 0.45 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <button
                  onClick={() => onToggle(s)}
                  style={{
                    width: 36, height: 20, borderRadius: 10, border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0,
                    background: s.active ? "rgb(109,40,217)" : "var(--dw12)",
                  }}
                >
                  <span style={{ position: "absolute", top: 3, left: s.active ? 18 : 3, width: 14, height: 14, borderRadius: "50%", background: "white", transition: "left 0.2s" }} />
                </button>
                <span style={{ color: "var(--dtext)", fontSize: 13.5, fontWeight: 600, flex: 1, minWidth: 0 }}>{s.name}</span>
                <button onClick={() => onRemove(s.id)} style={{ background: "none", border: "none", color: "rgba(239,68,68,0.5)", cursor: "pointer", padding: 5, borderRadius: 7, flexShrink: 0 }}><Trash2 size={13} /></button>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 20, background: c.bg, color: c.text }}>{cat}</span>
                <span style={{ color: "var(--dw4)", fontSize: 12.5 }}>{formatMinutes(s.duration_minutes)}</span>
                <span style={{ color: "var(--dtext)", fontSize: 14, fontWeight: 800, letterSpacing: "-0.02em", marginLeft: "auto" }}>C${s.price}</span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
