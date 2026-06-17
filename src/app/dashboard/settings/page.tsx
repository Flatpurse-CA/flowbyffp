"use client";

import { useState } from "react";
import { Copy, Check, Link, Bell, CreditCard, User, Shield } from "lucide-react";

const TABS = [
  { label: "Profile",       Icon: User       },
  { label: "Business",      Icon: Link       },
  { label: "Notifications", Icon: Bell       },
  { label: "Billing",       Icon: CreditCard },
];

function Field({ label, value, type = "text", readOnly }: { label: string; value: string; type?: string; readOnly?: boolean }) {
  return (
    <div>
      <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 500, display: "block", marginBottom: 7 }}>{label}</label>
      <input
        defaultValue={value}
        type={type}
        readOnly={readOnly}
        style={{ width: "100%", background: readOnly ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 10, padding: "10px 13px", color: readOnly ? "rgba(255,255,255,0.35)" : "rgb(250,250,250)", fontSize: 13.5, outline: "none", boxSizing: "border-box", cursor: readOnly ? "default" : "text" }}
      />
    </div>
  );
}

function Toggle({ label, sub, on }: { label: string; sub: string; on: boolean }) {
  const [active, setActive] = useState(on);
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <div>
        <p style={{ color: "rgb(250,250,250)", fontSize: 13.5, fontWeight: 600, margin: "0 0 2px" }}>{label}</p>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, margin: 0 }}>{sub}</p>
      </div>
      <button onClick={() => setActive((v) => !v)} style={{ width: 42, height: 24, borderRadius: 12, border: "none", cursor: "pointer", background: active ? "rgb(109,40,217)" : "rgba(255,255,255,0.12)", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
        <span style={{ position: "absolute", top: 4, left: active ? 20 : 4, width: 16, height: 16, borderRadius: "50%", background: "white", transition: "left 0.2s" }} />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const [tab, setTab] = useState("Profile");
  const [copied, setCopied] = useState(false);
  const bookingLink = "flowbyffp.co/book/nnamdi";

  const copyLink = () => {
    navigator.clipboard.writeText(bookingLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const card: React.CSSProperties = { background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "24px 26px" };

  return (
    <div style={{ maxWidth: 780, margin: "0 auto", display: "flex", flexDirection: "column", gap: 22 }}>

      {/* Header */}
      <div>
        <h1 style={{ color: "rgb(250,250,250)", fontSize: 22, fontWeight: 800, margin: "0 0 3px", letterSpacing: "-0.03em" }}>Settings</h1>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, margin: 0 }}>Manage your account and preferences</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 2, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 4, alignSelf: "flex-start" }}>
        {TABS.map(({ label, Icon }) => (
          <button
            key={label}
            onClick={() => setTab(label)}
            style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 16px", borderRadius: 9, border: "none", cursor: "pointer", fontSize: 13, fontWeight: tab === label ? 700 : 500, background: tab === label ? "rgba(109,40,217,0.45)" : "transparent", color: tab === label ? "rgb(210,196,254)" : "rgba(255,255,255,0.42)", transition: "all 0.15s" }}
          >
            <Icon size={14} strokeWidth={tab === label ? 2.2 : 1.7} />
            {label}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {tab === "Profile" && (
        <>
          <div style={card}>
            <p style={{ color: "rgb(250,250,250)", fontSize: 14, fontWeight: 700, margin: "0 0 18px" }}>Personal information</p>
            <div style={{ display: "flex", gap: 14, marginBottom: 18 }}>
              <div style={{ flex: 1 }}><Field label="First name" value="Nnamdi" /></div>
              <div style={{ flex: 1 }}><Field label="Last name" value="Obi" /></div>
            </div>
            <div style={{ marginBottom: 18 }}><Field label="Email address" value="nnamdikbobi@gmail.com" type="email" /></div>
            <div><Field label="Phone number" value="+1 647 000 0000" type="tel" /></div>
          </div>

          <div style={card}>
            <p style={{ color: "rgb(250,250,250)", fontSize: 14, fontWeight: 700, margin: "0 0 4px" }}>Change password</p>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, margin: "0 0 18px" }}>Leave blank to keep your current password</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Field label="Current password"  value="" type="password" />
              <Field label="New password"      value="" type="password" />
              <Field label="Confirm new password" value="" type="password" />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button style={{ padding: "10px 20px", borderRadius: 10, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", fontSize: 13, cursor: "pointer" }}>Cancel</button>
            <button style={{ padding: "10px 24px", borderRadius: 10, background: "rgb(109,40,217)", border: "none", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Save changes</button>
          </div>
        </>
      )}

      {/* Business tab */}
      {tab === "Business" && (
        <>
          <div style={card}>
            <p style={{ color: "rgb(250,250,250)", fontSize: 14, fontWeight: 700, margin: "0 0 18px" }}>Business details</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Field label="Business name" value="Flow by FFP" />
              <Field label="Business type" value="Hair salon / Stylist" />
              <Field label="City" value="Toronto, ON" />
              <Field label="Website (optional)" value="" />
            </div>
          </div>

          <div style={card}>
            <p style={{ color: "rgb(250,250,250)", fontSize: 14, fontWeight: 700, margin: "0 0 4px" }}>Your booking link</p>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, margin: "0 0 16px" }}>Share this link with clients to let them book directly</p>
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 10, padding: "10px 13px" }}>
                <Link size={13} color="rgba(255,255,255,0.3)" />
                <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 13 }}>{bookingLink}</span>
              </div>
              <button onClick={copyLink} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", borderRadius: 10, background: copied ? "rgba(52,211,153,0.15)" : "rgba(255,255,255,0.06)", border: `1px solid ${copied ? "rgba(52,211,153,0.3)" : "rgba(255,255,255,0.1)"}`, color: copied ? "rgb(52,211,153)" : "rgba(255,255,255,0.5)", fontSize: 13, cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap" }}>
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? "Copied!" : "Copy link"}
              </button>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button style={{ padding: "10px 24px", borderRadius: 10, background: "rgb(109,40,217)", border: "none", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Save changes</button>
          </div>
        </>
      )}

      {/* Notifications tab */}
      {tab === "Notifications" && (
        <div style={card}>
          <p style={{ color: "rgb(250,250,250)", fontSize: 14, fontWeight: 700, margin: "0 0 4px" }}>Notification preferences</p>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, margin: "0 0 18px" }}>Choose what you hear about</p>
          <Toggle label="New booking"           sub="Get notified when a client books an appointment" on={true} />
          <Toggle label="Booking cancellation"  sub="Alert when a booking is cancelled"               on={true} />
          <Toggle label="AutoPilot activity"    sub="Daily digest of what AutoPilot did"              on={true} />
          <Toggle label="No-show alert"         sub="When a client doesn't show up"                   on={false} />
          <Toggle label="Weekly summary"        sub="Revenue and bookings recap every Monday"         on={true} />
          <Toggle label="Payment received"      sub="When a client pays online"                       on={false} />
        </div>
      )}

      {/* Billing tab */}
      {tab === "Billing" && (
        <>
          <div style={{ ...card, background: "linear-gradient(135deg, rgb(15,11,40), rgb(28,16,70))", border: "1px solid rgba(139,92,246,0.25)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: "rgba(109,40,217,0.35)", color: "rgb(196,181,253)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Pro plan</span>
                <p style={{ color: "rgb(250,250,250)", fontSize: 28, fontWeight: 800, margin: "12px 0 4px", letterSpacing: "-0.04em" }}>C$29<span style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.45)" }}>/month</span></p>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, margin: 0 }}>Renews Jul 17, 2026</p>
              </div>
              <Shield size={36} color="rgba(139,92,246,0.5)" strokeWidth={1.2} />
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
              <button style={{ padding: "9px 18px", borderRadius: 9, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)", fontSize: 13, cursor: "pointer" }}>Manage plan</button>
              <button style={{ padding: "9px 18px", borderRadius: 9, background: "linear-gradient(90deg, rgb(109,40,217), rgb(99,102,241))", border: "none", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Upgrade to Elite</button>
            </div>
          </div>

          <div style={card}>
            <p style={{ color: "rgb(250,250,250)", fontSize: 14, fontWeight: 700, margin: "0 0 18px" }}>Payment method</p>
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

          <div style={card}>
            <p style={{ color: "rgb(250,250,250)", fontSize: 14, fontWeight: 700, margin: "0 0 14px" }}>Recent invoices</p>
            {[
              { date: "Jun 17, 2026", amount: "C$29.00", status: "Paid" },
              { date: "May 17, 2026", amount: "C$29.00", status: "Paid" },
              { date: "Apr 17, 2026", amount: "C$29.00", status: "Paid" },
            ].map((inv, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>{inv.date}</span>
                <span style={{ color: "rgb(250,250,250)", fontSize: 13, fontWeight: 600 }}>{inv.amount}</span>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: "rgba(52,211,153,0.1)", color: "rgb(52,211,153)" }}>{inv.status}</span>
                <button style={{ fontSize: 12, color: "rgba(139,92,246,0.7)", background: "none", border: "none", cursor: "pointer" }}>Download</button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
