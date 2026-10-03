import type { Metadata } from "next";
import Link from "next/link";
import { H4Header, Arrow } from "../home-4/H4Chrome";
import Footer from "@/components/Footer";
import "../home-4/home-4.css";
import "./autopilot.css";

// Ported from design-imports/flow-landing/autopilot/index.html (home-4 design).

export const metadata: Metadata = {
  title: "AutoPilot | Salon Booking Automation | FlatPurse Flow",
  description: "AutoPilot helps Canadian salon and barbershop owners keep the calendar moving with online booking, reminders, waitlist recovery, follow-ups and payments.",
};

const FEATURES = [
  { n: "01 / SMART BOOKING", t: "Online salon booking, around the clock", b: "Give clients one link to choose a service, pick a barber or stylist, and select an available appointment. They can book when it suits them without a phone call during your busiest hour.", u: "For the booking request that arrives after closing." },
  { n: "02 / NO-SHOW RECOVERY", t: "Put your waitlist to work", b: "When a cancellation leaves a gap, AutoPilot helps reach clients waiting for a slot. Appointment reminders also help clients remember their visit before an empty chair becomes lost revenue.", u: "For the opening you would otherwise have to fill manually." },
  { n: "03 / AI FRONT DESK", t: "Booking questions, with less back-and-forth", b: "AutoPilot helps answer client questions and handle booking conversations through supported messaging channels. Questions that need your judgement can be passed back to you.", u: "For the “Do you have anything Friday?” message." },
  { n: "04 / CLIENT WIN-BACK", t: "Reconnect with clients you haven’t seen", b: "A missed routine can turn into a forgotten regular. Win-back messages help you reconnect with clients who haven’t visited recently, without working through your client list by hand.", u: "For the regular whose next appointment never got booked." },
  { n: "05 / REBOOKING REMINDERS", t: "Help the next appointment happen", b: "Rebooking nudges encourage clients to return for their next service. Keep cuts, colour appointments, and other repeat visits on their radar while leaving them free to choose a time.", u: "For the “I’ve been meaning to book” moment." },
  { n: "06 / PAYMENTS", t: "Connect the appointment to the payment", b: "Bring deposits, tips, and service payments into the booking workflow. Flow takes no marketplace commission; payment processing fees and your plan’s terms still apply.", u: "For fewer loose ends after a busy day." },
];

const FAQ: { q: string; a: React.ReactNode }[] = [
  { q: "What is AutoPilot?", a: "AutoPilot is FlatPurse Flow’s booking automation system for independent salons and barbershops. It connects online booking, appointment reminders, waitlist recovery, booking conversations, client follow-ups, and payments." },
  { q: "Can AutoPilot prevent every no-show?", a: "No. Reminders can help clients remember appointments, and waitlist outreach can help fill a cancelled slot. Results depend on your clients, their availability, your policies, and the way your shop uses the tools." },
  { q: "Is AutoPilot a replacement for my receptionist?", a: "AutoPilot supports routine booking and follow-up tasks. Your team still handles personal service, exceptions, and decisions that need a human." },
  { q: "How do win-back and rebooking reminders differ?", a: "Rebooking reminders prompt a client to arrange their next regular visit. Win-back messages reconnect with clients who have stopped returning or have not visited recently." },
  { q: "Does AutoPilot work for Canadian salons?", a: "FlatPurse Flow is built in Edmonton for Canadian salons and barbershops, with pricing in Canadian dollars. Check your plan for the payment methods and messaging channels available to your shop." },
  { q: "How much does AutoPilot cost?", a: <>Flow offers multiple subscription plans. Visit the <Link href="/pricing">current pricing page</Link> to compare AutoPilot features, limits, and any available offers.</> },
];

export default function AutoPilotPage() {
  return (
    <>
    <div className="h4-page" data-audience="page">
      <a className="skip" href="#main">Skip to content</a>
      <H4Header current="autopilot" />

      <main id="main">
        <section className="ap-hero section">
          <div>
            <div className="eyebrow">AUTOPILOT BY FLATPURSE FLOW</div>
            <h1>Salon booking<br />automation.<br /><em>Less on your plate.</em></h1>
            <p>Bookings, reminders, and follow-ups shouldn’t take over your working day. AutoPilot helps Canadian salon and barbershop owners keep the calendar moving while they focus on the person in the chair.</p>
            <div className="hero-actions">
              <Link className="button" href="/signup">Start your free trial <Arrow /></Link>
              <a className="text-link" href="#features">Explore AutoPilot ↓</a>
            </div>
            <div className="micro">Built in Edmonton for independent shops.</div>
          </div>
          <div className="ap-story">
            <div className="ap-story-top">
              <span>LESS CHASING. MORE CREATING.</span>
              <span className="ap-symbol" aria-hidden="true">✳</span>
            </div>
            <h2>A change of plans.<br />A chance to fill the chair.</h2>
            <ol className="ap-timeline">
              <li><span className="ap-time">09:00</span><div><strong>An appointment opens up</strong><p>A client cancels their afternoon visit.</p></div></li>
              <li><span className="ap-time">NEXT</span><div><strong>Your waitlist gets a nudge</strong><p>AutoPilot reaches out about the available slot.</p></div></li>
              <li><span className="ap-time">THEN</span><div><strong>A client takes the opening</strong><p>They book and follow the payment steps.</p></div></li>
            </ol>
            <div className="ap-story-note">Example workflow. A replacement booking depends on client availability and response.</div>
          </div>
        </section>

        <div className="ap-jump" aria-label="On this page">
          <a href="#features">What it does</a>
          <a href="#how-it-works">How it works</a>
          <a href="#salons">Who it’s for</a>
          <a href="#faq">Questions</a>
        </div>

        <section className="section" id="features">
          <div className="section-heading">
            <div>
              <div className="eyebrow">SIX WAYS TO LIGHTEN YOUR DAY</div>
              <h2>From the first booking<br />to the next visit.</h2>
            </div>
            <p>One connected approach to appointment management, client communication, and getting paid.</p>
          </div>
          <div className="ap-features">
            {FEATURES.map((f) => (
              <article key={f.n}>
                <span className="number">{f.n}</span>
                <h3>{f.t}</h3>
                <p>{f.b}</p>
                <span className="ap-use">{f.u}</span>
              </article>
            ))}
          </div>
          <p className="ap-plan-note">Feature availability and supported channels depend on your plan and setup. <Link href="/pricing">Compare current plan details <Arrow size={13} /></Link></p>
        </section>

        <section className="ap-setup section" id="how-it-works">
          <div>
            <div className="eyebrow">YOUR SHOP. YOUR WAY OF WORKING.</div>
            <h2>How AutoPilot<br />fits into your day.</h2>
            <p>Start with the essentials, then connect the parts of your workflow where you need help.</p>
            <Link className="text-link" href="/signup">Set up your shop <Arrow size={15} /></Link>
          </div>
          <ol>
            <li><strong>Add your services and availability</strong><p>Give your booking page the information clients need: services, staff, appointment times, and your shop’s policies.</p></li>
            <li><strong>Connect your booking workflow</strong><p>Set up payments and the supported communication channels you use with clients. Review what your plan includes.</p></li>
            <li><strong>Share your link and keep an eye on the results</strong><p>Put your booking link on your website and social profiles. Review appointments and follow-ups as clients start using it.</p></li>
          </ol>
        </section>

        <section className="section ap-audience" id="salons">
          <div className="section-heading">
            <div>
              <div className="eyebrow">MADE FOR INDEPENDENT BUSINESSES</div>
              <h2>For salons and barbershops<br />with better things to do.</h2>
            </div>
            <p>Built in Edmonton, with Canadian shop owners at the centre of the experience.</p>
          </div>
          <div className="ap-audience-grid">
            <article><h3>Salon owners</h3><p>Keep service bookings, stylist availability, and repeat visits connected. Spend less time chasing appointment details between clients.</p></article>
            <article><h3>Barbershop owners</h3><p>Make it easier for regulars to find their barber’s next opening, book a cut, and remember their appointment.</p></article>
            <article><h3>Solo professionals</h3><p>Let clients book while you’re working. Bring the admin into one workflow without adding another person to your team.</p></article>
          </div>
          {/* The source linked to a cost calculator on its homepage, which wasn't ported; pricing is the closest real destination. */}
          <Link className="text-link" href="/pricing">Estimate your annual booking costs <Arrow size={15} /></Link>
        </section>

        <section className="faq section" id="faq">
          <div>
            <div className="eyebrow">AUTOPILOT, EXPLAINED</div>
            <h2>Your questions.<br />Answered.</h2>
          </div>
          <div className="questions">
            {FAQ.map((item) => (
              <details key={item.q}>
                <summary>{item.q}<span>+</span></summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
    </div>

    {/* The app's own footer (same as home-3), outside .h4-page so home-4's footer styles don't touch it */}
    <Footer />
    </>
  );
}
