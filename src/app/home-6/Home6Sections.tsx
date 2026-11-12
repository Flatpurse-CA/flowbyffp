"use client";

// Sections ported from the "FlatPurse Flow — Full Site Redesign" canvas (Home
// artboard), rebuilt with home-5's card/chip/section styles so they sit
// naturally on the existing page. New styles are h6-* in ./home-6.css.

import Link from "next/link";
import {
  UserX, CalendarClock, RotateCcw, MessageCircle, Repeat, Gift,
  Percent, ReceiptText, Smartphone, ShieldCheck, Check, ArrowUpRight,
} from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import "./home-6.css";

function Head({ eyebrow, title, body, align = "center" }: { eyebrow: string; title: React.ReactNode; body?: React.ReactNode; align?: "center" | "left" }) {
  return (
    <div className={`h5-head h5-head-${align}`}>
      <div className="h3-hero-chip h5-chip"><span>{eyebrow}</span></div>
      <h2>{title}</h2>
      {body && <p>{body}</p>}
    </div>
  );
}

const FLOWS = [
  { icon: UserX, t: "No-Show Recovery", d: "When a client misses an appointment, Flow messages them an hour later with a link to rebook." },
  { icon: CalendarClock, t: "Last-Minute Slot Filler", d: "A cancellation opens a slot. Flow offers it to your waitlist and sends the next client a payment link." },
  { icon: RotateCcw, t: "30-Day Win-Back", d: "Clients who have not visited in 30 days get a message inviting them back." },
  { icon: MessageCircle, t: "AI Front Desk", d: "Answers Instagram and WhatsApp messages, books the appointment and hands off to you only when it needs to." },
  { icon: Repeat, t: "Rebooking Reminders", d: "Nudges each client to rebook based on how often they usually come in." },
  { icon: Gift, t: "Birthday and Occasion Offers", d: "Sends an offer on birthdays and on the occasions you choose." },
];

/** The six AutoPilot flows as a card grid. */
export function AutoPilotFlows() {
  return (
    <div className="h5-page h6-wrap">
      <section className="h5-section h6-flows-section" id="autopilot-flows">
        <ScrollReveal>
          <Head
            eyebrow="AUTOPILOT"
            title={<>Six flows that <em>run themselves.</em></>}
            body="Six always-on flows recover no-shows, fill openings and bring clients back. Switch each one on, or pause it, whenever you like."
          />
        </ScrollReveal>
        <div className="h6-grid h6-grid-3">
          {FLOWS.map((f, i) => (
            <ScrollReveal key={f.t} delay={(i % 3) * 80}>
              <article className="h5-card h6-card">
                <div className="h5-icon h6-icon"><f.icon size={22} strokeWidth={1.7} /></div>
                <h3>{f.t}</h3>
                <p>{f.d}</p>
              </article>
            </ScrollReveal>
          ))}
        </div>
        <p className="h6-footnote">
          AI Front Desk starts on Pro. The full AutoPilot is included in Pro+.{" "}
          <Link href="/features">See every feature <ArrowUpRight size={14} strokeWidth={2.2} aria-hidden="true" /></Link>
        </p>
      </section>
    </div>
  );
}

const CLIENT_POINTS = [
  "One booking link that works on any device, day or night",
  "They pick the service, the person and the time themselves",
  "Deposits collected at booking when you ask for one",
  "Confirmations and reminders by SMS and WhatsApp",
  "A prompt to leave a Google review after the visit",
];

/** What clients get, with an illustrative booking screen. */
export function ClientExperience() {
  return (
    <div className="h5-page h6-wrap">
      <section className="h5-section h6-split" id="client-experience">
        <ScrollReveal>
          <div>
            <Head align="left" eyebrow="WHAT YOUR CLIENTS GET" title={<>Booking that takes a few taps, <em>not a phone call.</em></>} />
            <ul className="h6-checks">
              {CLIENT_POINTS.map(p => (
                <li key={p}><span className="h6-check" aria-hidden="true"><Check size={14} strokeWidth={2.6} /></span>{p}</li>
              ))}
            </ul>
            <a href="#for-clients" className="h5-link">See the client experience <ArrowUpRight size={16} strokeWidth={2.2} /></a>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          {/* Illustrative only: a static picture of the booking flow, not a live form */}
          <div className="h5-card h6-booking" role="img" aria-label="Example of a client booking a fade and beard trim with Dre on Saturday at 1:00 pm">
            <div className="h6-booking-head">
              <div className="h6-booking-avatar" aria-hidden="true">S</div>
              <div>
                <strong>Your shop</strong>
                <span>Whyte Ave, Edmonton</span>
              </div>
              <span className="h6-booking-tag">Example</span>
            </div>

            <p className="h6-booking-step">1. Service</p>
            <div className="h6-booking-row h6-on"><div><strong>Fade and beard trim</strong><span>45 min</span></div><b>C$55</b></div>
            <div className="h6-booking-row"><div><strong>Classic cut</strong><span>30 min</span></div><b>C$40</b></div>

            <p className="h6-booking-step">2. With</p>
            <div className="h6-booking-pills">
              <span>Anyone</span><span className="h6-on">Dre</span><span>Maya</span>
            </div>

            <p className="h6-booking-step">3. Time, Sat 14 Nov</p>
            <div className="h6-booking-pills">
              <span>10:30</span><span>11:15</span><span className="h6-on">1:00</span><span>2:30</span>
            </div>

            <div className="h6-booking-confirm">
              <strong>Confirm booking</strong>
              <span>Sat 14 Nov, 1:00 pm with Dre</span>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}

const CANADA = [
  { icon: Percent, t: "0% commission", d: "You pay a flat monthly plan plus standard card processing. Flow takes no cut of your bookings or of new clients." },
  { icon: ReceiptText, t: "Tax handled in 13 provinces and territories", d: "GST, HST and PST are applied for you, with CRA-compliant receipts on every sale." },
  { icon: Smartphone, t: "Tap to Pay, Interac included", d: "Take cards and Interac debit on your iPhone or Android phone. No card reader to buy." },
  { icon: ShieldCheck, t: "Your data stays in Canada", d: "Client data is stored in Canada, encrypted in transit and at rest, and never sold." },
];

/** Canadian payments, tax and data residency. */
export function CanadaPayments() {
  return (
    <div className="h5-page h6-wrap">
      <section className="h5-section" id="canada-payments">
        <ScrollReveal>
          <Head eyebrow="BUILT IN EDMONTON" title={<>Made for how <em>Canadian shops</em> get paid.</>} />
        </ScrollReveal>
        <div className="h6-grid h6-grid-2">
          {CANADA.map((c, i) => (
            <ScrollReveal key={c.t} delay={(i % 2) * 80}>
              <article className="h5-card h6-card h6-card-row">
                <div className="h5-icon h6-icon"><c.icon size={22} strokeWidth={1.7} /></div>
                <div>
                  <h3>{c.t}</h3>
                  <p>{c.d}</p>
                </div>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </section>
    </div>
  );
}

/** Closing call to action above the footer. */
export function TrialCta() {
  return (
    <div className="h5-page h6-wrap">
      <section className="h5-section h6-cta-section" id="trial">
        <ScrollReveal>
          <div className="h6-cta">
            <h2>Stop losing chairs to <span className="h6-nowrap">no-shows.</span></h2>
            <p>Start your free trial today. Founders Beta shops get 40% off Pro or Pro+ for the first year.</p>
            <div className="h5-hero-actions">
              <Link href="/signup" className="h6-cta-primary">Start your free trial</Link>
              <Link href="/demo" className="h5-ghost h5-ghost-dark">
                Book a personal demo <ArrowUpRight size={16} strokeWidth={2.2} />
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
