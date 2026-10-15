"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, ArrowDown, MapPin, Tag } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
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
 * home-3. Any link to "#demo" on the page (hero button, FAQ answers) goes to
 * the /demo walkthrough page instead of scrolling to a section.
 */
export function AudienceProvider({ children }: { children: React.ReactNode }) {
  const [audience, setAudience] = useState<Audience>("owners");
  const router = useRouter();

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement | null)?.closest?.('a[href="#demo"]');
      if (!link) return;
      e.preventDefault();
      router.push("/demo");
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [router]);

  return (
    <AudienceContext.Provider value={{ audience, setAudience }}>
      {children}
    </AudienceContext.Provider>
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
                <p>Compare Starter, Pro and Pro+ to find the right fit.<br />Card processing fees apply.</p>
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
