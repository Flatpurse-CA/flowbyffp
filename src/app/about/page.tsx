import type { Metadata } from "next";
import Link from "next/link";
import { Leaf } from "lucide-react";
import { H4Header, Arrow } from "../home-4/H4Chrome";
import Footer from "@/components/Footer";
import "../home-4/home-4.css";
import "./about.css";

// Ported from design-imports/flow-landing/about/index.html (home-4 design).

export const metadata: Metadata = {
  title: "About FlatPurse Flow | George & Our Edmonton Story",
  description: "Meet George and FlatPurse Flow, built in Edmonton to help Canadian salon and barbershop owners spend less time on admin and more time on their craft.",
};

export default function AboutPage() {
  return (
    <>
    <div className="h4-page" data-audience="page">
      <a className="skip" href="#main">Skip to content</a>
      <H4Header current="about" />

      <main id="main">
        <section className="about-hero section">
          <div className="eyebrow">FLATPURSE FLOW / OUR STORY</div>
          <h1>Built here.<br />For the people<br /><em>building their own thing.</em></h1>
          <div className="about-intro">
            <span className="location-stamp">EDMONTON, ALBERTA<br /><strong>Canada is our starting point.</strong></span>
            <p>Independent salons and barbershops bring a neighbourhood to life. FlatPurse Flow is being built in Edmonton to make the work behind those businesses a little easier.</p>
          </div>
        </section>

        <section className="george-section section">
          <div className="george-name">
            <span className="eyebrow">THE PERSON BEHIND FLOW</span>
            <h2>Meet George.</h2>
            <p>Building FlatPurse Flow.<br />Based in Edmonton.</p>
            <a className="text-link" href="mailto:support@flatpurse.com">Say hello <Arrow size={15} /></a>
          </div>
          <div className="george-story">
            <h3>A local business deserves<br />a local point of view.</h3>
            <p>George is building Flow for Canadian salon and barbershop owners: people balancing appointments, clients, payments, and all the small tasks that keep a shop running.</p>
            <p>The idea behind Flow is straightforward. Give those everyday tasks a connected home, and give owners more time for their craft.</p>
            <p>That local perspective carries into the product: Canadian dollars, familiar payment options, and support in Mountain Time. When you need a hand, there’s a person behind the product.</p>
          </div>
        </section>

        <section className="section about-purpose">
          <div className="section-heading">
            <div>
              <div className="eyebrow">WHAT WE’RE HERE TO DO</div>
              <h2>Less time chasing.<br />More time creating.</h2>
            </div>
            <p>Software should make an independent business easier to run, one useful step at a time.</p>
          </div>
          <div className="about-values">
            <article>
              <span>01</span>
              <h3>Start with the shop.</h3>
              <p>Bookings, cancellations, repeat visits, and payments are part of everyday life. Those are the workflows Flow brings together.</p>
            </article>
            <article>
              <span>02</span>
              <h3>Make room for people.</h3>
              <p>Automation can help with reminders and follow-ups. The relationships, judgement, and personal service stay with you.</p>
            </article>
            <article>
              <span>03</span>
              <h3>Build with Canada in mind.</h3>
              <p>Canadian currency and local working hours belong in the experience from the beginning.</p>
            </article>
          </div>
          <Link className="text-link" href="/autopilot">Meet AutoPilot <Arrow size={15} /></Link>
        </section>

        <section className="about-contact">
          <div className="eyebrow">LET’S TALK SHOP</div>
          <h2>What’s taking up<br />too much of your day?</h2>
          <p>Tell us about your business, ask a question, or share what you’d like Flow to do better.</p>
          <a className="button" href="mailto:support@flatpurse.com">support@flatpurse.com <Arrow /></a>
          <span className="contact-location">Edmonton, Alberta · Mountain Time</span>
        </section>

        <section className="canada section about-canada" id="canada" aria-labelledby="canada-title">
          <div className="canada-intro">
            <div className="canada-heading">
              <div className="eyebrow"><span className="leaf-mark" aria-hidden="true"><Leaf size={14} /></span> CANADA IS THE STARTING POINT</div>
              <h2 id="canada-title">Built in Edmonton.<br /><em>Built for Canada.</em></h2>
            </div>
            <div className="canada-story">
              <p className="canada-lead">Your currency. Your payment habits.<br />Your side of the clock.</p>
              <p>FlatPurse Flow is built in Edmonton for Canadian salon and barbershop owners. Canadian dollars, local payment options, and support that understands your working day belong at the centre of the experience.</p>
            </div>
          </div>
          <div className="canada-grid">
            <article>
              <span className="canada-icon" aria-hidden="true">C$</span>
              <span className="canada-index">01 / YOUR CURRENCY</span>
              <h3>CAD-native</h3>
              <p>Prices, invoices, payouts, and reports in Canadian dollars. Provincial GST/HST settings built around the way you do business.</p>
              <span className="canada-detail">Canadian dollars from booking to reporting.</span>
            </article>
            <article>
              <span className="canada-icon" aria-hidden="true">⌑</span>
              <span className="canada-index">02 / CLIENT PRIVACY</span>
              <h3>Privacy, from day one.</h3>
              <p>Canadian privacy needs belong in the product from the start, including consent, client information, and deletion requests.</p>
              <Link className="canada-detail" href="/privacy">Read our privacy policy <Arrow size={14} /></Link>
            </article>
            <article>
              <span className="canada-icon" aria-hidden="true">↳</span>
              <span className="canada-index">03 / REAL PEOPLE</span>
              <h3>Edmonton support</h3>
              <p>It’s 8am Mountain Time. Your shop is opening, and you need a hand. George picks up, right here in Edmonton.</p>
              <span className="canada-detail">A local person who understands your day.</span>
            </article>
          </div>
          <div className="canada-signoff">
            <span>Independent shops deserve a home-field advantage.</span>
            <span className="canada-location"><span className="leaf-mark" aria-hidden="true"><Leaf size={13} /></span> EDMONTON, ALBERTA · MOUNTAIN TIME</span>
          </div>
        </section>
      </main>
    </div>

    {/* The app's own footer (same as home-3), outside .h4-page so home-4's footer styles don't touch it */}
    <Footer />
    </>
  );
}
