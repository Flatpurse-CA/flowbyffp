import type { Metadata } from "next";
import { SeoShell, SeoCta, Related, faqLd } from "@/components/seo/SeoShell";
import { PRICES, SITE_URL } from "@/lib/seo/facts";
import { seoMetadata } from "@/lib/seo/metadata";
import { NoShowCalculator } from "./NoShowCalculator";
import "./calculator.css";

const PATH = "/no-show-calculator";
const TITLE = "No-Show Cost Calculator for Salons and Barbershops | FlatPurse Flow";
const DESCRIPTION = "Work out what no-shows cost your salon, barbershop or spa each month and year, and how much automatic recovery could win back. Free, no sign-up.";

export const metadata: Metadata = seoMetadata({ title: TITLE, description: DESCRIPTION, path: PATH });

const FAQS = [
  {
    q: "How is the no-show cost calculated?",
    a: "Team size × appointments per person per day × working days per month × your no-show rate gives missed appointments per month. Multiply by your average ticket for the monthly cost, and by 12 for the year.",
  },
  {
    q: "What is a typical no-show rate for a salon?",
    a: "It varies by shop. Check your own booking history: count no-shows and same-day cancellations over the last three months and divide by total bookings. The calculator starts at 5%, the rate used in our worked example.",
  },
  {
    q: "Is the recovery figure a guarantee?",
    a: "No. It's a worked example based on the share you choose, not a customer result. How much you win back depends on your clients, your policy and how quickly you follow up.",
  },
];

export default function NoShowCalculatorPage() {
  return (
    <SeoShell
      crumbs={[{ href: "/", label: "Home" }, { href: PATH, label: "No-show cost calculator" }]}
      schema={[
        {
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "No-Show Cost Calculator",
          description: DESCRIPTION,
          url: `${SITE_URL}${PATH}`,
          applicationCategory: "BusinessApplication",
          offers: { "@type": "Offer", price: "0", priceCurrency: "CAD" },
        },
        faqLd(FAQS),
      ]}
    >
      <p className="seo-eyebrow">Free calculator</p>
      <h1>What are no-shows costing your shop?</h1>
      <p className="seo-lede">Move the sliders to match your business. You&apos;ll see what missed appointments cost you each month and year, and what you could win back.</p>

      <NoShowCalculator planMonthly={PRICES.proPlus} />

      <h2>How Flow wins them back</h2>
      <ol>
        <li><strong>No-Show Recovery</strong> messages the client about an hour after the missed appointment with an easy rebook link.</li>
        <li><strong>Last-Minute Slot Filler</strong> offers the open time to clients who asked for an earlier slot.</li>
        <li><strong>Reminders and deposits</strong> prevent many no-shows before they happen.</li>
      </ol>

      <h2>Questions</h2>
      {FAQS.map(f => (
        <div key={f.q}>
          <h3>{f.q}</h3>
          <p>{f.a}</p>
        </div>
      ))}

      <SeoCta />
      <Related links={[
        { href: "/guides/cost-of-no-shows", label: "What a no-show really costs" },
        { href: "/questions/reduce-no-shows", label: "How to reduce no-shows" },
        { href: "/compare/flow-vs-fresha-booksy-vagaro", label: "Flow vs Fresha, Booksy and Vagaro" },
      ]} />
    </SeoShell>
  );
}
