"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { acceptOffer, cancelPlan, logKept, type CancelContext, type CancelReason, type OfferKind } from "./actions";

// Plain link (not next/link): it downloads a file.
const EXPORT_HREF = "/api/account/export";

const REASONS: [CancelReason, string][] = [
  ["expensive", "Too expensive"],
  ["not_using", "Not using it enough / too hard to set up"],
  ["seasonal", "Seasonal / taking a break"],
  ["missing_feature", "Missing a feature"],
  ["switching", "Switching to another tool"],
  ["technical", "Technical problems"],
  ["closing", "Closing my business"],
  ["other", "Other"],
];
const TOOLS = ["Fresha", "Vagaro", "Square Appointments", "GlossGenius", "Booksy", "Jane", "Other"];
const BILLING = "/dashboard/settings?tab=billing";

const card: React.CSSProperties = { width: "100%", maxWidth: 520, margin: "40px auto", padding: "0 16px", display: "flex", flexDirection: "column", gap: 16 };
const h: React.CSSProperties = { color: "var(--dtext)", fontSize: 22, fontWeight: 800, margin: 0 };
const p: React.CSSProperties = { color: "var(--dw45)", fontSize: 14, lineHeight: 1.6, margin: 0 };
const primary: React.CSSProperties = { background: "rgb(109,40,217)", color: "#fff", border: "none", borderRadius: 10, padding: "13px 0", fontSize: 14.5, fontWeight: 700, cursor: "pointer", width: "100%" };
const ghost: React.CSSProperties = { ...primary, background: "var(--dsurface2)", color: "var(--dtext)" };
const danger: React.CSSProperties = { ...primary, background: "rgb(185,28,28)" };
const money = (n: number) => `C$${n.toFixed(2)}`;

type Offer = { kind: OfferKind; title: string; body: string };

function offerFor(reason: CancelReason, d: CancelContext): Offer | null {
  const pause: Offer = { kind: "pause", title: "Pause instead", body: `Pause for 1, 2 or 3 months at no charge. Your data${d.isFounder ? " and your Founders price are" : " is"} kept.` };
  if (d.trialing) return null; // a trial cancels right away with no charge
  if (d.isFounder) return reason === "closing" || d.pauseMonthsLeft === 0 ? null : pause;
  if (d.offerUsed && reason !== "seasonal") return null;
  switch (reason) {
    case "expensive":
      return d.plan !== "starter" && d.starterSaving > 0
        ? { kind: "downgrade_starter", title: "Move to Starter", body: `Save ${money(d.starterSaving)}/month and keep your bookings and clients. Takes effect on your next billing date.` }
        : { kind: "half_off_2m", title: "50% off your next 2 months", body: "Applied right away. No codes." };
    case "not_using":
      return { kind: "free_month", title: "1 free month + a free setup call", body: "We'll take a month off your bill, and George will help you get set up in a 20-minute call." };
    case "seasonal":
    case "other":
      return d.pauseMonthsLeft > 0 ? pause : null;
    case "missing_feature":
      return d.pauseMonthsLeft > 0 ? { ...pause, body: `We've sent your request to George. ${pause.body}` } : null;
    case "switching":
      return { kind: "half_off_2m", title: "50% off your next 2 months", body: "Remember: Flow charges no marketplace commission on new clients." };
    case "technical":
      return { kind: "free_month", title: "Priority support + 1 free month", body: "We'll reply within 4 business hours and take a month off your bill." };
    default:
      return null;
  }
}

/** In-app cancel flow (FL-066): 4 screens max, "Continue to cancel" always visible. */
export function CancelFlow({ data }: { data: CancelContext }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [reason, setReason] = useState<CancelReason | null>(null);
  const [comment, setComment] = useState("");
  const [detail, setDetail] = useState("");
  const [months, setMonths] = useState(1);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const offer = reason ? offerFor(reason, data) : null;

  const keep = () => start(async () => { await logKept(reason); router.push(BILLING); });
  const accept = () => offer && reason && start(async () => {
    const r = await acceptOffer({ reason, comment, detail, offer: offer.kind, pauseMonths: months });
    if (r.error) setError(r.error); else setDone(r.message ?? "Done!");
  });
  const cancel = () => reason && start(async () => {
    const r = await cancelPlan({ reason, comment, detail, offerShown: offer?.kind ?? "none" });
    if (r.error) setError(r.error);
    else setDone(data.trialing ? "Your trial is cancelled. You won't be charged." : `Your plan is cancelled. Changed your mind? Reactivate anytime before ${r.periodEnd}.`);
  });

  if (done) {
    return (
      <div style={card}>
        <h1 style={h}>{done}</h1>
        <Link href="/dashboard" style={{ ...primary, textAlign: "center", textDecoration: "none" }}>Back to Flow</Link>
      </div>
    );
  }

  return (
    <div style={card}>
      <div style={{ display: "flex", gap: 6 }}>
        {[0, 1, 2, 3].map((i) => <span key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= step ? "rgb(109,40,217)" : "var(--dsurface3)" }} />)}
      </div>

      {step === 0 && (
        <>
          <h1 style={h}>Before you go</h1>
          <p style={{ ...p, color: "var(--dtext)" }}>
            Flow has taken {data.bookings} bookings{data.recovered > 0 ? `, recovered ${money(data.recovered)}` : ""}, and holds {data.clients} client profiles for you.
          </p>
          <p style={p}>If you cancel, your booking page stops taking bookings, AutoPilot stops, and your clients stop getting reminders.</p>
          {data.isFounder && <p style={{ ...p, color: "var(--dtext)", fontWeight: 700 }}>Cancelling ends your Founders price (25% off forever). It can&apos;t be restored.</p>}
          <button type="button" style={primary} onClick={() => router.push(BILLING)}>Keep my plan</button>
          <button type="button" style={ghost} onClick={() => setStep(1)}>Continue to cancel</button>
        </>
      )}

      {step === 1 && (
        <>
          <h1 style={h}>Why are you leaving?</h1>
          <div role="radiogroup" aria-label="Reason for leaving" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {REASONS.map(([k, label]) => (
              <label key={k} style={{ display: "flex", gap: 10, alignItems: "center", padding: "11px 12px", borderRadius: 10, cursor: "pointer", background: reason === k ? "var(--dsurface2)" : "transparent", border: `1px solid ${reason === k ? "rgb(109,40,217)" : "var(--dsurface3)"}`, color: "var(--dtext)", fontSize: 14 }}>
                <input type="radio" name="reason" checked={reason === k} onChange={() => setReason(k)} />
                {label}
              </label>
            ))}
          </div>
          {reason === "missing_feature" && <input value={detail} onChange={(e) => setDetail(e.target.value)} placeholder="Which feature?" style={inputStyle} />}
          {reason === "switching" && (
            <select value={detail} onChange={(e) => setDetail(e.target.value)} style={inputStyle}>
              <option value="">Which tool?</option>
              {TOOLS.map((t) => <option key={t}>{t}</option>)}
            </select>
          )}
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder={reason === "other" ? "Tell us more. Want George to call you? Leave your number." : "Anything else? (optional)"} rows={3} style={inputStyle} />
          <button type="button" style={{ ...primary, opacity: reason ? 1 : 0.5 }} disabled={!reason} onClick={() => setStep(offer ? 2 : 3)}>Continue</button>
        </>
      )}

      {step === 2 && offer && (
        <>
          <h1 style={h}>{offer.title}</h1>
          <p style={{ ...p, color: "var(--dtext)" }}>{offer.body}</p>
          {offer.kind === "pause" && (
            <div role="radiogroup" aria-label="Pause length" style={{ display: "flex", gap: 8 }}>
              {[1, 2, 3].filter((m) => m <= data.pauseMonthsLeft).map((m) => (
                <button key={m} type="button" role="radio" aria-checked={months === m} onClick={() => setMonths(m)} style={{ ...ghost, border: months === m ? "2px solid rgb(109,40,217)" : "2px solid transparent" }}>
                  {m} month{m > 1 ? "s" : ""}
                </button>
              ))}
            </div>
          )}
          <button type="button" style={primary} disabled={pending} onClick={accept}>{pending ? "Applying..." : "Accept offer"}</button>
          <button type="button" style={ghost} onClick={() => setStep(3)}>No thanks, cancel my plan</button>
        </>
      )}

      {step === 3 && (
        <>
          <h1 style={h}>Confirm</h1>
          {data.trialing ? (
            <p style={{ ...p, color: "var(--dtext)" }}>Your trial ends now and you won&apos;t be charged. Your data is kept for 90 days.</p>
          ) : (
            <p style={{ ...p, color: "var(--dtext)" }}>Your plan stays active until {data.periodEnd}. After that your booking page stops taking bookings and AutoPilot stops. Your data is kept for 90 days.</p>
          )}
          {reason === "closing" && <p style={p}>We&apos;re sorry to see you go, and we wish you the very best with what comes next.</p>}
          <a href={EXPORT_HREF} download style={{ color: "var(--dpurple-text)", fontSize: 14 }}>Export my data</a>
          <button type="button" style={danger} disabled={pending} onClick={cancel}>{pending ? "Cancelling..." : "Cancel my plan"}</button>
          <button type="button" style={ghost} onClick={keep}>Keep my plan</button>
        </>
      )}
      {error && <p style={{ color: "rgb(220,38,38)", fontSize: 13, margin: 0 }}>{error}</p>}
    </div>
  );
}

const inputStyle: React.CSSProperties = { width: "100%", boxSizing: "border-box", background: "var(--dsurface1)", border: "1px solid var(--dsurface3)", borderRadius: 10, padding: "10px 12px", color: "var(--dtext)", fontSize: 14, fontFamily: "inherit" };
