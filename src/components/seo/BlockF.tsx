import Link from "next/link";

// "Everything in Flow" (AEO Page Pack block F), near the bottom of every
// vertical x city page. Lists only what the live app does.
const FEATURES: { t: string; b: string }[] = [
  { t: "Bookings", b: "online booking page, calendar, staff assignment and real-time availability." },
  { t: "Clients", b: "full client history and lifetime value, plus automatic segments on Pro and up: New, Loyal, VIP, Overdue, Churn Risk." },
  { t: "Team", b: "staff profiles, availability, invitations and performance." },
  { t: "Tap to Pay", b: "take credit and Interac on an iPhone. No card reader to buy." },
  { t: "Canadian sales tax", b: "GST, HST, PST, RST and QST for all 13 provinces and territories, applied on the final bill." },
  { t: "AI Front Desk", b: "answers client questions and books appointments while you work." },
  { t: "Daily Brief", b: "each morning, today's bookings, yesterday's revenue, AutoPilot activity and what needs your attention." },
  { t: "AutoPilot", b: "No-Show Recovery about an hour after a missed appointment, Last-Minute Slot Filler, win-backs, rebooking reminders and birthday offers, with the revenue it recovered." },
  { t: "Flow Coach", b: "AI coaching on what to change to grow revenue." },
  { t: "Business Health Score", b: "one number that tracks how your business is doing, with what's moving it." },
  { t: "Revenue forecasting", b: "see next month's revenue before it happens." },
];

export default function BlockF() {
  return (
    <section aria-labelledby="everything-in-flow">
      <h2 id="everything-in-flow">Everything in Flow</h2>
      <ul className="seo-features">
        {FEATURES.map(f => <li key={f.t}><strong>{f.t}:</strong> {f.b}</li>)}
      </ul>
      <p>AI Front Desk and the Daily Brief come with Pro. AutoPilot, Flow Coach, the Business Health Score and revenue forecasting come with Pro+. <Link href="/pricing">See plans</Link>.</p>
    </section>
  );
}
