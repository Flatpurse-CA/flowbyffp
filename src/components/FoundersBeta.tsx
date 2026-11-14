import Link from "next/link";
import { FOUNDERS_TOTAL } from "@/lib/founders";
import "./founders-beta.css";

const CARDS = [
  { t: "A direct line to the founder", d: "Founders Beta support comes from George, in Edmonton. What you ask for goes straight into the product." },
  { t: "Founders pricing, locked in", d: "40% off your first year, then 25% off for as long as you stay subscribed." },
  { t: "Try all of it first", d: "14 days of Pro+ free. No contracts. Cancel any time." },
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
          <blockquote>&ldquo;Flow is new, so I am not going to show you reviews we have not earned yet. Try it for 14 days and tell me what is missing.&rdquo;</blockquote>
          <div className="fb-note-foot">
            <p><strong>George Ogunbande</strong><span>Founder, FlatPurse Flow</span></p>
            <Link href="/signup" className="fb-btn">Claim a Founders spot</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
