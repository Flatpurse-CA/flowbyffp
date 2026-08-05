"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Copy, Check, Link2, Bell, CreditCard, Shield, Building2,
  Wallet, Clock, Receipt, Zap,
  ChevronDown, ChevronUp,
} from "lucide-react";
import { updateFamilyHours, updateBusinessHours, startStripeOnboarding, startCheckout, chooseStarterPlan, openBillingPortal, type BusinessHourRow, type BillingStatus } from "./actions";
import { PLANS, type BillingInterval } from "@/lib/plans";

export type FamilyHoursSettings = { enabled: boolean; start: string; end: string };

function redirectTo(url: string) {
  window.location.href = url;
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const card: React.CSSProperties = {
  background: "var(--dw025)",
  border: "1px solid var(--dw07)",
  borderRadius: 16,
  padding: "22px 24px",
};

// ─── Tiny components ─────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ color: "var(--dw3)", fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 14px" }}>
      {children}
    </p>
  );
}

function Field({ label, value, type = "text", readOnly, placeholder, half }: {
  label: string; value: string; type?: string; readOnly?: boolean; placeholder?: string; half?: boolean;
}) {
  return (
    <div style={{ flex: half ? "1 1 45%" : "1 1 100%" }}>
      <label style={{ color: "var(--dw38)", fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6, letterSpacing: "0.03em" }}>{label}</label>
      <input
        defaultValue={value}
        type={type}
        readOnly={readOnly}
        placeholder={placeholder}
        style={{
          width: "100%", background: readOnly ? "var(--dw02)" : "var(--dw05)",
          border: `1px solid ${readOnly ? "var(--dw05)" : "var(--dw09)"}`,
          borderRadius: 10, padding: "10px 13px",
          color: readOnly ? "var(--dw3)" : "var(--dtext)",
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
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: "1px solid var(--dw04)" }}>
      <div>
        <p style={{ color: "var(--dtext)", fontSize: 13.5, fontWeight: 600, margin: "0 0 2px" }}>{label}</p>
        <p style={{ color: "var(--dw35)", fontSize: 12, margin: 0 }}>{sub}</p>
      </div>
      <button onClick={() => setActive(v => !v)} style={{
        width: 42, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
        background: active ? "rgb(109,40,217)" : "var(--dw12)",
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
      <button style={{ padding: "10px 20px", borderRadius: 10, background: "var(--dw05)", border: "1px solid var(--dw09)", color: "var(--dw45)", fontSize: 13, cursor: "pointer" }}>Discard</button>
      <button style={{ padding: "10px 24px", borderRadius: 10, background: "rgb(109,40,217)", border: "none", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Save changes</button>
    </div>
  );
}

// ─── Tab definitions ──────────────────────────────────────────────────────────

const TABS = [
  { label: "Business",      Icon: Building2  },
  { label: "Payments",      Icon: Wallet     },
  { label: "Hours",         Icon: Clock      },
  { label: "Tax & GST",     Icon: Receipt    },
  { label: "AutoPilot",     Icon: Zap        },
  { label: "Notifications", Icon: Bell       },
  { label: "Billing",       Icon: CreditCard },
] as const;

type TabLabel = typeof TABS[number]["label"];

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

// ─── Business hours ───────────────────────────────────────────────────────────

type HourRow = { weekday: number; label: string; open: boolean; start: string; end: string };

// Display order is Monday-first; `weekday` is the stored int (0=Sunday, matching the DB).
const DAY_LABELS: Array<{ weekday: number; label: string }> = [
  { weekday: 1, label: "Monday" },
  { weekday: 2, label: "Tuesday" },
  { weekday: 3, label: "Wednesday" },
  { weekday: 4, label: "Thursday" },
  { weekday: 5, label: "Friday" },
  { weekday: 6, label: "Saturday" },
  { weekday: 0, label: "Sunday" },
];

function buildHourRows(initial: BusinessHourRow[]): HourRow[] {
  return DAY_LABELS.map(({ weekday, label }) => {
    const existing = initial.find(r => r.weekday === weekday);
    return {
      weekday, label,
      open: existing?.open ?? weekday !== 0,
      start: existing?.start ?? "09:00",
      end: existing?.end ?? "18:00",
    };
  });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function SettingsClient({ initialFamilyHours, initialBusinessHours, initialStripeConnected, initialBookingUrl, initialBilling }: { initialFamilyHours: FamilyHoursSettings; initialBusinessHours: BusinessHourRow[]; initialStripeConnected: boolean; initialBookingUrl: string | null; initialBilling: BillingStatus | null }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as TabLabel | null;
  const [tab, setTab]         = useState<TabLabel>(tabParam && TABS.some(t => t.label === tabParam) ? tabParam : "Business");
  const [copied, setCopied]   = useState(false);
  const [flows, setFlows]     = useState<Flow[]>(INITIAL_FLOWS);
  const [hours, setHours]     = useState<HourRow[]>(() => buildHourRows(initialBusinessHours));
  const [savingHours, setSavingHours] = useState(false);
  const [hoursSaved, setHoursSaved]   = useState(false);
  const [expandedFlow, setExpandedFlow] = useState<FlowKey | null>(null);
  const [familyStart, setFamilyStart] = useState(initialFamilyHours.start);
  const [familyEnd, setFamilyEnd]     = useState(initialFamilyHours.end);
  const [familyOn, setFamilyOn]       = useState(initialFamilyHours.enabled);
  const [savingFamily, setSavingFamily] = useState(false);
  const [familySaved, setFamilySaved]   = useState(false);
  const [taxRate, setTaxRate]         = useState("13");
  const [taxInclusive, setTaxInclusive] = useState(false);
  const [connectingStripe, setConnectingStripe] = useState(false);
  const [stripeError, setStripeError]           = useState<string | null>(null);
  const [billingInterval, setBillingInterval]   = useState<BillingInterval>(initialBilling?.billingInterval ?? "monthly");
  const [pendingPlanKey, setPendingPlanKey]     = useState<string | null>(null);
  const [billingError, setBillingError]         = useState<string | null>(null);
  const [portalLoading, setPortalLoading]       = useState(false);

  const currentPlan = PLANS.find(p => p.key === initialBilling?.plan) ?? PLANS[0];

  const selectPlan = async (planKey: string, claimFounders: boolean) => {
    setBillingError(null);
    if (planKey === "starter") {
      setPendingPlanKey(planKey);
      const res = await chooseStarterPlan();
      setPendingPlanKey(null);
      if (res.error) setBillingError(res.error);
      else router.refresh();
      return;
    }
    if (planKey === "enterprise") {
      redirectTo("mailto:sales@flatpurse.com?subject=Enterprise%20plan");
      return;
    }
    setPendingPlanKey(planKey);
    const res = await startCheckout({ planKey: planKey as "pro" | "pro_plus", interval: billingInterval, claimFounders });
    if (res.error) {
      setBillingError(res.error);
      setPendingPlanKey(null);
      return;
    }
    if (res.url) redirectTo(res.url);
  };

  const manageBilling = async () => {
    setPortalLoading(true);
    setBillingError(null);
    const res = await openBillingPortal();
    if (res.error) {
      setBillingError(res.error);
      setPortalLoading(false);
      return;
    }
    if (res.url) window.location.href = res.url;
  };

  const connectStripe = async () => {
    setConnectingStripe(true);
    setStripeError(null);
    const res = await startStripeOnboarding();
    if (res.error) {
      setStripeError(res.error);
      setConnectingStripe(false);
      return;
    }
    if (res.url) window.location.href = res.url;
  };

  const saveFamilyHours = async () => {
    setSavingFamily(true);
    setFamilySaved(false);
    try {
      await updateFamilyHours({ enabled: familyOn, start: familyStart, end: familyEnd });
      setFamilySaved(true);
      router.refresh();
      setTimeout(() => setFamilySaved(false), 2500);
    } finally {
      setSavingFamily(false);
    }
  };

  const saveBusinessHours = async () => {
    setSavingHours(true);
    setHoursSaved(false);
    try {
      await updateBusinessHours(hours.map(({ weekday, open, start, end }) => ({ weekday, open, start, end })));
      setHoursSaved(true);
      router.refresh();
      setTimeout(() => setHoursSaved(false), 2500);
    } finally {
      setSavingHours(false);
    }
  };

  const bookingLinkDisplay = initialBookingUrl ? initialBookingUrl.replace(/^https?:\/\//, "") : null;

  const copyLink = () => {
    if (!initialBookingUrl) return;
    navigator.clipboard.writeText(initialBookingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleFlow = (key: FlowKey) =>
    setFlows(f => f.map(fl => fl.key === key ? { ...fl, enabled: !fl.enabled } : fl));

  const toggleHour = (idx: number) =>
    setHours(h => h.map((r, i) => i === idx ? { ...r, open: !r.open } : r));

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", flexDirection: "column", gap: 22 }}>

      {/* Header */}
      <div>
        <h1 style={{ color: "var(--dtext)", fontSize: 22, fontWeight: 800, margin: "0 0 3px", letterSpacing: "-0.03em" }}>Settings</h1>
        <p style={{ color: "var(--dw35)", fontSize: 13, margin: 0 }}>Manage your business, services, and preferences</p>
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {TABS.map(({ label, Icon }) => (
          <button
            key={label}
            onClick={() => setTab(label)}
            style={{
              display: "flex", alignItems: "center", gap: 6, padding: "8px 15px",
              borderRadius: 10, border: `1px solid ${tab === label ? "rgba(139,92,246,0.4)" : "var(--dw08)"}`,
              cursor: "pointer", fontSize: 12.5, fontWeight: tab === label ? 700 : 500,
              background: tab === label ? "rgba(109,40,217,0.15)" : "var(--dw03)",
              color: tab === label ? "rgb(210,196,254)" : "var(--dw4)",
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
                <label style={{ color: "var(--dw38)", fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6 }}>About / Bio</label>
                <textarea
                  defaultValue="Toronto-based luxury hair studio specialising in colour, silk press, and protective styles."
                  rows={3}
                  style={{ width: "100%", background: "var(--dw05)", border: "1px solid var(--dw09)", borderRadius: 10, padding: "10px 13px", color: "var(--dtext)", fontSize: 13, outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit", lineHeight: 1.5 }}
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
            <p style={{ color: "var(--dw4)", fontSize: 13, margin: "0 0 14px" }}>Share this with clients so they can self-book anytime.</p>
            {bookingLinkDisplay ? (
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <div style={{ flex: "1 1 200px", display: "flex", alignItems: "center", gap: 8, background: "var(--dw04)", border: "1px solid var(--dw08)", borderRadius: 10, padding: "10px 13px", minWidth: 0 }}>
                  <Link2 size={13} color="var(--dw3)" style={{ flexShrink: 0 }} />
                  <span style={{ color: "var(--dw5)", fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{bookingLinkDisplay}</span>
                </div>
                <a href={initialBookingUrl!} target="_blank" rel="noopener noreferrer" style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "10px 16px",
                  borderRadius: 10, fontSize: 13, whiteSpace: "nowrap", textDecoration: "none",
                  background: "var(--dw06)", border: "1px solid var(--dw1)", color: "var(--dw65)",
                }}>
                  Preview
                </a>
                <button onClick={copyLink} style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "10px 16px",
                  borderRadius: 10, cursor: "pointer", fontSize: 13, transition: "all 0.2s", whiteSpace: "nowrap",
                  background: copied ? "rgba(52,211,153,0.12)" : "var(--dw06)",
                  border: `1px solid ${copied ? "rgba(52,211,153,0.3)" : "var(--dw1)"}`,
                  color: copied ? "rgb(52,211,153)" : "var(--dw5)",
                }}>
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  {copied ? "Copied!" : "Copy link"}
                </button>
              </div>
            ) : (
              <p style={{ color: "rgba(248,113,113,0.8)", fontSize: 12.5, margin: 0 }}>
                No handle set for your shop yet — contact support to get your booking page activated.
              </p>
            )}
          </div>

          <SaveBar />
        </>
      )}

      {/* ── Payments ── */}
      {tab === "Payments" && (
        <>
          <div style={{ ...card, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
            <div>
              <p style={{ color: "var(--dtext)", fontSize: 13.5, fontWeight: 700, margin: "0 0 2px" }}>Manage your services</p>
              <p style={{ color: "var(--dw35)", fontSize: 12, margin: 0 }}>Add, price, and publish services from the Services page — that&apos;s what your booking page pulls from.</p>
            </div>
            <Link href="/dashboard/services" style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 10, background: "rgb(109,40,217)", color: "white", fontSize: 12.5, fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0 }}>
              Go to Services
            </Link>
          </div>

          <div style={card}>
            <SectionLabel>Stripe payments</SectionLabel>
            {initialStripeConnected ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 0" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "rgb(52,211,153)", flexShrink: 0 }} />
                <div>
                  <p style={{ color: "var(--dtext)", fontSize: 13.5, fontWeight: 700, margin: "0 0 2px" }}>Connected</p>
                  <p style={{ color: "var(--dw35)", fontSize: 12, margin: 0 }}>Your booking page accepts real card payments, and AutoPilot is active.</p>
                </div>
              </div>
            ) : (
              <div>
                <p style={{ color: "var(--dw45)", fontSize: 13, margin: "0 0 14px", lineHeight: 1.6 }}>
                  Connect Stripe to accept real card payments on your booking page and unlock AutoPilot.
                </p>
                {stripeError && <p style={{ color: "rgb(248,113,113)", fontSize: 12.5, margin: "0 0 12px" }}>{stripeError}</p>}
                <button onClick={connectStripe} disabled={connectingStripe} style={{
                  padding: "10px 20px", borderRadius: 10, border: "none",
                  background: "rgb(109,40,217)", color: "white", fontSize: 13, fontWeight: 700,
                  cursor: connectingStripe ? "default" : "pointer", opacity: connectingStripe ? 0.6 : 1,
                }}>
                  {connectingStripe ? "Redirecting…" : "Connect Stripe"}
                </button>
              </div>
            )}
          </div>

          <div style={card}>
            <SectionLabel>Deposit & payment</SectionLabel>
            <Toggle label="Require deposit at booking" sub="Clients pay 20% upfront to secure their appointment" on={true} />
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
                <div key={row.label} style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", padding: "13px 0", borderBottom: i < hours.length - 1 ? "1px solid var(--dw04)" : "none" }}>
                  {/* Toggle */}
                  <button onClick={() => toggleHour(i)} style={{
                    width: 38, height: 22, borderRadius: 11, border: "none", cursor: "pointer", flexShrink: 0,
                    background: row.open ? "rgb(109,40,217)" : "var(--dw1)",
                    position: "relative", transition: "background 0.2s",
                  }}>
                    <span style={{ position: "absolute", top: 3, left: row.open ? 18 : 3, width: 16, height: 16, borderRadius: "50%", background: "white", transition: "left 0.2s" }} />
                  </button>

                  {/* Day */}
                  <span style={{ color: row.open ? "var(--dtext)" : "var(--dw3)", fontSize: 13.5, fontWeight: 600, width: 100, flexShrink: 0 }}>{row.label}</span>

                  {row.open ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <input type="time" value={row.start} onChange={e => setHours(h => h.map((r, ri) => ri === i ? { ...r, start: e.target.value } : r))} style={{ background: "var(--dw05)", border: "1px solid var(--dw09)", borderRadius: 9, padding: "6px 10px", color: "var(--dtext)", fontSize: 12.5, outline: "none" }} />
                      <span style={{ color: "var(--dw3)", fontSize: 12 }}>to</span>
                      <input type="time" value={row.end} onChange={e => setHours(h => h.map((r, ri) => ri === i ? { ...r, end: e.target.value } : r))} style={{ background: "var(--dw05)", border: "1px solid var(--dw09)", borderRadius: 9, padding: "6px 10px", color: "var(--dtext)", fontSize: 12.5, outline: "none" }} />
                    </div>
                  ) : (
                    <span style={{ color: "var(--dw22)", fontSize: 13, fontStyle: "italic" }}>Closed</span>
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
                <p style={{ color: "var(--dw4)", fontSize: 12.5, margin: 0 }}>Block a window each evening — AutoPilot won&apos;t book clients during this time.</p>
              </div>
              <button onClick={() => setFamilyOn(v => !v)} style={{
                width: 42, height: 24, borderRadius: 12, border: "none", cursor: "pointer", flexShrink: 0,
                background: familyOn ? "rgb(109,40,217)" : "var(--dw12)",
                position: "relative", transition: "background 0.2s",
              }}>
                <span style={{ position: "absolute", top: 4, left: familyOn ? 20 : 4, width: 16, height: 16, borderRadius: "50%", background: "white", transition: "left 0.2s" }} />
              </button>
            </div>
            {familyOn && (
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <span style={{ color: "var(--dw45)", fontSize: 13 }}>Block every evening from</span>
                <input type="time" value={familyStart} onChange={e => setFamilyStart(e.target.value)} style={{ background: "var(--dw07)", border: "1px solid rgba(139,92,246,0.25)", borderRadius: 9, padding: "7px 12px", color: "var(--dtext)", fontSize: 13, outline: "none" }} />
                <span style={{ color: "var(--dw3)", fontSize: 13 }}>to</span>
                <input type="time" value={familyEnd} onChange={e => setFamilyEnd(e.target.value)} style={{ background: "var(--dw07)", border: "1px solid rgba(139,92,246,0.25)", borderRadius: 9, padding: "7px 12px", color: "var(--dtext)", fontSize: 13, outline: "none" }} />
                <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "rgba(139,92,246,0.15)", color: "rgb(167,139,250)", fontWeight: 700 }}>Protected</span>
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 16 }}>
              <button onClick={saveFamilyHours} disabled={savingFamily} style={{
                padding: "9px 18px", borderRadius: 10, border: "none",
                background: "rgb(109,40,217)", color: "white", fontSize: 12.5, fontWeight: 700,
                cursor: savingFamily ? "default" : "pointer", opacity: savingFamily ? 0.6 : 1,
              }}>
                {savingFamily ? "Saving…" : "Save family hours"}
              </button>
              {familySaved && <span style={{ color: "rgb(52,211,153)", fontSize: 12.5, fontWeight: 600 }}>Saved</span>}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 10 }}>
            {hoursSaved && <span style={{ color: "rgb(52,211,153)", fontSize: 12.5, fontWeight: 600 }}>Saved</span>}
            <button onClick={saveBusinessHours} disabled={savingHours} style={{
              padding: "10px 24px", borderRadius: 10, border: "none",
              background: "rgb(109,40,217)", color: "white", fontSize: 13, fontWeight: 700,
              cursor: savingHours ? "default" : "pointer", opacity: savingHours ? 0.6 : 1,
            }}>
              {savingHours ? "Saving…" : "Save business hours"}
            </button>
          </div>
        </>
      )}

      {/* ── Tax & GST ── */}
      {tab === "Tax & GST" && (
        <>
          <div style={card}>
            <SectionLabel>Tax settings</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ color: "var(--dw38)", fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6 }}>Tax rate (%)</label>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <input
                    type="number" value={taxRate} min="0" max="30" step="0.1"
                    onChange={e => setTaxRate(e.target.value)}
                    style={{ width: 100, background: "var(--dw05)", border: "1px solid var(--dw09)", borderRadius: 10, padding: "10px 13px", color: "var(--dtext)", fontSize: 15, fontWeight: 700, outline: "none" }}
                  />
                  <span style={{ color: "var(--dw3)", fontSize: 13 }}>%  (Ontario HST = 13%)</span>
                </div>
              </div>

              <Field label="Business registration number (GST/HST)" value="123456789 RT0001" placeholder="e.g. 123456789 RT0001" />
              <Field label="Legal business name" value="Flow by FFP Inc." />

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderTop: "1px solid var(--dw05)" }}>
                <div>
                  <p style={{ color: "var(--dtext)", fontSize: 13.5, fontWeight: 600, margin: "0 0 2px" }}>Tax-inclusive pricing</p>
                  <p style={{ color: "var(--dw35)", fontSize: 12, margin: 0 }}>Service prices shown already include tax (no tax added at checkout)</p>
                </div>
                <button onClick={() => setTaxInclusive(v => !v)} style={{
                  width: 42, height: 24, borderRadius: 12, border: "none", cursor: "pointer", flexShrink: 0,
                  background: taxInclusive ? "rgb(109,40,217)" : "var(--dw12)",
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
            <p style={{ color: "var(--dw4)", fontSize: 12.5, margin: "0 0 12px" }}>How a C$120 Highlights service would appear on receipts:</p>
            {[
              { label: "Service",  value: "C$120.00",  color: undefined       },
              { label: `HST (${taxRate}%)`, value: taxInclusive ? "Included" : `C$${(120 * parseFloat(taxRate||"0") / 100).toFixed(2)}`, color: undefined },
              { label: "Total",    value: taxInclusive ? "C$120.00" : `C$${(120 * (1 + parseFloat(taxRate||"0") / 100)).toFixed(2)}`, color: "rgb(52,211,153)" },
            ].map(r => (
              <div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--dw04)" }}>
                <span style={{ color: "var(--dw45)", fontSize: 13 }}>{r.label}</span>
                <span style={{ color: r.color ?? "var(--dtext)", fontSize: 13, fontWeight: r.color ? 800 : 600 }}>{r.value}</span>
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
              <p style={{ color: "var(--dw38)", fontSize: 12.5, margin: 0 }}>Configure each flow below — changes take effect immediately.</p>
            </div>
          </div>

          <div style={card}>
            <SectionLabel>Automation flows</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {flows.map((fl, i) => (
                <div key={fl.key} style={{ borderBottom: i < flows.length - 1 ? "1px solid var(--dw04)" : "none" }}>
                  {/* Row */}
                  <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "15px 0" }}>
                    {/* Toggle */}
                    <button onClick={() => toggleFlow(fl.key)} style={{
                      width: 38, height: 22, borderRadius: 11, border: "none", cursor: "pointer", flexShrink: 0,
                      background: fl.enabled ? "rgb(109,40,217)" : "var(--dw1)",
                      position: "relative", transition: "background 0.2s",
                    }}>
                      <span style={{ position: "absolute", top: 3, left: fl.enabled ? 18 : 3, width: 16, height: 16, borderRadius: "50%", background: "white", transition: "left 0.2s" }} />
                    </button>

                    <div style={{ flex: 1 }}>
                      <p style={{ color: fl.enabled ? "var(--dtext)" : "var(--dw35)", fontSize: 13.5, fontWeight: 700, margin: "0 0 2px" }}>{fl.name}</p>
                      <p style={{ color: "var(--dw3)", fontSize: 12, margin: 0 }}>{fl.description}</p>
                    </div>

                    <div style={{ textAlign: "right", marginRight: 10 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, color: "var(--dw3)", background: "var(--dw05)" }}>
                        {fl.channel}
                      </span>
                      <p style={{ color: "var(--dw22)", fontSize: 11, margin: "3px 0 0", whiteSpace: "nowrap" }}>{fl.delay}</p>
                    </div>

                    <button
                      onClick={() => setExpandedFlow(expandedFlow === fl.key ? null : fl.key)}
                      style={{ background: "var(--dw04)", border: "1px solid var(--dw07)", borderRadius: 8, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}
                    >
                      {expandedFlow === fl.key ? <ChevronUp size={13} color="var(--dw4)" /> : <ChevronDown size={13} color="var(--dw4)" />}
                    </button>
                  </div>

                  {/* Expanded editor */}
                  {expandedFlow === fl.key && (
                    <div style={{ background: "var(--dw02)", border: "1px solid var(--dw06)", borderRadius: 12, padding: "16px 18px", marginBottom: 14, display: "flex", flexDirection: "column", gap: 14 }}>
                      <div>
                        <label style={{ color: "var(--dw38)", fontSize: 11.5, fontWeight: 600, display: "block", marginBottom: 6, letterSpacing: "0.03em", textTransform: "uppercase" }}>Message template</label>
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
                          style={{ width: "100%", background: "var(--dw04)", border: "1px solid var(--dw08)", borderRadius: 10, padding: "10px 13px", color: "var(--dw75)", fontSize: 12.5, outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit", lineHeight: 1.6 }}
                        />
                        <p style={{ color: "var(--dw2)", fontSize: 11, margin: "5px 0 0" }}>Variables: {"{{first_name}}"} · {"{{days_since}}"} · {"{{booking_link}}"} · {"{{time}}"} · {"{{business_name}}"}</p>
                      </div>
                      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ color: "var(--dw38)", fontSize: 11.5, fontWeight: 600, display: "block", marginBottom: 6, letterSpacing: "0.03em", textTransform: "uppercase" }}>Channel</label>
                          <select defaultValue={fl.channel} style={{ width: "100%", background: "var(--dw05)", border: "1px solid var(--dw09)", borderRadius: 9, padding: "9px 12px", color: "var(--dtext)", fontSize: 13, outline: "none", cursor: "pointer" }}>
                            <option value="SMS">SMS</option>
                            <option value="Email">Email</option>
                            <option value="Both">SMS + Email</option>
                          </select>
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={{ color: "var(--dw38)", fontSize: 11.5, fontWeight: 600, display: "block", marginBottom: 6, letterSpacing: "0.03em", textTransform: "uppercase" }}>Timing</label>
                          <input defaultValue={fl.delay} style={{ width: "100%", background: "var(--dw05)", border: "1px solid var(--dw09)", borderRadius: 9, padding: "9px 12px", color: "var(--dtext)", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
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
          {/* Current plan */}
          <div style={{
            ...card,
            background: "rgb(23,14,58)",
            border: "1px solid rgba(139,92,246,0.25)",
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: "rgba(109,40,217,0.35)", color: "rgb(196,181,253)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  {currentPlan.label} plan{initialBilling?.isFounder ? " · Founder" : ""}
                </span>
                <p style={{ color: "rgb(250,250,250)", fontSize: 28, fontWeight: 800, margin: "12px 0 4px", letterSpacing: "-0.04em" }}>
                  {currentPlan.monthlyPrice === null
                    ? "Custom"
                    : currentPlan.monthlyPrice === 0
                    ? "Free"
                    : <>C${initialBilling?.billingInterval === "annual" ? currentPlan.annualPrice : currentPlan.monthlyPrice}<span style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.45)" }}>/{initialBilling?.billingInterval === "annual" ? "year" : "month"}</span></>}
                </p>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, margin: 0 }}>
                  {initialBilling?.subscriptionStatus ? `Status: ${initialBilling.subscriptionStatus}` : "No active subscription"}
                </p>
              </div>
              <Shield size={36} color="rgba(139,92,246,0.5)" strokeWidth={1.2} />
            </div>
            {initialBilling?.plan !== "starter" && (
              <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
                <button onClick={manageBilling} disabled={portalLoading} style={{ padding: "9px 18px", borderRadius: 9, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)", fontSize: 13, cursor: portalLoading ? "default" : "pointer", opacity: portalLoading ? 0.6 : 1 }}>
                  {portalLoading ? "Opening…" : "Manage billing (invoices, card, cancel)"}
                </button>
              </div>
            )}
          </div>

          {billingError && (
            <p style={{ color: "rgb(248,113,113)", fontSize: 12.5, margin: 0 }}>{billingError}</p>
          )}

          {/* Founders banner */}
          {initialBilling?.foundersEligible && (
            <div style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.25)", borderRadius: 16, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
              <div>
                <p style={{ color: "rgb(251,191,36)", fontSize: 13.5, fontWeight: 700, margin: "0 0 2px" }}>Founders Beta — {initialBilling.foundersSpotsRemaining} spots left</p>
                <p style={{ color: "var(--dw45)", fontSize: 12.5, margin: 0 }}>40% off your first 12 months on Pro or Pro+, then 25% off forever. Applies automatically at checkout.</p>
              </div>
            </div>
          )}

          {/* Billing interval toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {(["monthly", "annual"] as BillingInterval[]).map(iv => (
              <button key={iv} onClick={() => setBillingInterval(iv)} style={{
                padding: "7px 16px", borderRadius: 20, cursor: "pointer", fontSize: 12.5, fontWeight: 700,
                border: `1px solid ${billingInterval === iv ? "rgba(139,92,246,0.4)" : "var(--dw08)"}`,
                background: billingInterval === iv ? "rgba(109,40,217,0.15)" : "var(--dw03)",
                color: billingInterval === iv ? "rgb(210,196,254)" : "var(--dw4)",
              }}>
                {iv === "monthly" ? "Monthly" : "Annual (2 months free)"}
              </button>
            ))}
          </div>

          {/* Plan cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PLANS.map(plan => {
              const isCurrent = initialBilling?.plan === plan.key;
              const price = plan.monthlyPrice === null ? "Custom" : plan.monthlyPrice === 0 ? "Free" : `C$${billingInterval === "annual" ? plan.annualPrice : plan.monthlyPrice}/${billingInterval === "annual" ? "yr" : "mo"}`;
              return (
                <div key={plan.key} style={{ ...card, border: `1px solid ${isCurrent ? plan.color : "var(--dw07)"}`, display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: plan.color, letterSpacing: "0.06em", textTransform: "uppercase" }}>{plan.label}</span>
                    {plan.badge && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: plan.bg, color: plan.color }}>{plan.badge}</span>}
                  </div>
                  <p style={{ color: "var(--dtext)", fontSize: 20, fontWeight: 800, margin: 0 }}>{price}</p>
                  <p style={{ color: "var(--dw35)", fontSize: 12, margin: 0 }}>{plan.perfectFor}</p>
                  <button
                    onClick={() => selectPlan(plan.key, Boolean(initialBilling?.foundersEligible))}
                    disabled={isCurrent || pendingPlanKey === plan.key}
                    style={{
                      marginTop: 6, padding: "9px 16px", borderRadius: 9, fontSize: 12.5, fontWeight: 700,
                      border: "none", cursor: isCurrent ? "default" : "pointer",
                      background: isCurrent ? "var(--dw05)" : "rgb(109,40,217)",
                      color: isCurrent ? "var(--dw35)" : "white",
                      opacity: pendingPlanKey === plan.key ? 0.6 : 1,
                    }}
                  >
                    {isCurrent ? "Current plan" : pendingPlanKey === plan.key ? "Redirecting…" : plan.key === "enterprise" ? "Contact sales" : "Choose plan"}
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
