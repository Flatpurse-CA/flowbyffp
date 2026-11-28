import Link from "next/link";
import { FOUNDERS_TOTAL } from "@/lib/founders";
import "./founders-beta.css";

const CARDS = [
  { t: "A direct line to the founder", d: "Founders Beta support comes from George, in Edmonton. What you ask for goes straight into the product." },
  { t: "Founders pricing, locked in", d: "At least 25% off every plan, for as long as you stay subscribed." },
  { t: "Try all of it first", d: "14 days of Pro+ free, card required. Cancel before day 14 and you pay nothing." },
];

/** Honest social proof for a new product: replaces the testimonial sections. */
export default function FoundersBeta({ spotsLeft }: { spotsLeft: number | null }) {
  return (
    <section className="fb-section" id="founders-beta">
      <div className="fb-wrap">
        <div className="fb-head">
          <p className="fb-eyebrow">Founders Beta</p>
          <h2>Be one of the first 40 shops on Flow.</h2>
          <p className="fb-sub">Flow is new, and we would rather tell you that than pretend otherwise. The first 40 shops get founder pricing and a direct line to the person building it.</p>
          {spotsLeft !== null && (
            <p className="fb-counter">
              {spotsLeft >= FOUNDERS_TOTAL
                ? <>All <strong>{FOUNDERS_TOTAL}</strong> Founders spots are still open.</>
                : <><strong>{FOUNDERS_TOTAL - spotsLeft}</strong> of {FOUNDERS_TOTAL} Founders spots claimed.</>}
            </p>
          )}
        </div>
        <div className="fb-cards">
          {CARDS.map((c, i) => (
            <div key={c.t} className="fb-card">
              <span className="fb-num">{String(i + 1).padStart(2, "0")}</span>
              <h3>{c.t}</h3>
              <p>{c.d}</p>
            </div>
          ))}
        </div>
        <div className="fb-note">
          <p className="fb-note-label" style={{ margin: "0 0 10px", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.7 }}>A note from the founder</p>
          <blockquote>&ldquo;Flow is brand new, and the first businesses to join get to help shape it. Try it free for 14 days. If you stay, Founders lock in at least 25% off for as long as they stay subscribed, and get a direct line to me.&rdquo;</blockquote>
          <div className="fb-note-foot">
            <p><strong>George Ogunbande</strong><span>Founder, FlatPurse Flow</span></p>
            <Link href="/signup" className="fb-btn">Claim a Founders spot</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
