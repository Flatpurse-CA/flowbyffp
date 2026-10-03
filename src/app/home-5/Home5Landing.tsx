"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { X, ArrowUpRight, ArrowDown, MapPin, Tag } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { requestDemo } from "../home-4/actions";
import Home4Landing from "../home-4/Home4Landing";
import "../home-4/home-4.css";
import "./home-5.css";

type Audience = "owners" | "clients";


const SPARKLE = "M10,21.236,6.755,14.745.264,11.5,6.755,8.255,10,1.764l3.245,6.491L19.736,11.5l-6.491,3.245ZM18,21l1.5,3L21,21l3-1.5L21,18l-1.5-3L18,18l-3,1.5ZM19.333,4.667,20.5,7l1.167-2.333L24,3.5,21.667,2.333,20.5,0,19.333,2.333,17,3.5Z";

/** home-3's gradient-bordered chip, used for every section eyebrow. */
function Chip({ children }: { children: React.ReactNode }) {
  return (
    <div className="h3-hero-chip h5-chip">
      <span>{children}</span>
    </div>
  );
}

function SectionHead({ eyebrow, title, body, align = "center" }: { eyebrow: string; title: React.ReactNode; body?: React.ReactNode; align?: "center" | "left" }) {
  return (
    <div className={`h5-head h5-head-${align}`}>
      <Chip>{eyebrow}</Chip>
      <h2>{title}</h2>
      {body && <p>{body}</p>}
    </div>
  );
}

const AudienceContext = createContext<{ audience: Audience; setAudience: (a: Audience) => void }>({ audience: "owners", setAudience: () => {} });

/**
 * Shares the Shop owners / Clients choice across the home-4 blocks added into
 * home-3, and owns the demo-request popup: any link to "#demo" on the page
 * (hero button, FAQ answers) opens it instead of scrolling to a section.
 */
export function AudienceProvider({ children }: { children: React.ReactNode }) {
  const [audience, setAudience] = useState<Audience>("owners");
  const [demoOpen, setDemoOpen] = useState(false);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement | null)?.closest?.('a[href="#demo"]');
      if (!link) return;
      e.preventDefault();
      setDemoOpen(true);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <AudienceContext.Provider value={{ audience, setAudience }}>
      {children}
      {demoOpen && <DemoModal onClose={() => setDemoOpen(false)} />}
    </AudienceContext.Provider>
  );
}

/** home-4's demo request (copy + form), shown as a popup. */
function DemoModal({ onClose }: { onClose: () => void }) {
  const [demo, setDemo] = useState({ name: "", email: "", business: "", phone: "", website: "", marketing: false });
  const [demoStatus, setDemoStatus] = useState<{ submitting: boolean; message: string; isError: boolean }>({ submitting: false, message: "", isError: false });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

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
        setDemoStatus({ submitting: false, message: "Thank you — your demo request has been saved. We’ll use your details to follow up.", isError: false });
      }
    } catch {
      setDemoStatus({ submitting: false, message: "We couldn’t save your request. Please try again or email support@flatpurse.com.", isError: true });
    }
  }

  return (
    <div className="h5-page h5-modal-backdrop" onClick={onClose}>
      <div className="h5-modal" role="dialog" aria-modal="true" aria-labelledby="demo-heading" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="h5-modal-close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
        <div className="h5-demo-copy">
          <Chip>LET’S TALK ABOUT YOUR SHOP</Chip>
          <h2 id="demo-heading">See what Flow<br /><em>could do for you.</em></h2>
          <p>Tell us a little about your business. We’ll use these details to contact you about a personal walkthrough.</p>
          <p className="h5-demo-help">Prefer email? <a href="mailto:support@flatpurse.com">support@flatpurse.com</a></p>
        </div>
          <form className="h5-form h5-modal-form" onSubmit={handleDemoSubmit}>
          <h3>Request your personal demo</h3>
          <div className="h5-fields">
            <label>Your name
              <input name="name" autoFocus required autoComplete="name" maxLength={100} value={demo.name} onChange={(e) => setDemo((d) => ({ ...d, name: e.target.value }))} disabled={demoStatus.submitting} />
            </label>
            <label>Email address
              <input name="email" type="email" required autoComplete="email" maxLength={254} value={demo.email} onChange={(e) => setDemo((d) => ({ ...d, email: e.target.value }))} disabled={demoStatus.submitting} />
            </label>
            <label>Business name
              <input name="business" required autoComplete="organization" maxLength={150} value={demo.business} onChange={(e) => setDemo((d) => ({ ...d, business: e.target.value }))} disabled={demoStatus.submitting} />
            </label>
            <label><span className="h5-label">Phone <span>(optional)</span></span>
              <input name="phone" type="tel" autoComplete="tel" maxLength={40} value={demo.phone} onChange={(e) => setDemo((d) => ({ ...d, phone: e.target.value }))} disabled={demoStatus.submitting} />
            </label>
          </div>
          <div className="h5-trap" aria-hidden="true">
            <label>Website
              <input name="website" tabIndex={-1} autoComplete="off" value={demo.website} onChange={(e) => setDemo((d) => ({ ...d, website: e.target.value }))} />
            </label>
          </div>
          <label className="h5-check">
            <input name="marketing" type="checkbox" checked={demo.marketing} onChange={(e) => setDemo((d) => ({ ...d, marketing: e.target.checked }))} disabled={demoStatus.submitting} />
            <span>I’d also like occasional Flow product updates and offers. Optional.</span>
          </label>
          <p className="h5-privacy">We’ll use your details to respond to this request. Marketing updates are optional. <Link href="/privacy">Privacy policy</Link>.</p>
          <button className="h3-cta-btn h5-submit" type="submit" disabled={demoStatus.submitting}>
            <svg viewBox="0 0 24 24" className="h3-cta-sparkle"><path d={SPARKLE} /></svg>
            <span className="h3-cta-text">{demoStatus.submitting ? "Saving your request…" : "Request my demo"}</span>
          </button>
          <p role="status" aria-live="polite" className="h5-status" style={demoStatus.isError ? { color: "#b42318" } : undefined}>{demoStatus.message}</p>
          <noscript>Please email <a href="mailto:support@flatpurse.com">support@flatpurse.com</a> to request a demo.</noscript>
        </form>
      </div>
    </div>
  );
}

function useAudience() {
  const { audience, setAudience } = useContext(AudienceContext);
  return { audience, setAudience, isClients: audience === "clients" };
}

/** Shop owners / Clients switch for the hero, in place of home-3's chip. Same shared state as the sections below. */
export function HeroAudienceToggle() {
  const { setAudience, isClients } = useAudience();
  return (
    <>
      <fieldset className="h5-toggle h5-toggle-hero">
        <legend className="sr-only">Show benefits for</legend>
        <label>
          <input type="radio" name="hero-audience" value="owners" checked={!isClients} onChange={() => setAudience("owners")} />
          <span>Shop owners</span>
        </label>
        <label>
          <input type="radio" name="hero-audience" value="clients" checked={isClients} onChange={() => setAudience("clients")} />
          <span>Clients</span>
        </label>
      </fieldset>
      <span className="sr-only" role="status">{isClients ? "Showing benefits for clients." : "Showing benefits for shop owners."}</span>
    </>
  );
}

/**
 * Clients see home-4's page exactly as it is (nothing combined with home-3);
 * Shop owners see the home-5 page passed in. Choosing Shop owners on the
 * home-4 page hands control back here.
 */
export function PageSwitch({ owners }: { owners: React.ReactNode }) {
  const { setAudience, isClients } = useAudience();
  useEffect(() => { window.scrollTo(0, 0); }, [isClients]);
  if (!isClients) return <>{owners}</>;
  return <Home4Landing initialAudience="clients" onAudienceChange={setAudience} />;
}

/** Hero headline, paragraph and buttons; switches with the audience toggle (home-4 copy for each side). */
export function HeroCopy() {
  const { audience, isClients } = useAudience();
  return (
    <div key={audience} className="h5-hero-copy-swap">
      <h1 className="h3-hero-h1 h5-hero-h1">
        {isClients ? (
          <>YOUR TIME.<br /><span className="h5-hero-accent">YOUR STYLE.</span><br />ZERO FUSS.</>
        ) : (
          <>Fill more chairs.<br /><span className="h5-hero-accent">Spend less time managing them.</span></>
        )}
      </h1>
      <p className="h5-hero-lede">
        {isClients
          ? "Book your favourite salon or barber when it suits you. Choose your service, pick your time, and get on with your day."
          : "Booking, payments and AI follow-ups for Canadian salons and barbershops. Flow helps fill empty slots and bring clients back, while you focus on your craft."}
      </p>
      <div className="h5-hero-actions">
        {isClients ? (
          <a href="#booking" className="h3-cta-btn">
            <svg viewBox="0 0 24 24" className="h3-cta-sparkle"><path d={SPARKLE} /></svg>
            <span className="h3-cta-text">How to book</span>
          </a>
        ) : (
          <Link href="/signup" className="h3-cta-btn">
            <svg viewBox="0 0 24 24" className="h3-cta-sparkle"><path d={SPARKLE} /></svg>
            <span className="h3-cta-text">Start your free trial</span>
          </Link>
        )}
        <a href={isClients ? "#booking" : "#demo"} className="h5-ghost h5-ghost-dark">
          {isClients ? <>Explore the benefits <ArrowDown size={16} strokeWidth={2.2} /></> : <>Request a personal demo <ArrowUpRight size={16} strokeWidth={2.2} /></>}
        </a>
      </div>
      <p className="h5-hero-micro">{isClients ? "Your favourite shop. A simpler way to book." : "No credit card required."}</p>
    </div>
  );
}

/** home-4's hero, tools, product, video, how-it-works, booking guide and briefs, styled like home-3. */
export function Home5Main() {
  const { isClients } = useAudience();

  return (
    <div className="h5-page h5-block">
        {!isClients && (
          <section className="h5-section h5-duo">
            <ScrollReveal>
              <article className="h5-card h5-brief" id="canada">
                <div className="h5-icon" style={{ color: "#059669", background: "rgba(5,150,105,0.08)" }}><MapPin size={22} strokeWidth={1.6} /></div>
                <Chip>BUILT IN EDMONTON</Chip>
                <h2>Canadian roots.<br />Local understanding.</h2>
                <p>CAD pricing, familiar payment options and support from George in Edmonton.</p>
                <Link className="h5-link" href="/about#canada">Meet the people behind Flow →</Link>
              </article>
            </ScrollReveal>
            <ScrollReveal delay={90}>
              <article className="h5-card h5-brief h5-brief-dark" id="pricing">
                <div className="h5-icon" style={{ color: "#fff", background: "rgba(255,255,255,0.12)" }}><Tag size={22} strokeWidth={1.6} /></div>
                <Chip>ROOM TO GROW</Chip>
                <h2>Plans from C$39/month.</h2>
                <p>Compare Starter, Pro and Pro+ to find the right fit.<br />Card processing and platform fees apply.</p>
                <Link className="h5-pill-btn" href="/pricing">Compare plans &amp; fees →</Link>
              </article>
            </ScrollReveal>
          </section>
        )}

        {isClients && (
          <section className="h5-section h5-booking" id="booking">
            <ScrollReveal>
              <SectionHead
                align="left"
                eyebrow="YOUR NEXT APPOINTMENT, WITHOUT THE BACK-AND-FORTH"
                title={<>Start with your<br />favourite shop.</>}
                body="Open your salon or barber’s Flow booking link from their website, social profile, or a message they’ve sent you."
              />
            </ScrollReveal>
            <ol className="h5-steps">
              {[
                { t: "Find your shop’s booking link", d: "Don’t have it? Ask your salon or barber to send it over." },
                { t: "Make it your appointment", d: "Choose your service, your person, and an available time." },
                { t: "You’re on the calendar", d: "Follow the checkout steps, including any deposit your shop requires, and look out for your confirmation." },
              ].map((step, i) => (
                <ScrollReveal key={step.t} delay={i * 90}>
                  <li className="h5-card">
                    <span className="h5-step-n">{i + 1}</span>
                    <div>
                      <strong>{step.t}</strong>
                      <p>{step.d}</p>
                    </div>
                  </li>
                </ScrollReveal>
              ))}
            </ol>
          </section>
        )}

    </div>
  );
}

/** home-4's footer links, email and socials, added inside home-3's footer. */
export function Home5FooterRow() {
  return (
    <div className="h5-footer-row">
      <nav aria-label="Footer">
        <Link href="/pricing">Pricing</Link>
        <Link href="/about">About</Link>
        <Link href="/autopilot">AutoPilot</Link>
        <Link href="/terms">Terms</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/refund-policy">Refunds</Link>
      </nav>
      <a className="h5-footer-email" href="mailto:support@flatpurse.com">support@flatpurse.com</a>
      <div className="h5-social" aria-label="Social media">
        <span>Follow along</span>
        <a href="https://www.instagram.com/flatpurse/" target="_blank" rel="noopener noreferrer" aria-label="FlatPurse on Instagram (opens in a new tab)" title="Instagram">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>
        </a>
        <a href="https://www.facebook.com/flatpurse/" target="_blank" rel="noopener noreferrer" aria-label="FlatPurse on Facebook (opens in a new tab)" title="Facebook">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.51 1.5-3.9 3.78-3.9 1.09 0 2.23.2 2.23.2v2.45H15.2c-1.24 0-1.63.77-1.63 1.56V12h2.77l-.44 2.89h-2.33v6.99A10 10 0 0 0 22 12Z" /></svg>
        </a>
        <a href="https://ca.linkedin.com/company/flatpurse" target="_blank" rel="noopener noreferrer" aria-label="FlatPurse on LinkedIn (opens in a new tab)" title="LinkedIn">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.049c.476-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124ZM7.119 20.452H3.555V9h3.564v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003Z" /></svg>
        </a>
      </div>
    </div>
  );
}
