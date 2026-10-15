import type { Metadata } from "next";
import { SeoShell, SeoCta, Related } from "@/components/seo/SeoShell";
import { COMPETITOR_CHECK_DATE, SITE_URL, SOURCES } from "@/lib/seo/facts";
import { seoMetadata } from "@/lib/seo/metadata";

const URL = `${SITE_URL}/compare/flow-vs-fresha-booksy-vagaro`;
const TITLE = "Flow vs Fresha vs Booksy vs Vagaro (2026) | FlatPurse Flow";
const DESCRIPTION = "Compare booking software for Canadian salons: AI Front Desk, no-show recovery, Tap to Pay, new-client commissions and CAD pricing.";

export const metadata: Metadata = seoMetadata({ title: TITLE, description: DESCRIPTION, path: "/compare/flow-vs-fresha-booksy-vagaro" });

// "Not listed" = not in the competitor's published pages and reviews we
// checked on COMPETITOR_CHECK_DATE. It isn't proof the feature doesn't exist.
const ROWS: [string, string, string, string, string][] = [
  ["Bookings and online booking page", "Yes (all plans)", "Yes", "Yes", "Yes"],
  ["Client profiles and history", "Yes (all plans); automatic segments on Pro and up", "Client profiles", "Client profiles", "Client profiles"],
  ["Team: staff profiles and availability", "Yes", "Yes", "Yes, extra users paid", "Yes, priced per calendar"],
  ["Tap to Pay on a phone", "Yes, iPhone, Interac included (all plans)", "Yes, extra fee per tap", "Yes", "Yes (\"Tap to Phone\")"],
  ["No-show handling", "No-Show Recovery: rebook message about an hour after a miss, plus Last-Minute Slot Filler (Pro+)", "Deposit and fee protection", "Deposit and fee protection, waitlist", "Not listed"],
  ["AI Front Desk (answers questions, books appointments)", "Yes (Pro and up)", "Announced, no date", "Beta, US site, by request", "Third-party add-ons"],
  ["Automatic win-back, rebooking and birthday offers", "AutoPilot (Pro+)", "Blast messaging", "Email and text marketing", "Text marketing add-on"],
  ["Daily Brief (morning business summary)", "Yes (Pro and up)", "Not listed", "Not listed", "Not listed"],
  ["AI business coaching", "Flow Coach (Pro+)", "Not listed", "Not listed", "Not listed"],
  ["Business Health Score", "Yes (Pro+)", "Not listed", "Not listed", "Not listed"],
  ["Revenue forecasting", "Yes (Pro+)", "Not listed (\"improved analytics\" announced)", "Not listed", "Not listed"],
  ["Commission on new marketplace clients", "None", "20% of first visit", "30% of first visit with Boost, capped", "None described"],
  ["Canadian sales tax, CAD pricing, data in Canada", "Yes, all 13 provinces and territories", "Pricing published in USD", "Pricing published in USD", "Pricing published in USD"],
];

export default function ComparePage() {
  return (
    <SeoShell
      crumbs={[{ href: "/", label: "Home" }, { href: "/compare/flow-vs-fresha-booksy-vagaro", label: "Flow vs Fresha, Booksy and Vagaro" }]}
      schema={[{
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: TITLE,
        description: DESCRIPTION,
        url: URL,
        about: ["FlatPurse Flow", "Fresha", "Booksy", "Vagaro"].map(name => ({ "@type": "SoftwareApplication", name })),
      }]}
    >
      <h1>FlatPurse Flow vs Fresha, Booksy and Vagaro</h1>
      <p className="seo-lede">All four handle bookings, clients and payments. The difference is what happens when nobody is at the desk. Flow&apos;s AI Front Desk answers clients, AutoPilot sends a rebook message about an hour after a no-show, and the Daily Brief tells you each morning what needs attention. Flow never takes a commission on a new client.</p>

      <div className="seo-table-wrap"><table>
        <thead><tr><th>Feature</th><th>FlatPurse Flow (plan)</th><th>Fresha</th><th>Booksy</th><th>Vagaro</th></tr></thead>
        <tbody>{ROWS.map(r => <tr key={r[0]}>{r.map((c, i) => i === 0 ? <th key={i} scope="row">{c}</th> : <td key={i}>{c}</td>)}</tr>)}</tbody>
      </table></div>
      <p className="seo-sources">
        As of {COMPETITOR_CHECK_DATE}. &quot;Not listed&quot; means the feature didn&apos;t appear in the competitor&apos;s published pages and reviews we checked; it doesn&apos;t prove the feature doesn&apos;t exist. Check each product before you decide. Pricing: <a href={SOURCES.fresha.href} target="_blank" rel="noopener noreferrer">Fresha</a>, <a href={SOURCES.booksy.href} target="_blank" rel="noopener noreferrer">Booksy</a>, <a href={SOURCES.vagaro.href} target="_blank" rel="noopener noreferrer">Vagaro</a>.
      </p>

      <h2>Who should pick Flow</h2>
      <p>Canadian salons, barbershops, spas, clinics and studios that want AI to fill empty chairs, CAD pricing and Interac on a phone.</p>
      <h2>Who might pick another tool</h2>
      <p>Businesses that rely on a marketplace for most new clients, that need staff commission payroll, gift cards or intake forms built in today, or that take payments on an Android phone.</p>

      <SeoCta />
      <Related links={[
        { href: "/questions/fresha-booksy-new-client-commission", label: "Does Fresha or Booksy take a commission?" },
        { href: "/guides/marketplace-commission-cost", label: "The real cost of marketplace commissions" },
        { href: "/questions/best-barbershop-booking-app-canada", label: "Best barbershop app in Canada" },
        { href: "/guides/canadian-salon-software", label: "8 checks before choosing salon software" },
      ]} />
    </SeoShell>
  );
}
