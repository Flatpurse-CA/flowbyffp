"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Clock, CheckCircle2, ChevronLeft, X, MapPin, Lock, CalendarClock,
} from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { getAvailableSlots, createPublicBooking, createPaymentIntent } from "./actions";
import { customerLogin, customerSignup } from "../../customer/actions";

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

// ─── Types ────────────────────────────────────────────────────────────────────

type Shop = { id: string; name: string; city: string; province: string; stripeConnected: boolean };
type Service = { id: string; name: string; price: number; duration_minutes: number; category: string | null };
type Staff = { id: string; full_name: string; role: string | null; color: string };
type BusinessHour = { weekday: number; open: boolean; start_time: string; end_time: string };
type Customer = { fullName: string; email: string };

const ACCENT = "rgb(109,40,217)";

function fmtDuration(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function fmtTime(iso: string) {
  return new Intl.DateTimeFormat("en-US", { timeZone: "America/Edmonton", hour: "numeric", minute: "2-digit" }).format(new Date(iso));
}

function fmtDayLabel(d: Date) {
  return {
    label: new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(d),
    day: d.getUTCDate(),
    dateStr: d.toISOString().slice(0, 10),
  };
}

// ─── Day strip generation ──────────────────────────────────────────────────────

function nextDays(count: number) {
  const today = new Date();
  const startUTC = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  return Array.from({ length: count }, (_, i) => new Date(startUTC + i * 86400000));
}

// ─── Open-now status + hours summary ───────────────────────────────────────────

const WEEKDAY_FROM_SHORT: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
const HOURS_DAY_LABELS = [
  { weekday: 1, label: "Mon" }, { weekday: 2, label: "Tue" }, { weekday: 3, label: "Wed" },
  { weekday: 4, label: "Thu" }, { weekday: 5, label: "Fri" }, { weekday: 6, label: "Sat" }, { weekday: 0, label: "Sun" },
];

function fmtHourLabel(hhmm: string) {
  const [h, m] = hhmm.slice(0, 5).split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${h12}${period}` : `${h12}:${String(m).padStart(2, "0")}${period}`;
}

function computeOpenStatus(businessHours: BusinessHour[]): { openNow: boolean; label: string } | null {
  if (businessHours.length === 0) return null;

  const now = new Date();
  const dayStr = new Intl.DateTimeFormat("en-US", { timeZone: "America/Edmonton", weekday: "short" }).format(now);
  const weekday = WEEKDAY_FROM_SHORT[dayStr];
  const timeStr = new Intl.DateTimeFormat("en-US", { timeZone: "America/Edmonton", hour: "2-digit", minute: "2-digit", hour12: false }).format(now);
  const [nowH, nowM] = timeStr.split(":").map(Number);
  const nowMinutes = nowH * 60 + nowM;

  const today = businessHours.find(h => h.weekday === weekday);
  if (!today || !today.open) return { openNow: false, label: "Closed today" };

  const [openH, openM] = today.start_time.slice(0, 5).split(":").map(Number);
  const [closeH, closeM] = today.end_time.slice(0, 5).split(":").map(Number);
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  if (nowMinutes < openMinutes) return { openNow: false, label: `Opens at ${fmtHourLabel(today.start_time)}` };
  if (nowMinutes >= closeMinutes) return { openNow: false, label: "Closed for today" };
  return { openNow: true, label: `Open until ${fmtHourLabel(today.end_time)}` };
}

// ─── Main component ────────────────────────────────────────────────────────────

export function BookingClient({ shop, services, staff, businessHours, initialCustomer }: {
  shop: Shop; services: Service[]; staff: Staff[]; businessHours: BusinessHour[]; initialCustomer: Customer | null;
}) {
  const [showFlow, setShowFlow]     = useState(false);
  const [step, setStep]             = useState<"datetime" | "account" | "confirm" | "pay" | "done">("datetime");
  const [paymentClientSecret, setPaymentClientSecret] = useState<string | null>(null);
  const [paymentError, setPaymentError]               = useState<string | null>(null);
  const [catFilter, setCatFilter]   = useState("All");
  const [activeTab, setActiveTab]   = useState<"services" | "team" | "hours">("services");
  const [service, setService]       = useState<Service | null>(null);
  const [staffId, setStaffId]       = useState<string | "any">("any");
  const [date, setDate]             = useState<string | null>(null);
  const [time, setTime]             = useState<string | null>(null);
  const [notes, setNotes]           = useState("");
  const [slots, setSlots]           = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [customer, setCustomer]     = useState<Customer | null>(initialCustomer);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [booking, setBooking]       = useState(false);

  const categories = useMemo(() => ["All", ...Array.from(new Set(services.map(s => s.category || "Other")))], [services]);

  const startBooking = (s: Service) => {
    setService(s);
    setStaffId("any");
    setDate(null);
    setTime(null);
    setNotes("");
    setBookingError(null);
    setStep("datetime");
    setShowFlow(true);
  };

  const reset = () => {
    setShowFlow(false);
    setService(null);
    setStep("datetime");
  };

  useEffect(() => {
    let cancelled = false;
    const timeout = setTimeout(() => {
      if (!service || !date) { if (!cancelled) setSlots([]); return; }
      if (!cancelled) setLoadingSlots(true);
      getAvailableSlots({ shopId: shop.id, serviceId: service.id, staffId, date }).then(res => {
        if (!cancelled) { setSlots(res); setLoadingSlots(false); }
      });
    }, 0);
    return () => { cancelled = true; clearTimeout(timeout); };
  }, [service, date, staffId, shop.id]);

  const goToAccountOrConfirm = () => {
    setStep(customer ? "confirm" : "account");
  };

  const handleConfirm = async () => {
    if (!service || !time) return;
    setBooking(true);
    setBookingError(null);
    const res = await createPublicBooking({
      shopId: shop.id,
      serviceId: service.id,
      staffId: staffId === "any" ? null : staffId,
      startsAt: time,
      notes,
    });
    if (res.error) { setBookingError(res.error); setBooking(false); return; }

    if (shop.stripeConnected && res.appointmentId) {
      const pi = await createPaymentIntent({ appointmentId: res.appointmentId, depositOnly: false });
      setBooking(false);
      if (pi.error || !pi.clientSecret) { setPaymentError(pi.error ?? "Couldn't start payment"); setStep("pay"); return; }
      setPaymentClientSecret(pi.clientSecret);
      setStep("pay");
      return;
    }

    setBooking(false);
    setStep("done");
  };

  const dayRows = nextDays(14).map(d => {
    const { label, day, dateStr } = fmtDayLabel(d);
    const hoursRow = businessHours.find(h => h.weekday === d.getUTCDay());
    const open = hoursRow?.open ?? false;
    return { label, day, dateStr, open };
  });

  const openStatus = useMemo(() => computeOpenStatus(businessHours), [businessHours]);

  const tabs = useMemo(() => {
    const t: { id: "services" | "team" | "hours"; label: string; count: number | null }[] = [
      { id: "services", label: "Services", count: services.length },
    ];
    if (staff.length > 0) t.push({ id: "team", label: "Team", count: staff.length });
    if (businessHours.length > 0) t.push({ id: "hours", label: "Hours", count: null });
    return t;
  }, [services.length, staff.length, businessHours.length]);

  return (
    <div style={{ minHeight: "100vh", background: "rgb(246,246,250)", fontFamily: "DM Sans, system-ui, sans-serif" }}>

      {/* Cover — full-bleed edge to edge */}
      <div style={{ position: "relative", height: 200, overflow: "hidden", background: "linear-gradient(135deg, rgb(30,10,80) 0%, rgb(88,28,218) 50%, rgb(109,40,217) 100%)" }}>
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.25)" }} />
        <div style={{ position: "absolute", top: 16, right: 20 }}>
          {customer ? (
            <Link href="/customer/account" style={{ display: "inline-block", fontSize: 12.5, color: "white", fontWeight: 700, textDecoration: "none", padding: "8px 16px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.35)", background: "rgba(255,255,255,0.12)", backdropFilter: "blur(4px)" }}>
              My bookings ({customer.fullName.split(" ")[0]})
            </Link>
          ) : (
            <Link href="/customer/login" style={{ display: "inline-block", fontSize: 12.5, color: "white", fontWeight: 700, textDecoration: "none", padding: "8px 16px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.35)", background: "rgba(255,255,255,0.12)", backdropFilter: "blur(4px)" }}>
              Sign in
            </Link>
          )}
        </div>
      </div>

      {/* Profile info — centered column, avatar overlapping the cover */}
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
        <div style={{
          width: 96, height: 96, borderRadius: "50%", margin: "-48px auto 0",
          background: "linear-gradient(135deg, rgb(88,28,218), rgb(139,92,246))",
          border: "4px solid rgb(246,246,250)", boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "white", fontSize: 30, fontWeight: 800,
        }}>
          {shop.name.trim().split(/\s+/).map(w => w[0]).join("").slice(0, 2).toUpperCase()}
        </div>

        <div style={{ padding: "14px 0 18px" }}>
          <h1 style={{ color: "rgb(20,20,30)", fontSize: 22, fontWeight: 800, margin: "0 0 6px", letterSpacing: "-0.02em" }}>{shop.name}</h1>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            <p style={{ color: "rgba(0,0,0,0.45)", fontSize: 13.5, margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
              <MapPin size={13} /> {shop.city}, {shop.province}
            </p>
            {openStatus && (
              <span style={{
                display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700,
                padding: "3px 10px", borderRadius: 20,
                background: openStatus.openNow ? "rgba(16,185,129,0.1)" : "rgba(0,0,0,0.05)",
                color: openStatus.openNow ? "rgb(5,150,105)" : "rgba(0,0,0,0.45)",
              }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: openStatus.openNow ? "rgb(16,185,129)" : "rgba(0,0,0,0.25)" }} />
                {openStatus.label}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: "white", borderBottom: "1px solid rgba(0,0,0,0.08)", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 16px", display: "flex", justifyContent: "center", gap: 2, overflowX: "auto" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
              padding: "14px 16px", background: "none", border: "none", cursor: "pointer", whiteSpace: "nowrap",
              fontSize: 14, fontWeight: activeTab === t.id ? 800 : 600,
              color: activeTab === t.id ? "rgb(20,20,30)" : "rgba(0,0,0,0.4)",
              borderBottom: activeTab === t.id ? `3px solid ${ACCENT}` : "3px solid transparent",
              marginBottom: -1, display: "flex", alignItems: "center", gap: 6,
            }}>
              {t.label}
              {t.count != null && <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(0,0,0,0.35)" }}>{t.count}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 24px 80px" }}>
        {activeTab === "services" && (
          <>
            <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
              {categories.map(c => (
                <button key={c} onClick={() => setCatFilter(c)} style={{
                  padding: "6px 14px", borderRadius: 20,
                  border: `1px solid ${catFilter === c ? ACCENT : "rgba(0,0,0,0.1)"}`,
                  background: catFilter === c ? ACCENT : "white",
                  color: catFilter === c ? "white" : "rgba(0,0,0,0.5)",
                  fontSize: 12.5, fontWeight: catFilter === c ? 700 : 500, cursor: "pointer",
                }}>
                  {c}
                </button>
              ))}
            </div>

            {services.length === 0 ? (
              <div style={{ padding: "44px 20px", textAlign: "center", background: "white", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(109,40,217,0.08)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                  <CalendarClock size={22} color={ACCENT} strokeWidth={1.6} />
                </div>
                <p style={{ color: "rgb(20,20,30)", fontSize: 14, fontWeight: 700, margin: "0 0 4px" }}>Booking isn&apos;t open here yet</p>
                <p style={{ color: "rgba(0,0,0,0.4)", fontSize: 13, margin: 0 }}>This shop is still setting up their services — check back soon.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {services.filter(s => catFilter === "All" || (s.category || "Other") === catFilter).map(s => (
                  <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px", borderRadius: 16, background: "white", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ color: "rgb(20,20,30)", fontSize: 15, fontWeight: 700 }}>{s.name}</span>
                      <div style={{ color: "rgba(0,0,0,0.4)", fontSize: 13, display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                        <Clock size={11} /> {fmtDuration(s.duration_minutes)}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                      <span style={{ color: "rgb(20,20,30)", fontSize: 17, fontWeight: 800 }}>C${s.price}</span>
                      <button onClick={() => startBooking(s)} style={{ padding: "9px 18px", borderRadius: 10, border: "none", background: ACCENT, color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
                        Book
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "team" && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {staff.map(s => (
              <div key={s.id} style={{ flex: "1 1 200px", display: "flex", alignItems: "center", gap: 12, background: "white", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 16, padding: "14px 16px" }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: `${s.color}22`, border: `1.5px solid ${s.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, color: s.color, flexShrink: 0 }}>
                  {s.full_name.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ color: "rgb(20,20,30)", fontSize: 14, fontWeight: 700, margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.full_name}</p>
                  {s.role && <p style={{ color: "rgba(0,0,0,0.4)", fontSize: 12.5, margin: 0 }}>{s.role}</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "hours" && (
          <div style={{ background: "white", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 16, padding: "18px 20px", maxWidth: 320 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {HOURS_DAY_LABELS.map(({ weekday, label }) => {
                const row = businessHours.find(h => h.weekday === weekday);
                return (
                  <div key={weekday} style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5 }}>
                    <span style={{ color: "rgba(0,0,0,0.45)" }}>{label}</span>
                    <span style={{ color: row?.open ? "rgb(20,20,30)" : "rgba(0,0,0,0.3)", fontWeight: row?.open ? 600 : 400 }}>
                      {row?.open ? `${fmtHourLabel(row.start_time)} – ${fmtHourLabel(row.end_time)}` : "Closed"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Booking flow modal */}
      {showFlow && service && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div style={{ background: "rgb(246,246,250)", width: "100%", maxWidth: 540, borderRadius: "22px 22px 0 0", maxHeight: "92vh", overflowY: "auto", padding: "24px 24px 40px", boxShadow: "0 -8px 40px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
              <button onClick={reset} style={{ background: "rgba(0,0,0,0.06)", border: "none", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <X size={16} color="rgba(0,0,0,0.5)" />
              </button>
            </div>

            {step === "datetime" && (
              <DateTimeStep
                service={service} staff={staff} dayRows={dayRows}
                staffId={staffId} setStaffId={setStaffId}
                date={date} setDate={setDate}
                time={time} setTime={setTime}
                slots={slots} loadingSlots={loadingSlots}
                onBack={reset}
                onNext={goToAccountOrConfirm}
              />
            )}
            {step === "account" && (
              <AccountStep
                onBack={() => setStep("datetime")}
                onAuthed={(c) => { setCustomer(c); setStep("confirm"); }}
              />
            )}
            {step === "confirm" && customer && (
              <ConfirmStep
                service={service} staffName={staffId === "any" ? "Anyone available" : staff.find(s => s.id === staffId)?.full_name ?? "Anyone available"}
                time={time!} customer={customer} notes={notes} setNotes={setNotes}
                error={bookingError} submitting={booking} stripeConnected={shop.stripeConnected}
                onBack={() => setStep(customer ? "datetime" : "account")}
                onConfirm={handleConfirm}
              />
            )}
            {step === "pay" && (
              <PayStep
                service={service}
                clientSecret={paymentClientSecret}
                error={paymentError}
                onBack={() => setStep("confirm")}
                onPaid={() => setStep("done")}
              />
            )}
            {step === "done" && (
              <DoneStep service={service} time={time!} shop={shop} onDone={reset} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Step: date & time ──────────────────────────────────────────────────────────

function DateTimeStep({ service, staff, dayRows, staffId, setStaffId, date, setDate, time, setTime, slots, loadingSlots, onBack, onNext }: {
  service: Service; staff: Staff[];
  dayRows: { label: string; day: number; dateStr: string; open: boolean }[];
  staffId: string | "any"; setStaffId: (v: string | "any") => void;
  date: string | null; setDate: (v: string) => void;
  time: string | null; setTime: (v: string | null) => void;
  slots: string[]; loadingSlots: boolean;
  onBack: () => void; onNext: () => void;
}) {
  const canContinue = Boolean(date && time);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <button onClick={onBack} style={{ background: "none", border: "none", display: "flex", alignItems: "center", gap: 6, color: ACCENT, fontSize: 13, fontWeight: 700, cursor: "pointer", padding: 0 }}>
        <ChevronLeft size={16} /> Back
      </button>

      <div>
        <h2 style={{ color: "rgb(30,30,40)", fontSize: 20, fontWeight: 800, margin: "0 0 2px" }}>Pick a time</h2>
        <p style={{ color: "rgba(0,0,0,0.4)", fontSize: 14, margin: 0 }}>{service.name} · C${service.price} · {fmtDuration(service.duration_minutes)}</p>
      </div>

      {staff.length > 0 && (
        <div>
          <p style={{ color: "rgba(0,0,0,0.45)", fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 10px" }}>Who with?</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[{ id: "any" as const, initials: "★", name: "Anyone", color: ACCENT }, ...staff.map(s => ({ id: s.id, initials: s.full_name.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase(), name: s.full_name.split(" ")[0], color: s.color }))].map(s => (
              <button key={s.id} onClick={() => { setStaffId(s.id); setTime(null); }} style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                padding: "12px 14px", borderRadius: 14, border: `1.5px solid ${staffId === s.id ? ACCENT : "rgba(0,0,0,0.1)"}`,
                background: staffId === s.id ? "rgba(109,40,217,0.06)" : "white", cursor: "pointer", flex: 1, minWidth: 70,
              }}>
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: staffId === s.id ? `${s.color}22` : "rgba(0,0,0,0.06)", border: `1.5px solid ${staffId === s.id ? s.color : "transparent"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: s.id === "any" ? 16 : 13, fontWeight: 800, color: staffId === s.id ? s.color : "rgba(0,0,0,0.4)" }}>
                  {s.initials}
                </div>
                <span style={{ color: staffId === s.id ? ACCENT : "rgb(30,30,40)", fontSize: 11.5, fontWeight: staffId === s.id ? 700 : 500 }}>{s.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <p style={{ color: "rgba(0,0,0,0.45)", fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 10px" }}>When?</p>
        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
          {dayRows.map(d => {
            const isSelected = date === d.dateStr;
            return (
              <button key={d.dateStr} disabled={!d.open} onClick={() => { setDate(d.dateStr); setTime(null); }} style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
                padding: "10px 10px 8px", borderRadius: 12, flexShrink: 0, width: 56,
                border: `1.5px solid ${isSelected ? ACCENT : "rgba(0,0,0,0.09)"}`,
                background: isSelected ? ACCENT : !d.open ? "rgba(0,0,0,0.03)" : "white",
                cursor: d.open ? "pointer" : "default", opacity: d.open ? 1 : 0.45,
              }}>
                <span style={{ color: isSelected ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.4)", fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>{d.label}</span>
                <span style={{ color: isSelected ? "white" : "rgb(20,20,30)", fontSize: 15, fontWeight: 800 }}>{d.day}</span>
              </button>
            );
          })}
        </div>
      </div>

      {date && (
        <div>
          <p style={{ color: "rgba(0,0,0,0.45)", fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 10px" }}>Available times</p>
          {loadingSlots ? (
            <p style={{ color: "rgba(0,0,0,0.35)", fontSize: 13 }}>Checking availability…</p>
          ) : slots.length === 0 ? (
            <p style={{ color: "rgba(0,0,0,0.35)", fontSize: 13 }}>No open times that day — try another date.</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
              {slots.map(t => (
                <button key={t} onClick={() => setTime(t)} style={{
                  padding: "10px 6px", borderRadius: 10,
                  border: `1.5px solid ${time === t ? ACCENT : "rgba(0,0,0,0.1)"}`,
                  background: time === t ? ACCENT : "white",
                  color: time === t ? "white" : "rgb(30,30,40)",
                  fontSize: 12.5, fontWeight: time === t ? 700 : 500, cursor: "pointer",
                }}>
                  {fmtTime(t)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <button disabled={!canContinue} onClick={onNext} style={{
        padding: "14px", borderRadius: 14, border: "none",
        background: canContinue ? ACCENT : "rgba(0,0,0,0.08)",
        color: canContinue ? "white" : "rgba(0,0,0,0.3)",
        fontSize: 15, fontWeight: 800, cursor: canContinue ? "pointer" : "default", letterSpacing: "-0.01em",
      }}>
        Continue →
      </button>
    </div>
  );
}

// ─── Step: account ──────────────────────────────────────────────────────────────

function AccountStep({ onBack, onAuthed }: { onBack: () => void; onAuthed: (c: Customer) => void }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail]       = useState("");
  const [phone, setPhone]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  const inputStyle: React.CSSProperties = { width: "100%", padding: "11px 13px", borderRadius: 10, border: "1.5px solid rgba(0,0,0,0.12)", background: "white", color: "rgb(20,20,30)", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit" };

  const submit = async () => {
    setLoading(true);
    setError(null);
    const res = mode === "login"
      ? await customerLogin({ email, password })
      : await customerSignup({ fullName, email, phone, password });
    setLoading(false);
    if (res.error) { setError(res.error); return; }
    onAuthed({ fullName: mode === "login" ? email.split("@")[0] : fullName, email });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <button onClick={onBack} style={{ background: "none", border: "none", display: "flex", alignItems: "center", gap: 6, color: ACCENT, fontSize: 13, fontWeight: 700, cursor: "pointer", padding: 0 }}>
        <ChevronLeft size={16} /> Back
      </button>
      <div>
        <h2 style={{ color: "rgb(30,30,40)", fontSize: 20, fontWeight: 800, margin: "0 0 2px" }}>{mode === "login" ? "Sign in to book" : "Create an account"}</h2>
        <p style={{ color: "rgba(0,0,0,0.4)", fontSize: 14, margin: 0 }}>Your time slot is held while you do this.</p>
      </div>

      {error && <div style={{ padding: "10px 13px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "rgb(185,28,28)", fontSize: 12.5 }}>{error}</div>}

      {mode === "signup" && (
        <div>
          <label style={{ color: "rgba(0,0,0,0.45)", fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6 }}>Full name</label>
          <input value={fullName} onChange={e => setFullName(e.target.value)} style={inputStyle} />
        </div>
      )}
      <div>
        <label style={{ color: "rgba(0,0,0,0.45)", fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6 }}>Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
      </div>
      {mode === "signup" && (
        <div>
          <label style={{ color: "rgba(0,0,0,0.45)", fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6 }}>Phone (optional)</label>
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} style={inputStyle} />
        </div>
      )}
      <div>
        <label style={{ color: "rgba(0,0,0,0.45)", fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6 }}>Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} />
      </div>

      <button onClick={submit} disabled={loading} style={{ padding: "14px", borderRadius: 14, border: "none", background: ACCENT, color: "white", fontSize: 15, fontWeight: 800, cursor: loading ? "default" : "pointer", opacity: loading ? 0.6 : 1 }}>
        {loading ? "Please wait…" : mode === "login" ? "Sign in & continue" : "Create account & continue"}
      </button>

      <button onClick={() => { setMode(m => m === "login" ? "signup" : "login"); setError(null); }} style={{ background: "none", border: "none", color: "rgba(0,0,0,0.5)", fontSize: 13, cursor: "pointer", textAlign: "center" }}>
        {mode === "login" ? "New here? Create an account" : "Already have an account? Sign in"}
      </button>
    </div>
  );
}

// ─── Step: confirm ──────────────────────────────────────────────────────────────

function ConfirmStep({ service, staffName, time, customer, notes, setNotes, error, submitting, stripeConnected, onBack, onConfirm }: {
  service: Service; staffName: string; time: string; customer: Customer;
  notes: string; setNotes: (v: string) => void;
  error: string | null; submitting: boolean; stripeConnected: boolean;
  onBack: () => void; onConfirm: () => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <button onClick={onBack} style={{ background: "none", border: "none", display: "flex", alignItems: "center", gap: 6, color: ACCENT, fontSize: 13, fontWeight: 700, cursor: "pointer", padding: 0 }}>
        <ChevronLeft size={16} /> Back
      </button>
      <div>
        <h2 style={{ color: "rgb(30,30,40)", fontSize: 20, fontWeight: 800, margin: "0 0 2px" }}>Confirm booking</h2>
        <p style={{ color: "rgba(0,0,0,0.4)", fontSize: 14, margin: 0 }}>Booking as {customer.fullName} ({customer.email})</p>
      </div>

      <div style={{ background: "rgb(248,247,252)", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 14, padding: "16px 18px" }}>
        {[
          { label: "Service", value: service.name },
          { label: "With", value: staffName },
          { label: "When", value: fmtTime(time) },
          { label: "Total", value: `C$${service.price}`, bold: true },
        ].map((r, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ color: "rgba(0,0,0,0.5)", fontSize: 13 }}>{r.label}</span>
            <span style={{ color: "rgb(20,20,30)", fontSize: 13, fontWeight: r.bold ? 800 : 500 }}>{r.value}</span>
          </div>
        ))}
      </div>

      <div>
        <label style={{ color: "rgba(0,0,0,0.45)", fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6 }}>Notes for the shop (optional)</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} style={{ width: "100%", padding: "11px 13px", borderRadius: 10, border: "1.5px solid rgba(0,0,0,0.12)", background: "white", color: "rgb(20,20,30)", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit", resize: "vertical" }} />
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "10px", background: "rgba(0,0,0,0.03)", borderRadius: 10 }}>
        <span style={{ color: "rgba(0,0,0,0.4)", fontSize: 12 }}>
          {stripeConnected ? "You'll pay on the next step." : "No payment required — the shop will confirm your booking."}
        </span>
      </div>

      {error && <div style={{ padding: "10px 13px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "rgb(185,28,28)", fontSize: 12.5 }}>{error}</div>}

      <button onClick={onConfirm} disabled={submitting} style={{
        padding: "15px", borderRadius: 14, border: "none", background: ACCENT, color: "white",
        fontSize: 15, fontWeight: 800, cursor: submitting ? "default" : "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: submitting ? 0.6 : 1,
      }}>
        {submitting ? "Booking…" : stripeConnected ? "Continue to payment" : "Request booking"}
      </button>
    </div>
  );
}

// ─── Step: pay ───────────────────────────────────────────────────────────────────

function PayStep({ service, clientSecret, error, onBack, onPaid }: {
  service: Service; clientSecret: string | null; error: string | null;
  onBack: () => void; onPaid: () => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <button onClick={onBack} style={{ background: "none", border: "none", display: "flex", alignItems: "center", gap: 6, color: ACCENT, fontSize: 13, fontWeight: 700, cursor: "pointer", padding: 0 }}>
        <ChevronLeft size={16} /> Back
      </button>
      <div>
        <h2 style={{ color: "rgb(30,30,40)", fontSize: 20, fontWeight: 800, margin: "0 0 2px" }}>Pay for your booking</h2>
        <p style={{ color: "rgba(0,0,0,0.4)", fontSize: 14, margin: 0 }}>{service.name} · C${service.price}</p>
      </div>

      {error && (
        <div style={{ padding: "10px 13px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "rgb(185,28,28)", fontSize: 12.5 }}>
          {error} — your booking was still created and is waiting for the shop to confirm; you can pay later or contact them directly.
        </div>
      )}

      {!error && !clientSecret && (
        <p style={{ color: "rgba(0,0,0,0.35)", fontSize: 13 }}>Setting up payment…</p>
      )}

      {!error && clientSecret && stripePromise && (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <PayForm onPaid={onPaid} />
        </Elements>
      )}

      {!error && clientSecret && !stripePromise && (
        <div style={{ padding: "10px 13px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "rgb(185,28,28)", fontSize: 12.5 }}>
          Payments aren&apos;t configured on this deployment (missing publishable key). Your booking was still created.
        </div>
      )}
    </div>
  );
}

function PayForm({ onPaid }: { onPaid: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError(null);
    const { error: confirmError } = await stripe.confirmPayment({ elements, redirect: "if_required" });
    setSubmitting(false);
    if (confirmError) { setError(confirmError.message ?? "Payment failed"); return; }
    onPaid();
  };

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <PaymentElement />
      {error && <p style={{ color: "rgb(185,28,28)", fontSize: 12.5, margin: 0 }}>{error}</p>}
      <button type="submit" disabled={!stripe || submitting} style={{
        padding: "15px", borderRadius: 14, border: "none", background: ACCENT, color: "white",
        fontSize: 15, fontWeight: 800, cursor: submitting ? "default" : "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: submitting ? 0.6 : 1,
      }}>
        <Lock size={15} /> {submitting ? "Processing…" : "Pay now"}
      </button>
    </form>
  );
}

// ─── Step: done ──────────────────────────────────────────────────────────────────

function DoneStep({ service, time, shop, onDone }: { service: Service; time: string; shop: Shop; onDone: () => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, textAlign: "center", padding: "20px 0" }}>
      <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(52,211,153,0.12)", border: "2px solid rgba(52,211,153,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CheckCircle2 size={40} color="rgb(52,211,153)" strokeWidth={1.5} />
      </div>
      <div>
        <h2 style={{ color: "rgb(20,20,30)", fontSize: 24, fontWeight: 800, margin: "0 0 6px", letterSpacing: "-0.02em" }}>Booking requested!</h2>
        <p style={{ color: "rgba(0,0,0,0.45)", fontSize: 14, margin: 0 }}>A confirmation has been sent to your email. {shop.name} will confirm shortly.</p>
      </div>

      <div style={{ width: "100%", background: "white", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 18, overflow: "hidden", boxShadow: "0 2px 16px rgba(0,0,0,0.08)" }}>
        <div style={{ background: ACCENT, padding: "20px 22px", textAlign: "left" }}>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 4px" }}>Booking requested</p>
          <p style={{ color: "white", fontSize: 20, fontWeight: 800, margin: 0 }}>{service.name}</p>
        </div>
        <div style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: 8, textAlign: "left" }}>
          <p style={{ color: "rgb(20,20,30)", fontSize: 13, fontWeight: 600, margin: 0 }}>{fmtTime(time)}</p>
          <p style={{ color: "rgba(0,0,0,0.4)", fontSize: 12.5, margin: 0 }}>{fmtDuration(service.duration_minutes)} · C${service.price}</p>
        </div>
      </div>

      <Link href="/customer/account" style={{ width: "100%", boxSizing: "border-box", padding: "13px", borderRadius: 12, border: "1.5px solid rgba(0,0,0,0.1)", background: "white", color: "rgb(20,20,30)", fontSize: 13.5, fontWeight: 700, textDecoration: "none", textAlign: "center", display: "block" }}>
        View my bookings
      </Link>

      <button onClick={onDone} style={{ background: "none", border: "none", color: ACCENT, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
        Book another service
      </button>
    </div>
  );
}
