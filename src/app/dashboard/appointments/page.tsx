"use client";

import { useState } from "react";
import {
  Plus, Search, Copy, Check, MessageSquare,
  Mail, ExternalLink, Zap, Clock, ChevronRight,
  X, Link2, Phone, CreditCard, Banknote, Smartphone,
  Send, Pencil, Ban, CheckCircle2, StickyNote,
} from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────

const BOOKING_LINK = "flowbyffp.co/book/george";

type Booking = {
  id: number; hour: number; min: number; duration: number;
  name: string; initials: string; color: string;
  service: string; stylist: string; price: string;
  status: "confirmed" | "pending" | "deposit";
  phone: string; email: string; notes: string; depositAmount?: string;
};

const DAY_BOOKINGS: Booking[] = [
  { id:1,  hour:9,  min:0,  duration:90, name:"Amara Obi",     initials:"AO", color:"rgb(52,211,153)",  service:"Full Highlights + Trim", stylist:"Emma",   price:"C$140", status:"confirmed", phone:"+1 647 201 3344", email:"amara@gmail.com",   notes:"Prefers no heat on ends. Allergic to sulfates — use the sulfate-free line." },
  { id:2,  hour:11, min:0,  duration:60, name:"Lola Adeyemi",  initials:"LA", color:"rgb(167,139,250)", service:"Knotless Braids",         stylist:"Grace",  price:"C$180", status:"confirmed", phone:"+1 416 882 7701", email:"lola@icloud.com",   notes:"Likes braids medium length, box parting." },
  { id:3,  hour:13, min:0,  duration:60, name:"Temi Bello",    initials:"TB", color:"rgb(251,191,36)",  service:"Silk Press",               stylist:"Emma",   price:"C$85",  status:"pending",   phone:"+1 905 334 2299", email:"temi@gmail.com",    notes:"First-time client — walked in from Instagram." },
  { id:4,  hour:15, min:0,  duration:90, name:"Zara Johnson",  initials:"ZJ", color:"rgb(96,165,250)",  service:"Colour + Gloss",           stylist:"Grace",  price:"C$160", status:"deposit",   phone:"+1 647 553 8812", email:"zara@yahoo.com",    notes:"C$40 deposit paid at booking — balance due at close-out.", depositAmount:"C$40" },
  { id:5,  hour:17, min:0,  duration:60, name:"Chisom Eze",    initials:"CE", color:"rgb(248,113,113)", service:"Trim + Blowout",           stylist:"Emma",   price:"C$65",  status:"confirmed", phone:"+1 416 772 0091", email:"chisom@gmail.com",  notes:"" },
];

// Open slots (hour, revenue lost)
const OPEN_SLOTS = [10, 12, 14, 16];
const OPEN_REVENUE: Record<number, string> = { 10:"C$85", 12:"C$140", 14:"C$95", 16:"C$120" };
const FAMILY_HOURS = [18, 19]; // 6–8 PM

const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM – 7 PM

const WEEK_DAYS = [
  { label: "Mon", date: "Jun 23", booked: 6,  total: 8,  revenue: "C$890",  closed: false },
  { label: "Tue", date: "Jun 24", booked: 8,  total: 8,  revenue: "C$1,240",closed: false },
  { label: "Wed", date: "Jun 25", booked: 5,  total: 8,  revenue: "C$760",  closed: false },
  { label: "Thu", date: "Jun 26", booked: 4,  total: 8,  revenue: "C$580",  closed: false },
  { label: "Fri", date: "Jun 27", booked: 7,  total: 8,  revenue: "C$1,080",closed: false },
  { label: "Sat", date: "Jun 28", booked: 8,  total: 9,  revenue: "C$1,420",closed: false },
  { label: "Sun", date: "Jun 29", booked: 0,  total: 0,  revenue: "—",      closed: true  },
];

const LIST_BOOKINGS = [
  { id:1,  date:"Today",          time:"9:00 AM",  name:"Amara Obi",    service:"Full Highlights",  stylist:"Emma",  price:"C$140", status:"confirmed", duration:90, phone:"+1 647 201 3344", email:"amara@gmail.com",   notes:"Prefers no heat on ends. Allergic to sulfates." },
  { id:2,  date:"Today",          time:"11:00 AM", name:"Lola Adeyemi", service:"Knotless Braids",  stylist:"Grace", price:"C$180", status:"confirmed", duration:60, phone:"+1 416 882 7701", email:"lola@icloud.com",   notes:"Likes braids medium length, box parting." },
  { id:3,  date:"Today",          time:"1:00 PM",  name:"Temi Bello",   service:"Silk Press",       stylist:"Emma",  price:"C$85",  status:"pending",   duration:60, phone:"+1 905 334 2299", email:"temi@gmail.com",    notes:"First-time client — walked in from Instagram." },
  { id:4,  date:"Today",          time:"3:00 PM",  name:"Zara Johnson", service:"Colour + Gloss",   stylist:"Grace", price:"C$160", status:"deposit",   duration:90, phone:"+1 647 553 8812", email:"zara@yahoo.com",    notes:"C$40 deposit paid at booking — balance due at close-out.", depositAmount:"C$40" },
  { id:5,  date:"Today",          time:"5:00 PM",  name:"Chisom Eze",   service:"Trim + Blowout",   stylist:"Emma",  price:"C$65",  status:"confirmed", duration:60, phone:"+1 416 772 0091", email:"chisom@gmail.com",  notes:"" },
  { id:6,  date:"Tomorrow",       time:"10:00 AM", name:"Bisola Akin",  service:"Deep Condition",   stylist:"Grace", price:"C$90",  status:"confirmed", duration:60, phone:"+1 416 334 5567", email:"bisola@icloud.com", notes:"" },
  { id:7,  date:"Tomorrow",       time:"12:00 PM", name:"Ngozi Chukwu", service:"Full Colour",      stylist:"Emma",  price:"C$220", status:"confirmed", duration:120,phone:"+1 647 881 2230", email:"ngozi@gmail.com",   notes:"Wants a deeper auburn tone than last time." },
  { id:8,  date:"Wed, Jun 25",    time:"9:00 AM",  name:"Funmi Alabi",  service:"Loc Retwist",      stylist:"Grace", price:"C$110", status:"pending",   duration:90, phone:"+1 416 229 4410", email:"funmi@hotmail.com", notes:"" },
  { id:9,  date:"Wed, Jun 25",    time:"2:00 PM",  name:"Adaeze Nwosu", service:"Balayage",         stylist:"Emma",  price:"C$280", status:"confirmed", duration:150,phone:"+1 647 990 3317", email:"adaeze@gmail.com",  notes:"Bring reference photo she texted last week." },
  { id:10, date:"Fri, Jun 27",    time:"10:30 AM", name:"Sola Dada",    service:"Knotless Braids",  stylist:"Emma",  price:"C$180", status:"confirmed", duration:60, phone:"+1 416 773 2290", email:"sola@gmail.com",    notes:"" },
];

const OPEN_SLOT_LIST = [
  { id:"o1", date:"Today",    time:"10:00 AM", revenue:"C$85",  label:"1 hr open" },
  { id:"o2", date:"Today",    time:"12:00 PM", revenue:"C$140", label:"1.5 hr open" },
  { id:"o3", date:"Today",    time:"2:00 PM",  revenue:"C$95",  label:"1 hr open" },
  { id:"o4", date:"Tomorrow", time:"11:00 AM", revenue:"C$120", label:"1 hr open" },
];

const SERVICES = ["Signature Cut","Cut + Beard","Full Highlights","Balayage","Knotless Braids","Silk Press","Loc Retwist","Trim + Blowout","Deep Condition + Set","Colour + Gloss"];
const STYLISTS = ["Emma Watson","Grace Olu","James Miller"];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt12 = (h: number) => h === 12 ? "12 PM" : h > 12 ? `${h - 12} PM` : h === 0 ? "12 AM" : `${h} AM`;

const STATUS_STYLE: Record<string, { label: string; color: string; bg: string; border: string }> = {
  confirmed: { label: "Confirmed", color: "rgb(52,211,153)",  bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.2)"  },
  pending:   { label: "Pending",   color: "rgb(251,191,36)",  bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.2)"  },
  deposit:   { label: "⚠ Deposit", color: "rgb(248,113,113)", bg: "rgba(239,68,68,0.1)",  border: "rgba(239,68,68,0.2)"   },
  completed: { label: "Completed", color: "rgb(96,165,250)",  bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.2)"  },
  cancelled: { label: "Cancelled", color: "rgba(255,255,255,0.4)", bg: "rgba(255,255,255,0.06)", border: "rgba(255,255,255,0.1)" },
};

const card: React.CSSProperties = {
  background: "rgba(255,255,255,0.025)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 16,
  overflow: "hidden",
};

// ─── Appointment detail — unified record shared by Day + List views ───────────

type ApptStatus = "confirmed" | "pending" | "deposit" | "completed" | "cancelled";

type ApptRecord = {
  id: number; name: string; initials: string; color: string;
  service: string; stylist: string; price: string; duration: number;
  dateLabel: string; time: string; status: ApptStatus;
  phone: string; email: string; notes: string; depositAmount?: string;
};

function dayBookingToAppt(b: Booking): ApptRecord {
  return {
    id: b.id, name: b.name, initials: b.initials, color: b.color,
    service: b.service, stylist: b.stylist, price: b.price, duration: b.duration,
    dateLabel: "Today", time: fmt12(b.hour), status: b.status,
    phone: b.phone, email: b.email, notes: b.notes, depositAmount: b.depositAmount,
  };
}

function listBookingToAppt(b: typeof LIST_BOOKINGS[number]): ApptRecord {
  return {
    id: b.id, name: b.name,
    initials: b.name.split(" ").map(n => n[0]).join(""),
    color: `hsl(${b.id * 53 + 200}deg 35% 25%)`,
    service: b.service, stylist: b.stylist, price: b.price, duration: b.duration,
    dateLabel: b.date, time: b.time, status: b.status as ApptStatus,
    phone: b.phone, email: b.email, notes: b.notes, depositAmount: b.depositAmount,
  };
}

// ─── New Appointment Overlay ───────────────────────────────────────────────────

function NewBookingOverlay({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<"client"|"service"|"datetime"|"confirm">("client");
  const [clientQ, setClientQ] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [selectedStylist, setSelectedStylist] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [notes, setNotes] = useState("");
  const [deposit, setDeposit] = useState(false);
  const [sms, setSms] = useState(true);

  const TIMES = ["9:00 AM","9:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM","12:00 PM","1:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM"];

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10, padding: "10px 13px", color: "rgb(250,250,250)", fontSize: 13.5,
    outline: "none", boxSizing: "border-box",
  };

  const STEPS = ["client","service","datetime","confirm"];
  const stepIdx = STEPS.indexOf(step);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 300,
      background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }} onClick={onClose}>
      <div style={{
        background: "rgb(14,14,18)", border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 22, width: "100%", maxWidth: 520,
        padding: "28px 28px 24px", margin: 20,
        boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <h2 style={{ color: "rgb(250,250,250)", fontSize: 18, fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>
            New Booking
          </h2>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "rgba(255,255,255,0.5)" }}>
            <X size={16} />
          </button>
        </div>

        {/* Step progress */}
        <div style={{ display: "flex", gap: 4, marginBottom: 24 }}>
          {["Client","Service","Date & Time","Confirm"].map((s, i) => (
            <div key={s} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
              <div style={{ height: 3, borderRadius: 2, background: i <= stepIdx ? "rgb(109,40,217)" : "rgba(255,255,255,0.08)" }} />
              <span style={{ fontSize: 10, fontWeight: i === stepIdx ? 700 : 500, color: i === stepIdx ? "rgb(210,196,254)" : "rgba(255,255,255,0.25)" }}>{s}</span>
            </div>
          ))}
        </div>

        {/* Step: Client */}
        {step === "client" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 500, display: "block", marginBottom: 7 }}>Search client</label>
              <input value={clientQ} onChange={e => setClientQ(e.target.value)} placeholder="Name, email or phone…" style={inputStyle} />
            </div>
            {clientQ && (
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, overflow: "hidden" }}>
                {["Amara Obi","Lola Adeyemi","Temi Bello"].filter(n => n.toLowerCase().includes(clientQ.toLowerCase())).map(n => (
                  <button key={n} onClick={() => { setClientQ(n); }} style={{
                    display: "flex", alignItems: "center", gap: 10, width: "100%",
                    padding: "11px 14px", background: "transparent", border: "none",
                    borderBottom: "1px solid rgba(255,255,255,0.05)", cursor: "pointer",
                    color: "rgb(250,250,250)", fontSize: 13, textAlign: "left",
                  }}>
                    <div style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(139,92,246,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "rgb(167,139,250)" }}>
                      {n.split(" ").map(w=>w[0]).join("")}
                    </div>
                    {n}
                  </button>
                ))}
                <button style={{
                  display: "flex", alignItems: "center", gap: 8, width: "100%",
                  padding: "11px 14px", background: "transparent", border: "none",
                  cursor: "pointer", color: "rgb(167,139,250)", fontSize: 13, textAlign: "left",
                }}>
                  <Plus size={14} strokeWidth={2.5} /> Add new client
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step: Service */}
        {step === "service" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 500, display: "block", marginBottom: 7 }}>Service</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 240, overflowY: "auto" }}>
                {SERVICES.map(s => (
                  <button key={s} onClick={() => setSelectedService(s)} style={{
                    padding: "10px 14px", borderRadius: 10, border: `1px solid ${selectedService === s ? "rgba(139,92,246,0.5)" : "rgba(255,255,255,0.07)"}`,
                    background: selectedService === s ? "rgba(109,40,217,0.15)" : "rgba(255,255,255,0.02)",
                    color: selectedService === s ? "rgb(210,196,254)" : "rgba(255,255,255,0.6)",
                    fontSize: 13, fontWeight: selectedService === s ? 700 : 400, cursor: "pointer", textAlign: "left",
                  }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 500, display: "block", marginBottom: 7 }}>Stylist</label>
              <div style={{ display: "flex", gap: 8 }}>
                {STYLISTS.map(s => (
                  <button key={s} onClick={() => setSelectedStylist(s)} style={{
                    flex: 1, padding: "9px 6px", borderRadius: 10,
                    border: `1px solid ${selectedStylist === s ? "rgba(139,92,246,0.5)" : "rgba(255,255,255,0.07)"}`,
                    background: selectedStylist === s ? "rgba(109,40,217,0.15)" : "rgba(255,255,255,0.02)",
                    color: selectedStylist === s ? "rgb(210,196,254)" : "rgba(255,255,255,0.5)",
                    fontSize: 12, fontWeight: selectedStylist === s ? 700 : 400, cursor: "pointer",
                  }}>
                    {s.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step: Date & Time */}
        {step === "datetime" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 500, display: "block", marginBottom: 7 }}>Date</label>
              <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} style={{ ...inputStyle, colorScheme: "dark" }} />
            </div>
            <div>
              <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 500, display: "block", marginBottom: 7 }}>Time</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6 }}>
                {TIMES.map(t => (
                  <button key={t} onClick={() => setSelectedTime(t)} style={{
                    padding: "8px 4px", borderRadius: 9,
                    border: `1px solid ${selectedTime === t ? "rgba(139,92,246,0.5)" : "rgba(255,255,255,0.07)"}`,
                    background: selectedTime === t ? "rgba(109,40,217,0.15)" : "rgba(255,255,255,0.02)",
                    color: selectedTime === t ? "rgb(210,196,254)" : "rgba(255,255,255,0.5)",
                    fontSize: 11.5, fontWeight: selectedTime === t ? 700 : 400, cursor: "pointer",
                  }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 500, display: "block", marginBottom: 7 }}>Notes (optional)</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. first time client, prefers no heat…" rows={2} style={{ ...inputStyle, resize: "none", fontFamily: "inherit" }} />
            </div>
          </div>
        )}

        {/* Step: Confirm */}
        {step === "confirm" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "16px 18px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { label: "Client",  value: clientQ || "—" },
                  { label: "Service", value: selectedService || "—" },
                  { label: "Stylist", value: selectedStylist || "—" },
                  { label: "Date",    value: selectedDate || "—" },
                  { label: "Time",    value: selectedTime || "—" },
                ].map(row => (
                  <div key={row.label} style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 13 }}>{row.label}</span>
                    <span style={{ color: "rgb(250,250,250)", fontSize: 13, fontWeight: 600 }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label: "Require deposit", sub: "Client pays upfront to hold slot", value: deposit, set: setDeposit },
                { label: "Send SMS confirmation", sub: "Text the client when booked", value: sms, set: setSms },
              ].map(t => (
                <div key={t.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: "rgba(255,255,255,0.03)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div>
                    <p style={{ color: "rgb(250,250,250)", fontSize: 13, fontWeight: 600, margin: "0 0 2px" }}>{t.label}</p>
                    <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11.5, margin: 0 }}>{t.sub}</p>
                  </div>
                  <button onClick={() => t.set(!t.value)} style={{
                    width: 40, height: 22, borderRadius: 11, border: "none", cursor: "pointer",
                    background: t.value ? "rgb(109,40,217)" : "rgba(255,255,255,0.12)",
                    position: "relative", transition: "background 0.2s",
                  }}>
                    <span style={{
                      position: "absolute", top: 3, left: t.value ? 21 : 3,
                      width: 16, height: 16, borderRadius: "50%",
                      background: "white", transition: "left 0.2s",
                    }} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer buttons */}
        <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
          {stepIdx > 0 && (
            <button onClick={() => setStep(STEPS[stepIdx - 1] as typeof step)} style={{
              flex: 1, padding: "12px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.6)",
              fontSize: 13.5, fontWeight: 700, cursor: "pointer",
            }}>
              Back
            </button>
          )}
          {step !== "confirm" ? (
            <button onClick={() => setStep(STEPS[stepIdx + 1] as typeof step)} style={{
              flex: 2, padding: "12px", borderRadius: 12, border: "none",
              background: "rgb(109,40,217)", color: "white",
              fontSize: 13.5, fontWeight: 700, cursor: "pointer",
            }}>
              Continue →
            </button>
          ) : (
            <button onClick={onClose} style={{
              flex: 2, padding: "12px", borderRadius: 12, border: "none",
              background: "rgb(52,211,153)", color: "rgb(5,40,20)",
              fontSize: 13.5, fontWeight: 800, cursor: "pointer",
            }}>
              Book appointment
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Close-out Modal (payment collection) ──────────────────────────────────

const GRATUITY_PRESETS = [0, 15, 18, 20];

function CloseOutModal({ appt, onClose, onCompleted }: { appt: ApptRecord; onClose: () => void; onCompleted: () => void }) {
  const [gratuityPct, setGratuityPct] = useState<number | "custom">(18);
  const [customTip, setCustomTip] = useState("");
  const [method, setMethod] = useState<"tap" | "link" | "card" | "cash" | null>(null);
  const [linkChannel, setLinkChannel] = useState<"sms" | "whatsapp" | "email">("sms");
  const [receiptSms, setReceiptSms] = useState(true);
  const [stage, setStage] = useState<"select" | "processing" | "success">("select");

  const baseNum = parseFloat(appt.price.replace(/[^0-9.]/g, "")) || 0;
  const depositNum = appt.depositAmount ? parseFloat(appt.depositAmount.replace(/[^0-9.]/g, "")) || 0 : 0;
  const subtotal = Math.max(0, baseNum - depositNum);
  const tipAmount = gratuityPct === "custom" ? (parseFloat(customTip) || 0) : (baseNum * gratuityPct / 100);
  const total = subtotal + tipAmount;
  const fmtMoney = (n: number) => `C$${n.toFixed(2)}`;

  const runCharge = () => {
    setStage("processing");
    setTimeout(() => setStage("success"), method === "cash" ? 500 : 1400);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10, padding: "10px 13px", color: "rgb(250,250,250)", fontSize: 13.5,
    outline: "none", boxSizing: "border-box",
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 320,
      background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }} onClick={stage === "select" ? onClose : undefined}>
      <div style={{
        background: "rgb(14,14,18)", border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 22, width: "100%", maxWidth: 440,
        padding: "26px 26px 24px", margin: 20,
        boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
      }} onClick={e => e.stopPropagation()}>

        {stage === "success" ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "12px 0 4px", animation: "fp-success-pop 0.5s cubic-bezier(0.2,0.8,0.2,1)" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(52,211,153,0.12)", border: "2px solid rgba(52,211,153,0.35)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <CheckCircle2 size={30} color="rgb(52,211,153)" strokeWidth={1.8} />
            </div>
            <h2 style={{ color: "rgb(250,250,250)", fontSize: 19, fontWeight: 800, margin: "0 0 6px", letterSpacing: "-0.02em" }}>{fmtMoney(total)} collected</h2>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, margin: "0 0 4px" }}>
              {method === "link" ? `Payment link sent via ${linkChannel === "sms" ? "SMS" : linkChannel === "whatsapp" ? "WhatsApp" : "Email"}`
                : method === "cash" ? "Marked as received in cash"
                : "Charged card on file"}
            </p>
            {receiptSms ? (
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, margin: "0 0 22px" }}>Receipt texted to {appt.phone}</p>
            ) : (
              <div style={{ marginBottom: 22 }} />
            )}
            <button onClick={onCompleted} style={{ width: "100%", padding: "13px", borderRadius: 13, border: "none", background: "rgb(52,211,153)", color: "rgb(5,40,20)", fontSize: 14, fontWeight: 800, cursor: "pointer" }}>
              Done
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <h2 style={{ color: "rgb(250,250,250)", fontSize: 17, fontWeight: 800, margin: "0 0 2px", letterSpacing: "-0.02em" }}>Close out</h2>
                <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12.5, margin: 0 }}>{appt.name} · {appt.service}</p>
              </div>
              <button onClick={onClose} disabled={stage === "processing"} style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: stage === "processing" ? "default" : "pointer", color: "rgba(255,255,255,0.5)" }}>
                <X size={16} />
              </button>
            </div>

            {stage === "processing" ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "30px 0 20px" }}>
                <div style={{ position: "relative", width: 64, height: 64, marginBottom: 18 }}>
                  <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(139,92,246,0.15)", border: "2px solid rgba(139,92,246,0.4)" }} />
                  <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(139,92,246,0.3)", animation: "ping 1.4s cubic-bezier(0,0,0.2,1) infinite" }} />
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {method === "tap" ? <Smartphone size={22} color="rgb(167,139,250)" /> : method === "link" ? <Send size={20} color="rgb(167,139,250)" /> : method === "cash" ? <Banknote size={20} color="rgb(167,139,250)" /> : <CreditCard size={20} color="rgb(167,139,250)" />}
                  </div>
                </div>
                <p style={{ color: "rgb(250,250,250)", fontSize: 13.5, fontWeight: 700, margin: "0 0 4px" }}>
                  {method === "tap" ? "Hold card or phone near reader…" : method === "link" ? "Sending payment link…" : method === "cash" ? "Marking as received…" : "Charging card on file…"}
                </p>
                <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, margin: 0 }}>{fmtMoney(total)}</p>
              </div>
            ) : (
              <>
                {/* Gratuity selector */}
                <div style={{ marginBottom: 18 }}>
                  <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 500, display: "block", marginBottom: 8 }}>Gratuity</label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 6 }}>
                    {GRATUITY_PRESETS.map(p => (
                      <button key={p} onClick={() => setGratuityPct(p)} style={{
                        padding: "9px 4px", borderRadius: 10,
                        border: `1px solid ${gratuityPct === p ? "rgba(139,92,246,0.5)" : "rgba(255,255,255,0.07)"}`,
                        background: gratuityPct === p ? "rgba(109,40,217,0.15)" : "rgba(255,255,255,0.02)",
                        color: gratuityPct === p ? "rgb(210,196,254)" : "rgba(255,255,255,0.5)",
                        fontSize: 12.5, fontWeight: gratuityPct === p ? 700 : 400, cursor: "pointer",
                      }}>
                        {p === 0 ? "No tip" : `${p}%`}
                      </button>
                    ))}
                    <button onClick={() => setGratuityPct("custom")} style={{
                      padding: "9px 4px", borderRadius: 10,
                      border: `1px solid ${gratuityPct === "custom" ? "rgba(139,92,246,0.5)" : "rgba(255,255,255,0.07)"}`,
                      background: gratuityPct === "custom" ? "rgba(109,40,217,0.15)" : "rgba(255,255,255,0.02)",
                      color: gratuityPct === "custom" ? "rgb(210,196,254)" : "rgba(255,255,255,0.5)",
                      fontSize: 12.5, fontWeight: gratuityPct === "custom" ? 700 : 400, cursor: "pointer",
                    }}>
                      Custom
                    </button>
                  </div>
                  {gratuityPct === "custom" && (
                    <input value={customTip} onChange={e => setCustomTip(e.target.value.replace(/[^0-9.]/g, ""))} placeholder="Custom tip amount" style={{ ...inputStyle, marginTop: 8 }} />
                  )}
                </div>

                {/* Total breakdown */}
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "14px 16px", marginBottom: 18, display: "flex", flexDirection: "column", gap: 7 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12.5 }}>Service</span>
                    <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 12.5 }}>{appt.price}</span>
                  </div>
                  {depositNum > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12.5 }}>Deposit already paid</span>
                      <span style={{ color: "rgb(52,211,153)", fontSize: 12.5 }}>-{appt.depositAmount}</span>
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12.5 }}>Gratuity</span>
                    <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 12.5 }}>{fmtMoney(tipAmount)}</span>
                  </div>
                  <div style={{ height: 1, background: "rgba(255,255,255,0.07)", margin: "3px 0" }} />
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "rgb(250,250,250)", fontSize: 14, fontWeight: 700 }}>Total due</span>
                    <span style={{ color: "rgb(52,211,153)", fontSize: 16, fontWeight: 800 }}>{fmtMoney(total)}</span>
                  </div>
                </div>

                {/* Payment method */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 500, display: "block", marginBottom: 8 }}>Payment method</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {[
                      { id: "tap" as const, Icon: Smartphone, label: "Tap to Pay", sub: "NFC / contactless" },
                      { id: "link" as const, Icon: Send, label: "Payment Link", sub: "SMS / WhatsApp / Email" },
                      { id: "card" as const, Icon: CreditCard, label: "Card on File", sub: "Visa •••• 4242" },
                      { id: "cash" as const, Icon: Banknote, label: "Cash", sub: "Collected in person" },
                    ].map(m => (
                      <button key={m.id} onClick={() => setMethod(m.id)} style={{
                        display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 6,
                        padding: "12px 13px", borderRadius: 12,
                        border: `1px solid ${method === m.id ? "rgba(139,92,246,0.5)" : "rgba(255,255,255,0.07)"}`,
                        background: method === m.id ? "rgba(109,40,217,0.15)" : "rgba(255,255,255,0.02)",
                        cursor: "pointer", textAlign: "left",
                      }}>
                        <m.Icon size={17} color={method === m.id ? "rgb(167,139,250)" : "rgba(255,255,255,0.5)"} strokeWidth={1.7} />
                        <div>
                          <p style={{ color: method === m.id ? "rgb(210,196,254)" : "rgb(250,250,250)", fontSize: 12.5, fontWeight: 700, margin: "0 0 1px" }}>{m.label}</p>
                          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 10.5, margin: 0 }}>{m.sub}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment link channel picker */}
                {method === "link" && (
                  <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                    {[
                      { id: "sms" as const, label: "SMS" },
                      { id: "whatsapp" as const, label: "WhatsApp" },
                      { id: "email" as const, label: "Email" },
                    ].map(c => (
                      <button key={c.id} onClick={() => setLinkChannel(c.id)} style={{
                        flex: 1, padding: "8px 6px", borderRadius: 9,
                        border: `1px solid ${linkChannel === c.id ? "rgba(139,92,246,0.5)" : "rgba(255,255,255,0.07)"}`,
                        background: linkChannel === c.id ? "rgba(109,40,217,0.15)" : "rgba(255,255,255,0.02)",
                        color: linkChannel === c.id ? "rgb(210,196,254)" : "rgba(255,255,255,0.5)",
                        fontSize: 12, fontWeight: linkChannel === c.id ? 700 : 400, cursor: "pointer",
                      }}>
                        {c.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Receipt SMS toggle */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: "rgba(255,255,255,0.03)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.07)", marginBottom: 20 }}>
                  <div>
                    <p style={{ color: "rgb(250,250,250)", fontSize: 13, fontWeight: 600, margin: "0 0 2px" }}>Text receipt to client</p>
                    <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11.5, margin: 0 }}>{appt.phone}</p>
                  </div>
                  <button onClick={() => setReceiptSms(v => !v)} style={{
                    width: 40, height: 22, borderRadius: 11, border: "none", cursor: "pointer",
                    background: receiptSms ? "rgb(109,40,217)" : "rgba(255,255,255,0.12)",
                    position: "relative", transition: "background 0.2s",
                  }}>
                    <span style={{ position: "absolute", top: 3, left: receiptSms ? 21 : 3, width: 16, height: 16, borderRadius: "50%", background: "white", transition: "left 0.2s" }} />
                  </button>
                </div>

                {/* CTA */}
                <button
                  disabled={!method}
                  onClick={runCharge}
                  style={{
                    width: "100%", padding: "14px", borderRadius: 13, border: "none",
                    background: method ? "rgb(52,211,153)" : "rgba(255,255,255,0.08)",
                    color: method ? "rgb(5,40,20)" : "rgba(255,255,255,0.3)",
                    fontSize: 14, fontWeight: 800, cursor: method ? "pointer" : "default",
                  }}
                >
                  Complete · Collect {fmtMoney(total)}
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Appointment Detail overlay ────────────────────────────────────────────

function AppointmentDetail({ appt, onClose, onCloseOut }: { appt: ApptRecord; onClose: () => void; onCloseOut: () => void }) {
  const [status, setStatus] = useState<ApptStatus>(appt.status);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [rescheduling, setRescheduling] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  const s = STATUS_STYLE[status];
  const TIMES = ["9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"];

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10, padding: "10px 13px", color: "rgb(250,250,250)", fontSize: 13.5,
    outline: "none", boxSizing: "border-box", colorScheme: "dark",
  };

  const avatarColor = appt.color.startsWith("hsl") ? "rgba(255,255,255,0.85)" : appt.color;
  const isDone = status === "completed" || status === "cancelled";

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 310,
      background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }} onClick={onClose}>
      <div style={{
        background: "rgb(12,12,16)", border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 24, width: "100%", maxWidth: 480,
        maxHeight: "90vh", display: "flex", flexDirection: "column",
        margin: 20, overflow: "hidden",
        boxShadow: "0 32px 100px rgba(0,0,0,0.8)",
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding: "22px 22px 0", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 46, height: 46, borderRadius: "50%", background: `${appt.color}22`, border: `1.5px solid ${appt.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, color: avatarColor, flexShrink: 0 }}>
                {appt.initials}
              </div>
              <div>
                <h2 style={{ color: "rgb(250,250,250)", fontSize: 17, fontWeight: 800, margin: "0 0 3px", letterSpacing: "-0.02em" }}>{appt.name}</h2>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12.5, margin: 0 }}>{appt.dateLabel} · {appt.time}</p>
              </div>
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "rgba(255,255,255,0.45)", flexShrink: 0 }}>
              <X size={16} />
            </button>
          </div>

          {/* status + deposit badges */}
          <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 11px", borderRadius: 20, color: s.color, background: s.bg, border: `1px solid ${s.border}` }}>
              {s.label}
            </span>
            {appt.depositAmount && status !== "completed" && (
              <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 11px", borderRadius: 20, color: "rgb(52,211,153)", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
                {appt.depositAmount} deposit paid
              </span>
            )}
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 22px 22px", display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Client card */}
          <div style={{ ...card, padding: "14px 16px" }}>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 10px" }}>Client</p>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: "rgb(250,250,250)", fontSize: 13, fontWeight: 600, margin: "0 0 2px" }}>{appt.phone}</p>
                <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{appt.email}</p>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "rgb(52,211,153)" }}>
                  <MessageSquare size={14} strokeWidth={1.8} />
                </button>
                <button style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "rgb(96,165,250)" }}>
                  <Phone size={14} strokeWidth={1.8} />
                </button>
              </div>
            </div>
          </div>

          {/* Service details */}
          <div style={{ ...card, padding: "14px 16px" }}>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 10px" }}>Service</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label: "Service", value: appt.service },
                { label: "Stylist", value: appt.stylist },
                { label: "Duration", value: `${appt.duration} min` },
                { label: "Price", value: appt.price },
              ].map(row => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 12.5 }}>{row.label}</span>
                  <span style={{ color: "rgb(250,250,250)", fontSize: 12.5, fontWeight: 600 }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Client notes */}
          <div style={{ ...card, padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <StickyNote size={12} color="rgba(255,255,255,0.35)" />
              <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", margin: 0 }}>Client notes</p>
            </div>
            <p style={{ color: appt.notes ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.25)", fontSize: 12.5, margin: 0, lineHeight: 1.55 }}>
              {appt.notes || "No notes on file for this client."}
            </p>
          </div>

          {/* Reschedule panel */}
          {rescheduling && (
            <div style={{ ...card, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
              <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", margin: 0 }}>Reschedule to</p>
              <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} style={inputStyle} />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6 }}>
                {TIMES.map(t => (
                  <button key={t} onClick={() => setNewTime(t)} style={{
                    padding: "8px 4px", borderRadius: 9,
                    border: `1px solid ${newTime === t ? "rgba(139,92,246,0.5)" : "rgba(255,255,255,0.07)"}`,
                    background: newTime === t ? "rgba(109,40,217,0.15)" : "rgba(255,255,255,0.02)",
                    color: newTime === t ? "rgb(210,196,254)" : "rgba(255,255,255,0.5)",
                    fontSize: 11.5, fontWeight: newTime === t ? 700 : 400, cursor: "pointer",
                  }}>
                    {t}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setRescheduling(false)} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.6)", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>
                  Cancel
                </button>
                <button
                  disabled={!newDate || !newTime}
                  onClick={() => setRescheduling(false)}
                  style={{ flex: 2, padding: "10px", borderRadius: 10, border: "none", background: newDate && newTime ? "rgb(109,40,217)" : "rgba(255,255,255,0.08)", color: newDate && newTime ? "white" : "rgba(255,255,255,0.3)", fontSize: 12.5, fontWeight: 700, cursor: newDate && newTime ? "pointer" : "default" }}
                >
                  Confirm new time
                </button>
              </div>
            </div>
          )}

          {/* Cancel confirm */}
          {confirmCancel && (
            <div style={{ background: "rgba(248,113,113,0.06)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 14, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
              <p style={{ color: "rgba(248,113,113,0.9)", fontSize: 12.5, fontWeight: 600, margin: 0 }}>
                Cancel this appointment? The client will be notified automatically.
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setConfirmCancel(false)} style={{ flex: 1, padding: "9px", borderRadius: 9, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                  Never mind
                </button>
                <button onClick={() => { setStatus("cancelled"); setConfirmCancel(false); }} style={{ flex: 1, padding: "9px", borderRadius: 9, border: "none", background: "rgb(239,68,68)", color: "white", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                  Cancel appointment
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        {!isDone && (
          <div style={{ padding: "16px 22px 22px", flexShrink: 0, borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setRescheduling(v => !v)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "11px", borderRadius: 11, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.65)", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>
                <Pencil size={13} strokeWidth={2} /> Reschedule
              </button>
              <button onClick={() => setConfirmCancel(v => !v)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "11px", borderRadius: 11, border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.06)", color: "rgb(248,113,113)", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>
                <Ban size={13} strokeWidth={2} /> Cancel
              </button>
            </div>
            <button onClick={onCloseOut} style={{ width: "100%", padding: "13px", borderRadius: 13, border: "none", background: "rgb(52,211,153)", color: "rgb(5,40,20)", fontSize: 13.5, fontWeight: 800, cursor: "pointer" }}>
              Mark as completed →
            </button>
          </div>
        )}
        {status === "cancelled" && (
          <div style={{ padding: "16px 22px 22px", flexShrink: 0, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, textAlign: "center", margin: 0 }}>This appointment has been cancelled.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Day view ─────────────────────────────────────────────────────────────────

function DayView({ onNewBooking, onSelect }: { onNewBooking: () => void; onSelect: (appt: ApptRecord) => void }) {
  const bookingAtHour = (h: number) => DAY_BOOKINGS.find(b => b.hour === h);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* Booking link card */}
      <BookingLinkCard />

      {/* AI fill banner */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.22)",
        borderRadius: 14, padding: "12px 18px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Zap size={16} color="rgb(167,139,250)" strokeWidth={1.8} />
          <span style={{ color: "rgb(210,196,254)", fontSize: 13.5, fontWeight: 700 }}>
            14 of 18 booked · 4 gaps left
          </span>
          <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 13 }}>— Fill all with AI + Payment</span>
        </div>
        <button style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "8px 16px", borderRadius: 10,
          background: "rgb(109,40,217)", border: "none",
          color: "white", fontSize: 12.5, fontWeight: 700, cursor: "pointer",
        }}>
          Fill all <ChevronRight size={13} strokeWidth={2.5} />
        </button>
      </div>

      {/* Time rail */}
      <div style={{ ...card, padding: 0 }}>
        <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ color: "rgb(250,250,250)", fontSize: 14, fontWeight: 700, margin: 0 }}>Today</p>
          <button onClick={onNewBooking} style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "7px 14px", borderRadius: 9,
            background: "rgb(109,40,217)", border: "none",
            color: "white", fontSize: 12, fontWeight: 700, cursor: "pointer",
          }}>
            <Plus size={13} strokeWidth={2.5} /> Add booking
          </button>
        </div>

        {HOURS.map(h => {
          const booking = bookingAtHour(h);
          const isOpen = OPEN_SLOTS.includes(h);
          const isFamily = FAMILY_HOURS.includes(h);

          return (
            <div key={h} style={{
              display: "flex", alignItems: "stretch",
              borderBottom: h < HOURS[HOURS.length - 1] ? "1px solid rgba(255,255,255,0.04)" : "none",
              minHeight: 56,
            }}>
              {/* Time label */}
              <div style={{
                width: 72, flexShrink: 0, padding: "16px 0 16px 20px",
                display: "flex", alignItems: "flex-start",
              }}>
                <span style={{ color: "rgba(255,255,255,0.22)", fontSize: 11.5, fontWeight: 600 }}>{fmt12(h)}</span>
              </div>

              {/* Slot content */}
              <div style={{ flex: 1, padding: "8px 16px 8px 8px", display: "flex", alignItems: "center" }}>
                {booking ? (
                  <div onClick={() => onSelect(dayBookingToAppt(booking))} style={{
                    flex: 1, padding: "10px 14px", borderRadius: 12,
                    background: `${booking.color}12`,
                    border: `1px solid ${booking.color}30`,
                    display: "flex", alignItems: "center", gap: 12, cursor: "pointer",
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                      background: `${booking.color}22`, border: `1.5px solid ${booking.color}44`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 10, fontWeight: 800, color: booking.color,
                    }}>{booking.initials}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: "rgb(250,250,250)", fontSize: 13, fontWeight: 700, margin: "0 0 2px" }}>{booking.name}</p>
                      <p style={{ color: "rgba(255,255,255,0.38)", fontSize: 11.5, margin: 0 }}>{booking.service} · {booking.stylist}</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20,
                        color: STATUS_STYLE[booking.status].color,
                        background: STATUS_STYLE[booking.status].bg,
                      }}>
                        {STATUS_STYLE[booking.status].label}
                      </span>
                      <span style={{ color: "rgb(52,211,153)", fontSize: 13, fontWeight: 700 }}>{booking.price}</span>
                    </div>
                  </div>
                ) : isFamily ? (
                  <div style={{
                    flex: 1, padding: "10px 14px", borderRadius: 12,
                    background: "rgba(239,68,68,0.05)",
                    border: "1px solid rgba(239,68,68,0.15)",
                    display: "flex", alignItems: "center", gap: 10,
                  }}>
                    <span style={{ fontSize: 14 }}>🏠</span>
                    <p style={{ color: "rgba(248,113,113,0.7)", fontSize: 12.5, fontWeight: 600, margin: 0 }}>
                      Family Hours — bookings paused
                    </p>
                  </div>
                ) : isOpen ? (
                  <div style={{
                    flex: 1, padding: "10px 14px", borderRadius: 12,
                    border: "1.5px dashed rgba(248,113,113,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, cursor: "pointer",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Clock size={13} color="rgba(248,113,113,0.5)" />
                      <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 12.5 }}>Open slot</span>
                      <span style={{ color: "rgba(248,113,113,0.6)", fontSize: 11.5, fontWeight: 600 }}>
                        -{OPEN_REVENUE[h]} lost
                      </span>
                    </div>
                    <button style={{
                      padding: "5px 12px", borderRadius: 8,
                      background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.25)",
                      color: "rgb(248,113,113)", fontSize: 11.5, fontWeight: 700, cursor: "pointer",
                    }}>
                      Fill →
                    </button>
                  </div>
                ) : (
                  <div style={{ flex: 1, height: 38 }} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Week view ────────────────────────────────────────────────────────────────

function WeekView() {
  const maxBookings = Math.max(...WEEK_DAYS.map(d => d.total || 1));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* Summary tiles */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
        {[
          { label: "Week total", value: "C$5,970", sub: "+11% vs last week" },
          { label: "Avg / day",  value: "C$995",   sub: "6 active days"     },
          { label: "Open slots", value: "9",        sub: "Fill to earn +C$840" },
        ].map(t => (
          <div key={t.label} style={{ ...card, padding: "16px 18px" }}>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 6px" }}>{t.label}</p>
            <p style={{ color: "rgb(250,250,250)", fontSize: 24, fontWeight: 800, margin: "0 0 3px", letterSpacing: "-0.03em" }}>{t.value}</p>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11.5, margin: 0 }}>{t.sub}</p>
          </div>
        ))}
      </div>

      {/* 7-day columns */}
      <div style={{ ...card, padding: "20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 10 }}>
          {WEEK_DAYS.map((day, i) => {
            const isToday = i === 5; // Sat = today for demo
            const fillPct = day.total ? (day.booked / day.total) * 100 : 0;

            return (
              <div key={day.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                {/* Day header */}
                <div style={{ textAlign: "center" }}>
                  <p style={{ color: isToday ? "rgb(167,139,250)" : "rgba(255,255,255,0.35)", fontSize: 11, fontWeight: 700, margin: "0 0 2px", textTransform: "uppercase" }}>{day.label}</p>
                  <div style={{
                    width: 30, height: 30, borderRadius: "50%",
                    background: isToday ? "rgb(109,40,217)" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <p style={{ color: isToday ? "white" : "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: isToday ? 800 : 500, margin: 0 }}>{day.date.split(" ")[1]}</p>
                  </div>
                </div>

                {day.closed ? (
                  <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.15)", fontSize: 11 }}>Closed</div>
                ) : (
                  <>
                    {/* Bar chart */}
                    <div style={{ width: "100%", height: 80, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                      <div style={{
                        width: "60%", borderRadius: "4px 4px 0 0",
                        height: `${(day.booked / maxBookings) * 100}%`,
                        background: isToday ? "rgb(139,92,246)" : "rgba(139,92,246,0.4)",
                        minHeight: 4,
                      }} />
                    </div>

                    {/* Booked/total */}
                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, margin: 0, textAlign: "center" }}>
                      <span style={{ color: "rgb(250,250,250)", fontWeight: 700 }}>{day.booked}</span>/{day.total}
                    </p>

                    {/* Revenue */}
                    <p style={{ color: "rgb(52,211,153)", fontSize: 11, fontWeight: 700, margin: 0 }}>{day.revenue}</p>

                    {/* Fill bar */}
                    <div style={{ width: "100%", height: 4, borderRadius: 2, background: "rgba(255,255,255,0.06)" }}>
                      <div style={{ height: "100%", width: `${fillPct}%`, borderRadius: 2, background: fillPct === 100 ? "rgb(52,211,153)" : fillPct > 75 ? "rgb(251,191,36)" : "rgb(139,92,246)" }} />
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── List view ────────────────────────────────────────────────────────────────

function ListView({ onSelect }: { onSelect: (appt: ApptRecord) => void }) {
  const grouped = LIST_BOOKINGS.reduce<Record<string, typeof LIST_BOOKINGS>>((acc, b) => {
    (acc[b.date] ??= []).push(b);
    return acc;
  }, {});

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Booked appointments */}
      {Object.entries(grouped).map(([date, bookings]) => (
        <div key={date}>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 10px" }}>{date}</p>
          <div style={{ ...card }}>
            {bookings.map((b, i) => {
              const s = STATUS_STYLE[b.status];
              return (
                <div key={b.id} onClick={() => onSelect(listBookingToAppt(b))} style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "13px 18px", cursor: "pointer",
                  borderBottom: i < bookings.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                }}>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", background: `hsl(${b.id * 53 + 200}deg 35% 25%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.8)", flexShrink: 0 }}>
                    {b.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: "rgb(250,250,250)", fontSize: 13, fontWeight: 700, margin: "0 0 2px" }}>{b.name}</p>
                    <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, margin: 0 }}>{b.service} · {b.stylist}</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.4)", fontSize: 12, flexShrink: 0 }}>
                    <Clock size={11} />
                    {b.time}
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, color: s.color, background: s.bg, whiteSpace: "nowrap" }}>{s.label}</span>
                  <span style={{ color: "rgb(52,211,153)", fontSize: 13, fontWeight: 700, minWidth: 52, textAlign: "right" }}>{b.price}</span>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Open slots */}
      <div>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 10px" }}>
          Open slots — <span style={{ color: "rgb(248,113,113)" }}>C$440 potential</span>
        </p>
        <div style={{ ...card }}>
          {OPEN_SLOT_LIST.map((slot, i) => (
            <div key={slot.id} style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "13px 18px",
              borderBottom: i < OPEN_SLOT_LIST.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
            }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(248,113,113,0.08)", border: "1.5px dashed rgba(248,113,113,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Clock size={14} color="rgba(248,113,113,0.5)" />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, fontWeight: 600, margin: "0 0 2px" }}>{slot.label}</p>
                <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 12, margin: 0 }}>{slot.date} · {slot.time}</p>
              </div>
              <span style={{ color: "rgb(248,113,113)", fontSize: 12.5, fontWeight: 700 }}>{slot.revenue} lost</span>
              <button style={{
                padding: "7px 14px", borderRadius: 9,
                background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.25)",
                color: "rgb(167,139,250)", fontSize: 12, fontWeight: 700, cursor: "pointer",
              }}>
                Fill →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Booking link card ─────────────────────────────────────────────────────────

function BookingLinkCard() {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(`https://${BOOKING_LINK}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ ...card, padding: "16px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(139,92,246,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <ExternalLink size={15} color="rgb(167,139,250)" strokeWidth={1.8} />
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 2px" }}>Your booking link</p>
            <p style={{ color: "rgb(210,196,254)", fontSize: 13.5, fontWeight: 600, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{BOOKING_LINK}</p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          {[
            { Icon: Link2,         label: "Instagram", color: "rgb(232,121,249)" },
            { Icon: MessageSquare, label: "SMS",       color: "rgb(52,211,153)"  },
            { Icon: Mail,          label: "Email",     color: "rgb(96,165,250)"  },
          ].map(({ Icon, label, color }) => (
            <button key={label} title={label} style={{
              width: 32, height: 32, borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color,
            }}>
              <Icon size={14} strokeWidth={1.8} />
            </button>
          ))}
          <button onClick={copy} style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "7px 14px", borderRadius: 9,
            background: copied ? "rgba(52,211,153,0.12)" : "rgba(255,255,255,0.06)",
            border: `1px solid ${copied ? "rgba(52,211,153,0.3)" : "rgba(255,255,255,0.1)"}`,
            color: copied ? "rgb(52,211,153)" : "rgba(255,255,255,0.6)",
            fontSize: 12.5, fontWeight: 700, cursor: "pointer", transition: "all 0.2s",
          }}>
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const VIEWS = ["Day", "Week", "List"] as const;
type View = typeof VIEWS[number];

export default function BookingsPage() {
  const [view, setView]           = useState<View>("Day");
  const [query, setQuery]         = useState("");
  const [showNewBooking, setNew]  = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<ApptRecord | null>(null);
  const [closingOut, setClosingOut]     = useState(false);

  const dateStr = new Date().toLocaleDateString("en-CA", {
    weekday: "short", month: "short", day: "numeric",
  });

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ color: "rgb(250,250,250)", fontSize: 22, fontWeight: 800, margin: "0 0 3px", letterSpacing: "-0.03em" }}>Bookings</h1>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, margin: 0 }}>{dateStr}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* View switcher */}
          <div style={{ display: "flex", gap: 2, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 11, padding: 3 }}>
            {VIEWS.map(v => (
              <button key={v} onClick={() => setView(v)} style={{
                padding: "6px 16px", borderRadius: 8, border: "none", cursor: "pointer",
                fontSize: 12.5, fontWeight: view === v ? 700 : 500,
                background: view === v ? "rgba(109,40,217,0.45)" : "transparent",
                color: view === v ? "rgb(210,196,254)" : "rgba(255,255,255,0.4)",
                transition: "all 0.15s",
              }}>
                {v}
              </button>
            ))}
          </div>

          {/* Search */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "8px 12px", width: 200 }}>
            <Search size={13} color="rgba(255,255,255,0.3)" />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search…" style={{ background: "none", border: "none", outline: "none", color: "rgb(250,250,250)", fontSize: 12.5, flex: 1 }} />
          </div>

          <button onClick={() => setNew(true)} style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "10px 18px", borderRadius: 11,
            background: "rgb(109,40,217)", border: "none",
            color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer",
          }}>
            <Plus size={15} strokeWidth={2.5} /> New booking
          </button>
        </div>
      </div>

      {/* View content */}
      {view === "Day"  && <DayView onNewBooking={() => setNew(true)} onSelect={setSelectedAppt} />}
      {view === "Week" && <WeekView />}
      {view === "List" && <ListView onSelect={setSelectedAppt} />}

      {/* New booking overlay */}
      {showNewBooking && <NewBookingOverlay onClose={() => setNew(false)} />}

      {/* Appointment detail → close-out */}
      {selectedAppt && !closingOut && (
        <AppointmentDetail
          appt={selectedAppt}
          onClose={() => setSelectedAppt(null)}
          onCloseOut={() => setClosingOut(true)}
        />
      )}
      {selectedAppt && closingOut && (
        <CloseOutModal
          appt={selectedAppt}
          onClose={() => setClosingOut(false)}
          onCompleted={() => { setClosingOut(false); setSelectedAppt(null); }}
        />
      )}
    </div>
  );
}
