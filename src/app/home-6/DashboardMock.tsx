"use client";

// Static, illustrative copy of the owner dashboard home (src/app/dashboard/
// HomeClient.tsx + DashboardShell.tsx, light theme) for the landing hero, in
// place of /home3/app-screenshot.png. Laid out at a fixed 1400px "design
// width" and scaled to fit, so it reads like a real screenshot at any size.
// Numbers are sample data for a busy salon.

import { useEffect, useRef, useState } from "react";
import {
  LayoutGrid, CalendarDays, Users2, Wallet, Star, MessageSquare, Zap, LayoutDashboard, Compass,
  ChevronRight, Search, Sparkles, Bell, Moon, ChevronDown, AlertTriangle, BarChart2, Clock,
} from "lucide-react";

const W = 1400;
const VIOLET = "rgb(109,40,217)";
const GREEN = "rgb(4,120,87)";
const RED = "rgb(200,30,30)";
const BLUE = "rgb(29,78,216)";
const INK = "rgb(12,12,20)";
const LABEL = "rgba(0,0,0,0.43)";
const LINE = "1px solid rgba(0,0,0,0.09)";

const card: React.CSSProperties = { background: "#fff", border: LINE, borderRadius: 18, overflow: "hidden" };

const WEEK = [
  { d: "F", v: 520 }, { d: "S", v: 840 }, { d: "S", v: 310 }, { d: "M", v: 460 },
  { d: "T", v: 690 }, { d: "W", v: 580 }, { d: "T", v: 385 },
];

const SCHEDULE = [
  { t: "9:00 AM", n: "Amara Okafor", s: "Silk press", who: "Maya", st: "done", p: 95 },
  { t: "10:30 AM", n: "Jordan Lee", s: "Skin fade and beard", who: "Dre", st: "done", p: 55 },
  { t: "11:15 AM", n: "Priya Shah", s: "Balayage", who: "Maya", st: "done", p: 210 },
  { t: "1:00 PM", n: "Chloe Martin", s: "Colour and cut", who: "Dre", st: "next", p: 140 },
  { t: "2:30 PM", n: "Tunde Bello", s: "Classic cut", who: "Sam", st: "confirmed", p: 40 },
  { t: "3:15 PM", n: "Emily Tremblay", s: "Gel manicure", who: "Ivy", st: "deposit", p: 60 },
];

const AVATARS = ["rgb(52,211,153)", "rgb(248,113,113)", "rgb(139,92,246)", "rgb(251,146,60)", "rgb(96,165,250)"];
const AVATAR_BG = ["rgb(214,246,234)", "rgb(254,226,226)", "rgb(237,233,254)", "rgb(255,237,213)", "rgb(219,234,254)"];
const AVATAR_FG = ["rgb(4,120,87)", "rgb(185,28,28)", "rgb(91,33,182)", "rgb(194,65,12)", "rgb(29,78,216)"];

const STATUS: Record<string, { label: string; color: string; bg: string }> = {
  done: { label: "Done", color: LABEL, bg: "rgb(238,238,240)" },
  next: { label: "Up next", color: "#fff", bg: VIOLET },
  confirmed: { label: "Confirmed", color: GREEN, bg: "rgb(214,246,234)" },
  deposit: { label: "Deposit due", color: "rgb(146,64,14)", bg: "rgb(254,236,200)" },
};

export default function DashboardMock() {
  const wrap = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setScale(e.contentRect.width / W));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const max = Math.max(...WEEK.map(w => w.v));

  return (
    <div
      ref={wrap}
      role="img"
      aria-label="FlatPurse Flow dashboard showing C$4,860 recovered by AutoPilot this month, 14 bookings today and C$18,420 revenue this month"
      style={{ position: "absolute", inset: 0, overflow: "hidden", background: "rgb(246,246,248)" }}
    >
      <div aria-hidden="true" style={{ width: W, transformOrigin: "0 0", transform: `scale(${scale})`, opacity: scale ? 1 : 0, display: "flex", fontFamily: "inherit", color: INK }}>
        {/* Sidebar */}
        <div style={{ width: 76, flexShrink: 0, borderRight: LINE, background: "#fff", minHeight: 900, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 18, gap: 10 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgb(237,233,254)", border: "1px solid rgb(221,214,254)", color: VIOLET, fontWeight: 800, fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>N</div>
          <div style={{ width: 40, height: 28, borderRadius: 8, border: LINE, background: "rgb(246,246,248)", display: "flex", alignItems: "center", justifyContent: "center" }}><ChevronRight size={14} color={LABEL} /></div>
          <div style={{ width: "100%", borderTop: LINE, margin: "6px 0 6px" }} />
          {[LayoutGrid, CalendarDays, Users2, Wallet, Star, MessageSquare, Zap, LayoutDashboard, Compass].map((Icon, i) => (
            <div key={i} style={{ width: 52, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", background: i === 0 ? "rgb(237,233,254)" : "transparent" }}>
              <Icon size={19} strokeWidth={1.7} color={i === 0 ? VIOLET : "rgba(0,0,0,0.5)"} />
            </div>
          ))}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Top bar */}
          <div style={{ height: 80, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 34px", borderBottom: LINE, background: "#fff" }}>
            <div>
              <p style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Good morning, Nnamdi</p>
              <p style={{ margin: "2px 0 0", fontSize: 12.5, color: "rgba(0,0,0,0.5)" }}>Here&apos;s what&apos;s happening today.</p>
            </div>
            <div style={{ width: 330, height: 42, borderRadius: 11, border: LINE, background: "rgb(246,246,248)", display: "flex", alignItems: "center", gap: 9, padding: "0 12px", color: "rgba(0,0,0,0.45)", fontSize: 13.5 }}>
              <Search size={15} /> <span style={{ flex: 1 }}>Search anything...</span>
              <span style={{ fontSize: 11, padding: "2px 7px", borderRadius: 6, background: "rgb(232,232,236)" }}>⌘K</span>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {[MessageSquare, Sparkles, Bell, Moon].map((Icon, i) => (
                <div key={i} style={{ position: "relative", width: 40, height: 40, borderRadius: 11, border: LINE, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={16} strokeWidth={1.7} color="rgba(0,0,0,0.6)" />
                  {i === 2 && <span style={{ position: "absolute", top: 5, right: 6, width: 15, height: 15, borderRadius: 8, background: VIOLET, color: "#fff", fontSize: 9, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>5</span>}
                </div>
              ))}
              <div style={{ height: 40, borderRadius: 11, border: LINE, display: "flex", alignItems: "center", gap: 6, padding: "0 8px 0 5px" }}>
                <span style={{ width: 30, height: 30, borderRadius: "50%", background: VIOLET, color: "#fff", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>N</span>
                <ChevronDown size={14} color={LABEL} />
              </div>
            </div>
          </div>

          <div style={{ padding: "18px 34px 34px", display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p style={{ margin: 0, fontSize: 13.5, color: "rgba(0,0,0,0.55)" }}>Saturday, November 14</p>
              <span style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 30, background: "rgb(214,246,234)", color: GREEN, fontSize: 11.5, fontWeight: 700 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: GREEN }} /> Live
              </span>
            </div>

            {/* AutoPilot card */}
            <div style={{ background: VIOLET, borderRadius: 20, padding: "22px 26px", position: "relative", display: "flex", justifyContent: "space-between", gap: 30 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "rgb(52,211,153)", boxShadow: "0 0 0 3px rgb(84,52,190)" }} />
                  <span style={{ color: "rgb(180,246,214)", fontSize: 11, fontWeight: 800, letterSpacing: "0.1em" }}>AUTOPILOT IS ON</span>
                </div>
                <p style={{ color: "rgb(214,203,247)", fontSize: 12, fontWeight: 600, margin: "0 0 4px", letterSpacing: "0.03em" }}>RECOVERED THIS MONTH</p>
                <p style={{ color: "#fff", fontSize: 46, fontWeight: 800, margin: "0 0 20px", letterSpacing: "-0.04em", lineHeight: 1 }}>C$4,860</p>
                <div style={{ display: "flex", gap: 30 }}>
                  {[
                    { v: "C$385", l: "Today" }, { v: "23", l: "Slots filled" }, { v: "14", l: "No-shows saved" },
                    { v: "11", l: "Win-backs" }, { v: "96%", l: "Show-up rate" },
                  ].map(s => (
                    <div key={s.l}>
                      <p style={{ color: "#fff", fontSize: 18, fontWeight: 800, margin: "0 0 2px", letterSpacing: "-0.03em" }}>{s.v}</p>
                      <p style={{ color: "rgb(205,192,245)", fontSize: 11, margin: 0 }}>{s.l}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "space-between" }}>
                <span style={{ width: 34, height: 34, borderRadius: "50%", background: "rgb(128,70,226)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}><ChevronRight size={17} strokeWidth={2.5} /></span>
                <div>
                  <p style={{ color: "rgb(205,192,245)", fontSize: 11, fontWeight: 600, margin: "0 0 8px", textAlign: "right" }}>Recovered, last 7 days</p>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 92 }}>
                    {WEEK.map((w, i) => (
                      <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                        <span style={{ color: "rgb(205,192,245)", fontSize: 9.5, fontWeight: 700 }}>{w.v}</span>
                        <div style={{ width: 26, height: Math.round((w.v / max) * 58), borderRadius: 6, background: i === WEEK.length - 1 ? "rgb(52,211,153)" : "rgb(146,98,236)" }} />
                        <span style={{ color: "rgb(205,192,245)", fontSize: 10 }}>{w.d}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Stat cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
              {[
                { icon: CalendarDays, iconC: VIOLET, iconBg: "rgb(237,233,254)", label: "TODAY'S BOOKINGS", value: "14", sub: "Next at 1:00 PM", subC: LABEL },
                { icon: AlertTriangle, iconC: RED, iconBg: "rgb(254,226,226)", label: "NEEDS YOUR EYES", value: "2", valueC: RED, sub: "Deposit due for Emily T.", subC: LABEL, badge: 2 },
                { icon: BarChart2, iconC: BLUE, iconBg: "rgb(219,234,254)", label: "THIS MONTH", value: "C$18,420", sub: "+23% vs last month", subC: GREEN },
                { icon: Star, iconC: "rgb(180,83,9)", iconBg: "rgb(254,236,200)", label: "GOOGLE RATING", value: "4.9", sub: "38 new reviews", subC: LABEL },
              ].map(c => (
                <div key={c.label} style={{ ...card, padding: "20px 20px 18px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                    <div style={{ position: "relative", width: 36, height: 36, borderRadius: 10, background: c.iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <c.icon size={17} color={c.iconC} strokeWidth={1.8} />
                      {c.badge && <span style={{ position: "absolute", top: -4, right: -4, minWidth: 16, height: 16, borderRadius: 8, background: "rgb(239,68,68)", color: "#fff", fontSize: 9, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{c.badge}</span>}
                    </div>
                    <ChevronRight size={15} color="rgba(0,0,0,0.28)" />
                  </div>
                  <p style={{ color: LABEL, fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", margin: "0 0 6px" }}>{c.label}</p>
                  <p style={{ color: c.valueC ?? INK, fontSize: 28, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.04em" }}>{c.value}</p>
                  <p style={{ color: c.subC, fontSize: 12, margin: 0 }}>{c.sub}</p>
                </div>
              ))}
            </div>

            {/* Schedule + side column */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16 }}>
              <div style={card}>
                <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid rgba(0,0,0,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <p style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Today&apos;s Schedule <span style={{ color: LABEL, fontWeight: 600, fontSize: 12.5, marginLeft: 6 }}>14 bookings · C$1,640</span></p>
                  <span style={{ display: "flex", alignItems: "center", gap: 4, color: VIOLET, fontSize: 12, fontWeight: 600 }}>View all <ChevronRight size={13} /></span>
                </div>
                <div style={{ padding: "8px 0" }}>
                  {SCHEDULE.map((r, i) => {
                    const s = STATUS[r.st];
                    const a = i % AVATARS.length;
                    const initials = r.n.split(" ").map(p => p[0]).join("");
                    return (
                      <div key={r.n} style={{ display: "flex", alignItems: "center", gap: 14, padding: "11px 20px", background: r.st === "next" ? "rgb(248,246,255)" : "transparent" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 4, width: 70, flexShrink: 0 }}>
                          <Clock size={11} color="rgba(0,0,0,0.35)" />
                          <span style={{ color: "rgba(0,0,0,0.45)", fontSize: 11.5, fontWeight: 600 }}>{r.t}</span>
                        </div>
                        <div style={{ width: 34, height: 34, borderRadius: "50%", flexShrink: 0, background: AVATAR_BG[a], border: `1.5px solid ${AVATARS[a]}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: AVATAR_FG[a] }}>{initials}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 700, margin: "0 0 1px" }}>{r.n}</p>
                          <p style={{ color: "rgba(0,0,0,0.45)", fontSize: 11.5, margin: 0 }}>{r.s} · {r.who}</p>
                        </div>
                        <span style={{ fontSize: 10.5, fontWeight: 700, padding: "3px 9px", borderRadius: 20, color: s.color, background: s.bg }}>{s.label}</span>
                        <span style={{ color: GREEN, fontSize: 13, fontWeight: 700, minWidth: 50, textAlign: "right" }}>C${r.p}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ ...card, padding: "18px 20px" }}>
                  <p style={{ color: "rgba(0,0,0,0.48)", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", margin: "0 0 14px" }}>QUICK ACTIONS</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {["+ New booking", "Go to Clients", "View AutoPilot"].map((l, i) => (
                      <div key={l} style={{ padding: "10px 14px", borderRadius: 10, background: i === 0 ? VIOLET : "#fff", border: LINE, color: i === 0 ? "#fff" : "rgba(0,0,0,0.78)", fontSize: 13, fontWeight: 700, textAlign: "center" }}>{l}</div>
                    ))}
                  </div>
                </div>
                <div style={{ ...card, padding: "18px 20px" }}>
                  <p style={{ color: "rgba(0,0,0,0.48)", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", margin: "0 0 12px" }}>TEAM TODAY</p>
                  {[{ n: "Maya", b: 5, r: "C$640" }, { n: "Dre", b: 6, r: "C$520" }, { n: "Ivy", b: 3, r: "C$480" }].map(t => (
                    <div key={t.n} style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, padding: "6px 0" }}>
                      <span style={{ fontWeight: 700 }}>{t.n} <span style={{ color: LABEL, fontWeight: 500 }}>· {t.b} bookings</span></span>
                      <span style={{ color: GREEN, fontWeight: 700 }}>{t.r}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
