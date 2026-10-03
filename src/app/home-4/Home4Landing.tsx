"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Check, RefreshCw } from "lucide-react";
import "./home-4.css";
import { requestDemo } from "./actions";
import Footer from "@/components/Footer";

type Audience = "owners" | "clients";

const OWNER_FEATURES = [
  {
    number: "01 / GET BOOKED",
    title: (
      <>
        One link.
        <br />A full-service front desk.
      </>
    ),
    body: "Clients choose a service, pick their person, and pay a deposit. Your AI front desk handles booking questions, even after hours.",
  },
  {
    number: "02 / FILL THE GAPS",
    title: (
      <>
        A cancellation doesn’t
        <br />have to cost you.
      </>
    ),
    body: "When plans change, Flow reaches your waitlist to fill the opening. Automated reminders help clients make it to the chair.",
  },
  {
    number: "03 / KEEP THEM COMING",
    title: (
      <>
        Turn a great visit
        <br />into the next one.
      </>
    ),
    body: "Timely rebooking nudges and win-back messages keep your regulars coming back, without another task on your list.",
  },
];

function FlowLogo() {
  return (
    <svg className="brand-mark" viewBox="0 0 604 364" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="h4LogoGradient" x1="0" y1="0" x2="604" y2="364" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#534AB7" />
          <stop offset="100%" stopColor="#B05CF0" />
        </linearGradient>
      </defs>
      <g stroke="url(#h4LogoGradient)" strokeWidth="34" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 212C12 132 72 72 152 72H312" />
        <path d="M312 12V352" />
        <path d="M312 72H592C592 122 552 152 502 152H312" />
        <path d="M12 212H592" />
        <path d="M312 212H592C592 262 552 292 502 292H312" />
      </g>
    </svg>
  );
}

const CLIENT_FEATURES = [
  {
    number: "01 / BOOK YOUR WAY",
    symbol: <ArrowUpRight size={22} />,
    title: (
      <>
        A good time.
        <br />On your time.
      </>
    ),
    body: "Open your shop’s booking link whenever you’re ready. Pick a service, choose your stylist or barber, and see available appointment times.",
    tags: ["Online booking", "Your choice of stylist"],
  },
  {
    number: "02 / STAY IN THE LOOP",
    symbol: <Check size={22} />,
    title: (
      <>
        All the details.
        <br />Less to remember.
      </>
    ),
    body: "Booking confirmations and appointment reminders help you keep track of your visit. Your shop’s booking page guides you through any deposit.",
    tags: ["Confirmations", "Helpful reminders"],
  },
  {
    number: "03 / FIND YOUR RHYTHM",
    symbol: <RefreshCw size={20} />,
    title: (
      <>
        Time for a refresh?
        <br />A nudge helps.
      </>
    ),
    body: "Rebooking reminders make it easier to stay in your routine. If your shop offers a waitlist, you can hear when a spot opens up.",
    tags: ["Rebooking nudges", "Waitlist openings"],
  },
];

const OWNER_FAQ: { q: string; a: React.ReactNode }[] = [
  { q: "What is FlatPurse Flow?", a: "Flow is a booking and revenue management platform for independent salons and barbershops. It brings booking, payments, reminders, and client follow-ups together." },
  { q: "What does AutoPilot handle?", a: "AutoPilot helps with appointment reminders, cancellation recovery, rebooking, win-back messages, and client booking questions. Compare plans for the features included." },
  { q: "Is there really zero commission?", a: <>Flow charges a subscription and no marketplace commission. Card processing and per-transaction platform fees apply. <Link href="/pricing">See the fee schedule</Link>.</> },
  { q: "Can I cancel or change my plan?", a: "You can upgrade, downgrade, or cancel your plan. After cancellation, access continues until the end of your billing period. Founders discounts are subject to the offer terms." },
  { q: "Does Flow actually work for a business like mine?", a: <>Flow is designed for independent salons and barbershops. The walkthrough shows an example workflow with demo data, not verified customer results. <a href="#demo">Request a personal demo</a> to explore how it fits your services, team and booking process.</> },
  { q: "What happens when a client cancels?", a: "With the relevant AutoPilot flows enabled, Flow can contact clients to help fill an opening. A replacement booking depends on client availability and response; it is not guaranteed. Watch the simulation above for an example." },
  { q: "How hard is switching to Flow?", a: "You’ll need to set up your services, staff, booking availability and payment settings. Before switching, contact us to confirm which client records can be imported from your current system and what setup help is available." },
  { q: "Which plan includes AutoPilot?", a: <>Starter begins at C$39/month for booking, client management and payments. Pro starts at C$89/month and adds AutoPilot and AI Front Desk. Pro+ starts at C$189/month and adds Flow Coach and business insights. Card processing and platform fees apply. <Link href="/pricing">Compare all features and fees</Link>.</> },
  { q: "What happens after I click Start free trial?", a: <>You’ll go to Flow’s signup page to create your account. No credit card is required to get started. Confirm the current trial duration, included features and any beta offer during signup, or <a href="#demo">ask us before joining</a>.</> },
];

const CLIENT_FAQ: { q: string; a: string }[] = [
  { q: "How do I book an appointment?", a: "Use your salon or barber’s Flow booking link. Choose a service, staff member, and available time, then complete the booking steps." },
  { q: "Where do I find my shop’s link?", a: "Check your shop’s website, social profile, or recent messages. If you can’t find it, ask the shop to send you their direct booking link." },
  { q: "Will I need to pay a deposit?", a: "Your shop sets its own deposit requirements. Review the amount and terms shown during booking before you confirm." },
  { q: "What if my plans change?", a: "Check your booking confirmation for instructions or contact your shop directly. Cancellation windows, refunds, and no-show policies are set by the shop." },
];

const TOOL_CARDS = [
  { number: "01 / SMART BOOKING", title: "A booking page that works 24/7.", body: "Clients choose a service, pick a time, and book without the back-and-forth." },
  { number: "02 / NO-SHOW RECOVERY", title: "Turn empty slots into opportunities.", body: "When plans change, AutoPilot helps reach the next client and fill the opening." },
  { number: "03 / AI FRONT DESK", title: "Answers while you’re with a client.", body: "Routine booking questions get handled around the clock, with human decisions left to you." },
  { number: "04 / REBOOKING", title: "Keep regulars coming back.", body: "Timely reminders help clients return before they disappear from your calendar." },
];

// Optional control so another page (home-5) can show this page as-is for
// Clients and hand the Shop owners choice back. Without props it behaves
// exactly as before.
export default function Home4Landing({ initialAudience = "owners", onAudienceChange }: { initialAudience?: Audience; onAudienceChange?: (a: Audience) => void } = {}) {
  const [audience, setAudienceState] = useState<Audience>(initialAudience);
  const setAudience = (a: Audience) => {
    setAudienceState(a);
    onAudienceChange?.(a);
  };
  const isClients = audience === "clients";

  const [demo, setDemo] = useState({ name: "", email: "", business: "", phone: "", website: "", marketing: false });
  const [demoStatus, setDemoStatus] = useState<{ submitting: boolean; message: string; isError: boolean }>({
    submitting: false,
    message: "",
    isError: false,
  });

  const videoDisclosureRef = useRef<HTMLDetailsElement>(null);
  const disclosureVideoRef = useRef<HTMLVideoElement>(null);

  const toolsVisualRef = useRef<HTMLDivElement>(null);
  const toolCardRefs = useRef<(HTMLElement | null)[]>([]);

  // Sections fade up as they scroll into view. The hiding class is only
  // added once JS runs, so content is never stuck invisible without it.
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".h4-page");
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const targets = Array.from(root.querySelectorAll<HTMLElement>("main section:not(.hero), footer"));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.08 });
    targets.forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.9) el.classList.add("is-in");
      el.classList.add("h4-reveal");
      observer.observe(el);
    });
    return () => observer.disconnect();
  }, [audience]);

  useEffect(() => {
    if (audience !== "owners") return;
    const updateFocus = () => {
      const focus = window.innerHeight * 0.52;
      toolCardRefs.current.forEach((card) => {
        if (!card) return;
        const box = card.getBoundingClientRect();
        const distance = Math.min(1, Math.abs(box.top + box.height / 2 - focus) / (window.innerHeight * 0.8));
        card.style.setProperty("--tool-scale", (1.03 - distance * 0.11).toFixed(3));
        card.style.setProperty("--tool-opacity", (1 - distance * 0.18).toFixed(3));
      });
      const visual = toolsVisualRef.current;
      if (visual) {
        const box = visual.getBoundingClientRect();
        const distance = Math.min(1, Math.abs(box.top + box.height / 2 - focus) / (window.innerHeight * 1.15));
        visual.style.setProperty("--visual-scale", (1 - distance * 0.14).toFixed(3));
        visual.style.setProperty("--visual-opacity", (1 - distance * 0.22).toFixed(3));
      }
    };
    let ticking = false;
    const schedule = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        updateFocus();
        ticking = false;
      });
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    updateFocus();
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [audience]);

  function handleVideoDisclosureToggle() {
    const details = videoDisclosureRef.current;
    if (details && !details.open) {
      disclosureVideoRef.current?.pause();
    }
  }

  async function handleDemoSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!e.currentTarget.reportValidity()) return;
    setDemoStatus({ submitting: true, message: "", isError: false });
    try {
      const { error } = await requestDemo(demo.name, demo.email, demo.business, demo.phone, demo.website, demo.marketing);
      if (error) {
        setDemoStatus({ submitting: false, message: error, isError: true });
      } else {
        setDemo({ name: "", email: "", business: "", phone: "", website: "", marketing: false });
        setDemoStatus({
          submitting: false,
          message: "Thank you — your demo request has been saved. We’ll use your details to follow up.",
          isError: false,
        });
      }
    } catch {
      setDemoStatus({
        submitting: false,
        message: "We couldn’t save your request. Please try again or email support@flatpurse.com.",
        isError: true,
      });
    }
  }

  const pricingNavHref = isClients ? "#booking" : "/pricing";
  const pricingNavLabel = isClients ? "Booking" : "Pricing";
  const ctaHref = isClients ? "#booking" : "/signup";
  const ctaLabel = isClients ? "How to book" : "Start free trial";

  return (
    <>
    <div className="h4-page" data-audience={audience}>
      <a className="skip" href="#main">Skip to content</a>

      <header>
        <Link className="brand" href="/">
          <FlowLogo /> <span>FlatPurse <b>Flow</b></span>
        </Link>
        <nav aria-label="Main navigation">
          <Link href="/about">About</Link>
          <Link href="/autopilot">AutoPilot</Link>
          <Link href={pricingNavHref}>{pricingNavLabel}</Link>
        </nav>
        <div className="nav-end">
          {!isClients && <Link className="login" href="/login">Log in</Link>}
          <Link className="button small" href={ctaHref}>
            {ctaLabel} <ArrowUpRight className="h4-arrow" size={16} aria-hidden="true" />
          </Link>
        </div>
      </header>

      <main id="main">
        {/* ── Hero ── */}
        <section className="hero">
          <img
            id="client-portrait"
            className="client-portrait"
            src="/home4/client-hero.jpg"
            alt="A smiling woman with freshly styled natural curls enjoying a sunny day"
          />
          <div className="hero-copy">
            <fieldset className="audience-toggle">
              <legend className="sr-only">Show benefits for</legend>
              <label>
                <input type="radio" name="audience" value="owners" checked={!isClients} onChange={() => setAudience("owners")} />
                <span>Shop owners</span>
              </label>
              <label>
                <input type="radio" name="audience" value="clients" checked={isClients} onChange={() => setAudience("clients")} />
                <span>Clients</span>
              </label>
            </fieldset>
            <span className="sr-only" role="status">
              {isClients ? "Showing benefits for clients." : "Showing benefits for shop owners."}
            </span>

            {isClients ? (
              <Fragment key="clients">
                <div className="eyebrow"><span className="asterisk">✳</span> FOR YOUR NEXT GOOD HAIR DAY</div>
                <h1>
                  <span className="headline-strip">YOUR TIME.</span><br />
                  <span className="headline-strip accent-strip">YOUR STYLE.</span><br />
                  <span className="headline-strip">ZERO FUSS.</span>
                </h1>
                <p>Book your favourite salon or barber when it suits you. Choose your service, pick your time, and get on with your day.</p>
                <div className="hero-actions">
                  <a className="button" href="#booking">How to book <ArrowUpRight className="h4-arrow" size={16} aria-hidden="true" /></a>
                  <a className="text-link" href="#how">Explore the benefits <span>↓</span></a>
                </div>
                <div className="micro">Your favourite shop. A simpler way to book.</div>
              </Fragment>
            ) : (
              <Fragment key="owners">
                <div className="eyebrow"><span className="asterisk">✳</span> FOR THE PEOPLE BEHIND THE CHAIR</div>
                <h1>
                  <span className="h4-line">Fill more chairs.</span><br />
                  <em className="h4-line">Spend less time<br />managing them.</em>
                </h1>
                <p>Booking, payments and AI follow-ups for Canadian salons and barbershops. Flow helps fill empty slots and bring clients back, while you focus on your craft.</p>
                <div className="hero-actions">
                  <Link className="button" href="/signup">Start your free trial <ArrowUpRight className="h4-arrow" size={16} aria-hidden="true" /></Link>
                  <a className="text-link" href="#demo">Request a personal demo <ArrowUpRight className="h4-arrow" size={16} aria-hidden="true" /></a>
                </div>
                <div className="micro">No credit card required.</div>
              </Fragment>
            )}
          </div>

          {!isClients && (
            <div className="hero-visual">
              <div className="photo" role="img" aria-label="Barber carefully cutting a client’s hair in an independent shop" />
              <div className="photo-caption">Your chair. Your craft. Your business.</div>
              {/* Decorative crop of the illustrative dashboard image shown further down the page */}
              <img className="hero-float" src="/home4/hero-autopilot-card.png" alt="" aria-hidden="true" />
            </div>
          )}
        </section>

        {/* ── AutoPilot / shop tools (owners only) ── */}
        {!isClients && (
          <section className="section shop-tools" id="shop-tools">
            <div className="section-heading">
              <div>
                <div className="eyebrow">AUTOPILOT · ALWAYS ON</div>
                <h2>The tools running your shop<br /><em>while you run your craft.</em></h2>
              </div>
              <p>Flow keeps the busywork moving in the background—booking clients, recovering cancelled slots, answering questions, and bringing regulars back.</p>
            </div>
            <div className="tools-visual" ref={toolsVisualRef}>
              <img src="/home4/flow-dashboard-figures.png" alt="FlatPurse Flow dashboard showing bookings, recovered revenue and AutoPilot activity" loading="lazy" />
            </div>
            <div className="tools-grid">
              {TOOL_CARDS.map((tool, i) => (
                <article
                  className="tool-card"
                  key={tool.number}
                  ref={(el) => {
                    toolCardRefs.current[i] = el;
                  }}
                >
                  <span className="number">{tool.number}</span>
                  <h3>{tool.title}</h3>
                  <p>{tool.body}</p>
                </article>
              ))}
            </div>
            <Link className="text-link" href="/autopilot">See how AutoPilot works <ArrowUpRight className="h4-arrow" size={15} aria-hidden="true" /></Link>
          </section>
        )}

        {/* ── Product preview (owners only) ── */}
        {!isClients && (
          <section className="section product-preview" id="product">
            <div className="section-heading">
              <div>
                <div className="eyebrow">A LOOK INSIDE FLOW</div>
                <h2>Your day, in view.<br /><em>Your next step, clearer.</em></h2>
              </div>
              <p>See bookings, revenue and AutoPilot activity together. Start with a clear picture of your shop, then decide what needs your attention.</p>
            </div>
            <figure>
              <div className="product-browser">
                <span>FlatPurse Flow · Home dashboard</span>
              </div>
              <img
                src="/home4/flow-dashboard-figures.png"
                width={2790}
                height={1584}
                loading="lazy"
                alt="FlatPurse Flow dashboard with illustrative demo figures"
              />
              <figcaption>Realistic demo figures shown for illustration, not verified customer results.</figcaption>
            </figure>
          </section>
        )}

        {/* ── Intro video (both audiences) ── */}
        <section className="section landing-video" id="video">
          <details className="video-disclosure" ref={videoDisclosureRef} onToggle={handleVideoDisclosureToggle}>
            <summary>
              <span>Watch the Flow introduction <small>1 min 22 sec</small></span>
              <span aria-hidden="true">＋</span>
            </summary>
            <div className="landing-video-frame">
              <video ref={disclosureVideoRef} controls playsInline preload="none" poster="/home4/flow-demo-poster.jpg" aria-label="FlatPurse Flow video">
                <source src="/home4/flow-demo.mp4" type="video/mp4" />
                Your browser does not support embedded video. <a href="/home4/flow-demo.mp4">Watch the video</a>.
              </video>
            </div>
          </details>
        </section>

        {/* ── How it works ── */}
        <section className="how section" id="how">
          <div className="section-heading">
            <div>
              <div className="eyebrow">{isClients ? "FROM “I NEED A CUT” TO “SEE YOU SOON”" : "A GOOD DAY, ON REPEAT"}</div>
              <h2>
                {isClients ? (
                  <>Your next visit.<br />Made a little easier.</>
                ) : (
                  <>Your shop keeps moving.<br />Even when you clock out.</>
                )}
              </h2>
            </div>
            <p>
              {isClients
                ? "Less phone tag, fewer forgotten details, and an easier way to make time for yourself."
                : "From the first booking to the next visit, Flow handles the little things that fill your day."}
            </p>
          </div>
          <div className="feature-grid">
            {isClients
              ? CLIENT_FEATURES.map((f) => (
                  <article key={f.number}>
                    <span className="number">{f.number}</span>
                    <div className="feature-symbol">{f.symbol}</div>
                    <h3>{f.title}</h3>
                    <p>{f.body}</p>
                    <div className="tags">
                      {f.tags.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                  </article>
                ))
              : OWNER_FEATURES.map((f) => (
                  <article key={f.number}>
                    <span className="number">{f.number}</span>
                    <h3>{f.title}</h3>
                    <p>{f.body}</p>
                  </article>
                ))}
          </div>
          {!isClients && (
            <p className="ap-home-link">
              <Link className="text-link" href="/autopilot">Explore how AutoPilot works <ArrowUpRight className="h4-arrow" size={15} aria-hidden="true" /></Link>
            </p>
          )}
        </section>

        {/* ── Canada brief (owners only) ── */}
        {!isClients && (
          <section className="section canada-brief" id="canada">
            <div>
              <div className="eyebrow">BUILT IN EDMONTON</div>
              <h2>Canadian roots.<br />Local understanding.</h2>
            </div>
            <div>
              <p>CAD pricing, familiar payment options and support from George in Edmonton.</p>
              <Link className="text-link" href="/about#canada">Meet the people behind Flow →</Link>
            </div>
          </section>
        )}

        {/* ── Pricing brief (owners only) ── */}
        {!isClients && (
          <section className="section pricing-brief" id="pricing">
            <div>
              <div className="eyebrow">ROOM TO GROW</div>
              <h2>Plans from C$39/month.</h2>
              <p>Compare Starter, Pro and Pro+ to find the right fit.<br />Card processing and platform fees apply.</p>
            </div>
            <Link className="button outline" href="/pricing">Compare plans &amp; fees →</Link>
          </section>
        )}

        {/* ── Client booking guide (clients only) ── */}
        {isClients && (
          <section className="section client-booking" id="booking">
            <div>
              <div className="eyebrow">YOUR NEXT APPOINTMENT, WITHOUT THE BACK-AND-FORTH</div>
              <h2>Start with your<br />favourite shop.</h2>
              <p>Open your salon or barber’s Flow booking link from their website, social profile, or a message they’ve sent you.</p>
            </div>
            <ol>
              <li>
                <strong>Find your shop’s booking link</strong>
                <p>Don’t have it? Ask your salon or barber to send it over.</p>
              </li>
              <li>
                <strong>Make it your appointment</strong>
                <p>Choose your service, your person, and an available time.</p>
              </li>
              <li>
                <strong>You’re on the calendar</strong>
                <p>Follow the checkout steps, including any deposit your shop requires, and look out for your confirmation.</p>
              </li>
            </ol>
          </section>
        )}

        {/* ── Demo request (owners only) ── */}
        {!isClients && (
          <section className="section demo-section" id="demo" aria-labelledby="demo-heading">
            <div className="demo-copy">
              <div className="eyebrow">LET’S TALK ABOUT YOUR SHOP</div>
              <h2 id="demo-heading">See what Flow<br /><em>could do for you.</em></h2>
              <p>Tell us a little about your business. We’ll use these details to contact you about a personal walkthrough.</p>
              <p className="demo-help">Prefer email? <a href="mailto:support@flatpurse.com">support@flatpurse.com</a></p>
            </div>
            <form onSubmit={handleDemoSubmit}>
              <h3>Request your personal demo</h3>
              <div className="form-fields">
                <label>
                  Your name
                  <input
                    name="name"
                    required
                    autoComplete="name"
                    maxLength={100}
                    value={demo.name}
                    onChange={(e) => setDemo((d) => ({ ...d, name: e.target.value }))}
                    disabled={demoStatus.submitting}
                  />
                </label>
                <label>
                  Email address
                  <input
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    maxLength={254}
                    value={demo.email}
                    onChange={(e) => setDemo((d) => ({ ...d, email: e.target.value }))}
                    disabled={demoStatus.submitting}
                  />
                </label>
                <label>
                  Business name
                  <input
                    name="business"
                    required
                    autoComplete="organization"
                    maxLength={150}
                    value={demo.business}
                    onChange={(e) => setDemo((d) => ({ ...d, business: e.target.value }))}
                    disabled={demoStatus.submitting}
                  />
                </label>
                <label>
                  Phone <span>(optional)</span>
                  <input
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    maxLength={40}
                    value={demo.phone}
                    onChange={(e) => setDemo((d) => ({ ...d, phone: e.target.value }))}
                    disabled={demoStatus.submitting}
                  />
                </label>
              </div>
              <div className="form-trap" aria-hidden="true">
                <label>
                  Website
                  <input
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={demo.website}
                    onChange={(e) => setDemo((d) => ({ ...d, website: e.target.value }))}
                  />
                </label>
              </div>
              <label className="marketing-choice">
                <input
                  name="marketing"
                  type="checkbox"
                  checked={demo.marketing}
                  onChange={(e) => setDemo((d) => ({ ...d, marketing: e.target.checked }))}
                  disabled={demoStatus.submitting}
                />
                <span>I’d also like occasional Flow product updates and offers. Optional.</span>
              </label>
              <p className="form-privacy">
                We’ll use your details to respond to this request. Marketing updates are optional. <Link href="/privacy">Privacy policy</Link>.
              </p>
              <button className="button" type="submit" disabled={demoStatus.submitting}>
                {demoStatus.submitting ? "Saving your request…" : <>Request my demo <ArrowUpRight className="h4-arrow" size={16} aria-hidden="true" /></>}
              </button>
              <p role="status" aria-live="polite" style={demoStatus.isError ? { color: "#b42318" } : undefined}>
                {demoStatus.message}
              </p>
              <noscript>Please email <a href="mailto:support@flatpurse.com">support@flatpurse.com</a> to request a demo.</noscript>
            </form>
          </section>
        )}

        {/* ── FAQ ── */}
        <section className="faq section" id="faq">
          <div>
            <div className="eyebrow">A FEW THINGS TO KNOW</div>
            <h2>Good questions.<br />Straight answers.</h2>
          </div>
          <div className="questions">
            {(isClients ? CLIENT_FAQ : OWNER_FAQ).map((item) => (
              <details key={item.q}>
                <summary>{item.q}<span>+</span></summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ── Closing ── */}
        <section className="closing">
          {isClients ? (
            <>
              <div className="eyebrow">A LITTLE TIME FOR YOURSELF</div>
              <h2>Your next great visit.<br /><em>One less thing to organise.</em></h2>
              <a className="button" href="#booking">How to book your visit <ArrowUpRight className="h4-arrow" size={16} aria-hidden="true" /></a>
              <p>Start with your salon or barber’s booking link.</p>
            </>
          ) : (
            <>
              <div className="eyebrow">START YOUR NEXT CHAPTER</div>
              <h2>Stop letting your client<br />book your competitors.</h2>
              <p>Start free today. No credit card required. Founders pricing may be available for the first 40 shops: 40% off for 12 months, then 25% off while your subscription stays active.</p>
              <Link className="button" href="/signup">Start your free trial <ArrowUpRight className="h4-arrow" size={16} aria-hidden="true" /></Link>
            </>
          )}
        </section>
      </main>
    </div>

    {/* The app's main footer, outside .h4-page so home-4's footer styles don't touch it */}
    <Footer />
    </>
  );
}
