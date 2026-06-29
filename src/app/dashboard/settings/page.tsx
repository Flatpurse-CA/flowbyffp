"use client";

import { useState } from "react";
import {
  Copy, Check, Link2, Bell, CreditCard, Shield, Building2,
  Scissors, Clock, Receipt, Zap, Plus, Trash2, GripVertical,
  ChevronDown, ChevronUp,
} from "lucide-react";

// ─── Shared styles ────────────────────────────────────────────────────────────

const card: React.CSSProperties = {
  background: "rgba(255,255,255,0.025)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 16,
  padding: "22px 24px",
};

// ─── Tiny components ─────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 14px" }}>
      {children}
    </p>
  );
}

function Field({ label, value, type = "text", readOnly, placeholder, half }: {
  label: string; value: string; type?: string; readOnly?: boolean; placeholder?: string; half?: boolean;
}) {
  return (
    <div style={{ flex: half ? "1 1 45%" : "1 1 100%" }}>
      <label style={{ color: "rgba(255,255,255,0.38)", fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6, letterSpacing: "0.03em" }}>{label}</label>
      <input
        defaultValue={value}
        type={type}
        readOnly={readOnly}
        placeholder={placeholder}
        style={{
          width: "100%", background: readOnly ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.05)",
          border: `1px solid ${readOnly ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.09)"}`,
          borderRadius: 10, padding: "10px 13px",
          color: readOnly ? "rgba(255,255,255,0.3)" : "rgb(250,250,250)",
          fontSize: 13.5, outline: "none", boxSizing: "border-box",
          cursor: readOnly ? "default" : "text",
        }}
      />
    </div>
  );
}

function Toggle({ label, sub, on }: { label: string; sub: string; on: boolean }) {
  const [active, setActive] = useState(on);
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
      <div>
        <p style={{ color: "rgb(250,250,250)", fontSize: 13.5, fontWeight: 600, margin: "0 0 2px" }}>{label}</p>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, margin: 0 }}>{sub}</p>
      </div>
      <button onClick={() => setActive(v => !v)} style={{
        width: 42, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
        background: active ? "rgb(109,40,217)" : "rgba(255,255,255,0.12)",
        position: "relative", transition: "background 0.2s", flexShrink: 0,
      }}>
        <span style={{ position: "absolute", top: 4, left: active ? 20 : 4, width: 16, height: 16, borderRadius: "50%", background: "white", transition: "left 0.2s" }} />
      </button>
    </div>
  );
}

function SaveBar() {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
      <button style={{ padding: "10px 20px", borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.45)", fontSize: 13, cursor: "pointer" }}>Discard</button>
      <button style={{ padding: "10px 24px", borderRadius: 10, background: "rgb(109,40,217)", border: "none", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Save changes</button>
    </div>
  );
}

// ─── Tab definitions ──────────────────────────────────────────────────────────

const TABS = [
  { label: "Business",      Icon: Building2  },
  { label: "Services",      Icon: Scissors   },
  { label: "Hours",         Icon: Clock      },
  { label: "Tax & GST",     Icon: Receipt    },
  { label: "AutoPilot",     Icon: Zap        },
  { label: "Notifications", Icon: Bell       },
  { label: "Billing",       Icon: CreditCard },
] as const;

type TabLabel = typeof TABS[number]["label"];

// ─── Services data ────────────────────────────────────────────────────────────

type Service = { id: number; name: string; duration: number; price: number; category: string; active: boolean };

const INITIAL_SERVICES: Service[] = [
  { id:1, name:"Silk Press",           duration:60,  price:85,  category:"Styling",    active:true },
  { id:2, name:"Full Highlights",      duration:120, price:120, category:"Colour",     active:true },
  { id:3, name:"Colour + Gloss",       duration:90,  price:160, category:"Colour",     active:true },
  { id:4, name:"Knotless Braids",      duration:180, price:180, category:"Protective", active:true },
  { id:5, name:"Trim + Treatment",     duration:45,  price:70,  category:"Treatment",  active:true },
  { id:6, name:"Scalp Treatment",      duration:30,  price:55,  category:"Treatment",  active:true },
  { id:7, name:"Keratin Blowout",      duration:120, price:200, category:"Styling",    active:false },
];

// ─── AutoPilot flows data ─────────────────────────────────────────────────────

type FlowKey = "rebooking" | "noshow" | "winback" | "birthday" | "lastminute" | "frontdesk";

type Flow = {
  key: FlowKey; name: string; description: string;
  enabled: boolean; channel: string; delay: string;
};

const INITIAL_FLOWS: Flow[] = [
  { key:"rebooking",   name:"Rebooking reminder",   description:"Nudge clients to book when they're due",                  enabled:true,  channel:"SMS",   delay:"28 days after last visit"   },
  { key:"noshow",      name:"No-show recovery",      description:"Re-engage clients who missed their appointment",          enabled:true,  channel:"SMS",   delay:"2 hours after no-show"      },
  { key:"winback",     name:"30-day win-back",        description:"Bring back clients who haven't visited in a month",      enabled:true,  channel:"Email", delay:"30 days of inactivity"      },
  { key:"birthday",    name:"Birthday offer",         description:"Automatic birthday treat to loyal clients",              enabled:true,  channel:"SMS",   delay:"3 days before birthday"     },
  { key:"lastminute",  name:"Last-minute slot filler","description":"Fill cancellations with nearby available clients",     enabled:false, channel:"SMS",   delay:"On cancellation"            },
  { key:"frontdesk",   name:"AI front desk",          description:"Instantly respond to client messages 24/7",             enabled:false, channel:"SMS",   delay:"Immediate"                  },
];

// ─── Family Hours data ────────────────────────────────────────────────────────

type HourRow = { label: string; open: boolean; start: string; end: string };

const WEEKDAYS: HourRow[] = [
  { label:"Monday",    open:true,  start:"09:00", end:"18:00" },
  { label:"Tuesday",   open:true,  start:"09:00", end:"18:00" },
  { label:"Wednesday", open:true,  start:"09:00", end:"18:00" },
  { label:"Thursday",  open:true,  start:"09:00", end:"19:00" },
  { label:"Friday",    open:true,  start:"09:00", end:"19:00" },
  { label:"Saturday",  open:true,  start:"10:00", end:"17:00" },
  { label:"Sunday",    open:false, start:"10:00", end:"15:00" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [tab, setTab]         = useState<TabLabel>("Business");
  const [copied, setCopied]   = useState(false);
  const [services, setServices] = useState<Service[]>(INITIAL_SERVICES);
  const [flows, setFlows]     = useState<Flow[]>(INITIAL_FLOWS);
  const [hours, setHours]     = useState<HourRow[]>(WEEKDAYS);
  const [expandedFlow, setExpandedFlow] = useState<FlowKey | null>(null);
  const [familyStart, setFamilyStart] = useState("18:00");
  const [familyEnd, setFamilyEnd]     = useState("20:00");
  const [familyOn, setFamilyOn]       = useState(true);
  const [taxRate, setTaxRate]         = useState("13");
  const [taxInclusive, setTaxInclusive] = useState(false);

  const bookingLink = "flowbyffp.co/book/ffp";

  const copyLink = () => {
    navigator.clipboard.writeText(bookingLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleService = (id: number) =>
    setServices(s => s.map(sv => sv.id === id ? { ...sv, active: !sv.active } : sv));

  const removeService = (id: number) =>
    setServices(s => s.filter(sv => sv.id !== id));

  const toggleFlow = (key: FlowKey) =>
    setFlows(f => f.map(fl => fl.key === key ? { ...fl, enabled: !fl.enabled } : fl));

  const toggleHour = (idx: number) =>
    setHours(h => h.map((r, i) => i === idx ? { ...r, open: !r.open } : r));

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", flexDirection: "column", gap: 22 }}>

      {/* Header */}
      <div>
        <h1 style={{ color: "rgb(250,250,250)", fontSize: 22, fontWeight: 800, margin: "0 0 3px", letterSpacing: "-0.03em" }}>Settings</h1>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, margin: 0 }}>Manage your business, services, and preferences</p>
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {TABS.map(({ label, Icon }) => (
          <button
            key={label}
            onClick={() => setTab(label)}
            style={{
              display: "flex", alignItems: "center", gap: 6, padding: "8px 15px",
              borderRadius: 10, border: `1px solid ${tab === label ? "rgba(139,92,246,0.4)" : "rgba(255,255,255,0.08)"}`,
              cursor: "pointer", fontSize: 12.5, fontWeight: tab === label ? 700 : 500,
              background: tab === label ? "rgba(109,40,217,0.15)" : "rgba(255,255,255,0.03)",
              color: tab === label ? "rgb(210,196,254)" : "rgba(255,255,255,0.4)",
              transition: "all 0.15s",
            }}
          >
            <Icon size={13} strokeWidth={tab === label ? 2.2 : 1.7} />
            {label}
          </button>
        ))}
      </div>

      {/* ── Business ── */}
      {tab === "Business" && (
        <>
          <div style={card}>
            <SectionLabel>Business profile</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                <Field label="Business name" value="Flow by FFP" half />
                <Field label="Handle (booking URL)" value="ffp" half />
              </div>
              <Field label="Business type" value="Hair salon / Independent stylist" />
              <div>
                <label style={{ color: "rgba(255,255,255,0.38)", fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6 }}>About / Bio</label>
                <textarea
                  defaultValue="Toronto-based luxury hair studio specialising in colour, silk press, and protective styles."
                  rows={3}
                  style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 10, padding: "10px 13px", color: "rgb(250,250,250)", fontSize: 13, outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit", lineHeight: 1.5 }}
                />
              </div>
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                <Field label="City" value="Toronto, ON" half />
                <Field label="Postal code" value="M5V 1A1" half />
              </div>
              <Field label="Phone number" value="+1 647 000 0000" type="tel" />
            </div>
          </div>

          <div style={card}>
            <SectionLabel>Booking link</SectionLabel>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, margin: "0 0 14px" }}>Share this with clients so they can self-book anytime.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "10px 13px" }}>
                <Link2 size={13} color="rgba(255,255,255,0.3)" />
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>{bookingLink}</span>
              </div>
              <button onClick={copyLink} style={{
                display: "flex", alignItems: "center", gap: 6, padding: "10px 16px",
                borderRadius: 10, cursor: "pointer", fontSize: 13, transition: "all 0.2s", whiteSpace: "nowrap",
                background: copied ? "rgba(52,211,153,0.12)" : "rgba(255,255,255,0.06)",
                border: `1px solid ${copied ? "rgba(52,211,153,0.3)" : "rgba(255,255,255,0.1)"}`,
                color: copied ? "rgb(52,211,153)" : "rgba(255,255,255,0.5)",
              }}>
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? "Copied!" : "Copy link"}
              </button>
            </div>
          </div>

          <SaveBar />
        </>
      )}

      {/* ── Services ── */}
      {tab === "Services" && (
        <>
          <div style={card}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <SectionLabel>Services & pricing</SectionLabel>
              <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 9, background: "rgb(109,40,217)", border: "none", color: "white", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>
                <Plus size={13} strokeWidth={2.5} /> Add service
              </button>
            </div>

            {/* Category groups */}
            {["Styling","Colour","Protective","Treatment"].map(cat => {
              const catServices = services.filter(s => s.category === cat);
              if (!catServices.length) return null;
              return (
                <div key={cat} style={{ marginBottom: 22 }}>
                  <p style={{ color: "rgba(255,255,255,0.28)", fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 8px" }}>{cat}</p>
                  <div style={{ border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, overflow: "hidden" }}>
                    {catServices.map((sv, i) => (
                      <div key={sv.id} style={{
                        display: "flex", alignItems: "center", gap: 12, padding: "13px 16px",
                        borderBottom: i < catServices.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                        background: sv.active ? "transparent" : "rgba(255,255,255,0.01)",
                      }}>
                        <GripVertical size={14} color="rgba(255,255,255,0.15)" style={{ cursor: "grab", flexShrink: 0 }} />

                        <div style={{ flex: 1 }}>
                          <p style={{ color: sv.active ? "rgb(250,250,250)" : "rgba(255,255,255,0.3)", fontSize: 13.5, fontWeight: 700, margin: "0 0 2px" }}>{sv.name}</p>
                          <p style={{ color: "rgba(255,255,255,0.28)", fontSize: 12, margin: 0 }}>{sv.duration} min · C${sv.price}</p>
                        </div>

                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: "2px 9px", borderRadius: 20, whiteSpace: "nowrap",
                          color: sv.active ? "rgb(52,211,153)" : "rgba(255,255,255,0.2)",
                          background: sv.active ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.04)",
                        }}>
                          {sv.active ? "Active" : "Hidden"}
                        </span>

                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={() => toggleService(sv.id)} style={{ padding: "5px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.4)", fontSize: 11.5, cursor: "pointer" }}>
                            {sv.active ? "Hide" : "Show"}
                          </button>
                          <button onClick={() => removeService(sv.id)} style={{ width: 28, height: 28, borderRadius: 8, border: "1px solid rgba(239,68,68,0.15)", background: "rgba(239,68,68,0.06)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                            <Trash2 size={12} color="rgba(248,113,113,0.7)" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Deposit setting */}
          <div style={card}>
            <SectionLabel>Deposit & payment</SectionLabel>
            <Toggle label="Require deposit at booking" sub="Clients pay 20% upfront to secure their appointment" on={true} />
            <Toggle label="Enable online payments"      sub="Accept card payments via Stripe on the booking page" on={false} />
            <Toggle label="Show gratuity prompt"       sub="Offer tip options (10% / 15% / 20% / 25%) at checkout" on={true} />
          </div>

          <SaveBar />
        </>
      )}

      {/* ── Hours ── */}
      {tab === "Hours" && (
        <>
          <div style={card}>
            <SectionLabel>Business hours</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {hours.map((row, i) => (
                <div key={row.label} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 0", borderBottom: i < hours.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                  {/* Toggle */}
                  <button onClick={() => toggleHour(i)} style={{
                    width: 38, height: 22, borderRadius: 11, border: "none", cursor: "pointer", flexShrink: 0,
                    background: row.open ? "rgb(109,40,217)" : "rgba(255,255,255,0.1)",
                    position: "relative", transition: "background 0.2s",
                  }}>
                    <span style={{ position: "absolute", top: 3, left: row.open ? 18 : 3, width: 16, height: 16, borderRadius: "50%", background: "white", transition: "left 0.2s" }} />
                  </button>

                  {/* Day */}
                  <span style={{ color: row.open ? "rgb(250,250,250)" : "rgba(255,255,255,0.3)", fontSize: 13.5, fontWeight: 600, width: 100, flexShrink: 0 }}>{row.label}</span>

                  {row.open ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <input type="time" defaultValue={row.start} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 9, padding: "6px 10px", color: "rgb(250,250,250)", fontSize: 12.5, outline: "none" }} />
                      <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>to</span>
                      <input type="time" defaultValue={row.end} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 9, padding: "6px 10px", color: "rgb(250,250,250)", fontSize: 12.5, outline: "none" }} />
                    </div>
                  ) : (
                    <span style={{ color: "rgba(255,255,255,0.22)", fontSize: 13, fontStyle: "italic" }}>Closed</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Family hours */}
          <div style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.18)", borderRadius: 16, padding: "22px 24px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
              <div>
                <p style={{ color: "rgb(210,196,254)", fontSize: 14, fontWeight: 700, margin: "0 0 4px" }}>Family hours</p>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12.5, margin: 0 }}>Block a window each evening — AutoPilot won't book clients during this time.</p>
              </div>
              <button onClick={() => setFamilyOn(v => !v)} style={{
                width: 42, height: 24, borderRadius: 12, border: "none", cursor: "pointer", flexShrink: 0,
                background: familyOn ? "rgb(109,40,217)" : "rgba(255,255,255,0.12)",
                position: "relative", transition: "background 0.2s",
              }}>
                <span style={{ position: "absolute", top: 4, left: familyOn ? 20 : 4, width: 16, height: 16, borderRadius: "50%", background: "white", transition: "left 0.2s" }} />
              </button>
            </div>
            {familyOn && (
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 13 }}>Block every evening from</span>
                <input type="time" value={familyStart} onChange={e => setFamilyStart(e.target.value)} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(139,92,246,0.25)", borderRadius: 9, padding: "7px 12px", color: "rgb(250,250,250)", fontSize: 13, outline: "none" }} />
                <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>to</span>
                <input type="time" value={familyEnd} onChange={e => setFamilyEnd(e.target.value)} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(139,92,246,0.25)", borderRadius: 9, padding: "7px 12px", color: "rgb(250,250,250)", fontSize: 13, outline: "none" }} />
                <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "rgba(139,92,246,0.15)", color: "rgb(167,139,250)", fontWeight: 700 }}>Protected</span>
              </div>
            )}
          </div>

          <SaveBar />
        </>
      )}

      {/* ── Tax & GST ── */}
      {tab === "Tax & GST" && (
        <>
          <div style={card}>
            <SectionLabel>Tax settings</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ color: "rgba(255,255,255,0.38)", fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6 }}>Tax rate (%)</label>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <input
                    type="number" value={taxRate} min="0" max="30" step="0.1"
                    onChange={e => setTaxRate(e.target.value)}
                    style={{ width: 100, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 10, padding: "10px 13px", color: "rgb(250,250,250)", fontSize: 15, fontWeight: 700, outline: "none" }}
                  />
                  <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>%  (Ontario HST = 13%)</span>
                </div>
              </div>

              <Field label="Business registration number (GST/HST)" value="123456789 RT0001" placeholder="e.g. 123456789 RT0001" />
              <Field label="Legal business name" value="Flow by FFP Inc." />

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                <div>
                  <p style={{ color: "rgb(250,250,250)", fontSize: 13.5, fontWeight: 600, margin: "0 0 2px" }}>Tax-inclusive pricing</p>
                  <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, margin: 0 }}>Service prices shown already include tax (no tax added at checkout)</p>
                </div>
                <button onClick={() => setTaxInclusive(v => !v)} style={{
                  width: 42, height: 24, borderRadius: 12, border: "none", cursor: "pointer", flexShrink: 0,
                  background: taxInclusive ? "rgb(109,40,217)" : "rgba(255,255,255,0.12)",
                  position: "relative", transition: "background 0.2s",
                }}>
                  <span style={{ position: "absolute", top: 4, left: taxInclusive ? 20 : 4, width: 16, height: 16, borderRadius: "50%", background: "white", transition: "left 0.2s" }} />
                </button>
              </div>
            </div>
          </div>

          {/* Tax preview */}
          <div style={{ ...card, background: "rgba(52,211,153,0.04)", border: "1px solid rgba(52,211,153,0.12)" }}>
            <SectionLabel>Preview</SectionLabel>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12.5, margin: "0 0 12px" }}>How a C$120 Highlights service would appear on receipts:</p>
            {[
              { label: "Service",  value: "C$120.00",  color: undefined       },
              { label: `HST (${taxRate}%)`, value: taxInclusive ? "Included" : `C$${(120 * parseFloat(taxRate||"0") / 100).toFixed(2)}`, color: undefined },
              { label: "Total",    value: taxInclusive ? "C$120.00" : `C$${(120 * (1 + parseFloat(taxRate||"0") / 100)).toFixed(2)}`, color: "rgb(52,211,153)" },
            ].map(r => (
              <div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 13 }}>{r.label}</span>
                <span style={{ color: r.color ?? "rgb(250,250,250)", fontSize: 13, fontWeight: r.color ? 800 : 600 }}>{r.value}</span>
              </div>
            ))}
          </div>

          <SaveBar />
        </>
      )}

      {/* ── AutoPilot ── */}
      {tab === "AutoPilot" && (
        <>
          <div style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.18)", borderRadius: 16, padding: "18px 22px", display: "flex", alignItems: "center", gap: 14 }}>
            <Zap size={20} color="rgb(167,139,250)" strokeWidth={2} />
            <div>
              <p style={{ color: "rgb(210,196,254)", fontSize: 13.5, fontWeight: 700, margin: "0 0 2px" }}>AutoPilot is active</p>
              <p style={{ color: "rgba(255,255,255,0.38)", fontSize: 12.5, margin: 0 }}>Configure each flow below — changes take effect immediately.</p>
            </div>
          </div>

          <div style={card}>
            <SectionLabel>Automation flows</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {flows.map((fl, i) => (
                <div key={fl.key} style={{ borderBottom: i < flows.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                  {/* Row */}
                  <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "15px 0" }}>
                    {/* Toggle */}
                    <button onClick={() => toggleFlow(fl.key)} style={{
                      width: 38, height: 22, borderRadius: 11, border: "none", cursor: "pointer", flexShrink: 0,
                      background: fl.enabled ? "rgb(109,40,217)" : "rgba(255,255,255,0.1)",
                      position: "relative", transition: "background 0.2s",
                    }}>
                      <span style={{ position: "absolute", top: 3, left: fl.enabled ? 18 : 3, width: 16, height: 16, borderRadius: "50%", background: "white", transition: "left 0.2s" }} />
                    </button>

                    <div style={{ flex: 1 }}>
                      <p style={{ color: fl.enabled ? "rgb(250,250,250)" : "rgba(255,255,255,0.35)", fontSize: 13.5, fontWeight: 700, margin: "0 0 2px" }}>{fl.name}</p>
                      <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, margin: 0 }}>{fl.description}</p>
                    </div>

                    <div style={{ textAlign: "right", marginRight: 10 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, color: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.05)" }}>
                        {fl.channel}
                      </span>
                      <p style={{ color: "rgba(255,255,255,0.22)", fontSize: 11, margin: "3px 0 0", whiteSpace: "nowrap" }}>{fl.delay}</p>
                    </div>

                    <button
                      onClick={() => setExpandedFlow(expandedFlow === fl.key ? null : fl.key)}
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}
                    >
                      {expandedFlow === fl.key ? <ChevronUp size={13} color="rgba(255,255,255,0.4)" /> : <ChevronDown size={13} color="rgba(255,255,255,0.4)" />}
                    </button>
                  </div>

                  {/* Expanded editor */}
                  {expandedFlow === fl.key && (
                    <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "16px 18px", marginBottom: 14, display: "flex", flexDirection: "column", gap: 14 }}>
                      <div>
                        <label style={{ color: "rgba(255,255,255,0.38)", fontSize: 11.5, fontWeight: 600, display: "block", marginBottom: 6, letterSpacing: "0.03em", textTransform: "uppercase" }}>Message template</label>
                        <textarea
                          rows={3}
                          defaultValue={
                            fl.key === "rebooking"  ? "Hi {{first_name}}! It's been a while 💜 Ready to book your next appointment? Reply YES or tap: {{booking_link}}" :
                            fl.key === "noshow"     ? "Hi {{first_name}}, we missed you today! Let's get you rebooked — tap here: {{booking_link}}" :
                            fl.key === "winback"    ? "Hey {{first_name}} — it's been {{days_since}} days since we last saw you. We'd love to have you back! Book at: {{booking_link}}" :
                            fl.key === "birthday"   ? "Happy birthday {{first_name}}! 🎂 Treat yourself — enjoy 15% off your next visit. Book at: {{booking_link}}" :
                            fl.key === "lastminute" ? "Hi {{first_name}}! We just had a cancellation at {{time}} today — interested? Tap to grab the slot: {{booking_link}}" :
                            "Hi! I'm the AI assistant for {{business_name}}. I can help you book, reschedule, or answer questions. What can I do for you?"
                          }
                          style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "10px 13px", color: "rgba(255,255,255,0.75)", fontSize: 12.5, outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit", lineHeight: 1.6 }}
                        />
                        <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, margin: "5px 0 0" }}>Variables: {"{{first_name}}"} · {"{{days_since}}"} · {"{{booking_link}}"} · {"{{time}}"} · {"{{business_name}}"}</p>
                      </div>
                      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ color: "rgba(255,255,255,0.38)", fontSize: 11.5, fontWeight: 600, display: "block", marginBottom: 6, letterSpacing: "0.03em", textTransform: "uppercase" }}>Channel</label>
                          <select defaultValue={fl.channel} style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 9, padding: "9px 12px", color: "rgb(250,250,250)", fontSize: 13, outline: "none", cursor: "pointer" }}>
                            <option value="SMS">SMS</option>
                            <option value="Email">Email</option>
                            <option value="Both">SMS + Email</option>
                          </select>
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={{ color: "rgba(255,255,255,0.38)", fontSize: 11.5, fontWeight: 600, display: "block", marginBottom: 6, letterSpacing: "0.03em", textTransform: "uppercase" }}>Timing</label>
                          <input defaultValue={fl.delay} style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 9, padding: "9px 12px", color: "rgb(250,250,250)", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                        </div>
                      </div>
                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button style={{ padding: "7px 18px", borderRadius: 9, background: "rgb(109,40,217)", border: "none", color: "white", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>Save flow</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── Notifications ── */}
      {tab === "Notifications" && (
        <>
          <div style={card}>
            <SectionLabel>Push & SMS alerts</SectionLabel>
            <Toggle label="New booking"          sub="When a client books an appointment"             on={true}  />
            <Toggle label="Cancellation"         sub="When a booking is cancelled"                     on={true}  />
            <Toggle label="No-show alert"        sub="When a client doesn't turn up"                   on={true}  />
            <Toggle label="Payment received"     sub="When a client pays online"                       on={false} />
            <Toggle label="AutoPilot win"        sub="When AutoPilot books or recovers a client"       on={true}  />
          </div>
          <div style={card}>
            <SectionLabel>Reports & summaries</SectionLabel>
            <Toggle label="Daily brief"          sub="Morning summary delivered at 8 AM"              on={true}  />
            <Toggle label="Weekly revenue recap" sub="Revenue + bookings recap every Monday"          on={true}  />
            <Toggle label="Monthly statement"    sub="Full income statement on the 1st"               on={false} />
          </div>
          <SaveBar />
        </>
      )}

      {/* ── Billing ── */}
      {tab === "Billing" && (
        <>
          {/* Plan card */}
          <div style={{
            ...card,
            background: "linear-gradient(135deg, rgb(15,11,40), rgb(28,16,70))",
            border: "1px solid rgba(139,92,246,0.25)",
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: "rgba(109,40,217,0.35)", color: "rgb(196,181,253)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Pro plan</span>
                <p style={{ color: "rgb(250,250,250)", fontSize: 28, fontWeight: 800, margin: "12px 0 4px", letterSpacing: "-0.04em" }}>
                  C$29<span style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.45)" }}>/month</span>
                </p>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, margin: 0 }}>Renews Jul 17, 2026</p>
              </div>
              <Shield size={36} color="rgba(139,92,246,0.5)" strokeWidth={1.2} />
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
              <button style={{ padding: "9px 18px", borderRadius: 9, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)", fontSize: 13, cursor: "pointer" }}>Manage plan</button>
              <button style={{ padding: "9px 18px", borderRadius: 9, background: "linear-gradient(90deg, rgb(109,40,217), rgb(99,102,241))", border: "none", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Upgrade to Elite</button>
            </div>
          </div>

          {/* Payment method */}
          <div style={card}>
            <p style={{ color: "rgb(250,250,250)", fontSize: 14, fontWeight: 700, margin: "0 0 14px" }}>Payment method</p>
            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 }}>
              <div style={{ width: 40, height: 26, borderRadius: 5, background: "linear-gradient(135deg, #1434CB, #0052CC)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CreditCard size={14} color="white" strokeWidth={1.5} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ color: "rgb(250,250,250)", fontSize: 13, fontWeight: 600, margin: "0 0 2px" }}>•••• •••• •••• 4242</p>
                <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, margin: 0 }}>Expires 04/28</p>
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: "rgba(52,211,153,0.1)", color: "rgb(52,211,153)" }}>DEFAULT</span>
            </div>
            <button style={{ marginTop: 12, padding: "9px 18px", borderRadius: 9, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.5)", fontSize: 13, cursor: "pointer" }}>
              + Add payment method
            </button>
          </div>

          {/* Invoices */}
          <div style={card}>
            <p style={{ color: "rgb(250,250,250)", fontSize: 14, fontWeight: 700, margin: "0 0 14px" }}>Recent invoices</p>
            {[
              { date: "Jun 17, 2026", amount: "C$29.00" },
              { date: "May 17, 2026", amount: "C$29.00" },
              { date: "Apr 17, 2026", amount: "C$29.00" },
            ].map((inv, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>{inv.date}</span>
                <span style={{ color: "rgb(250,250,250)", fontSize: 13, fontWeight: 600 }}>{inv.amount}</span>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: "rgba(52,211,153,0.1)", color: "rgb(52,211,153)" }}>Paid</span>
                <button style={{ fontSize: 12, color: "rgba(139,92,246,0.7)", background: "none", border: "none", cursor: "pointer" }}>Download</button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
