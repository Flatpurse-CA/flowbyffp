"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Check, Mail, MessageSquare, Gift, Users } from "lucide-react";
import { saveClientReferralSettings } from "./actions";

export type ReferralRow = {
  id: string;
  name: string;
  status: "signed_up" | "rewarded";
  credit: "applied" | "owed" | null;
  creditCents: number;
  createdAt: string;
};

export type ClientReferralRow = {
  id: string;
  referrer: string;
  referred: string;
  reward: number;
  rewardUsed: boolean;
  createdAt: string;
};

const card: React.CSSProperties = { background: "var(--dsurface1)", border: "1px solid var(--dw07)", borderRadius: 16 };
const MESSAGE = "I run my shop on FlatPurse Flow: bookings, Tap to Pay and AI that rebooks no-shows. Sign up with my link and we both get a free month:";

export function ReferralsClient({ link, rows, clientReferrals }: {
  link: string; rows: ReferralRow[];
  clientReferrals: { enabled: boolean; reward: number; rows: ClientReferralRow[] };
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked (e.g. insecure context); the link is selectable below.
    }
  };

  const rewarded = rows.filter(r => r.status === "rewarded");
  const earned = rewarded.reduce((s, r) => s + r.creditCents, 0) / 100;
  const text = `${MESSAGE} ${link}`;

  const shareBtn: React.CSSProperties = { display: "flex", alignItems: "center", gap: 7, padding: "9px 14px", borderRadius: 10, background: "var(--dsurface2)", border: "1px solid var(--dw07)", color: "var(--dtext)", fontSize: 13, fontWeight: 600, textDecoration: "none" };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 style={{ color: "var(--dtext)", fontSize: 22, fontWeight: 800, margin: "0 0 3px", letterSpacing: "-0.03em" }}>Referrals</h1>
        <p style={{ color: "var(--dw35)", fontSize: 13, margin: 0 }}>Know another salon, barbershop or spa owner? You both get a free month of Flow.</p>
      </div>

      <div style={{ ...card, padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 34, height: 34, borderRadius: 10, background: "rgb(109,40,217)", display: "grid", placeItems: "center" }}>
            <Gift size={17} color="white" />
          </span>
          <span style={{ color: "var(--dtext)", fontSize: 15, fontWeight: 700 }}>Your referral link</span>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input readOnly value={link} onFocus={e => e.currentTarget.select()} aria-label="Your referral link" style={{ flex: "1 1 260px", minWidth: 0, background: "var(--dsurface2)", border: "1px solid var(--dw07)", borderRadius: 10, color: "var(--dtext)", fontSize: 13.5, padding: "10px 12px" }} />
          <button onClick={copy} style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 18px", borderRadius: 10, background: "rgb(109,40,217)", border: "none", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            {copied ? <Check size={15} /> : <Copy size={15} />} {copied ? "Copied" : "Copy link"}
          </button>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <a href={`sms:?&body=${encodeURIComponent(text)}`} style={shareBtn}><MessageSquare size={14} /> Text</a>
          <a href={`mailto:?subject=${encodeURIComponent("A free month of FlatPurse Flow")}&body=${encodeURIComponent(text)}`} style={shareBtn}><Mail size={14} /> Email</a>
          <a href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer" style={shareBtn}>WhatsApp</a>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
        {[
          { label: "Signed up", value: String(rows.length) },
          { label: "Now paying", value: String(rewarded.length) },
          { label: "Credit earned", value: `C$${earned.toLocaleString("en-CA", { maximumFractionDigits: 2 })}` },
        ].map(s => (
          <div key={s.label} style={{ ...card, padding: "16px 18px" }}>
            <p style={{ color: "var(--dw35)", fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 6px" }}>{s.label}</p>
            <p style={{ color: "var(--dtext)", fontSize: 24, fontWeight: 800, margin: 0 }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div style={{ ...card, padding: 20 }}>
        <div style={{ color: "var(--dtext)", fontSize: 14, fontWeight: 700, marginBottom: 10 }}>How it works</div>
        <ol style={{ margin: 0, paddingLeft: 18, color: "var(--dw5)", fontSize: 13, lineHeight: 1.9 }}>
          <li>Share your link with another business owner.</li>
          <li>They sign up and try Flow free for 14 days.</li>
          <li>When they start paying, you each get one month of your plan as credit on your next bill.</li>
        </ol>
      </div>

      <div style={{ ...card, overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", color: "var(--dtext)", fontSize: 14, fontWeight: 700, borderBottom: "1px solid var(--dw05)" }}>Your referrals</div>
        {rows.length === 0 ? (
          <div style={{ padding: "36px 18px", textAlign: "center", color: "var(--dw25)", fontSize: 13 }}>No referrals yet. Share your link to get started.</div>
        ) : rows.map((r, i) => {
          const paid = r.status === "rewarded";
          const label = !paid ? "On trial" : r.credit === "owed" ? "Credit waiting for your first payment" : "You earned a free month";
          return (
            <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 18px", borderTop: i ? "1px solid var(--dw05)" : "none", flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 180px", minWidth: 0 }}>
                <div style={{ color: "var(--dtext)", fontSize: 13.5, fontWeight: 600 }}>{r.name}</div>
                <div suppressHydrationWarning style={{ color: "var(--dw35)", fontSize: 11.5 }}>Joined {new Date(r.createdAt).toLocaleDateString()}</div>
              </div>
              <span style={{ padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700, color: "white", background: paid ? "rgb(22,163,74)" : "rgb(107,114,128)" }}>{label}</span>
            </div>
          );
        })}
      </div>

      <ClientReferralsSection {...clientReferrals} />
    </div>
  );
}

function ClientReferralsSection({ enabled, reward, rows }: { enabled: boolean; reward: number; rows: ClientReferralRow[] }) {
  const router = useRouter();
  const [on, setOn] = useState(enabled);
  const [amount, setAmount] = useState(String(reward));
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const save = async (nextOn = on) => {
    setSaving(true);
    setMsg(null);
    try {
      await saveClientReferralSettings({ enabled: nextOn, reward: Number(amount) });
      setMsg({ ok: true, text: "Saved" });
      router.refresh();
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Couldn't save" });
      setOn(enabled);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ ...card, padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <span style={{ width: 34, height: 34, borderRadius: 10, background: "rgb(22,163,74)", display: "grid", placeItems: "center" }}>
          <Users size={17} color="white" />
        </span>
        <div style={{ flex: "1 1 220px" }}>
          <div style={{ color: "var(--dtext)", fontSize: 15, fontWeight: 700 }}>Client referrals</div>
          <div style={{ color: "var(--dw35)", fontSize: 12.5 }}>Your clients share a link. Friends get money off their first visit, and the client who referred them gets the same off their next one.</div>
        </div>
        <button
          role="switch"
          aria-checked={on}
          aria-label="Client referrals"
          disabled={saving}
          onClick={() => { const next = !on; setOn(next); save(next); }}
          style={{ width: 46, height: 26, borderRadius: 99, border: "none", cursor: "pointer", background: on ? "rgb(22,163,74)" : "var(--dsurface3)", position: "relative", flexShrink: 0 }}
        >
          <span style={{ position: "absolute", top: 3, left: on ? 23 : 3, width: 20, height: 20, borderRadius: "50%", background: "white", transition: "left 0.15s" }} />
        </button>
      </div>

      <div style={{ display: "flex", alignItems: "flex-end", gap: 10, flexWrap: "wrap" }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 6, color: "var(--dw35)", fontSize: 12 }}>
          Reward for each side (C$)
          <input type="number" min={1} max={500} step={1} value={amount} onChange={e => setAmount(e.target.value)} style={{ width: 120, background: "var(--dsurface2)", border: "1px solid var(--dw07)", borderRadius: 10, color: "var(--dtext)", fontSize: 14, padding: "9px 12px" }} />
        </label>
        <button onClick={() => save()} disabled={saving} style={{ padding: "10px 18px", borderRadius: 10, background: "rgb(109,40,217)", border: "none", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          {saving ? "Saving..." : "Save"}
        </button>
        {msg && <span style={{ fontSize: 12.5, color: msg.ok ? "var(--dgreen-text)" : "var(--dred-text)" }}>{msg.text}</span>}
      </div>
      <p style={{ color: "var(--dw35)", fontSize: 12, margin: 0 }}>
        Applied automatically at booking, up to half the service price. Clients see their link after they book. The referrer&apos;s reward unlocks once their friend&apos;s visit is marked completed.
      </p>

      {rows.length > 0 && (
        <div style={{ borderTop: "1px solid var(--dw05)", paddingTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          {rows.map(r => (
            <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", fontSize: 13 }}>
              <span style={{ color: "var(--dtext)", flex: "1 1 220px" }}><strong>{r.referrer}</strong> referred <strong>{r.referred}</strong></span>
              <span suppressHydrationWarning style={{ color: "var(--dw35)", fontSize: 12 }}>{new Date(r.createdAt).toLocaleDateString()}</span>
              <span style={{ padding: "2px 9px", borderRadius: 99, fontSize: 11, fontWeight: 700, color: "white", background: r.rewardUsed ? "rgb(22,163,74)" : "rgb(107,114,128)" }}>
                {r.rewardUsed ? `C$${r.reward} reward used` : "Reward pending"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
