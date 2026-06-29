"use client";

import { useState } from "react";
import {
  Star, MapPin, Clock, CheckCircle2, ChevronRight,
  ChevronLeft, X, CreditCard, Shield, Phone, Mail,
  Calendar, Plus, Check,
} from "lucide-react";

// ─── Static shop data ─────────────────────────────────────────────────────────

const SHOP = {
  name: "George's Salon & Studio",
  handle: "george",
  tagline: "Premium cuts, colour & styling in Edmonton",
  rating: 4.9,
  reviews: 312,
  bookings: "2,400+",
  address: "124 Whyte Ave, Edmonton, AB",
  phone: "+1 (780) 555-0192",
  email: "hello@georgesalon.ca",
  verified: true,
};

const SERVICES = [
  { id: "s1",  name: "Signature Cut",       price: 65,  duration: "45 min", category: "Cuts",       popular: true,  badge: "Most booked" },
  { id: "s2",  name: "Cut + Beard",         price: 80,  duration: "1h",     category: "Cuts",       popular: false, badge: ""            },
  { id: "s3",  name: "Full Highlights",     price: 140, duration: "2.5h",   category: "Colour",     popular: true,  badge: "Fan favourite" },
  { id: "s4",  name: "Balayage",            price: 280, duration: "4h",     category: "Colour",     popular: false, badge: "Premium"     },
  { id: "s5",  name: "Knotless Braids",     price: 180, duration: "3h",     category: "Braids",     popular: true,  badge: "Top rated"   },
  { id: "s6",  name: "Silk Press",          price: 85,  duration: "1.5h",   category: "Treatments", popular: false, badge: ""            },
  { id: "s7",  name: "Loc Retwist",         price: 110, duration: "2h",     category: "Braids",     popular: false, badge: ""            },
  { id: "s8",  name: "Trim + Blowout",      price: 65,  duration: "1h",     category: "Cuts",       popular: false, badge: ""            },
  { id: "s9",  name: "Deep Condition + Set",price: 90,  duration: "1.5h",   category: "Treatments", popular: false, badge: ""            },
  { id: "s10", name: "Colour + Gloss",      price: 160, duration: "2.5h",   category: "Colour",     popular: false, badge: ""            },
];

const STAFF = [
  { id: "e1", initials: "EW", name: "Emma",  role: "Senior Stylist", color: "rgb(167,139,250)" },
  { id: "e2", initials: "GR", name: "Grace", role: "Braids Specialist", color: "rgb(52,211,153)" },
  { id: "e3", initials: "JM", name: "James", role: "Barber",  color: "rgb(96,165,250)"  },
];

// June 2026 — days starting Mon Jun 23
const DAYS = [
  { label: "Mon", date: "Jun 23", state: "limited"  },
  { label: "Tue", date: "Jun 24", state: "full"     },
  { label: "Wed", date: "Jun 25", state: "open"     },
  { label: "Thu", date: "Jun 26", state: "open"     },
  { label: "Fri", date: "Jun 27", state: "limited"  },
  { label: "Sat", date: "Jun 28", state: "open"     },
  { label: "Sun", date: "Jun 29", state: "closed"   },
];

const TIME_SLOTS = ["9:00 AM","9:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM","1:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM"];

const SERVICE_CATS = ["All", "Cuts", "Colour", "Braids", "Treatments"];

// ─── Card input formatter ──────────────────────────────────────────────────────

function formatCard(val: string) {
  const digits = val.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

function detectNetwork(val: string): string {
  const d = val.replace(/\D/g, "");
  if (d.startsWith("4")) return "VISA";
  if (/^5[1-5]/.test(d) || /^2[2-7]/.test(d)) return "MC";
  if (/^3[47]/.test(d)) return "AMEX";
  return "";
}

// ─── Step 1: Choose service ───────────────────────────────────────────────────

function StepService({ onSelect }: { onSelect: (s: typeof SERVICES[0]) => void }) {
  const [cat, setCat] = useState("All");

  const filtered = SERVICES.filter(s => cat === "All" || s.category === cat);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <h2 style={{ color: "rgb(30,30,40)", fontSize: 20, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.02em" }}>Choose a service</h2>
        <p style={{ color: "rgba(0,0,0,0.4)", fontSize: 14, margin: 0 }}>{SERVICES.length} services available</p>
      </div>

      {/* Category chips */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {SERVICE_CATS.map(c => (
          <button key={c} onClick={() => setCat(c)} style={{
            padding: "6px 14px", borderRadius: 20,
            border: `1px solid ${cat === c ? "rgb(109,40,217)" : "rgba(0,0,0,0.1)"}`,
            background: cat === c ? "rgb(109,40,217)" : "white",
            color: cat === c ? "white" : "rgba(0,0,0,0.5)",
            fontSize: 12.5, fontWeight: cat === c ? 700 : 500, cursor: "pointer",
          }}>
            {c}
          </button>
        ))}
      </div>

      {/* Service cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.map(s => (
          <button key={s.id} onClick={() => onSelect(s)} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "16px 18px", borderRadius: 14,
            background: "white", border: "1px solid rgba(0,0,0,0.08)",
            cursor: "pointer", textAlign: "left",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            transition: "box-shadow 0.15s, border-color 0.15s",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgb(109,40,217)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(109,40,217,0.12)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(0,0,0,0.08)"; e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)"; }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ color: "rgb(20,20,30)", fontSize: 15, fontWeight: 700 }}>{s.name}</span>
                {s.badge && (
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                    background: s.popular ? "rgba(109,40,217,0.1)" : "rgba(0,0,0,0.06)",
                    color: s.popular ? "rgb(109,40,217)" : "rgba(0,0,0,0.4)",
                  }}>
                    {s.badge}
                  </span>
                )}
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <span style={{ color: "rgba(0,0,0,0.4)", fontSize: 13, display: "flex", alignItems: "center", gap: 4 }}>
                  <Clock size={11} /> {s.duration}
                </span>
                <span style={{ color: "rgba(0,0,0,0.3)", fontSize: 13 }}>{s.category}</span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ color: "rgb(20,20,30)", fontSize: 17, fontWeight: 800 }}>C${s.price}</span>
              <ChevronRight size={16} color="rgba(0,0,0,0.25)" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Step 2: Choose staff, day, time ─────────────────────────────────────────

function StepDateTime({
  service, onBack, onNext,
}: {
  service: typeof SERVICES[0];
  onBack: () => void;
  onNext: (staff: string, day: string, time: string) => void;
}) {
  const [staff, setStaff] = useState("");
  const [day, setDay]     = useState("");
  const [time, setTime]   = useState("");

  const canContinue = !!staff && !!day && !!time;

  const dayStateColor = (state: string) => {
    if (state === "open")    return { dot: "rgb(52,211,153)",  label: "Open"    };
    if (state === "limited") return { dot: "rgb(251,191,36)",  label: "Limited" };
    if (state === "full")    return { dot: "rgb(248,113,113)", label: "Full"    };
    return { dot: "rgba(0,0,0,0.2)", label: "Closed" };
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <button onClick={onBack} style={{ background: "none", border: "none", display: "flex", alignItems: "center", gap: 6, color: "rgb(109,40,217)", fontSize: 13, fontWeight: 700, cursor: "pointer", padding: 0 }}>
        <ChevronLeft size={16} /> Back
      </button>

      <div>
        <h2 style={{ color: "rgb(30,30,40)", fontSize: 20, fontWeight: 800, margin: "0 0 2px" }}>Pick a time</h2>
        <p style={{ color: "rgba(0,0,0,0.4)", fontSize: 14, margin: 0 }}>{service.name} · C${service.price} · {service.duration}</p>
      </div>

      {/* Staff pills */}
      <div>
        <p style={{ color: "rgba(0,0,0,0.45)", fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 10px" }}>Who with?</p>
        <div style={{ display: "flex", gap: 10 }}>
          {[{ id: "any", initials: "★", name: "Anyone", role: "First available", color: "rgb(109,40,217)" }, ...STAFF].map(s => (
            <button key={s.id} onClick={() => setStaff(s.id)} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
              padding: "12px 14px", borderRadius: 14, border: `1.5px solid ${staff === s.id ? "rgb(109,40,217)" : "rgba(0,0,0,0.1)"}`,
              background: staff === s.id ? "rgba(109,40,217,0.06)" : "white",
              cursor: "pointer", flex: 1, minWidth: 0,
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: "50%",
                background: staff === s.id ? `${s.color}22` : "rgba(0,0,0,0.06)",
                border: `1.5px solid ${staff === s.id ? s.color : "transparent"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: s.id === "any" ? 16 : 13, fontWeight: 800, color: staff === s.id ? s.color : "rgba(0,0,0,0.4)",
              }}>
                {s.initials}
              </div>
              <span style={{ color: staff === s.id ? "rgb(109,40,217)" : "rgb(30,30,40)", fontSize: 11.5, fontWeight: staff === s.id ? 700 : 500 }}>{s.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Day strip */}
      <div>
        <p style={{ color: "rgba(0,0,0,0.45)", fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 10px" }}>When?</p>
        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
          {DAYS.map(d => {
            const dc = dayStateColor(d.state);
            const isSelected = day === d.date;
            const disabled = d.state === "closed" || d.state === "full";
            return (
              <button key={d.date} disabled={disabled} onClick={() => setDay(d.date)} style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
                padding: "10px 10px 8px", borderRadius: 12, flexShrink: 0, width: 62,
                border: `1.5px solid ${isSelected ? "rgb(109,40,217)" : "rgba(0,0,0,0.09)"}`,
                background: isSelected ? "rgb(109,40,217)" : disabled ? "rgba(0,0,0,0.03)" : "white",
                cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.5 : 1,
              }}>
                <span style={{ color: isSelected ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.4)", fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>{d.label}</span>
                <span style={{ color: isSelected ? "white" : "rgb(20,20,30)", fontSize: 15, fontWeight: 800 }}>{d.date.split(" ")[1]}</span>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: isSelected ? "rgba(255,255,255,0.6)" : dc.dot }} />
              </button>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          {[["rgb(52,211,153)","Open"], ["rgb(251,191,36)","Limited"], ["rgb(248,113,113)","Full"]].map(([c, l]) => (
            <div key={l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: c, flexShrink: 0 }} />
              <span style={{ color: "rgba(0,0,0,0.4)", fontSize: 11 }}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Time grid */}
      {day && (
        <div>
          <p style={{ color: "rgba(0,0,0,0.45)", fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 10px" }}>Available times</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
            {TIME_SLOTS.map(t => (
              <button key={t} onClick={() => setTime(t)} style={{
                padding: "10px 6px", borderRadius: 10,
                border: `1.5px solid ${time === t ? "rgb(109,40,217)" : "rgba(0,0,0,0.1)"}`,
                background: time === t ? "rgb(109,40,217)" : "white",
                color: time === t ? "white" : "rgb(30,30,40)",
                fontSize: 12.5, fontWeight: time === t ? 700 : 500, cursor: "pointer",
              }}>
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        disabled={!canContinue}
        onClick={() => onNext(staff, day, time)}
        style={{
          padding: "14px", borderRadius: 14, border: "none",
          background: canContinue ? "rgb(109,40,217)" : "rgba(0,0,0,0.08)",
          color: canContinue ? "white" : "rgba(0,0,0,0.3)",
          fontSize: 15, fontWeight: 800, cursor: canContinue ? "pointer" : "default",
          letterSpacing: "-0.01em",
        }}
      >
        Continue to payment →
      </button>
    </div>
  );
}

// ─── Step 3: Confirm & Pay ─────────────────────────────────────────────────────

function StepPay({
  service, day, time, onBack, onConfirm,
}: {
  service: typeof SERVICES[0]; day: string; time: string;
  onBack: () => void; onConfirm: () => void;
}) {
  const [firstName, setFirstName]   = useState("");
  const [lastName, setLastName]     = useState("");
  const [phone, setPhone]           = useState("");
  const [email, setEmail]           = useState("");
  const [cardNum, setCardNum]       = useState("");
  const [expiry, setExpiry]         = useState("");
  const [cvc, setCvc]               = useState("");
  const [gratuity, setGratuity]     = useState(0);
  const [deposit, setDeposit]       = useState(false);
  const [saveCard, setSaveCard]     = useState(false);
  const [smsCon, setSmsCon]         = useState(true);

  const network = detectNetwork(cardNum);
  const total   = service.price + gratuity;
  const charge  = deposit ? Math.ceil(service.price * 0.2) : total;

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "11px 13px", borderRadius: 10,
    border: "1.5px solid rgba(0,0,0,0.12)", background: "white",
    color: "rgb(20,20,30)", fontSize: 14, outline: "none",
    boxSizing: "border-box", fontFamily: "inherit",
  };

  const label = (text: string) => (
    <label style={{ color: "rgba(0,0,0,0.45)", fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6 }}>{text}</label>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <button onClick={onBack} style={{ background: "none", border: "none", display: "flex", alignItems: "center", gap: 6, color: "rgb(109,40,217)", fontSize: 13, fontWeight: 700, cursor: "pointer", padding: 0 }}>
        <ChevronLeft size={16} /> Back
      </button>

      <div>
        <h2 style={{ color: "rgb(30,30,40)", fontSize: 20, fontWeight: 800, margin: "0 0 2px" }}>Confirm & pay</h2>
        <p style={{ color: "rgba(0,0,0,0.4)", fontSize: 14, margin: 0 }}>{service.name} · {day} · {time}</p>
      </div>

      {/* Contact */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>{label("First name")}<input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Amara" style={inputStyle} /></div>
          <div>{label("Last name")}<input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Obi" style={inputStyle} /></div>
        </div>
        <div>{label("Phone")}<input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 (780) 555-0100" style={inputStyle} /></div>
        <div>{label("Email")}<input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" type="email" style={inputStyle} /></div>
      </div>

      {/* Gratuity */}
      <div>
        <p style={{ color: "rgba(0,0,0,0.45)", fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 10px" }}>Add a gratuity?</p>
        <div style={{ display: "flex", gap: 8 }}>
          {[0, 10, 15, 20, 25].map(pct => (
            <button key={pct} onClick={() => setGratuity(Math.round(service.price * pct / 100))} style={{
              flex: 1, padding: "9px 4px", borderRadius: 10,
              border: `1.5px solid ${gratuity === Math.round(service.price * pct / 100) ? "rgb(109,40,217)" : "rgba(0,0,0,0.1)"}`,
              background: gratuity === Math.round(service.price * pct / 100) ? "rgba(109,40,217,0.08)" : "white",
              color: gratuity === Math.round(service.price * pct / 100) ? "rgb(109,40,217)" : "rgba(0,0,0,0.5)",
              fontSize: 12, fontWeight: 700, cursor: "pointer",
            }}>
              {pct === 0 ? "None" : `${pct}%`}
            </button>
          ))}
        </div>
      </div>

      {/* Deposit toggle */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "13px 15px", background: "rgba(109,40,217,0.05)",
        border: "1px solid rgba(109,40,217,0.15)", borderRadius: 12,
      }}>
        <div>
          <p style={{ color: "rgb(20,20,30)", fontSize: 13.5, fontWeight: 700, margin: "0 0 2px" }}>Pay deposit only (20%)</p>
          <p style={{ color: "rgba(0,0,0,0.4)", fontSize: 12, margin: 0 }}>Pay C${Math.ceil(service.price * 0.2)} now · C${service.price - Math.ceil(service.price * 0.2)} at appointment</p>
        </div>
        <button onClick={() => setDeposit(!deposit)} style={{
          width: 42, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
          background: deposit ? "rgb(109,40,217)" : "rgba(0,0,0,0.12)", position: "relative", transition: "background 0.2s",
        }}>
          <span style={{ position: "absolute", top: 4, left: deposit ? 22 : 4, width: 16, height: 16, borderRadius: "50%", background: "white", transition: "left 0.2s" }} />
        </button>
      </div>

      {/* Card entry */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div>
          {label("Card number")}
          <div style={{ position: "relative" }}>
            <input
              value={cardNum}
              onChange={e => setCardNum(formatCard(e.target.value))}
              placeholder="1234 5678 9012 3456"
              style={{ ...inputStyle, paddingRight: network ? 56 : 13 }}
            />
            {network && (
              <span style={{
                position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                fontSize: 10, fontWeight: 800, color: "rgb(109,40,217)",
                background: "rgba(109,40,217,0.08)", padding: "3px 7px", borderRadius: 6,
              }}>
                {network}
              </span>
            )}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            {label("Expiry")}
            <input value={expiry} onChange={e => {
              const v = e.target.value.replace(/\D/g, "").slice(0,4);
              setExpiry(v.length > 2 ? `${v.slice(0,2)}/${v.slice(2)}` : v);
            }} placeholder="MM/YY" style={inputStyle} />
          </div>
          <div>
            {label(network === "AMEX" ? "CVC (4 digits)" : "CVC")}
            <input value={cvc} onChange={e => setCvc(e.target.value.replace(/\D/g,"").slice(0, network === "AMEX" ? 4 : 3))} placeholder={network === "AMEX" ? "4 digits" : "3 digits"} style={inputStyle} />
          </div>
        </div>

        {/* Save card + SMS */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { label: "Save card for next time", value: saveCard, set: setSaveCard },
            { label: "Send SMS confirmation", value: smsCon, set: setSmsCon },
          ].map(t => (
            <label key={t.label} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
              <input type="checkbox" checked={t.value} onChange={e => t.set(e.target.checked)} style={{ display: "none" }} />
              <div style={{
                width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                border: `2px solid ${t.value ? "rgb(109,40,217)" : "rgba(0,0,0,0.2)"}`,
                background: t.value ? "rgb(109,40,217)" : "white",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {t.value && <Check size={10} color="white" strokeWidth={3} />}
              </div>
              <span style={{ color: "rgba(0,0,0,0.6)", fontSize: 13 }}>{t.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Stripe badge */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "10px", background: "rgba(0,0,0,0.03)", borderRadius: 10 }}>
        <Shield size={13} color="rgba(0,0,0,0.3)" />
        <span style={{ color: "rgba(0,0,0,0.35)", fontSize: 12 }}>Payments secured by <strong>Stripe</strong> · PCI compliant</span>
      </div>

      {/* Order summary */}
      <div style={{ background: "rgb(248,247,252)", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 14, padding: "16px 18px" }}>
        {[
          { label: service.name, value: `C$${service.price}` },
          ...(gratuity > 0 ? [{ label: "Gratuity", value: `C$${gratuity}` }] : []),
          { label: deposit ? `Deposit (20%)` : "Total", value: `C$${charge}`, bold: true },
          ...(deposit ? [{ label: "Balance at appointment", value: `C$${total - charge}`, muted: true }] : []),
        ].map((r, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ color: (r as {muted?: boolean}).muted ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.5)", fontSize: 13 }}>{r.label}</span>
            <span style={{ color: (r as {bold?: boolean}).bold ? "rgb(20,20,30)" : "rgba(0,0,0,0.6)", fontSize: 13, fontWeight: (r as {bold?: boolean}).bold ? 800 : 500 }}>{r.value}</span>
          </div>
        ))}
      </div>

      <button onClick={onConfirm} style={{
        padding: "15px", borderRadius: 14, border: "none",
        background: "rgb(109,40,217)", color: "white",
        fontSize: 15, fontWeight: 800, cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        letterSpacing: "-0.01em",
        boxShadow: "0 4px 20px rgba(109,40,217,0.35)",
      }}>
        <CreditCard size={17} strokeWidth={2} />
        {deposit ? `Pay deposit · C$${charge}` : `Complete booking · C$${charge}`}
      </button>
    </div>
  );
}

// ─── Step 4: Confirmation ─────────────────────────────────────────────────────

function StepConfirmation({ service, day, time, onDone }: {
  service: typeof SERVICES[0]; day: string; time: string; onDone: () => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, textAlign: "center", padding: "20px 0" }}>

      {/* Success animation */}
      <div style={{
        width: 80, height: 80, borderRadius: "50%",
        background: "rgba(52,211,153,0.12)",
        border: "2px solid rgba(52,211,153,0.3)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <CheckCircle2 size={40} color="rgb(52,211,153)" strokeWidth={1.5} />
      </div>

      <div>
        <h2 style={{ color: "rgb(20,20,30)", fontSize: 24, fontWeight: 800, margin: "0 0 6px", letterSpacing: "-0.02em" }}>You&apos;re booked!</h2>
        <p style={{ color: "rgba(0,0,0,0.45)", fontSize: 14, margin: 0 }}>A confirmation has been sent to your phone and email.</p>
      </div>

      {/* Booking summary */}
      <div style={{ width: "100%", background: "white", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 18, overflow: "hidden", boxShadow: "0 2px 16px rgba(0,0,0,0.08)" }}>
        <div style={{ background: "rgb(109,40,217)", padding: "20px 22px", textAlign: "left" }}>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 4px" }}>Booking confirmed</p>
          <p style={{ color: "white", fontSize: 20, fontWeight: 800, margin: 0 }}>{service.name}</p>
        </div>
        <div style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { Icon: Calendar,  label: "Date & time",  value: `${day} at ${time}`      },
            { Icon: Clock,     label: "Duration",     value: service.duration          },
            { Icon: MapPin,    label: "Location",     value: SHOP.address              },
            { Icon: Phone,     label: "Shop phone",   value: SHOP.phone                },
          ].map(({ Icon, label, value }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(109,40,217,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon size={14} color="rgb(109,40,217)" strokeWidth={1.8} />
              </div>
              <div style={{ textAlign: "left" }}>
                <p style={{ color: "rgba(0,0,0,0.4)", fontSize: 11, margin: 0 }}>{label}</p>
                <p style={{ color: "rgb(20,20,30)", fontSize: 13, fontWeight: 600, margin: 0 }}>{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Deposit breakdown */}
      <div style={{ width: "100%", background: "rgb(248,252,249)", border: "1px solid rgba(52,211,153,0.2)", borderRadius: 14, padding: "14px 18px", textAlign: "left" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ color: "rgba(0,0,0,0.5)", fontSize: 13 }}>Charged today</span>
          <span style={{ color: "rgb(20,20,30)", fontSize: 13, fontWeight: 800 }}>C${Math.ceil(service.price * 0.2)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "rgba(0,0,0,0.4)", fontSize: 12 }}>Balance due at appointment</span>
          <span style={{ color: "rgba(0,0,0,0.4)", fontSize: 12 }}>C${service.price - Math.ceil(service.price * 0.2)}</span>
        </div>
      </div>

      {/* Add to calendar */}
      <button style={{
        width: "100%", padding: "13px", borderRadius: 12, border: "1.5px solid rgba(0,0,0,0.1)",
        background: "white", color: "rgb(20,20,30)", fontSize: 13.5, fontWeight: 700, cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      }}>
        <Calendar size={16} /> Add to calendar
      </button>

      <button onClick={onDone} style={{
        background: "none", border: "none", color: "rgb(109,40,217)", fontSize: 13, fontWeight: 700, cursor: "pointer",
      }}>
        Book another service
      </button>
    </div>
  );
}

// ─── Main booking page ─────────────────────────────────────────────────────────

export default function BookingPage() {
  const [step, setStep] = useState<"browse" | "datetime" | "pay" | "done">("browse");
  const [selectedService, setService]   = useState<typeof SERVICES[0] | null>(null);
  const [selectedStaff, setStaff]       = useState("");
  const [selectedDay, setDay]           = useState("");
  const [selectedTime, setTime]         = useState("");
  const [catFilter, setCatFilter]       = useState("All");
  const [showFlow, setShowFlow]         = useState(false);

  const startBooking = (s: typeof SERVICES[0]) => {
    setService(s);
    setStep("datetime");
    setShowFlow(true);
  };

  const reset = () => {
    setStep("browse");
    setShowFlow(false);
    setService(null);
    setStaff(""); setDay(""); setTime("");
  };

  return (
    <div style={{ minHeight: "100vh", background: "rgb(246,246,250)", fontFamily: "DM Sans, system-ui, sans-serif" }}>

      {/* ── Hero ── */}
      <div style={{
        position: "relative", height: 260, overflow: "hidden",
        background: "linear-gradient(135deg, rgb(30,10,80) 0%, rgb(88,28,218) 50%, rgb(109,40,217) 100%)",
      }}>
        {/* Overlay */}
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.25)" }} />

        {/* Content */}
        <div style={{ position: "relative", maxWidth: 680, margin: "0 auto", padding: "40px 24px 0", display: "flex", flexDirection: "column", justifyContent: "flex-end", height: "100%" }}>
          <div style={{ paddingBottom: 28 }}>
            {/* Verified badge */}
            {SHOP.verified && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(52,211,153,0.2)", border: "1px solid rgba(52,211,153,0.3)", borderRadius: 20, padding: "3px 10px", marginBottom: 10 }}>
                <CheckCircle2 size={11} color="rgb(52,211,153)" />
                <span style={{ color: "rgb(52,211,153)", fontSize: 11, fontWeight: 700 }}>Verified</span>
              </div>
            )}

            <h1 style={{ color: "white", fontSize: 28, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.02em" }}>{SHOP.name}</h1>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 14, margin: "0 0 14px" }}>{SHOP.tagline}</p>

            {/* Stats strip */}
            <div style={{ display: "flex", gap: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Star size={13} color="rgb(251,191,36)" fill="rgb(251,191,36)" />
                <span style={{ color: "white", fontSize: 13, fontWeight: 700 }}>{SHOP.rating}</span>
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>({SHOP.reviews} reviews)</span>
              </div>
              <span style={{ color: "rgba(255,255,255,0.4)" }}>·</span>
              <span style={{ color: "rgba(255,255,255,0.65)", fontSize: 13 }}>{SHOP.bookings} bookings</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Contact row ── */}
      <div style={{ background: "white", borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "12px 24px", display: "flex", gap: 20, flexWrap: "wrap" }}>
          {[
            { Icon: MapPin, text: SHOP.address },
            { Icon: Phone,  text: SHOP.phone   },
            { Icon: Mail,   text: SHOP.email   },
          ].map(({ Icon, text }) => (
            <div key={text} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Icon size={13} color="rgba(0,0,0,0.35)" />
              <span style={{ color: "rgba(0,0,0,0.5)", fontSize: 12.5 }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Trust pills ── */}
      <div style={{ background: "white", borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "10px 24px", display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["Free cancellation 24h","Instant confirmation","Secure payment","No commission"].map(p => (
            <span key={p} style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "4px 12px", borderRadius: 20,
              background: "rgba(109,40,217,0.07)", border: "1px solid rgba(109,40,217,0.15)",
              color: "rgb(109,40,217)", fontSize: 11.5, fontWeight: 600,
            }}>
              <Check size={10} strokeWidth={3} /> {p}
            </span>
          ))}
        </div>
      </div>

      {/* ── Services section ── */}
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "28px 24px 80px" }}>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={{ color: "rgb(20,20,30)", fontSize: 18, fontWeight: 800, margin: 0 }}>Services</h2>
          <span style={{ color: "rgba(0,0,0,0.35)", fontSize: 13 }}>{SERVICES.length} available</span>
        </div>

        {/* Cat filter */}
        <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
          {SERVICE_CATS.map(c => (
            <button key={c} onClick={() => setCatFilter(c)} style={{
              padding: "6px 14px", borderRadius: 20,
              border: `1px solid ${catFilter === c ? "rgb(109,40,217)" : "rgba(0,0,0,0.1)"}`,
              background: catFilter === c ? "rgb(109,40,217)" : "white",
              color: catFilter === c ? "white" : "rgba(0,0,0,0.5)",
              fontSize: 12.5, fontWeight: catFilter === c ? 700 : 500, cursor: "pointer",
            }}>
              {c}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {SERVICES.filter(s => catFilter === "All" || s.category === catFilter).map(s => (
            <div key={s.id} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "16px 18px", borderRadius: 16,
              background: "white", border: "1px solid rgba(0,0,0,0.08)",
              boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ color: "rgb(20,20,30)", fontSize: 15, fontWeight: 700 }}>{s.name}</span>
                  {s.badge && (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "rgba(109,40,217,0.09)", color: "rgb(109,40,217)" }}>
                      {s.badge}
                    </span>
                  )}
                </div>
                <span style={{ color: "rgba(0,0,0,0.4)", fontSize: 13, display: "flex", alignItems: "center", gap: 4 }}>
                  <Clock size={11} /> {s.duration}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ color: "rgb(20,20,30)", fontSize: 17, fontWeight: 800 }}>C${s.price}</span>
                <button onClick={() => startBooking(s)} style={{
                  padding: "9px 18px", borderRadius: 10, border: "none",
                  background: "rgb(109,40,217)", color: "white",
                  fontSize: 13, fontWeight: 700, cursor: "pointer",
                  whiteSpace: "nowrap",
                }}>
                  Book
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Booking flow modal ── */}
      {showFlow && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 200,
          background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "flex-end", justifyContent: "center",
        }}>
          <div style={{
            background: "rgb(246,246,250)", width: "100%", maxWidth: 540,
            borderRadius: "22px 22px 0 0", maxHeight: "92vh", overflowY: "auto",
            padding: "24px 24px 40px",
            boxShadow: "0 -8px 40px rgba(0,0,0,0.3)",
          }}>
            {/* Close */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
              <button onClick={reset} style={{ background: "rgba(0,0,0,0.06)", border: "none", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <X size={16} color="rgba(0,0,0,0.5)" />
              </button>
            </div>

            {step === "datetime" && selectedService && (
              <StepDateTime
                service={selectedService}
                onBack={reset}
                onNext={(s, d, t) => { setStaff(s); setDay(d); setTime(t); setStep("pay"); }}
              />
            )}
            {step === "pay" && selectedService && (
              <StepPay
                service={selectedService}
                day={selectedDay}
                time={selectedTime}
                onBack={() => setStep("datetime")}
                onConfirm={() => setStep("done")}
              />
            )}
            {step === "done" && selectedService && (
              <StepConfirmation
                service={selectedService}
                day={selectedDay}
                time={selectedTime}
                onDone={reset}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
