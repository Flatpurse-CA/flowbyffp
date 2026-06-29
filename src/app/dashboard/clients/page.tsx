"use client";

import { useState } from "react";
import {
  Plus, Search, Zap, Star, Phone, Mail, MessageSquare,
  CreditCard, FileText, CalendarDays, X, ChevronRight,
  TrendingUp, Clock, AlertTriangle, Check, Send,
} from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────

type ChurnRisk = "low" | "medium" | "high";
type Tag = "VIP" | "New" | "Inactive" | "High Spender" | "Lapsed";

type Client = {
  id: number; name: string; initials: string; color: string;
  email: string; phone: string;
  visits: number; lastVisit: string; daysSince: number;
  ltv: string; avgSpend: string;
  nextAppt: string | null;
  churn: ChurnRisk; tags: Tag[];
  autopilot: boolean; rating: number;
  rebookInterval: number;
};

const CLIENTS: Client[] = [
  { id:1,  name:"Amara Obi",     initials:"AO", color:"rgb(167,139,250)", email:"amara@gmail.com",    phone:"+1 647 201 3344", visits:12, lastVisit:"Today",     daysSince:0,  ltv:"C$1,240", avgSpend:"C$103", nextAppt:"Jul 3, 2:00 PM",  churn:"low",    tags:["VIP","High Spender"], autopilot:true,  rating:5, rebookInterval:28 },
  { id:2,  name:"Lola Adeyemi",  initials:"LA", color:"rgb(52,211,153)",  email:"lola@icloud.com",    phone:"+1 416 882 7701", visits:8,  lastVisit:"Today",     daysSince:0,  ltv:"C$960",   avgSpend:"C$120", nextAppt:"Jun 30, 11:00 AM", churn:"low",    tags:["VIP"],                autopilot:true,  rating:5, rebookInterval:21 },
  { id:3,  name:"Temi Bello",    initials:"TB", color:"rgb(96,165,250)",  email:"temi@gmail.com",     phone:"+1 905 334 2299", visits:5,  lastVisit:"Today",     daysSince:0,  ltv:"C$510",   avgSpend:"C$102", nextAppt:null,               churn:"medium", tags:[],                     autopilot:true,  rating:4, rebookInterval:35 },
  { id:4,  name:"Zara Johnson",  initials:"ZJ", color:"rgb(251,191,36)",  email:"zara@yahoo.com",     phone:"+1 647 553 8812", visits:3,  lastVisit:"Today",     daysSince:0,  ltv:"C$340",   avgSpend:"C$113", nextAppt:null,               churn:"medium", tags:["New"],                autopilot:false, rating:4, rebookInterval:42 },
  { id:5,  name:"Chisom Eze",    initials:"CE", color:"rgb(248,113,113)", email:"chisom@gmail.com",   phone:"+1 416 772 0091", visits:7,  lastVisit:"Today",     daysSince:0,  ltv:"C$620",   avgSpend:"C$89",  nextAppt:"Jul 5, 3:00 PM",  churn:"low",    tags:["VIP"],                autopilot:true,  rating:5, rebookInterval:28 },
  { id:6,  name:"Bisola Akin",   initials:"BA", color:"rgb(52,211,153)",  email:"bisola@icloud.com",  phone:"+1 416 334 5567", visits:4,  lastVisit:"Yesterday", daysSince:1,  ltv:"C$430",   avgSpend:"C$108", nextAppt:"Tomorrow, 10 AM",  churn:"low",    tags:[],                     autopilot:true,  rating:4, rebookInterval:30 },
  { id:7,  name:"Ngozi Chukwu",  initials:"NC", color:"rgb(139,92,246)",  email:"ngozi@gmail.com",    phone:"+1 647 881 2230", visits:9,  lastVisit:"Jun 14",    daysSince:15, ltv:"C$1,100", avgSpend:"C$122", nextAppt:null,               churn:"medium", tags:["High Spender"],       autopilot:true,  rating:5, rebookInterval:21 },
  { id:8,  name:"Funmi Alabi",   initials:"FA", color:"rgb(251,146,60)",  email:"funmi@hotmail.com",  phone:"+1 416 229 4410", visits:2,  lastVisit:"Jun 12",    daysSince:17, ltv:"C$200",   avgSpend:"C$100", nextAppt:null,               churn:"high",   tags:["Inactive"],           autopilot:false, rating:3, rebookInterval:14 },
  { id:9,  name:"Adaeze Nwosu",  initials:"AN", color:"rgb(167,139,250)", email:"adaeze@gmail.com",   phone:"+1 647 990 3317", visits:6,  lastVisit:"Jun 10",    daysSince:19, ltv:"C$780",   avgSpend:"C$130", nextAppt:null,               churn:"high",   tags:["Lapsed"],             autopilot:true,  rating:5, rebookInterval:14 },
  { id:10, name:"Yemi Okafor",   initials:"YO", color:"rgb(96,165,250)",  email:"yemi@icloud.com",    phone:"+1 905 441 6688", visits:1,  lastVisit:"Jun 08",    daysSince:21, ltv:"C$65",    avgSpend:"C$65",  nextAppt:null,               churn:"high",   tags:["Inactive","Lapsed"],  autopilot:false, rating:3, rebookInterval:14 },
  { id:11, name:"Sola Dada",     initials:"SD", color:"rgb(52,211,153)",  email:"sola@gmail.com",     phone:"+1 416 773 2290", visits:11, lastVisit:"Jun 05",    daysSince:24, ltv:"C$1,380", avgSpend:"C$125", nextAppt:null,               churn:"high",   tags:["VIP","High Spender","Lapsed"], autopilot:true,  rating:5, rebookInterval:21 },
  { id:12, name:"Kemi Adesanya", initials:"KA", color:"rgb(248,113,113)", email:"kemi@yahoo.com",     phone:"+1 647 332 8815", visits:4,  lastVisit:"Jun 03",    daysSince:26, ltv:"C$450",   avgSpend:"C$113", nextAppt:null,               churn:"medium", tags:[],                     autopilot:true,  rating:4, rebookInterval:28 },
];

const VISIT_HISTORY = [
  { date:"Jun 29, 2026", service:"Full Highlights + Trim", stylist:"Emma",   price:"C$140", tip:"C$20",  status:"done"      },
  { date:"Jun 1, 2026",  service:"Silk Press",              stylist:"Grace",  price:"C$85",  tip:"C$15",  status:"done"      },
  { date:"May 3, 2026",  service:"Full Highlights",         stylist:"Emma",   price:"C$120", tip:"C$20",  status:"done"      },
  { date:"Apr 5, 2026",  service:"Knotless Braids",         stylist:"Grace",  price:"C$180", tip:"C$30",  status:"done"      },
  { date:"Mar 8, 2026",  service:"Colour + Gloss",          stylist:"Emma",   price:"C$160", tip:"C$25",  status:"done"      },
];

const AI_THREAD = [
  { from:"ai",     text:"Hi Amara! It's been 4 weeks since your last visit. Ready to book your next appointment?", time:"Jun 27, 9:00 AM" },
  { from:"client", text:"Oh yes! Can I come in next week?", time:"Jun 27, 9:14 AM" },
  { from:"ai",     text:"Perfect! I have Thursday Jul 3 at 2:00 PM with Emma available. Want me to book that for you?", time:"Jun 27, 9:14 AM" },
  { from:"client", text:"Yes please!", time:"Jun 27, 9:16 AM" },
  { from:"ai",     text:"Done! You're booked for Thu Jul 3 at 2:00 PM — Full Highlights with Emma. Confirmation sent to your phone.", time:"Jun 27, 9:16 AM" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const CHURN_DOT: Record<ChurnRisk, string> = {
  low:    "rgb(52,211,153)",
  medium: "rgb(251,191,36)",
  high:   "rgb(248,113,113)",
};

const TAG_STYLE: Record<string, { color: string; bg: string }> = {
  VIP:           { color: "rgb(251,191,36)",  bg: "rgba(245,158,11,0.12)"  },
  "New":         { color: "rgb(52,211,153)",  bg: "rgba(16,185,129,0.1)"   },
  Inactive:      { color: "rgb(248,113,113)", bg: "rgba(239,68,68,0.1)"    },
  "High Spender":{ color: "rgb(167,139,250)", bg: "rgba(139,92,246,0.12)"  },
  Lapsed:        { color: "rgb(251,146,60)",  bg: "rgba(249,115,22,0.1)"   },
};

const FILTER_CHIPS: Array<"All" | Tag> = ["All","VIP","New","Inactive","High Spender","Lapsed"];

const card: React.CSSProperties = {
  background: "rgba(255,255,255,0.025)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 16,
};

// ─── Client Profile overlay ───────────────────────────────────────────────────

const PROFILE_TABS = ["Overview","History","Wallet","Prefs","AI","Notes"] as const;
type ProfileTab = typeof PROFILE_TABS[number];

function ClientProfile({ client, onClose }: { client: Client; onClose: () => void }) {
  const [tab, setTab] = useState<ProfileTab>("Overview");
  const [note, setNote] = useState("");

  const statItem = (label: string, value: string, color?: string) => (
    <div style={{ textAlign: "center" }}>
      <p style={{ color: color ?? "rgb(250,250,250)", fontSize: 18, fontWeight: 800, margin: "0 0 2px", letterSpacing: "-0.02em" }}>{value}</p>
      <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, margin: 0, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>{label}</p>
    </div>
  );

  const actionBtn = (Icon: React.ElementType, label: string, primary?: boolean) => (
    <button style={{
      display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
      padding: "10px 12px", borderRadius: 12, border: `1px solid ${primary ? "rgba(139,92,246,0.4)" : "rgba(255,255,255,0.08)"}`,
      background: primary ? "rgba(109,40,217,0.15)" : "rgba(255,255,255,0.03)",
      cursor: "pointer", flex: 1,
    }}>
      <Icon size={18} color={primary ? "rgb(167,139,250)" : "rgba(255,255,255,0.5)"} strokeWidth={1.7} />
      <span style={{ color: primary ? "rgb(167,139,250)" : "rgba(255,255,255,0.45)", fontSize: 10.5, fontWeight: 600 }}>{label}</span>
    </button>
  );

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 300,
      background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }} onClick={onClose}>
      <div style={{
        background: "rgb(12,12,16)", border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 24, width: "100%", maxWidth: 600,
        maxHeight: "90vh", display: "flex", flexDirection: "column",
        margin: 20, overflow: "hidden",
        boxShadow: "0 32px 100px rgba(0,0,0,0.8)",
      }} onClick={e => e.stopPropagation()}>

        {/* ── Hero ── */}
        <div style={{ padding: "24px 24px 0", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>

            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              {/* Avatar + churn dot */}
              <div style={{ position: "relative" }}>
                <div style={{
                  width: 56, height: 56, borderRadius: "50%",
                  background: `${client.color}20`, border: `2px solid ${client.color}44`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, fontWeight: 800, color: client.color,
                }}>
                  {client.initials}
                </div>
                <span style={{
                  position: "absolute", bottom: 1, right: 1,
                  width: 12, height: 12, borderRadius: "50%",
                  background: CHURN_DOT[client.churn],
                  border: "2px solid rgb(12,12,16)",
                }} />
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <h2 style={{ color: "rgb(250,250,250)", fontSize: 20, fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>{client.name}</h2>
                  {client.churn === "high" && (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, color: "rgb(248,113,113)", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.2)" }}>
                      ⚠ Churn risk
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                  {client.tags.map(t => (
                    <span key={t} style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, color: TAG_STYLE[t].color, background: TAG_STYLE[t].bg }}>
                      {t}
                    </span>
                  ))}
                  {client.autopilot && (
                    <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, color: "rgb(167,139,250)", background: "rgba(109,40,217,0.12)" }}>
                      <Zap size={8} /> AutoPilot
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "rgba(255,255,255,0.45)", flexShrink: 0 }}>
              <X size={16} />
            </button>
          </div>

          {/* 4-stat strip */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(4,1fr)",
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 14, padding: "14px 16px", marginBottom: 16, gap: 8,
          }}>
            {statItem("Visits", String(client.visits))}
            <div style={{ width: 1, background: "rgba(255,255,255,0.06)" }} />
            {statItem("LTV", client.ltv, "rgb(52,211,153)")}
            <div style={{ width: 1, background: "rgba(255,255,255,0.06)" }} />
            {statItem("Avg spend", client.avgSpend)}
            <div style={{ width: 1, background: "rgba(255,255,255,0.06)" }} />
            {statItem("Last visit", client.lastVisit)}
          </div>

          {/* 6 quick actions */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {actionBtn(CalendarDays, "Book",   true)}
            {actionBtn(MessageSquare, "SMS")}
            {actionBtn(Phone, "Call")}
            {actionBtn(Mail, "Email")}
            {actionBtn(CreditCard, "Charge")}
            {actionBtn(FileText, "Note")}
          </div>

          {/* Tab bar */}
          <div style={{ display: "flex", gap: 0, borderBottom: "1px solid rgba(255,255,255,0.07)", overflowX: "auto" }}>
            {PROFILE_TABS.map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: "10px 16px", border: "none", background: "transparent", cursor: "pointer",
                fontSize: 12.5, fontWeight: tab === t ? 700 : 500,
                color: tab === t ? "rgb(210,196,254)" : "rgba(255,255,255,0.35)",
                borderBottom: tab === t ? "2px solid rgb(139,92,246)" : "2px solid transparent",
                whiteSpace: "nowrap", transition: "color 0.15s",
              }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab content ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px 24px" }}>

          {/* ── Overview ── */}
          {tab === "Overview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

              {/* Next appointment */}
              {client.nextAppt ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 14, padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <CalendarDays size={16} color="rgb(167,139,250)" />
                    <div>
                      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 2px" }}>Next appointment</p>
                      <p style={{ color: "rgb(250,250,250)", fontSize: 13.5, fontWeight: 700, margin: 0 }}>{client.nextAppt}</p>
                    </div>
                  </div>
                  <ChevronRight size={14} color="rgba(255,255,255,0.25)" />
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(248,113,113,0.06)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 14, padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <AlertTriangle size={16} color="rgb(248,113,113)" />
                    <div>
                      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 2px" }}>No upcoming appointment</p>
                      <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, margin: 0 }}>Last seen {client.lastVisit} · {client.daysSince > 0 ? `${client.daysSince} days ago` : "today"}</p>
                    </div>
                  </div>
                  <button style={{ padding: "6px 14px", borderRadius: 9, background: "rgb(109,40,217)", border: "none", color: "white", fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
                    Book now
                  </button>
                </div>
              )}

              {/* AI insight */}
              <div style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.18)", borderRadius: 14, padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                  <Zap size={13} color="rgb(167,139,250)" />
                  <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>AI Insight</span>
                </div>
                <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, margin: "0 0 12px", lineHeight: 1.55 }}>
                  {client.churn === "high"
                    ? `${client.name.split(" ")[0]} hasn't booked in ${client.daysSince} days — ${client.daysSince - client.rebookInterval} days past her usual interval. A win-back offer could recover C$${parseInt(client.avgSpend.replace("C$","")) * 2}+.`
                    : `${client.name.split(" ")[0]} books every ~${client.rebookInterval} days. She's due in ~${Math.max(0, client.rebookInterval - client.daysSince)} days — send a reminder now to secure the slot.`
                  }
                </p>
                <div style={{ display: "flex", gap: 8 }}>
                  {client.churn === "high" ? (
                    <>
                      <button style={{ padding: "7px 14px", borderRadius: 9, background: "rgba(139,92,246,0.2)", border: "1px solid rgba(139,92,246,0.3)", color: "rgb(167,139,250)", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                        Send win-back →
                      </button>
                      <button style={{ padding: "7px 14px", borderRadius: 9, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)", fontSize: 12, cursor: "pointer" }}>
                        Dismiss
                      </button>
                    </>
                  ) : (
                    <button style={{ padding: "7px 14px", borderRadius: 9, background: "rgba(139,92,246,0.2)", border: "1px solid rgba(139,92,246,0.3)", color: "rgb(167,139,250)", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                      Send reminder →
                    </button>
                  )}
                </div>
              </div>

              {/* Contact + revenue grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ ...card, padding: "14px 16px" }}>
                  <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 10px" }}>Contact</p>
                  {[{ Icon: Mail, val: client.email }, { Icon: Phone, val: client.phone }].map(({ Icon, val }) => (
                    <div key={val} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
                      <Icon size={12} color="rgba(255,255,255,0.3)" />
                      <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 12.5 }}>{val}</span>
                    </div>
                  ))}
                </div>
                <div style={{ ...card, padding: "14px 16px" }}>
                  <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 10px" }}>Revenue</p>
                  {[
                    { label: "Lifetime value", value: client.ltv, color: "rgb(52,211,153)" },
                    { label: "Avg per visit",  value: client.avgSpend },
                    { label: "Rebook every",   value: `~${client.rebookInterval}d` },
                  ].map(r => (
                    <div key={r.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>{r.label}</span>
                      <span style={{ color: r.color ?? "rgb(250,250,250)", fontSize: 12, fontWeight: 700 }}>{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── History ── */}
          {tab === "History" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 10px" }}>Past visits</p>
                <div style={{ ...card, overflow: "hidden" }}>
                  {VISIT_HISTORY.map((v, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 16px", borderBottom: i < VISIT_HISTORY.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                      <div style={{ width: 32, height: 32, borderRadius: 9, background: "rgba(139,92,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Check size={14} color="rgb(167,139,250)" strokeWidth={2} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ color: "rgb(250,250,250)", fontSize: 13, fontWeight: 700, margin: "0 0 2px" }}>{v.service}</p>
                        <p style={{ color: "rgba(255,255,255,0.32)", fontSize: 11.5, margin: 0 }}>{v.date} · {v.stylist}</p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ color: "rgb(52,211,153)", fontSize: 13, fontWeight: 700, margin: "0 0 2px" }}>{v.price}</p>
                        <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 11 }}>+{v.tip} tip</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI message thread */}
              <div>
                <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 10px" }}>AI ↔ client messages</p>
                <div style={{ ...card, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
                  {AI_THREAD.map((msg, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, flexDirection: msg.from === "ai" ? "row" : "row-reverse" }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                        background: msg.from === "ai" ? "rgba(139,92,246,0.2)" : client.color + "22",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 9, fontWeight: 800, color: msg.from === "ai" ? "rgb(167,139,250)" : client.color,
                      }}>
                        {msg.from === "ai" ? "AI" : client.initials}
                      </div>
                      <div style={{ maxWidth: "75%" }}>
                        <div style={{
                          padding: "9px 12px", borderRadius: msg.from === "ai" ? "4px 12px 12px 12px" : "12px 4px 12px 12px",
                          background: msg.from === "ai" ? "rgba(139,92,246,0.1)" : "rgba(255,255,255,0.06)",
                          border: `1px solid ${msg.from === "ai" ? "rgba(139,92,246,0.2)" : "rgba(255,255,255,0.07)"}`,
                        }}>
                          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 12.5, margin: 0, lineHeight: 1.5 }}>{msg.text}</p>
                        </div>
                        <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 10, margin: "3px 4px 0", textAlign: msg.from === "ai" ? "left" : "right" }}>{msg.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Wallet ── */}
          {tab === "Wallet" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Card visual */}
              <div style={{
                borderRadius: 18, padding: "22px 24px",
                background: "linear-gradient(135deg, rgb(88,28,218) 0%, rgb(109,40,217) 60%, rgb(167,139,250) 100%)",
                position: "relative", overflow: "hidden",
              }}>
                <div style={{ position: "absolute", top: -20, right: -20, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
                <div style={{ position: "absolute", bottom: -30, left: 40, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: 600, margin: "0 0 20px", letterSpacing: "0.05em" }}>SAVED CARD</p>
                <p style={{ color: "white", fontSize: 18, fontWeight: 700, letterSpacing: "0.15em", margin: "0 0 20px" }}>•••• •••• •••• 4242</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <div>
                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, margin: "0 0 2px" }}>Card holder</p>
                    <p style={{ color: "white", fontSize: 13, fontWeight: 700, margin: 0 }}>{client.name.toUpperCase()}</p>
                  </div>
                  <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 700, margin: 0 }}>VISA</p>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <button style={{ padding: "12px", borderRadius: 12, background: "rgb(109,40,217)", border: "none", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <CreditCard size={15} /> Charge client
                </button>
                <button style={{ padding: "12px", borderRadius: 12, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <Send size={15} /> Send pay link
                </button>
              </div>

              {/* Payment history */}
              <div>
                <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 10px" }}>Payment history</p>
                <div style={{ ...card, overflow: "hidden" }}>
                  {VISIT_HISTORY.map((v, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: i < VISIT_HISTORY.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                      <div>
                        <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, fontWeight: 600, margin: "0 0 2px" }}>{v.service}</p>
                        <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 11, margin: 0 }}>{v.date}</p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ color: "rgb(52,211,153)", fontSize: 13, fontWeight: 700, margin: "0 0 1px" }}>{v.price}</p>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20, color: "rgb(52,211,153)", background: "rgba(16,185,129,0.1)" }}>Paid</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Prefs ── */}
          {tab === "Prefs" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                {
                  title: "Service preferences",
                  items: [
                    { label: "Favourite services", value: "Full Highlights, Silk Press" },
                    { label: "Preferred stylist",  value: "Emma Watson"                 },
                    { label: "Appointment length", value: "Prefers 2h max"              },
                  ],
                },
                {
                  title: "Personalisation",
                  items: [
                    { label: "Allergies / sensitivities", value: "None on file"     },
                    { label: "Colour notes",              value: "Warm tones only"  },
                    { label: "Hair type",                 value: "Type 4B, fine"    },
                  ],
                },
                {
                  title: "Communication",
                  items: [
                    { label: "Preferred channel", value: "SMS"                     },
                    { label: "Reminder timing",   value: "24h before"              },
                    { label: "Marketing emails",  value: "Opted in"                },
                  ],
                },
              ].map(section => (
                <div key={section.title} style={{ ...card, padding: "16px 18px" }}>
                  <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 12px" }}>{section.title}</p>
                  {section.items.map(item => (
                    <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 8, marginBottom: 8, borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <span style={{ color: "rgba(255,255,255,0.38)", fontSize: 13 }}>{item.label}</span>
                      <span style={{ color: "rgb(250,250,250)", fontSize: 13, fontWeight: 600 }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* ── AI ── */}
          {tab === "AI" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Active automations */}
              <div style={{ ...card, padding: "16px 18px" }}>
                <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 12px" }}>Active automations</p>
                {[
                  { name: "Rebooking reminder", status: "Scheduled", color: "rgb(167,139,250)", detail: `Sends in ${Math.max(0, client.rebookInterval - client.daysSince)} days` },
                  { name: "Win-back flow",       status: client.churn === "high" ? "Active" : "Standby", color: client.churn === "high" ? "rgb(248,113,113)" : "rgba(255,255,255,0.25)", detail: client.churn === "high" ? "Triggered — awaiting response" : "Activates at 30 days overdue" },
                  { name: "Birthday offer",      status: "Active",    color: "rgb(251,146,60)",  detail: "Sends 3 days before birthday" },
                ].map(a => (
                  <div key={a.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <div>
                      <p style={{ color: "rgb(250,250,250)", fontSize: 13, fontWeight: 600, margin: "0 0 2px" }}>{a.name}</p>
                      <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11.5, margin: 0 }}>{a.detail}</p>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, color: a.color, background: `${a.color}18` }}>{a.status}</span>
                  </div>
                ))}
              </div>

              {/* Visit predictions */}
              <div style={{ ...card, padding: "16px 18px" }}>
                <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 12px" }}>Revenue predictions</p>
                {[
                  { label: "Next 30 days",  value: client.churn === "high" ? "At risk" : client.avgSpend,   color: client.churn === "high" ? "rgb(248,113,113)" : "rgb(52,211,153)" },
                  { label: "Next 90 days",  value: client.churn === "high" ? "C$0" : `C$${parseInt(client.avgSpend.replace("C$","")) * 3}`,  color: client.churn === "high" ? "rgb(248,113,113)" : "rgb(52,211,153)" },
                  { label: "Upsell potential", value: "+C$40/visit",    color: "rgb(167,139,250)" },
                  { label: "Churn probability", value: client.churn === "high" ? "68%" : client.churn === "medium" ? "24%" : "8%", color: client.churn === "high" ? "rgb(248,113,113)" : client.churn === "medium" ? "rgb(251,191,36)" : "rgb(52,211,153)" },
                ].map(r => (
                  <div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>{r.label}</span>
                    <span style={{ color: r.color, fontSize: 13, fontWeight: 700 }}>{r.value}</span>
                  </div>
                ))}
              </div>

              {/* Win-back CTA if high churn */}
              {client.churn === "high" && (
                <button style={{
                  padding: "13px", borderRadius: 13, border: "none",
                  background: "rgb(109,40,217)", color: "white",
                  fontSize: 13.5, fontWeight: 800, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}>
                  <Zap size={16} strokeWidth={2} />
                  Trigger win-back now — recover C${parseInt(client.avgSpend.replace("C$","")) * 2}
                </button>
              )}
            </div>
          )}

          {/* ── Notes ── */}
          {tab === "Notes" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Pinned note */}
              <div style={{ background: "rgba(251,191,36,0.07)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: 14, padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  <Star size={11} color="rgb(251,191,36)" fill="rgb(251,191,36)" />
                  <span style={{ color: "rgba(251,191,36,0.8)", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>Pinned</span>
                  <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 10 }}>· Jun 1, 2026 · Emma</span>
                </div>
                <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, margin: 0, lineHeight: 1.55 }}>
                  Client prefers warm tones only — never cool ash. Allergic to ammonium persulphate. Always patch test before bleach services. Very loyal, tips generously.
                </p>
              </div>

              {/* Past notes */}
              {[
                { date: "May 3, 2026", author: "Grace", text: "Requested to use only Olaplex treatment going forward. Hair was brittle after last colour." },
                { date: "Apr 5, 2026", author: "Emma",  text: "Booked 3 months of appointments in advance. Prefers early morning slots." },
              ].map((n, i) => (
                <div key={i} style={{ ...card, padding: "14px 16px" }}>
                  <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                    <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>{n.date}</span>
                    <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 11 }}>·</span>
                    <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>{n.author}</span>
                  </div>
                  <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, margin: 0, lineHeight: 1.5 }}>{n.text}</p>
                </div>
              ))}

              {/* Add note */}
              <div style={{ ...card, padding: "14px 16px" }}>
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Add a staff note…"
                  rows={3}
                  style={{
                    width: "100%", background: "transparent", border: "none", outline: "none",
                    color: "rgba(255,255,255,0.7)", fontSize: 13, lineHeight: 1.5,
                    resize: "none", fontFamily: "inherit", boxSizing: "border-box",
                  }}
                />
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                  <button style={{
                    padding: "7px 16px", borderRadius: 9, background: note.trim() ? "rgb(109,40,217)" : "rgba(255,255,255,0.05)",
                    border: "none", color: note.trim() ? "white" : "rgba(255,255,255,0.25)",
                    fontSize: 12.5, fontWeight: 700, cursor: note.trim() ? "pointer" : "default",
                  }}>
                    Save note
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Clients page ─────────────────────────────────────────────────────────────

export default function ClientsPage() {
  const [query, setQuery]       = useState("");
  const [filter, setFilter]     = useState<"All" | Tag>("All");
  const [selected, setSelected] = useState<Client | null>(null);

  const filtered = CLIENTS.filter(c => {
    const matchQ = query === "" || c.name.toLowerCase().includes(query.toLowerCase()) || c.email.toLowerCase().includes(query.toLowerCase());
    const matchF = filter === "All" || c.tags.includes(filter as Tag);
    return matchQ && matchF;
  });

  const highChurn  = CLIENTS.filter(c => c.churn === "high").length;
  const totalLTV   = CLIENTS.reduce((s, c) => s + parseInt(c.ltv.replace("C$","").replace(",","")), 0);

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ color: "rgb(250,250,250)", fontSize: 22, fontWeight: 800, margin: "0 0 3px", letterSpacing: "-0.03em" }}>Clients</h1>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, margin: 0 }}>
            {CLIENTS.length} clients · {CLIENTS.filter(c => c.autopilot).length} on AutoPilot
          </p>
        </div>
        <button style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 18px", borderRadius: 11, background: "rgb(109,40,217)", border: "none", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          <Plus size={15} strokeWidth={2.5} /> Add client
        </button>
      </div>

      {/* KPI strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        {[
          { label: "Total clients",  value: String(CLIENTS.length), sub: "+3 this month",    color: undefined },
          { label: "Total LTV",      value: `C$${totalLTV.toLocaleString()}`, sub: "all time", color: "rgb(52,211,153)" },
          { label: "Churn risk",     value: String(highChurn),      sub: `${highChurn} need attention`, color: "rgb(248,113,113)" },
          { label: "On AutoPilot",   value: String(CLIENTS.filter(c => c.autopilot).length), sub: "AI active", color: "rgb(167,139,250)" },
        ].map(s => (
          <div key={s.label} style={{ ...card, padding: "16px 18px" }}>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 6px" }}>{s.label}</p>
            <p style={{ color: s.color ?? "rgb(250,250,250)", fontSize: 24, fontWeight: 800, margin: "0 0 3px", letterSpacing: "-0.03em" }}>{s.value}</p>
            <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 11, margin: 0 }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        {/* Search */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "8px 12px", width: 240 }}>
          <Search size={13} color="rgba(255,255,255,0.3)" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search clients…" style={{ background: "none", border: "none", outline: "none", color: "rgb(250,250,250)", fontSize: 12.5, flex: 1 }} />
        </div>

        {/* Filter chips */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {FILTER_CHIPS.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: "7px 14px", borderRadius: 20,
              border: `1px solid ${filter === f ? "rgba(139,92,246,0.5)" : "rgba(255,255,255,0.08)"}`,
              background: filter === f ? "rgba(109,40,217,0.2)" : "rgba(255,255,255,0.03)",
              color: filter === f ? "rgb(210,196,254)" : "rgba(255,255,255,0.4)",
              fontSize: 12.5, fontWeight: filter === f ? 700 : 500, cursor: "pointer",
            }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Client list */}
      <div style={{ ...card, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Client","Tags","Visits · LTV · Last visit","Avg spend","AutoPilot",""].map((h, i) => (
                <th key={i} style={{ padding: "11px 18px", textAlign: "left", color: "rgba(255,255,255,0.25)", fontSize: 10.5, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", background: "rgba(255,255,255,0.015)", borderBottom: "1px solid rgba(255,255,255,0.05)", whiteSpace: "nowrap" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, i) => (
              <tr
                key={c.id}
                onClick={() => setSelected(c)}
                style={{ borderBottom: i < filtered.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", cursor: "pointer" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                {/* Client */}
                <td style={{ padding: "13px 18px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                    <div style={{ position: "relative" }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: "50%",
                        background: `${c.color}18`, border: `1.5px solid ${c.color}33`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 11, fontWeight: 800, color: c.color, flexShrink: 0,
                      }}>
                        {c.initials}
                      </div>
                      <span style={{
                        position: "absolute", bottom: 0, right: 0,
                        width: 9, height: 9, borderRadius: "50%",
                        background: CHURN_DOT[c.churn],
                        border: "1.5px solid rgb(10,10,12)",
                      }} />
                    </div>
                    <div>
                      <p style={{ color: "rgb(250,250,250)", fontSize: 13, fontWeight: 700, margin: "0 0 2px" }}>{c.name}</p>
                      <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11.5, margin: 0 }}>{c.email}</p>
                    </div>
                  </div>
                </td>

                {/* Tags */}
                <td style={{ padding: "13px 18px" }}>
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                    {c.tags.slice(0, 2).map(t => (
                      <span key={t} style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20, color: TAG_STYLE[t].color, background: TAG_STYLE[t].bg, whiteSpace: "nowrap" }}>{t}</span>
                    ))}
                  </div>
                </td>

                {/* Stats */}
                <td style={{ padding: "13px 18px" }}>
                  <div style={{ display: "flex", gap: 14 }}>
                    <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12.5 }}>
                      <span style={{ color: "rgb(250,250,250)", fontWeight: 700 }}>{c.visits}</span> visits
                    </span>
                    <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12.5 }}>
                      <span style={{ color: "rgb(52,211,153)", fontWeight: 700 }}>{c.ltv}</span>
                    </span>
                    <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 12.5 }}>{c.lastVisit}</span>
                  </div>
                </td>

                {/* Avg spend */}
                <td style={{ padding: "13px 18px", color: "rgb(250,250,250)", fontSize: 13, fontWeight: 600 }}>{c.avgSpend}</td>

                {/* AutoPilot */}
                <td style={{ padding: "13px 18px" }}>
                  {c.autopilot
                    ? <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, color: "rgb(167,139,250)", background: "rgba(109,40,217,0.12)", width: "fit-content" }}><Zap size={9} strokeWidth={2.5} /> ON</span>
                    : <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, color: "rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.04)" }}>OFF</span>
                  }
                </td>

                {/* Arrow */}
                <td style={{ padding: "13px 18px" }}>
                  <ChevronRight size={14} color="rgba(255,255,255,0.2)" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div style={{ padding: "60px 20px", textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: 13 }}>No clients found</div>
        )}
      </div>

      {/* Profile overlay */}
      {selected && <ClientProfile client={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
