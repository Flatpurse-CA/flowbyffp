"use client";

// "For clients" page, ported from the redesign canvas (Clients artboard).
// Shown by the homepage when the audience is "clients" (nav "For clients"),
// in place of home-4's old clients landing.

import { useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, Check, Copy, Menu, X } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import Footer from "@/components/Footer";
import "./clients.css";

const STEPS = [
  { t: "Open your shop's link", d: "Your shop shares its booking link, or you tap it on their Instagram page. Open it whenever you are ready, day or night." },
  { t: "Pick your service, person and time", d: "Choose your stylist or barber and see their open times. If your shop takes a deposit, the page walks you through it." },
  { t: "Get reminders, then rebook", d: "You get a confirmation and a reminder before your visit, and a nudge when it is time for a refresh. If your shop runs a waitlist, you hear when a spot opens." },
];

const SHARE_URL = "https://flow.flatpurse.com";
const SHARE_TEXT = "I'd love to book with you online. Have a look at Flow, it takes under a day to set up:";

export default function ClientsLanding({ onOwners }: { onOwners: () => void }) {
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(SHARE_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard blocked; nothing to do */ }
  };

  const invite = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try { await navigator.share({ title: "FlatPurse Flow", text: SHARE_TEXT, url: SHARE_URL }); return; } catch { return; }
    }
    window.location.href = `mailto:?subject=${encodeURIComponent("Online booking for your shop")}&body=${encodeURIComponent(`${SHARE_TEXT} ${SHARE_URL}`)}`;
  };

  const toOwners = () => { setMenuOpen(false); onOwners(); };

  return (
    <div className="hc-page">
      <header className="hc-header">
        <button type="button" className="hc-logo" onClick={toOwners} aria-label="FlatPurse Flow home">
          <img src="/home3/logo-mark.svg" alt="" width={28} height={28} />
          <span><strong>FlatPurse</strong> Flow</span>
        </button>
        <nav aria-label="Main" className="hc-nav">
          <button type="button" onClick={toOwners}>Home</button>
          <Link href="/features">Features</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/guides">Resources</Link>
          <span aria-current="page" className="hc-nav-on">For clients</span>
        </nav>
        <div className="hc-actions">
          <button type="button" className="hc-owners" onClick={toOwners}>For shop owners</button>
          <a href="#how" className="hc-btn hc-btn-accent">How to book</a>
        </div>
        <button type="button" className="hc-menu-btn" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen(v => !v)}>
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        {menuOpen && (
          <div className="hc-drawer">
            <button type="button" onClick={toOwners}>Home</button>
            <Link href="/features">Features</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/guides">Resources</Link>
            <button type="button" onClick={toOwners}>For shop owners</button>
            <a href="#how" className="hc-btn hc-btn-accent" onClick={() => setMenuOpen(false)}>How to book</a>
          </div>
        )}
      </header>

      <main className="hc-main">
        <section className="hc-hero">
          <div className="hc-hero-copy">
            <span className="hc-chip">For clients</span>
            <h1>Your favourite shop.<br /><span>Booked in a few taps.</span></h1>
            <p className="hc-lede">Open your salon or barbershop&apos;s booking link, pick your service, choose who you want and grab a time that suits you. No calls, no waiting for a text back.</p>
            <div className="hc-hero-btns">
              <a href="#how" className="hc-btn hc-btn-dark">See how booking works <ArrowDown size={16} strokeWidth={2.2} aria-hidden="true" /></a>
              <a href="#invite" className="hc-btn hc-btn-outline">Invite your shop</a>
            </div>
            <p className="hc-note">Works on any device. Your shop sends you its link.</p>
          </div>

          {/* Illustrative only: a static picture of a shop's booking page */}
          <div className="hc-phone" role="img" aria-label="Example of a shop's booking page on a phone: fade and beard trim with Dre, Saturday 14 November at 1:00 pm">
            <div className="hc-phone-head">
              <div><strong>Your shop</strong><span>Whyte Ave, Edmonton</span></div>
              <em>Example</em>
            </div>
            <div className="hc-step">
              <p>1. Service</p>
              <div className="hc-row hc-on"><div><strong>Fade and beard trim</strong><span>45 min</span></div><b>C$55</b></div>
              <div className="hc-row"><div><strong>Classic cut</strong><span>30 min</span></div><b>C$40</b></div>
            </div>
            <div className="hc-step">
              <p>2. With</p>
              <div className="hc-pills hc-pills-3"><span>Anyone</span><span className="hc-on">Dre</span><span>Maya</span></div>
            </div>
            <div className="hc-step">
              <p>3. Time, Sat 14 Nov</p>
              <div className="hc-pills hc-pills-4 hc-times"><span>10:30</span><span>11:15</span><span className="hc-on">1:00</span><span>2:30</span></div>
            </div>
            <div className="hc-confirm">
              <span>Confirm booking</span>
              <small>Sat 14 Nov, 1:00 pm with Dre</small>
            </div>
          </div>
        </section>

        <section id="how" className="hc-how">
          <div className="hc-how-head">
            <div>
              <span className="hc-eyebrow">How booking works</span>
              <h2>Three steps. No phone tag.</h2>
            </div>
            <p>Fewer forgotten details, and an easier way to make time for yourself.</p>
          </div>
          <div className="hc-steps">
            {STEPS.map((s, i) => (
              <ScrollReveal key={s.t} delay={i * 90}>
                <article className="hc-card">
                  <span className="hc-num">{i + 1}</span>
                  <h3>{s.t}</h3>
                  <p>{s.d}</p>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </section>

        <section id="invite" className="hc-invite">
          <div>
            <h2>Is your shop still booking by text?</h2>
            <p>Send them Flow. It takes a shop under a day to set up, and you get to book your next visit online.</p>
          </div>
          <div className="hc-invite-btns">
            <button type="button" className="hc-btn hc-btn-lime" onClick={invite}>Invite your shop <ArrowUpRight size={16} strokeWidth={2.2} aria-hidden="true" /></button>
            <button type="button" className="hc-btn hc-btn-ghost" onClick={copyLink}>
              {copied ? <><Check size={16} strokeWidth={2.4} aria-hidden="true" /> Copied</> : <><Copy size={16} strokeWidth={2} aria-hidden="true" /> Copy link</>}
            </button>
            <span className="hc-sr" role="status">{copied ? "Link copied" : ""}</span>
          </div>
        </section>
      </main>

      <Footer hideCta />
    </div>
  );
}
