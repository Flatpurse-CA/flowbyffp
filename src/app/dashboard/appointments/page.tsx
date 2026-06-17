"use client";

import { useState } from "react";
import { Plus, Search, Filter, Clock, MoreHorizontal, ChevronDown } from "lucide-react";

const ALL_APPOINTMENTS = [
  { id: 1,  name: "Amara Obi",      service: "Full Highlights + Trim",  date: "Today",     time: "9:00 AM",   stylist: "Fatima",  duration: "2h",    price: "$140", status: "confirmed" },
  { id: 2,  name: "Lola Adeyemi",   service: "Knotless Braids",         date: "Today",     time: "11:30 AM",  stylist: "Grace",   duration: "3h",    price: "$180", status: "confirmed" },
  { id: 3,  name: "Temi Bello",     service: "Silk Press",              date: "Today",     time: "1:00 PM",   stylist: "Fatima",  duration: "1.5h",  price: "$85",  status: "pending"   },
  { id: 4,  name: "Zara Johnson",   service: "Colour + Gloss",          date: "Today",     time: "3:00 PM",   stylist: "Grace",   duration: "2.5h",  price: "$160", status: "confirmed" },
  { id: 5,  name: "Chisom Eze",     service: "Trim + Blowout",          date: "Today",     time: "5:00 PM",   stylist: "Fatima",  duration: "1h",    price: "$65",  status: "confirmed" },
  { id: 6,  name: "Bisola Akin",    service: "Deep Condition + Set",    date: "Tomorrow",  time: "10:00 AM",  stylist: "Grace",   duration: "1.5h",  price: "$90",  status: "confirmed" },
  { id: 7,  name: "Ngozi Chukwu",   service: "Full Colour",             date: "Tomorrow",  time: "12:00 PM",  stylist: "Fatima",  duration: "3h",    price: "$220", status: "confirmed" },
  { id: 8,  name: "Funmi Alabi",    service: "Loc Retwist",             date: "Wed Jun 19",time: "9:00 AM",   stylist: "Grace",   duration: "2h",    price: "$110", status: "pending"   },
  { id: 9,  name: "Adaeze Nwosu",   service: "Balayage",                date: "Wed Jun 19",time: "2:00 PM",   stylist: "Fatima",  duration: "4h",    price: "$280", status: "confirmed" },
  { id: 10, name: "Yemi Okafor",    service: "Trim + Blowout",          date: "Thu Jun 20",time: "11:00 AM",  stylist: "Grace",   duration: "1h",    price: "$65",  status: "cancelled" },
  { id: 11, name: "Sola Dada",      service: "Knotless Braids",         date: "Fri Jun 21",time: "10:30 AM",  stylist: "Fatima",  duration: "3h",    price: "$180", status: "confirmed" },
  { id: 12, name: "Kemi Adesanya",  service: "Silk Press + Trim",       date: "Fri Jun 21",time: "2:30 PM",   stylist: "Grace",   duration: "2h",    price: "$105", status: "confirmed" },
];

const TABS = ["All", "Today", "Upcoming", "Completed", "Cancelled"];

const statusStyle = (s: string): React.CSSProperties => ({
  fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20,
  letterSpacing: "0.04em", textTransform: "uppercase",
  color: s === "confirmed" ? "rgb(52,211,153)" : s === "pending" ? "rgb(251,191,36)" : "rgb(248,113,113)",
  background: s === "confirmed" ? "rgba(16,185,129,0.1)" : s === "pending" ? "rgba(245,158,11,0.1)" : "rgba(239,68,68,0.1)",
});

export default function AppointmentsPage() {
  const [tab, setTab]       = useState("All");
  const [query, setQuery]   = useState("");

  const filtered = ALL_APPOINTMENTS.filter((a) => {
    const matchTab =
      tab === "All"       ? true :
      tab === "Today"     ? a.date === "Today" :
      tab === "Upcoming"  ? ["Tomorrow", "Wed Jun 19", "Thu Jun 20", "Fri Jun 21"].includes(a.date) :
      tab === "Completed" ? false :
      tab === "Cancelled" ? a.status === "cancelled" : true;
    const matchQ = query === "" || a.name.toLowerCase().includes(query.toLowerCase()) || a.service.toLowerCase().includes(query.toLowerCase());
    return matchTab && matchQ;
  });

  const card: React.CSSProperties = {
    background: "rgba(255,255,255,0.025)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 16,
    overflow: "hidden",
  };

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", flexDirection: "column", gap: 22 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ color: "rgb(250,250,250)", fontSize: 22, fontWeight: 800, margin: "0 0 3px", letterSpacing: "-0.03em" }}>Appointments</h1>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, margin: 0 }}>{ALL_APPOINTMENTS.length} total bookings</p>
        </div>
        <button style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 18px", borderRadius: 11, background: "rgb(109,40,217)", border: "none", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", letterSpacing: "-0.01em" }}>
          <Plus size={15} strokeWidth={2.5} />
          New booking
        </button>
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {/* Tabs */}
        <div style={{ display: "flex", gap: 2, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 11, padding: 3 }}>
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12.5, fontWeight: tab === t ? 700 : 500,
                background: tab === t ? "rgba(109,40,217,0.45)" : "transparent",
                color: tab === t ? "rgb(210,196,254)" : "rgba(255,255,255,0.4)",
                transition: "all 0.15s",
              }}
            >
              {t}
            </button>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        {/* Search */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "8px 12px", width: 220 }}>
          <Search size={13} color="rgba(255,255,255,0.3)" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search client or service…"
            style={{ background: "none", border: "none", outline: "none", color: "rgb(250,250,250)", fontSize: 12.5, flex: 1 }}
          />
        </div>

        {/* Filter */}
        <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 13px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, color: "rgba(255,255,255,0.45)", fontSize: 12.5, cursor: "pointer" }}>
          <Filter size={13} />
          Filter
          <ChevronDown size={12} />
        </button>
      </div>

      {/* Table */}
      <div style={card}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Client", "Service", "Date", "Time", "Stylist", "Duration", "Price", "Status", ""].map((h, i) => (
                <th key={i} style={{ padding: "12px 18px", textAlign: "left", color: "rgba(255,255,255,0.28)", fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", background: "rgba(255,255,255,0.015)", borderBottom: "1px solid rgba(255,255,255,0.05)", whiteSpace: "nowrap" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((a, i) => (
              <tr key={a.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                <td style={{ padding: "13px 18px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: `hsl(${(a.id * 53 + 240) % 360},40%,26%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.85)", flexShrink: 0 }}>
                      {a.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <span style={{ color: "rgb(250,250,250)", fontSize: 13, fontWeight: 600 }}>{a.name}</span>
                  </div>
                </td>
                <td style={{ padding: "13px 18px", color: "rgba(255,255,255,0.5)", fontSize: 13, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.service}</td>
                <td style={{ padding: "13px 18px", color: "rgba(255,255,255,0.5)", fontSize: 13, whiteSpace: "nowrap" }}>{a.date}</td>
                <td style={{ padding: "13px 18px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, color: "rgba(255,255,255,0.5)", fontSize: 13, whiteSpace: "nowrap" }}>
                    <Clock size={12} strokeWidth={1.8} />
                    {a.time}
                  </div>
                </td>
                <td style={{ padding: "13px 18px", color: "rgba(255,255,255,0.5)", fontSize: 13 }}>{a.stylist}</td>
                <td style={{ padding: "13px 18px", color: "rgba(255,255,255,0.4)", fontSize: 13 }}>{a.duration}</td>
                <td style={{ padding: "13px 18px", color: "rgb(52,211,153)", fontSize: 13, fontWeight: 600 }}>{a.price}</td>
                <td style={{ padding: "13px 18px" }}><span style={statusStyle(a.status)}>{a.status}</span></td>
                <td style={{ padding: "13px 18px" }}>
                  <button style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", padding: 4 }}>
                    <MoreHorizontal size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div style={{ padding: "60px 20px", textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: 13 }}>
            No appointments found
          </div>
        )}
      </div>
    </div>
  );
}
