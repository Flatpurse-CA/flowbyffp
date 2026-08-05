"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Plus, Search, Copy, Check, MessageSquare,
  Mail, ExternalLink, Zap, Clock, ChevronRight,
  X, Phone, CreditCard, Banknote, Smartphone,
  Send, Pencil, Ban, CheckCircle2, StickyNote,
} from "lucide-react";
import type { AppointmentRow, AppointmentStatus } from "./actions";
import { createAppointment, rescheduleAppointment, cancelAppointment, completeAppointment, confirmAppointment } from "./actions";
import type { StaffRow } from "../team/actions";
import { tint } from "@/lib/color";

// ─── Timezone-aware formatting (shop is Edmonton-based) ───────────────────────

const TZ = "America/Edmonton";

function dateKey(d: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}
function dateLabelFor(d: Date, now: Date) {
  const dStr = dateKey(d);
  const todayStr = dateKey(now);
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (dStr === todayStr) return "Today";
  if (dStr === dateKey(tomorrow)) return "Tomorrow";
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, weekday: "short", month: "short", day: "numeric" }).format(d);
}
function timeLabelFor(d: Date) {
  return new Intl.DateTimeFormat("en-US", { timeZone: TZ, hour: "numeric", minute: "2-digit" }).format(d);
}
function hourFor(d: Date) {
  return parseInt(new Intl.DateTimeFormat("en-US", { timeZone: TZ, hour: "numeric", hour12: false }).format(d), 10) % 24;
}
function initialsFor(name: string) {
  return name.trim().split(/\s+/).map(w => w[0]?.toUpperCase() ?? "").slice(0, 2).join("") || "?";
}
function colorFor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  const palette = ["rgb(52,211,153)", "rgb(167,139,250)", "rgb(251,191,36)", "rgb(96,165,250)", "rgb(248,113,113)", "rgb(232,121,249)"];
  return palette[hash % palette.length];
}
function fmtPrice(n: number) {
  return Number.isInteger(n) ? `C$${n}` : `C$${n.toFixed(2)}`;
}

// ─── Unified appointment record for rendering ──────────────────────────────

type ApptRecord = {
  id: string; name: string; initials: string; color: string;
  service: string; stylist: string; price: string; duration: number;
  dateLabel: string; time: string; status: AppointmentStatus;
  phone: string; email: string; notes: string; depositAmount?: string;
  startsAt: string; hour: number;
};

function rowToAppt(row: AppointmentRow, now: Date): ApptRecord {
  const d = new Date(row.starts_at);
  return {
    id: row.id,
    name: row.client_name,
    initials: initialsFor(row.client_name),
    color: colorFor(row.id),
    service: row.service_name,
    stylist: row.stylist_name || "—",
    price: fmtPrice(Number(row.price)),
    duration: row.duration_minutes,
    dateLabel: dateLabelFor(d, now),
    time: timeLabelFor(d),
    status: row.status,
    phone: row.client_phone || "",
    email: row.client_email || "",
    notes: row.client_notes || "",
    depositAmount: row.deposit_amount != null ? fmtPrice(Number(row.deposit_amount)) : undefined,
    startsAt: row.starts_at,
    hour: hourFor(d),
  };
}

const SERVICES = ["Signature Cut", "Cut + Beard", "Full Highlights", "Balayage", "Knotless Braids", "Silk Press", "Loc Retwist", "Trim + Blowout", "Deep Condition + Set", "Colour + Gloss"];
const TIMES = ["9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"];
const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM – 7 PM
const FAMILY_HOURS = [18, 19]; // 6–8 PM, decorative until Settings/Hours is wired

const fmt12 = (h: number) => h === 12 ? "12 PM" : h > 12 ? `${h - 12} PM` : h === 0 ? "12 AM" : `${h} AM`;

const STATUS_STYLE: Record<string, { label: string; color: string; bg: string; border: string }> = {
  confirmed: { label: "Confirmed", color: "rgb(52,211,153)",  bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.2)"  },
  pending:   { label: "Pending",   color: "rgb(251,191,36)",  bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.2)"  },
  deposit:   { label: "⚠ Deposit", color: "rgb(248,113,113)", bg: "rgba(239,68,68,0.1)",  border: "rgba(239,68,68,0.2)"   },
  completed: { label: "Completed", color: "rgb(96,165,250)",  bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.2)"  },
  cancelled: { label: "Cancelled", color: "var(--dw4)", bg: "var(--dw06)", border: "var(--dw1)" },
};

const card: React.CSSProperties = {
  background: "var(--dw025)",
  border: "1px solid var(--dw07)",
  borderRadius: 16,
  overflow: "hidden",
};

// ─── Helpers to build a UTC ISO string from local date+time picker values ─────

function to24h(t: string) {
  const [time, ampm] = t.split(" ");
  const [hStr, mStr] = time.split(":");
  let h = parseInt(hStr, 10);
  if (ampm === "PM" && h !== 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${mStr}`;
}
function edmontonOffsetFor(dateStr: string) {
  // Resolve the UTC offset for this specific calendar date (handles MST/MDT
  // correctly) instead of relying on the executing machine's local timezone.
  const probe = new Date(`${dateStr}T12:00:00Z`);
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: TZ, timeZoneName: "shortOffset" }).formatToParts(probe);
  const raw = parts.find(p => p.type === "timeZoneName")?.value ?? "GMT+0";
  const m = raw.match(/GMT([+-]\d+)(?::(\d+))?/);
  if (!m) return "+00:00";
  const h = parseInt(m[1], 10);
  const min = m[2] ? parseInt(m[2], 10) : 0;
  return `${h < 0 ? "-" : "+"}${String(Math.abs(h)).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}
function combineDateTime(dateStr: string, timeStr: string) {
  return new Date(`${dateStr}T${to24h(timeStr)}:00${edmontonOffsetFor(dateStr)}`).toISOString();
}

// ─── New Appointment Overlay ───────────────────────────────────────────────────

function NewBookingOverlay({ onClose, onCreated, staff, selfStaffId }: { onClose: () => void; onCreated: () => void; staff: StaffRow[]; selfStaffId?: string | null }) {
  const [clientQ, setClientQ] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [selectedStaffId, setSelectedStaffId] = useState(selfStaffId ?? "");
  const selectedStylist = staff.find(s => s.id === selectedStaffId)?.full_name ?? "";
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [price, setPrice] = useState("50");
  const [duration, setDuration] = useState("60");
  const [notes, setNotes] = useState("");
  const [deposit, setDeposit] = useState(false);
  const [sms, setSms] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "var(--dw05)", border: "1px solid var(--dw1)",
    borderRadius: 10, padding: "10px 13px", color: "var(--dtext)", fontSize: 13.5,
    outline: "none", boxSizing: "border-box",
  };
  const sectionLabel: React.CSSProperties = {
    color: "var(--dw4)", fontSize: 11.5, fontWeight: 700, letterSpacing: "0.05em",
    textTransform: "uppercase", display: "block", marginBottom: 9,
  };

  const canBook = Boolean(clientQ.trim() && selectedService && selectedDate && selectedTime);

  const handleBook = async () => {
    if (!canBook) return;
    setError(null);
    setSubmitting(true);
    try {
      await createAppointment({
        clientName: clientQ,
        serviceName: selectedService,
        stylistName: selectedStylist,
        staffId: selectedStaffId || undefined,
        startsAt: combineDateTime(selectedDate, selectedTime),
        durationMinutes: parseInt(duration, 10) || 30,
        price: parseFloat(price) || 0,
        requireDeposit: deposit,
        depositAmount: deposit ? (parseFloat(price) || 0) * 0.25 : undefined,
        notes,
      });
      onCreated();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't book that appointment — try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const summaryRows: { label: string; value: string }[] = [
    { label: "Client", value: clientQ || "—" },
    { label: "Service", value: selectedService || "—" },
    { label: "Stylist", value: selectedStylist || "—" },
    { label: "Date", value: selectedDate || "—" },
    { label: "Time", value: selectedTime || "—" },
  ];
  const priceNum = parseFloat(price) || 0;
  const depositNum = deposit ? priceNum * 0.25 : 0;

  return (
    <div className="apt-modal-overlay" style={{
      position: "fixed", inset: 0, zIndex: 300,
      background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }} onClick={onClose}>
      <div className="apt-sheet" style={{
        background: "var(--dm1)", border: "1px solid var(--dw1)",
        borderRadius: 22, width: "100%", maxWidth: 860, maxHeight: "88vh",
        margin: 20, boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
        display: "flex", flexDirection: "column", overflow: "hidden",
      }} onClick={e => e.stopPropagation()}>

        {/* Header — spans the sheet so it stays put while the form scrolls */}
        <div className="apt-sheet-header" style={{ flexShrink: 0, padding: "22px 28px 16px", borderBottom: "1px solid var(--dw06)" }}>
          <div className="apt-sheet-grabber" />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2 style={{ color: "var(--dtext)", fontSize: 18, fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>
              New Booking
            </h2>
            <button onClick={onClose} aria-label="Close" style={{ background: "var(--dw06)", border: "none", borderRadius: 9, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--dw5)", flexShrink: 0 }}>
              <X size={17} />
            </button>
          </div>
        </div>

        <div className="nb-body" style={{ display: "flex", flex: 1, minHeight: 0 }}>

        {/* Form */}
        <div className="nb-form" style={{ flex: 1, minWidth: 0, padding: "22px 28px 26px", overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <label style={sectionLabel}>Client</label>
              <input value={clientQ} onChange={e => setClientQ(e.target.value)} placeholder="Full name…" style={inputStyle} />
            </div>

            <div>
              <label style={sectionLabel}>Service</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 10 }}>
                {SERVICES.map(s => (
                  <button key={s} className="apt-choice" onClick={() => setSelectedService(s)} style={{
                    padding: "9px 12px", borderRadius: 10, border: `1px solid ${selectedService === s ? "rgba(139,92,246,0.5)" : "var(--dw07)"}`,
                    background: selectedService === s ? "rgba(109,40,217,0.15)" : "var(--dw02)",
                    color: selectedService === s ? "rgb(210,196,254)" : "var(--dw6)",
                    fontSize: 12.5, fontWeight: selectedService === s ? 700 : 400, cursor: "pointer", textAlign: "left",
                  }}>
                    {s}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ color: "var(--dw35)", fontSize: 11.5, display: "block", marginBottom: 6 }}>Price (C$)</label>
                  <input type="number" value={price} onChange={e => setPrice(e.target.value)} style={inputStyle} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ color: "var(--dw35)", fontSize: 11.5, display: "block", marginBottom: 6 }}>Duration (min)</label>
                  <input type="number" value={duration} onChange={e => setDuration(e.target.value)} style={inputStyle} />
                </div>
              </div>
            </div>

            {staff.length > 0 && !selfStaffId && (
              <div>
                <label style={sectionLabel}>Stylist</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {staff.map(s => (
                    <button key={s.id} className="apt-choice" onClick={() => setSelectedStaffId(s.id)} style={{
                      padding: "9px 16px", borderRadius: 10,
                      border: `1px solid ${selectedStaffId === s.id ? "rgba(139,92,246,0.5)" : "var(--dw07)"}`,
                      background: selectedStaffId === s.id ? "rgba(109,40,217,0.15)" : "var(--dw02)",
                      color: selectedStaffId === s.id ? "rgb(210,196,254)" : "var(--dw5)",
                      fontSize: 12.5, fontWeight: selectedStaffId === s.id ? 700 : 400, cursor: "pointer",
                    }}>
                      {s.full_name.split(" ")[0]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label style={sectionLabel}>Date &amp; time</label>
              <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} style={{ ...inputStyle, colorScheme: "dark", marginBottom: 10 }} />
              <div className="apt-time-grid-6" style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 6 }}>
                {TIMES.map(t => (
                  <button key={t} className="apt-choice" onClick={() => setSelectedTime(t)} style={{
                    padding: "8px 4px", borderRadius: 9,
                    border: `1px solid ${selectedTime === t ? "rgba(139,92,246,0.5)" : "var(--dw07)"}`,
                    background: selectedTime === t ? "rgba(109,40,217,0.15)" : "var(--dw02)",
                    color: selectedTime === t ? "rgb(210,196,254)" : "var(--dw5)",
                    fontSize: 11, fontWeight: selectedTime === t ? 700 : 400, cursor: "pointer",
                  }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={sectionLabel}>Notes</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. first time client, prefers no heat…" rows={2} style={{ ...inputStyle, resize: "none", fontFamily: "inherit" }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label: "Require deposit", sub: "Marks 25% as paid upfront", value: deposit, set: setDeposit },
                { label: "Send SMS confirmation", sub: "Text the client when booked", value: sms, set: setSms },
              ].map(t => (
                <div key={t.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 14px", background: "var(--dw03)", borderRadius: 10, border: "1px solid var(--dw07)" }}>
                  <div>
                    <p style={{ color: "var(--dtext)", fontSize: 13, fontWeight: 600, margin: "0 0 2px" }}>{t.label}</p>
                    <p style={{ color: "var(--dw35)", fontSize: 11.5, margin: 0 }}>{t.sub}</p>
                  </div>
                  <button onClick={() => t.set(!t.value)} style={{
                    width: 40, height: 22, borderRadius: 11, border: "none", cursor: "pointer",
                    background: t.value ? "rgb(109,40,217)" : "var(--dw12)",
                    position: "relative", transition: "background 0.2s", flexShrink: 0,
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
        </div>

        {/* Live summary panel — sidebar on desktop, sticky action bar on mobile */}
        <div className="nb-summary" style={{
          width: 280, flexShrink: 0, background: "var(--dw02)",
          borderLeft: "1px solid var(--dw08)", padding: "22px",
          display: "flex", flexDirection: "column",
        }}>
          <div className="nb-summary-desktop" style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
            <p style={{ color: "var(--dw4)", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 16px" }}>
              Summary
            </p>

            <div style={{
              width: 44, height: 44, borderRadius: 12, background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "rgb(167,139,250)", marginBottom: 14,
            }}>
              {clientQ.trim() ? initialsFor(clientQ) : "?"}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
              {summaryRows.map(row => (
                <div key={row.label}>
                  <p style={{ color: "var(--dw3)", fontSize: 10.5, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", margin: "0 0 2px" }}>{row.label}</p>
                  <p style={{ color: "var(--dtext)", fontSize: 13.5, fontWeight: 600, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.value}</p>
                </div>
              ))}
            </div>

            <div style={{ background: "var(--dw03)", border: "1px solid var(--dw08)", borderRadius: 12, padding: "12px 14px", marginBottom: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: deposit ? 6 : 0 }}>
                <span style={{ color: "var(--dw4)", fontSize: 12 }}>Price</span>
                <span style={{ color: "var(--dtext)", fontSize: 13, fontWeight: 700 }}>{fmtPrice(priceNum)}</span>
              </div>
              {deposit && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--dw4)", fontSize: 12 }}>Deposit due</span>
                  <span style={{ color: "rgb(167,139,250)", fontSize: 13, fontWeight: 700 }}>{fmtPrice(depositNum)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Mobile-only condensed recap — the full form is right above it */}
          <div className="nb-summary-mobile" style={{ display: "none", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
            <p style={{ color: "var(--dw45)", fontSize: 12.5, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {selectedService || "Pick a service"}{selectedTime ? ` · ${selectedTime}` : ""}
            </p>
            <p style={{ color: "var(--dtext)", fontSize: 14, fontWeight: 800, margin: 0, flexShrink: 0 }}>
              {fmtPrice(priceNum)}{deposit ? <span style={{ color: "rgb(167,139,250)", fontSize: 11.5, fontWeight: 700 }}> · {fmtPrice(depositNum)} dep</span> : null}
            </p>
          </div>

          {error && (
            <p style={{ color: "rgb(248,113,113)", fontSize: 12, margin: "16px 0 0" }}>{error}</p>
          )}

          <button disabled={!canBook || submitting} onClick={handleBook} className="nb-book-btn" style={{
            marginTop: 16, padding: "14px", borderRadius: 12, border: "none",
            background: canBook ? "rgb(52,211,153)" : "var(--dw08)",
            color: canBook ? "rgb(5,40,20)" : "var(--dw3)",
            fontSize: 14, fontWeight: 800, cursor: canBook && !submitting ? "pointer" : "default",
            opacity: submitting ? 0.7 : 1,
          }}>
            {submitting ? "Booking…" : "Book appointment"}
          </button>
        </div>
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
  const [error, setError] = useState<string | null>(null);

  const baseNum = parseFloat(appt.price.replace(/[^0-9.]/g, "")) || 0;
  const depositNum = appt.depositAmount ? parseFloat(appt.depositAmount.replace(/[^0-9.]/g, "")) || 0 : 0;
  const subtotal = Math.max(0, baseNum - depositNum);
  const tipAmount = gratuityPct === "custom" ? (parseFloat(customTip) || 0) : (baseNum * gratuityPct / 100);
  const total = subtotal + tipAmount;
  const fmtMoney = (n: number) => `C$${n.toFixed(2)}`;

  const runCharge = () => {
    setStage("processing");
    setTimeout(async () => {
      try {
        await completeAppointment(appt.id, { tipAmount, paymentMethod: method ?? "cash", paidAmount: total });
        setStage("success");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Couldn't record that payment — try again.");
        setStage("select");
      }
    }, method === "cash" ? 500 : 1400);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "var(--dw05)", border: "1px solid var(--dw1)",
    borderRadius: 10, padding: "10px 13px", color: "var(--dtext)", fontSize: 13.5,
    outline: "none", boxSizing: "border-box",
  };

  return (
    <div className="apt-modal-overlay" style={{
      position: "fixed", inset: 0, zIndex: 320,
      background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }} onClick={stage === "select" ? onClose : undefined}>
      <div className="apt-sheet apt-sheet-scroll" style={{
        background: "var(--dm1)", border: "1px solid var(--dw1)",
        borderRadius: 22, width: "100%", maxWidth: 440,
        padding: "26px 26px 24px", margin: 20,
        boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
      }} onClick={e => e.stopPropagation()}>

        <div className="apt-sheet-grabber" />

        {stage === "success" ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "12px 0 4px", animation: "fp-success-pop 0.5s cubic-bezier(0.2,0.8,0.2,1)" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(52,211,153,0.12)", border: "2px solid rgba(52,211,153,0.35)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <CheckCircle2 size={30} color="rgb(52,211,153)" strokeWidth={1.8} />
            </div>
            <h2 style={{ color: "var(--dtext)", fontSize: 19, fontWeight: 800, margin: "0 0 6px", letterSpacing: "-0.02em" }}>{fmtMoney(total)} collected</h2>
            <p style={{ color: "var(--dw45)", fontSize: 13, margin: "0 0 4px" }}>
              {method === "link" ? `Payment link sent via ${linkChannel === "sms" ? "SMS" : linkChannel === "whatsapp" ? "WhatsApp" : "Email"}`
                : method === "cash" ? "Marked as received in cash"
                : "Charged card on file"}
            </p>
            {receiptSms ? (
              <p style={{ color: "var(--dw3)", fontSize: 12, margin: "0 0 22px" }}>Receipt texted to {appt.phone || "client"}</p>
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
                <h2 style={{ color: "var(--dtext)", fontSize: 17, fontWeight: 800, margin: "0 0 2px", letterSpacing: "-0.02em" }}>Close out</h2>
                <p style={{ color: "var(--dw35)", fontSize: 12.5, margin: 0 }}>{appt.name} · {appt.service}</p>
              </div>
              <button onClick={onClose} disabled={stage === "processing"} style={{ background: "var(--dw06)", border: "none", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: stage === "processing" ? "default" : "pointer", color: "var(--dw5)" }}>
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
                <p style={{ color: "var(--dtext)", fontSize: 13.5, fontWeight: 700, margin: "0 0 4px" }}>
                  {method === "tap" ? "Hold card or phone near reader…" : method === "link" ? "Sending payment link…" : method === "cash" ? "Marking as received…" : "Charging card on file…"}
                </p>
                <p style={{ color: "var(--dw3)", fontSize: 12, margin: 0 }}>{fmtMoney(total)}</p>
              </div>
            ) : (
              <>
                {/* Gratuity selector */}
                <div style={{ marginBottom: 18 }}>
                  <label style={{ color: "var(--dw4)", fontSize: 12, fontWeight: 500, display: "block", marginBottom: 8 }}>Gratuity</label>
                  <div className="apt-gratuity-grid" style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 6 }}>
                    {GRATUITY_PRESETS.map(p => (
                      <button key={p} onClick={() => setGratuityPct(p)} style={{
                        padding: "9px 4px", borderRadius: 10,
                        border: `1px solid ${gratuityPct === p ? "rgba(139,92,246,0.5)" : "var(--dw07)"}`,
                        background: gratuityPct === p ? "rgba(109,40,217,0.15)" : "var(--dw02)",
                        color: gratuityPct === p ? "rgb(210,196,254)" : "var(--dw5)",
                        fontSize: 12.5, fontWeight: gratuityPct === p ? 700 : 400, cursor: "pointer",
                      }}>
                        {p === 0 ? "No tip" : `${p}%`}
                      </button>
                    ))}
                    <button onClick={() => setGratuityPct("custom")} style={{
                      padding: "9px 4px", borderRadius: 10,
                      border: `1px solid ${gratuityPct === "custom" ? "rgba(139,92,246,0.5)" : "var(--dw07)"}`,
                      background: gratuityPct === "custom" ? "rgba(109,40,217,0.15)" : "var(--dw02)",
                      color: gratuityPct === "custom" ? "rgb(210,196,254)" : "var(--dw5)",
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
                <div style={{ background: "var(--dw03)", border: "1px solid var(--dw08)", borderRadius: 14, padding: "14px 16px", marginBottom: 18, display: "flex", flexDirection: "column", gap: 7 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--dw4)", fontSize: 12.5 }}>Service</span>
                    <span style={{ color: "var(--dw7)", fontSize: 12.5 }}>{appt.price}</span>
                  </div>
                  {depositNum > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--dw4)", fontSize: 12.5 }}>Deposit already paid</span>
                      <span style={{ color: "rgb(52,211,153)", fontSize: 12.5 }}>-{appt.depositAmount}</span>
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--dw4)", fontSize: 12.5 }}>Gratuity</span>
                    <span style={{ color: "var(--dw7)", fontSize: 12.5 }}>{fmtMoney(tipAmount)}</span>
                  </div>
                  <div style={{ height: 1, background: "var(--dw07)", margin: "3px 0" }} />
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--dtext)", fontSize: 14, fontWeight: 700 }}>Total due</span>
                    <span style={{ color: "rgb(52,211,153)", fontSize: 16, fontWeight: 800 }}>{fmtMoney(total)}</span>
                  </div>
                </div>

                {/* Payment method */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ color: "var(--dw4)", fontSize: 12, fontWeight: 500, display: "block", marginBottom: 8 }}>Payment method</label>
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
                        border: `1px solid ${method === m.id ? "rgba(139,92,246,0.5)" : "var(--dw07)"}`,
                        background: method === m.id ? "rgba(109,40,217,0.15)" : "var(--dw02)",
                        cursor: "pointer", textAlign: "left",
                      }}>
                        <m.Icon size={17} color={method === m.id ? "rgb(167,139,250)" : "var(--dw5)"} strokeWidth={1.7} />
                        <div>
                          <p style={{ color: method === m.id ? "rgb(210,196,254)" : "var(--dtext)", fontSize: 12.5, fontWeight: 700, margin: "0 0 1px" }}>{m.label}</p>
                          <p style={{ color: "var(--dw3)", fontSize: 10.5, margin: 0 }}>{m.sub}</p>
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
                        border: `1px solid ${linkChannel === c.id ? "rgba(139,92,246,0.5)" : "var(--dw07)"}`,
                        background: linkChannel === c.id ? "rgba(109,40,217,0.15)" : "var(--dw02)",
                        color: linkChannel === c.id ? "rgb(210,196,254)" : "var(--dw5)",
                        fontSize: 12, fontWeight: linkChannel === c.id ? 700 : 400, cursor: "pointer",
                      }}>
                        {c.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Receipt SMS toggle */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: "var(--dw03)", borderRadius: 10, border: "1px solid var(--dw07)", marginBottom: 20 }}>
                  <div>
                    <p style={{ color: "var(--dtext)", fontSize: 13, fontWeight: 600, margin: "0 0 2px" }}>Text receipt to client</p>
                    <p style={{ color: "var(--dw35)", fontSize: 11.5, margin: 0 }}>{appt.phone || "No phone on file"}</p>
                  </div>
                  <button onClick={() => setReceiptSms(v => !v)} style={{
                    width: 40, height: 22, borderRadius: 11, border: "none", cursor: "pointer",
                    background: receiptSms ? "rgb(109,40,217)" : "var(--dw12)",
                    position: "relative", transition: "background 0.2s",
                  }}>
                    <span style={{ position: "absolute", top: 3, left: receiptSms ? 21 : 3, width: 16, height: 16, borderRadius: "50%", background: "white", transition: "left 0.2s" }} />
                  </button>
                </div>

                {error && (
                  <p style={{ color: "rgb(248,113,113)", fontSize: 12.5, margin: "0 0 14px" }}>{error}</p>
                )}

                {/* CTA */}
                <button
                  disabled={!method}
                  onClick={runCharge}
                  style={{
                    width: "100%", padding: "14px", borderRadius: 13, border: "none",
                    background: method ? "rgb(52,211,153)" : "var(--dw08)",
                    color: method ? "rgb(5,40,20)" : "var(--dw3)",
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

function AppointmentDetail({ appt, onClose, onCloseOut, onChanged }: { appt: ApptRecord; onClose: () => void; onCloseOut: () => void; onChanged: () => void }) {
  const [status, setStatus] = useState<AppointmentStatus>(appt.status);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [rescheduling, setRescheduling] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const s = STATUS_STYLE[status];

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "var(--dw05)", border: "1px solid var(--dw1)",
    borderRadius: 10, padding: "10px 13px", color: "var(--dtext)", fontSize: 13.5,
    outline: "none", boxSizing: "border-box", colorScheme: "dark",
  };

  const avatarColor = appt.color;
  const isDone = status === "completed" || status === "cancelled";

  const doReschedule = async () => {
    setError(null);
    setBusy(true);
    try {
      await rescheduleAppointment(appt.id, combineDateTime(newDate, newTime));
      onChanged();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't reschedule — try again.");
    } finally {
      setBusy(false);
    }
  };

  const doConfirm = async () => {
    setError(null);
    setBusy(true);
    try {
      await confirmAppointment(appt.id);
      setStatus("confirmed");
      onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't confirm — try again.");
    } finally {
      setBusy(false);
    }
  };

  const doCancel = async () => {
    setError(null);
    setBusy(true);
    try {
      await cancelAppointment(appt.id);
      setStatus("cancelled");
      setConfirmCancel(false);
      onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't cancel — try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="apt-modal-overlay" style={{
      position: "fixed", inset: 0, zIndex: 310,
      background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }} onClick={onClose}>
      <div className="apt-sheet" style={{
        background: "var(--dm2)", border: "1px solid var(--dw1)",
        borderRadius: 24, width: "100%", maxWidth: 480,
        maxHeight: "90vh", display: "flex", flexDirection: "column",
        margin: 20, overflow: "hidden",
        boxShadow: "0 32px 100px rgba(0,0,0,0.8)",
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="apt-sheet-header" style={{ padding: "22px 22px 0", flexShrink: 0 }}>
          <div className="apt-sheet-grabber" />
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 46, height: 46, borderRadius: "50%", background: tint(appt.color, 0.13), border: `1.5px solid ${tint(appt.color, 0.27)}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, color: avatarColor, flexShrink: 0 }}>
                {appt.initials}
              </div>
              <div>
                <h2 style={{ color: "var(--dtext)", fontSize: 17, fontWeight: 800, margin: "0 0 3px", letterSpacing: "-0.02em" }}>{appt.name}</h2>
                <p style={{ color: "var(--dw4)", fontSize: 12.5, margin: 0 }}>{appt.dateLabel} · {appt.time}</p>
              </div>
            </div>
            <button onClick={onClose} style={{ background: "var(--dw06)", border: "none", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--dw45)", flexShrink: 0 }}>
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
            <p style={{ color: "var(--dw35)", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 10px" }}>Client</p>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: "var(--dtext)", fontSize: 13, fontWeight: 600, margin: "0 0 2px" }}>{appt.phone || "No phone on file"}</p>
                <p style={{ color: "var(--dw35)", fontSize: 12, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{appt.email || "No email on file"}</p>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid var(--dw08)", background: "var(--dw04)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "rgb(52,211,153)" }}>
                  <MessageSquare size={14} strokeWidth={1.8} />
                </button>
                <button style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid var(--dw08)", background: "var(--dw04)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "rgb(96,165,250)" }}>
                  <Phone size={14} strokeWidth={1.8} />
                </button>
              </div>
            </div>
          </div>

          {/* Service details */}
          <div style={{ ...card, padding: "14px 16px" }}>
            <p style={{ color: "var(--dw35)", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 10px" }}>Service</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label: "Service", value: appt.service },
                { label: "Stylist", value: appt.stylist },
                { label: "Duration", value: `${appt.duration} min` },
                { label: "Price", value: appt.price },
              ].map(row => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--dw35)", fontSize: 12.5 }}>{row.label}</span>
                  <span style={{ color: "var(--dtext)", fontSize: 12.5, fontWeight: 600 }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Client notes */}
          <div style={{ ...card, padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <StickyNote size={12} color="var(--dw35)" />
              <p style={{ color: "var(--dw35)", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", margin: 0 }}>Client notes</p>
            </div>
            <p style={{ color: appt.notes ? "var(--dw65)" : "var(--dw25)", fontSize: 12.5, margin: 0, lineHeight: 1.55 }}>
              {appt.notes || "No notes on file for this client."}
            </p>
          </div>

          {/* Reschedule panel */}
          {rescheduling && (
            <div style={{ ...card, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
              <p style={{ color: "var(--dw35)", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", margin: 0 }}>Reschedule to</p>
              <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} style={inputStyle} />
              <div className="apt-time-grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6 }}>
                {TIMES.map(t => (
                  <button key={t} onClick={() => setNewTime(t)} style={{
                    padding: "8px 4px", borderRadius: 9,
                    border: `1px solid ${newTime === t ? "rgba(139,92,246,0.5)" : "var(--dw07)"}`,
                    background: newTime === t ? "rgba(109,40,217,0.15)" : "var(--dw02)",
                    color: newTime === t ? "rgb(210,196,254)" : "var(--dw5)",
                    fontSize: 11.5, fontWeight: newTime === t ? 700 : 400, cursor: "pointer",
                  }}>
                    {t}
                  </button>
                ))}
              </div>
              {error && <p style={{ color: "rgb(248,113,113)", fontSize: 12, margin: 0 }}>{error}</p>}
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setRescheduling(false)} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1px solid var(--dw1)", background: "var(--dw04)", color: "var(--dw6)", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>
                  Cancel
                </button>
                <button
                  disabled={!newDate || !newTime || busy}
                  onClick={doReschedule}
                  style={{ flex: 2, padding: "10px", borderRadius: 10, border: "none", background: newDate && newTime ? "rgb(109,40,217)" : "var(--dw08)", color: newDate && newTime ? "white" : "var(--dw3)", fontSize: 12.5, fontWeight: 700, cursor: newDate && newTime ? "pointer" : "default" }}
                >
                  {busy ? "Saving…" : "Confirm new time"}
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
              {error && <p style={{ color: "rgb(248,113,113)", fontSize: 12, margin: 0 }}>{error}</p>}
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setConfirmCancel(false)} style={{ flex: 1, padding: "9px", borderRadius: 9, border: "1px solid var(--dw1)", background: "var(--dw04)", color: "var(--dw6)", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                  Never mind
                </button>
                <button disabled={busy} onClick={doCancel} style={{ flex: 1, padding: "9px", borderRadius: 9, border: "none", background: "rgb(239,68,68)", color: "white", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                  {busy ? "Cancelling…" : "Cancel appointment"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        {!isDone && (
          <div className="apt-sheet-footer" style={{ padding: "16px 22px 22px", flexShrink: 0, borderTop: "1px solid var(--dw06)", display: "flex", flexDirection: "column", gap: 10 }}>
            {status === "pending" && (
              <button disabled={busy} onClick={doConfirm} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "13px", borderRadius: 13, border: "none", background: "rgb(109,40,217)", color: "white", fontSize: 13.5, fontWeight: 800, cursor: busy ? "default" : "pointer", opacity: busy ? 0.6 : 1 }}>
                {busy ? "Confirming…" : "Confirm booking"}
              </button>
            )}
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setRescheduling(v => !v)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "11px", borderRadius: 11, border: "1px solid var(--dw1)", background: "var(--dw04)", color: "var(--dw65)", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>
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
          <div className="apt-sheet-footer" style={{ padding: "16px 22px 22px", flexShrink: 0, borderTop: "1px solid var(--dw06)" }}>
            <p style={{ color: "var(--dw3)", fontSize: 12, textAlign: "center", margin: 0 }}>This appointment has been cancelled.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Day view ─────────────────────────────────────────────────────────────────

function DayView({ appts, bookingUrl, onNewBooking, onSelect }: {
  appts: ApptRecord[]; bookingUrl: string | null;
  onNewBooking: () => void; onSelect: (appt: ApptRecord) => void;
}) {
  const todayAppts = useMemo(() => appts.filter(a => a.dateLabel === "Today" && a.status !== "cancelled"), [appts]);
  const bookingAtHour = (h: number) => todayAppts.find(a => a.hour === h);
  const openCount = HOURS.filter(h => !FAMILY_HOURS.includes(h) && !bookingAtHour(h)).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* Booking link card */}
      <BookingLinkCard bookingUrl={bookingUrl} />

      {/* Today summary banner */}
      <div className="bookings-day-banner" style={{
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
        background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.22)",
        borderRadius: 14, padding: "12px 18px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <Zap size={16} color="rgb(167,139,250)" strokeWidth={1.8} style={{ flexShrink: 0 }} />
          <span style={{ color: "rgb(210,196,254)", fontSize: 13.5, fontWeight: 700 }}>
            {todayAppts.length} booked today
          </span>
          <span style={{ color: "var(--dw35)", fontSize: 13 }}>· {openCount} open slot{openCount === 1 ? "" : "s"}</span>
        </div>
        <button className="bookings-day-banner-btn" onClick={onNewBooking} style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          padding: "9px 16px", borderRadius: 10, flexShrink: 0,
          background: "rgb(109,40,217)", border: "none",
          color: "white", fontSize: 12.5, fontWeight: 700, cursor: "pointer",
        }}>
          Add booking <ChevronRight size={13} strokeWidth={2.5} />
        </button>
      </div>

      {/* Time rail */}
      <div style={{ ...card, padding: 0 }}>
        <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid var(--dw06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ color: "var(--dtext)", fontSize: 14, fontWeight: 700, margin: 0 }}>Today</p>
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
          const isFamily = FAMILY_HOURS.includes(h);

          return (
            <div key={h} style={{
              display: "flex", alignItems: "stretch",
              borderBottom: h < HOURS[HOURS.length - 1] ? "1px solid var(--dw04)" : "none",
              minHeight: 56,
            }}>
              {/* Time label */}
              <div className="rail-time" style={{
                width: 72, flexShrink: 0, padding: "16px 0 16px 20px",
                display: "flex", alignItems: "flex-start",
              }}>
                <span style={{ color: "var(--dw22)", fontSize: 11.5, fontWeight: 600 }}>{fmt12(h)}</span>
              </div>

              {/* Slot content */}
              <div className="rail-slot" style={{ flex: 1, minWidth: 0, padding: "8px 16px 8px 8px", display: "flex", alignItems: "center" }}>
                {booking ? (
                  <div onClick={() => onSelect(booking)} style={{
                    flex: 1, minWidth: 0, padding: "10px 14px", borderRadius: 12,
                    background: tint(booking.color, 0.07),
                    border: `1px solid ${tint(booking.color, 0.19)}`,
                    display: "flex", alignItems: "center", gap: 12, cursor: "pointer",
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                      background: tint(booking.color, 0.13), border: `1.5px solid ${tint(booking.color, 0.27)}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 10, fontWeight: 800, color: booking.color,
                    }}>{booking.initials}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: "var(--dtext)", fontSize: 13, fontWeight: 700, margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{booking.name}</p>
                      <p style={{ color: "var(--dw38)", fontSize: 11.5, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{booking.service} · {booking.stylist}</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                      <span className="rail-status-badge" style={{
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
                ) : (
                  <div onClick={onNewBooking} style={{
                    flex: 1, padding: "10px 14px", borderRadius: 12,
                    border: "1.5px dashed rgba(139,92,246,0.25)",
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, cursor: "pointer",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Clock size={13} color="rgba(139,92,246,0.4)" />
                      <span style={{ color: "var(--dw25)", fontSize: 12.5 }}>Open slot</span>
                    </div>
                    <span style={{
                      padding: "5px 12px", borderRadius: 8,
                      background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)",
                      color: "rgb(167,139,250)", fontSize: 11.5, fontWeight: 700,
                    }}>
                      Add →
                    </span>
                  </div>
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

function WeekView({ appts }: { appts: ApptRecord[] }) {
  const weekDays = useMemo(() => {
    const now = new Date();
    const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const todayName = new Intl.DateTimeFormat("en-US", { timeZone: TZ, weekday: "short" }).format(now);
    const todayIdx = WEEKDAY_SHORT.indexOf(todayName); // 0=Sun
    const monday = new Date(now);
    monday.setDate(monday.getDate() - ((todayIdx + 6) % 7));

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const key = dateKey(d);
      const dayAppts = appts.filter(a => a.status !== "cancelled" && dateKey(new Date(a.startsAt)) === key);
      const revenue = dayAppts.reduce((sum, a) => sum + (parseFloat(a.price.replace(/[^0-9.]/g, "")) || 0), 0);
      return {
        label: new Intl.DateTimeFormat("en-US", { timeZone: TZ, weekday: "short" }).format(d),
        date: new Intl.DateTimeFormat("en-US", { timeZone: TZ, month: "short", day: "numeric" }).format(d),
        isToday: key === dateKey(now),
        booked: dayAppts.length,
        revenue,
      };
    });
  }, [appts]);

  const maxBooked = Math.max(1, ...weekDays.map(d => d.booked));
  const weekTotal = weekDays.reduce((s, d) => s + d.revenue, 0);
  const activeDays = weekDays.filter(d => d.booked > 0).length;
  const totalAppts = weekDays.reduce((s, d) => s + d.booked, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* Summary tiles */}
      <div className="bookings-week-tiles" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
        {[
          { label: "Week total", value: fmtPrice(weekTotal), sub: `${activeDays} active day${activeDays === 1 ? "" : "s"}` },
          { label: "Avg / day",  value: fmtPrice(weekTotal / 7), sub: "across the week" },
          { label: "Appointments", value: String(totalAppts), sub: "booked this week" },
        ].map(t => (
          <div key={t.label} className="bookings-week-tile" style={{ ...card, padding: "16px 18px" }}>
            <p style={{ color: "var(--dw35)", fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 6px" }}>{t.label}</p>
            <p className="bookings-week-tile-value" style={{ color: "var(--dtext)", fontSize: 24, fontWeight: 800, margin: "0 0 3px", letterSpacing: "-0.03em" }}>{t.value}</p>
            <p style={{ color: "var(--dw35)", fontSize: 11.5, margin: 0 }}>{t.sub}</p>
          </div>
        ))}
      </div>

      {/* 7-day columns */}
      <div style={{ ...card, padding: "20px", overflowX: "auto" }}>
        <div className="bookings-week-grid" style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 10, minWidth: 560 }}>
          {weekDays.map((day) => (
            <div key={day.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              {/* Day header */}
              <div style={{ textAlign: "center" }}>
                <p style={{ color: day.isToday ? "rgb(167,139,250)" : "var(--dw35)", fontSize: 11, fontWeight: 700, margin: "0 0 2px", textTransform: "uppercase" }}>{day.label}</p>
                <div style={{
                  width: 30, height: 30, borderRadius: "50%",
                  background: day.isToday ? "rgb(109,40,217)" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <p style={{ color: day.isToday ? "white" : "var(--dw5)", fontSize: 13, fontWeight: day.isToday ? 800 : 500, margin: 0 }}>{day.date.split(" ")[1]}</p>
                </div>
              </div>

              {/* Bar chart */}
              <div style={{ width: "100%", height: 80, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                <div style={{
                  width: "60%", borderRadius: "4px 4px 0 0",
                  height: `${(day.booked / maxBooked) * 100}%`,
                  background: day.isToday ? "rgb(139,92,246)" : "rgba(139,92,246,0.4)",
                  minHeight: day.booked > 0 ? 4 : 0,
                }} />
              </div>

              {/* Booked */}
              <p style={{ color: "var(--dw5)", fontSize: 11, margin: 0, textAlign: "center" }}>
                <span style={{ color: "var(--dtext)", fontWeight: 700 }}>{day.booked}</span> booked
              </p>

              {/* Revenue */}
              <p style={{ color: "rgb(52,211,153)", fontSize: 11, fontWeight: 700, margin: 0 }}>{fmtPrice(day.revenue)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── List view ────────────────────────────────────────────────────────────────

function ListView({ appts, onSelect }: { appts: ApptRecord[]; onSelect: (appt: ApptRecord) => void }) {
  const upcoming = useMemo(
    () => [...appts].sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()),
    [appts],
  );
  const grouped = upcoming.reduce<Record<string, ApptRecord[]>>((acc, a) => {
    (acc[a.dateLabel] ??= []).push(a);
    return acc;
  }, {});

  if (upcoming.length === 0) {
    return (
      <div style={{ ...card, padding: "40px 20px", textAlign: "center" }}>
        <p style={{ color: "var(--dw35)", fontSize: 13, margin: 0 }}>No appointments yet — add your first booking to see it here.</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {Object.entries(grouped).map(([date, bookings]) => (
        <div key={date}>
          <p style={{ color: "var(--dw35)", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 10px" }}>{date}</p>
          <div style={{ ...card }}>
            {bookings.map((b, i) => {
              const s = STATUS_STYLE[b.status];
              return (
                <div key={b.id} onClick={() => onSelect(b)} style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "13px 18px", cursor: "pointer",
                  borderBottom: i < bookings.length - 1 ? "1px solid var(--dw04)" : "none",
                }}>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", background: tint(b.color, 0.13), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: b.color, flexShrink: 0 }}>
                    {b.initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: "var(--dtext)", fontSize: 13, fontWeight: 700, margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.name}</p>
                    <p style={{ color: "var(--dw35)", fontSize: 12, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.service} · {b.stylist}</p>
                  </div>
                  {/* Right column: stacks under nothing on desktop, right-aligned column on mobile */}
                  <div className="bookings-list-meta" style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--dw4)", fontSize: 12 }}>
                      <Clock size={11} />
                      {b.time}
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, color: s.color, background: s.bg, whiteSpace: "nowrap" }}>{s.label}</span>
                    <span style={{ color: "rgb(52,211,153)", fontSize: 13, fontWeight: 700, minWidth: 52, textAlign: "right" }}>{b.price}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Booking link card ─────────────────────────────────────────────────────────

function BookingLinkCard({ bookingUrl }: { bookingUrl: string | null }) {
  const [copied, setCopied] = useState(false);

  if (!bookingUrl) {
    return (
      <div style={{ ...card, padding: "16px 20px" }}>
        <p style={{ color: "var(--dw4)", fontSize: 13, margin: 0 }}>
          Set up your booking page handle in Settings → Business to get a shareable booking link.
        </p>
      </div>
    );
  }

  const displayText = bookingUrl.replace(/^https?:\/\//, "");
  const smsHref = `sms:?&body=${encodeURIComponent(`Book with me: ${bookingUrl}`)}`;
  const emailHref = `mailto:?subject=${encodeURIComponent("Book an appointment")}&body=${encodeURIComponent(`Book here: ${bookingUrl}`)}`;

  const copy = () => {
    navigator.clipboard.writeText(bookingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ ...card, padding: "16px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <a href={bookingUrl} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0, textDecoration: "none" }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(139,92,246,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <ExternalLink size={15} color="rgb(167,139,250)" strokeWidth={1.8} />
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ color: "var(--dw35)", fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 2px" }}>Your booking link · tap to preview</p>
            <p style={{ color: "rgb(210,196,254)", fontSize: 13.5, fontWeight: 600, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{displayText}</p>
          </div>
        </a>

        <div className="bookings-link-actions" style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <a href={smsHref} title="Share via SMS" style={{
            width: 32, height: 32, borderRadius: 8, border: "1px solid var(--dw08)",
            background: "var(--dw04)", display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "rgb(52,211,153)", textDecoration: "none",
          }}>
            <MessageSquare size={14} strokeWidth={1.8} />
          </a>
          <a href={emailHref} title="Share via email" style={{
            width: 32, height: 32, borderRadius: 8, border: "1px solid var(--dw08)",
            background: "var(--dw04)", display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "rgb(96,165,250)", textDecoration: "none",
          }}>
            <Mail size={14} strokeWidth={1.8} />
          </a>
          <button onClick={copy} style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "7px 14px", borderRadius: 9,
            background: copied ? "rgba(52,211,153,0.12)" : "var(--dw06)",
            border: `1px solid ${copied ? "rgba(52,211,153,0.3)" : "var(--dw1)"}`,
            color: copied ? "rgb(52,211,153)" : "var(--dw6)",
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

export type BookingsStatusFilter = "active" | "cancelled" | "pending";

const STATUS_FILTER_TITLE: Record<BookingsStatusFilter, string> = {
  active: "Active Bookings",
  cancelled: "Cancelled Bookings",
  pending: "Pending Bookings",
};

export function AppointmentsClient({ initialAppointments, bookingUrl, staff, selfStaffId, statusFilter }: { initialAppointments: AppointmentRow[]; bookingUrl: string | null; staff: StaffRow[]; selfStaffId?: string | null; statusFilter?: BookingsStatusFilter }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [view, setView]           = useState<View>("Day");
  const [query, setQuery]         = useState("");
  const [showNewBooking, setNew]  = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [closingOut, setClosingOut] = useState(false);

  const now = useMemo(() => new Date(), []);
  const allAppts = useMemo(() => initialAppointments.map(r => rowToAppt(r, now)), [initialAppointments, now]);
  const appts = useMemo(() => {
    if (statusFilter === "active") return allAppts.filter(a => a.status === "confirmed" || a.status === "deposit");
    if (statusFilter === "cancelled") return allAppts.filter(a => a.status === "cancelled");
    if (statusFilter === "pending") return allAppts.filter(a => a.status === "pending");
    return allAppts;
  }, [allAppts, statusFilter]);
  const selectedAppt = appts.find(a => a.id === selectedId) ?? null;

  const refresh = () => startTransition(() => router.refresh());

  const dateStr = new Date().toLocaleDateString("en-CA", {
    weekday: "short", month: "short", day: "numeric",
  });

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Header */}
      <div className="bookings-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", rowGap: 12 }}>
        <div>
          <h1 style={{ color: "var(--dtext)", fontSize: 22, fontWeight: 800, margin: "0 0 3px", letterSpacing: "-0.03em" }}>{statusFilter ? STATUS_FILTER_TITLE[statusFilter] : "Bookings"}</h1>
          <p style={{ color: "var(--dw35)", fontSize: 13, margin: 0 }}>{dateStr}</p>
        </div>
        <div className="bookings-header-controls" style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {/* View switcher */}
          <div className="bookings-view-switch" style={{ display: "flex", gap: 2, background: "var(--dw04)", border: "1px solid var(--dw07)", borderRadius: 11, padding: 3 }}>
            {VIEWS.map(v => (
              <button key={v} onClick={() => setView(v)} style={{
                padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer",
                fontSize: 12.5, fontWeight: view === v ? 700 : 500,
                background: view === v ? "rgba(109,40,217,0.45)" : "transparent",
                color: view === v ? "rgb(210,196,254)" : "var(--dw4)",
                transition: "all 0.15s",
              }}>
                {v}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="bookings-search" style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--dw04)", border: "1px solid var(--dw07)", borderRadius: 10, padding: "8px 12px", width: 200 }}>
            <Search size={13} color="var(--dw3)" />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search…" style={{ background: "none", border: "none", outline: "none", color: "var(--dtext)", fontSize: 12.5, flex: 1, minWidth: 0 }} />
          </div>

          <button className="bookings-new-btn" onClick={() => setNew(true)} style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
            padding: "10px 18px", borderRadius: 11,
            background: "rgb(109,40,217)", border: "none",
            color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer",
          }}>
            <Plus size={15} strokeWidth={2.5} /> New booking
          </button>
        </div>
      </div>

      {/* View content */}
      {view === "Day"  && <DayView appts={appts} bookingUrl={bookingUrl} onNewBooking={() => setNew(true)} onSelect={a => setSelectedId(a.id)} />}
      {view === "Week" && <WeekView appts={appts} />}
      {view === "List" && <ListView appts={appts} onSelect={a => setSelectedId(a.id)} />}

      {/* New booking overlay */}
      {showNewBooking && <NewBookingOverlay onClose={() => setNew(false)} onCreated={refresh} staff={staff} selfStaffId={selfStaffId} />}

      {/* Appointment detail → close-out */}
      {selectedAppt && !closingOut && (
        <AppointmentDetail
          appt={selectedAppt}
          onClose={() => setSelectedId(null)}
          onCloseOut={() => setClosingOut(true)}
          onChanged={refresh}
        />
      )}
      {selectedAppt && closingOut && (
        <CloseOutModal
          appt={selectedAppt}
          onClose={() => setClosingOut(false)}
          onCompleted={() => { setClosingOut(false); setSelectedId(null); refresh(); }}
        />
      )}
    </div>
  );
}
