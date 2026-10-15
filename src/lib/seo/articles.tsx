// Question pages (Q1-Q8) and expert guides (E1-E4) from the AEO Page Pack.
// Each question page opens with a 40-60 word direct answer, the block answer
// engines quote. Copy is limited to what the live app does.

import Link from "next/link";
import { PROVINCES } from "@/lib/tax";
import { PRICES, RATES, SOURCES, COMPETITOR_CHECK_DATE } from "./facts";

export type Article = {
  kind: "question" | "guide";
  slug: string;
  title: string;
  titleTag: string;
  meta: string;
  /** Direct answer (questions) or standfirst (guides). Plain text: also used in schema. */
  answer: string;
  body: React.ReactNode;
  /** Local pages to link back to (vertical slug prefixes). */
  related: { href: string; label: string }[];
};

const src = (s: { label: string; href: string }) => <a href={s.href} target="_blank" rel="noopener noreferrer">{s.label}</a>;

const salonLinks = [
  { href: "/salon-software-edmonton", label: "Salon software in Edmonton" },
  { href: "/salon-software-toronto", label: "Salon software in Toronto" },
  { href: "/compare/flow-vs-fresha-booksy-vagaro", label: "Flow vs Fresha, Booksy and Vagaro" },
];
const barberLinks = [
  { href: "/barbershop-software-edmonton", label: "Barbershop app in Edmonton" },
  { href: "/barbershop-software-calgary", label: "Barbershop app in Calgary" },
  { href: "/compare/flow-vs-fresha-booksy-vagaro", label: "Flow vs Fresha, Booksy and Vagaro" },
];

export const QUESTIONS: Article[] = [
  {
    kind: "question", slug: "salon-software-cost-canada",
    title: "How much does salon booking software cost in Canada?",
    titleTag: "How Much Does Salon Booking Software Cost in Canada? | FlatPurse Flow",
    meta: "Monthly plans, card processing and new-client commissions explained, with Canadian examples and FlatPurse Flow's CAD pricing.",
    answer: `Salon booking software usually starts around 20 to 40 US dollars a month for one person and rises with each staff member, plus card processing of about 2.5 to 3% per sale. FlatPurse Flow starts at CAD ${PRICES.starter}/month for up to 2 team members, with no commission on new clients.`,
    body: <>
      <h2>What you&apos;re actually paying for</h2>
      <ol>
        <li><strong>Monthly plan.</strong> Fresha starts at USD 19.95 per bookable member, Booksy at USD 29.99 plus USD 20 per extra user, and Vagaro at USD 23.99 plus USD 10 per extra calendar (published US pricing, checked {COMPETITOR_CHECK_DATE}).</li>
        <li><strong>Card processing.</strong> On Flow, cards are Stripe&apos;s standard rates paid by your shop: {RATES.tappedCredit} for a tapped credit card, {RATES.interac} for Interac and {RATES.online} online.</li>
        <li><strong>New-client commissions.</strong> Fresha takes 20% of a new marketplace client&apos;s first visit; Booksy Boost takes 30%, capped at USD 100. Flow takes none.</li>
        <li><strong>Add-ons.</strong> Text marketing, forms and extra locations are often extra elsewhere.</li>
      </ol>
      <h2>A worked example</h2>
      <p>A 4-chair salon taking 20,000 dollars a month in tapped credit cards across 300 sales pays about 600 dollars in processing (2.7% is 540, plus 300 × 20¢). Interac sales cost less.</p>
      <h2>Flow&apos;s plans</h2>
      <p>Starter CAD {PRICES.starter}, Pro CAD {PRICES.pro}, Pro+ CAD {PRICES.proPlus} a month, per location, before tax. Founders Beta saves 40% in year 1 and 25% for life. <Link href="/pricing">See all plans</Link>.</p>
      <p className="seo-sources">Sources: {src(SOURCES.fresha)}, {src(SOURCES.booksy)}, {src(SOURCES.vagaro)}, {src(SOURCES.stripe)}.</p>
    </>,
    related: salonLinks,
  },
  {
    kind: "question", slug: "reduce-no-shows",
    title: "How do I reduce no-shows at my salon or barbershop?",
    titleTag: "How to Reduce No-Shows at a Salon or Barbershop | FlatPurse Flow",
    meta: "Deposits, reminders, a clear policy and fast follow-up: five steps that cut no-shows and recover the revenue from the rest.",
    answer: "Take a deposit for new clients and long services, send reminders with a reschedule link, publish a clear cancellation policy, and follow up fast when someone misses. Deposits and reminders prevent most no-shows; an automatic rebook message and slot filling recover the revenue from the rest.",
    body: <>
      <ol>
        <li><strong>Take a deposit</strong> for new clients and long services. In Flow, text a payment link for the deposit.</li>
        <li><strong>Send reminders</strong> before every appointment. Flow sends them automatically.</li>
        <li><strong>Publish a clear cancellation policy</strong> where clients book.</li>
        <li><strong>Fill the gap automatically.</strong> Flow&apos;s Last-Minute Slot Filler offers the open time to clients who want an earlier appointment.</li>
        <li><strong>Follow up within the hour.</strong> Flow&apos;s No-Show Recovery messages the client about an hour after the missed appointment, while they still want the service, with an easy rebook link.</li>
      </ol>
      <p>For the math behind why follow-up matters, read <Link href="/guides/cost-of-no-shows">what a no-show really costs a Canadian salon</Link>.</p>
    </>,
    related: [...salonLinks.slice(0, 1), ...barberLinks.slice(0, 1), { href: "/guides/cost-of-no-shows", label: "What a no-show really costs" }],
  },
  {
    kind: "question", slug: "gst-on-salon-services",
    title: "Do I charge GST on haircuts and salon services?",
    titleTag: "Do I Charge GST on Haircuts and Salon Services? | FlatPurse Flow",
    meta: "GST/HST and provincial sales tax on salon services in every Canadian province, plus the small supplier rule.",
    answer: "Yes. Haircuts and most salon and spa services are taxable for GST/HST in Canada. You must register and charge it once your taxable revenue passes 30,000 dollars in four consecutive calendar quarters; below that you're a small supplier and registering is optional.",
    body: <>
      <h2>Rates by province and territory</h2>
      <TaxTable />
      <p className="seo-sources">Rates per {src(SOURCES.taxtips)} and {src(SOURCES.manitoba)}; small supplier rule per the {src(SOURCES.cra)}.</p>
      <p>Flow applies the right rate for your province on every final bill, doesn&apos;t tax deposits, and lets you mark a service exempt. <em>General information, not tax advice; confirm with your accountant.</em></p>
      <p>The full explanation, including the traps we coded around, is in <Link href="/guides/salon-sales-tax-canada">sales tax for salons in every province</Link>.</p>
    </>,
    related: [{ href: "/guides/salon-sales-tax-canada", label: "Sales tax for salons, every province" }, ...salonLinks.slice(0, 2)],
  },
  {
    kind: "question", slug: "fresha-booksy-new-client-commission",
    title: "Does Fresha or Booksy take a commission on new clients?",
    titleTag: "Does Fresha or Booksy Take a Commission on New Clients? | FlatPurse Flow",
    meta: "Fresha and Booksy's new-client fees explained, what they cost a Canadian salon in a month, and the commission-free alternative.",
    answer: "Yes. Fresha charges 20% of a new client's first visit when they find you through its marketplace (US minimum USD 6). Booksy's Boost charges 30% of a Boost client's first visit, capped at USD 100. FlatPurse Flow charges no commission on any client.",
    body: <>
      <h2>Why it matters</h2>
      <p>On an 80-dollar colour service, that&apos;s 16 dollars to Fresha or 24 dollars to Booksy, before card fees. Across 20 new clients a month, it&apos;s 320 to 480 dollars.</p>
      <p className="seo-sources">Sources: {src(SOURCES.booksy)}, {src(SOURCES.fresha)}, checked {COMPETITOR_CHECK_DATE}. Related: <Link href="/guides/marketplace-commission-cost">the real cost of marketplace commissions</Link>.</p>
    </>,
    related: [{ href: "/guides/marketplace-commission-cost", label: "The real cost of marketplace commissions" }, ...barberLinks.slice(0, 1), { href: "/compare/flow-vs-fresha-booksy-vagaro", label: "Flow vs Fresha, Booksy and Vagaro" }],
  },
  {
    kind: "question", slug: "tap-to-pay-canada-salon",
    title: "Can I take card payments on my phone without a terminal in Canada?",
    titleTag: "Take Card Payments on Your Phone in Canada (No Terminal) | FlatPurse Flow",
    meta: "How Tap to Pay on iPhone works for Canadian salons and barbershops: Interac, credit, tips and what it costs.",
    answer: `Yes. With Tap to Pay on iPhone, a compatible iPhone accepts contactless credit cards, Interac debit, Apple Pay and Google Pay with no extra hardware. Flow has Tap to Pay built in: ${RATES.tappedCredit} per credit tap and ${RATES.interac} per Interac tap.`,
    body: <>
      <ul>
        <li><strong>What you need:</strong> a compatible iPhone and the Flow app, plus a connected Stripe account.</li>
        <li><strong>Tips and receipts:</strong> add a tip at checkout and text the client a receipt.</li>
        <li><strong>No reader to buy:</strong> Flow is phone-only, so there&apos;s no hardware cost.</li>
      </ul>
      <p>Interac at {RATES.interac} is cheaper than a percentage rate on any sale above about 31 dollars, which covers most haircuts and services.</p>
    </>,
    related: barberLinks,
  },
  {
    kind: "question", slug: "best-barbershop-booking-app-canada",
    title: "What is the best booking app for a barbershop in Canada?",
    titleTag: "Best Barbershop Booking App in Canada (2026) | FlatPurse Flow",
    meta: "What a Canadian barbershop should look for in a booking app: Interac on a phone, GST/HST, no-show recovery and no new-client commission.",
    answer: `The best barbershop app for a Canadian shop takes Interac on a phone, charges GST/HST correctly, rebooks no-shows automatically and doesn't take a cut of new clients. FlatPurse Flow is built in Edmonton for exactly that, from CAD ${PRICES.starter}/month for up to 2 barbers.`,
    body: <>
      <div className="seo-table-wrap"><table>
        <thead><tr><th>Need</th><th>Why it matters</th><th>Flow</th></tr></thead>
        <tbody>
          <tr><td>Interac and Tap to Pay</td><td>Many Canadian clients pay by debit</td><td>{RATES.interac} per Interac tap</td></tr>
          <tr><td>Canadian tax handling</td><td>GST/HST on every bill</td><td>All 13 provinces and territories</td></tr>
          <tr><td>No-show recovery</td><td>A missed cut is lost revenue</td><td>Rebook message in about an hour</td></tr>
          <tr><td>AI Front Desk</td><td>Answers while you&apos;re cutting</td><td>Pro and up</td></tr>
          <tr><td>No new-client commission</td><td>Growth shouldn&apos;t cost more</td><td>None</td></tr>
          <tr><td>CAD pricing, data in Canada</td><td>No exchange-rate surprises</td><td>Yes</td></tr>
        </tbody>
      </table></div>
      <p>See the full comparison: <Link href="/compare/flow-vs-fresha-booksy-vagaro">Flow vs Fresha, Booksy and Vagaro</Link>.</p>
    </>,
    related: barberLinks,
  },
  {
    kind: "question", slug: "win-back-lapsed-clients",
    title: "How do I get old clients to come back to my salon?",
    titleTag: "How to Win Back Lapsed Salon Clients | FlatPurse Flow",
    meta: "Define lapsed, send a personal note, give one reason to book, and automate it. A four-step win-back routine for Canadian salons.",
    answer: "Message clients who haven't booked in 30 to 60 days with a personal note and a reason to return, such as an open slot this week or a small offer. Do it automatically every week, so nobody slips through.",
    body: <>
      <ol>
        <li><strong>Define &quot;lapsed.&quot;</strong> For cuts, usually 6 to 8 weeks past their normal cycle.</li>
        <li><strong>Send a personal message</strong> in your name, not a newsletter.</li>
        <li><strong>Give one reason to book now:</strong> an open slot, a seasonal service or a birthday offer.</li>
        <li><strong>Automate it.</strong> Flow&apos;s win-back finds overdue clients, sends the message and tracks the revenue it brings back. The Churn Risk segment flags clients before they&apos;re gone.</li>
      </ol>
      <p><strong>Canadian note:</strong> marketing messages need consent under CASL (Canada&apos;s Anti-Spam Legislation). Message clients who have booked with you and opted in.</p>
    </>,
    related: salonLinks,
  },
  {
    kind: "question", slug: "automate-stylist-commission",
    title: "How do I pay stylists commission automatically?",
    titleTag: "How to Pay Stylists Commission Automatically | FlatPurse Flow",
    meta: "Flat, tiered and retail commission structures for salons, with examples, and how to calculate them from completed, paid appointments.",
    answer: "Set each stylist's commission as a flat rate or a tiered rate that rises with their monthly sales, with a separate rate for retail. Then calculate earnings each pay period from completed, paid appointments only, so cancellations and unpaid bookings never count.",
    body: <>
      <div className="seo-table-wrap"><table>
        <thead><tr><th>Structure</th><th>How it works</th><th>Example</th></tr></thead>
        <tbody>
          <tr><td>Flat</td><td>One rate on all services</td><td>40% of services</td></tr>
          <tr><td>Tiered (sliding scale)</td><td>Rate rises as monthly sales grow, rewarding top performers</td><td>35% up to 6,000 dollars a month, 40% to 10,000, 45% above</td></tr>
          <tr><td>Retail</td><td>Separate, lower rate on product sales</td><td>10 to 20% of retail</td></tr>
        </tbody>
      </table></div>
      <p>A flat rate is the most common structure; a tiered plan rewards growth without overpaying in slow months.</p>
      <p>In Flow, the Team page shows each team member&apos;s completed bookings and revenue, the figures commission is calculated from, and you can export itemised transactions for payroll.</p>
    </>,
    related: salonLinks,
  },
];

export function TaxTable() {
  return (
    <div className="seo-table-wrap"><table>
      <thead><tr><th>Province or territory</th><th>Rate on services</th><th>Notes</th></tr></thead>
      <tbody>
        {PROVINCES.map(p => (
          <tr key={p.code}>
            <td>{p.name}</td>
            <td>{p.components.filter(c => c.servicesByDefault).map(c => `${c.label} ${c.rate}%`).join(" + ")}</td>
            <td>{p.note}</td>
          </tr>
        ))}
      </tbody>
    </table></div>
  );
}

export const GUIDES: Article[] = [
  {
    kind: "guide", slug: "cost-of-no-shows",
    title: "What a no-show really costs a Canadian salon (and how to win it back)",
    titleTag: "What a No-Show Really Costs a Canadian Salon | FlatPurse Flow",
    meta: "The math behind salon no-shows: a worked example for a 4-stylist salon, and how automatic recovery wins the revenue back.",
    answer: "A single no-show looks small. Across a year it's often the biggest leak in a salon's revenue. Here's the math we used when we designed Flow's AutoPilot.",
    body: <>
      <h2>Worked example</h2>
      <div className="seo-table-wrap"><table>
        <thead><tr><th>Input</th><th>Value</th></tr></thead>
        <tbody>
          <tr><td>Stylists</td><td>4</td></tr>
          <tr><td>Appointments per stylist per day</td><td>6</td></tr>
          <tr><td>Average ticket</td><td>70 dollars</td></tr>
          <tr><td>No-show and late-cancel rate</td><td>5%</td></tr>
          <tr><td>Working days per month</td><td>22</td></tr>
        </tbody>
      </table></div>
      <p>That&apos;s 0.3 lost appointments per stylist per day, or about 462 dollars per stylist a month. For four stylists, it&apos;s about 1,850 dollars a month and roughly 22,000 dollars a year.</p>
      <h2>Why reminders alone don&apos;t fix it</h2>
      <p>Reminders prevent some no-shows. They do nothing about the slot once it&apos;s empty, or about the client who missed and now feels awkward rebooking. Most of that client&apos;s future value walks away with them.</p>
      <h2>What we built instead</h2>
      <ol>
        <li><strong>No-Show Recovery</strong> messages the client about an hour after the missed appointment with an easy rebook link and no guilt.</li>
        <li><strong>Last-Minute Slot Filler</strong> offers the open time to clients who asked for an earlier slot.</li>
        <li><strong>Win-back</strong> catches clients who drift away entirely.</li>
        <li><strong>The Daily Brief</strong> shows each morning what AutoPilot recovered.</li>
      </ol>
      <p>If AutoPilot recovers half of those missed appointments, the salon above keeps about 11,000 dollars a year it would have lost. On Pro+ at CAD {PRICES.proPlus} a month ({(PRICES.proPlus * 12).toLocaleString("en-CA")} dollars a year), that&apos;s roughly a 5× return from recovery alone. These are worked-example figures, not customer results.</p>
    </>,
    related: [{ href: "/questions/reduce-no-shows", label: "How to reduce no-shows" }, ...salonLinks.slice(0, 2)],
  },
  {
    kind: "guide", slug: "salon-sales-tax-canada",
    title: "Sales tax for salons in every province, explained by the people who coded it",
    titleTag: "Sales Tax for Salons in Every Canadian Province | FlatPurse Flow",
    meta: "GST, HST, PST, RST and QST for salons, spas and barbershops across all 13 provinces and territories, with the traps a salon runs into.",
    answer: "We built Flow's tax engine to cover all 13 provinces and territories. Writing the code forced us to learn every rule a growing salon runs into. Here's the plain-English version.",
    body: <>
      <h2>Four taxes, three systems</h2>
      <div className="seo-table-wrap"><table>
        <thead><tr><th>System</th><th>Where</th><th>Rate</th><th>How it works for a salon</th></tr></thead>
        <tbody>
          <tr><td>GST only</td><td>Alberta, Yukon, NWT, Nunavut</td><td>5%</td><td>Federal GST on taxable services</td></tr>
          <tr><td>HST</td><td>Ontario</td><td>13%</td><td>One combined rate</td></tr>
          <tr><td>HST</td><td>Nova Scotia</td><td>14%</td><td>One combined rate</td></tr>
          <tr><td>HST</td><td>New Brunswick, Newfoundland and Labrador, PEI</td><td>15%</td><td>One combined rate</td></tr>
          <tr><td>GST + PST/RST</td><td>BC (7%), Saskatchewan (6%), Manitoba (7%)</td><td>5% + provincial</td><td>Provincial tax always applies to retail products, but only to some services; Manitoba exempts hair, skin, spa and massage services</td></tr>
          <tr><td>GST + QST</td><td>Quebec</td><td>5% + 9.975%</td><td>Each calculated on the pre-tax price</td></tr>
        </tbody>
      </table></div>
      <h2>The traps we coded around</h2>
      <ul>
        <li><strong>Retail and services on one ticket.</strong> In PST provinces, products and services can be taxed differently.</li>
        <li><strong>Deposits.</strong> Flow doesn&apos;t tax the deposit; tax is calculated on the final bill when the service is delivered.</li>
        <li><strong>Tax-inclusive prices.</strong> If your menu prices include tax, Flow backs the tax out so the receipt still adds up to the price you quoted.</li>
        <li><strong>Massage and health services.</strong> Whether they&apos;re taxable depends on the service and the province, so Flow lets you mark any service exempt.</li>
        <li><strong>Small supplier threshold.</strong> Under 30,000 dollars of taxable revenue in four consecutive quarters, registration is optional; turn tax off in Flow until you register.</li>
      </ul>
      <h2>Every province and territory</h2>
      <TaxTable />
      <p className="seo-sources">Rates per {src(SOURCES.taxtips)} and {src(SOURCES.manitoba)}. <em>General information, not tax advice. Confirm with your accountant.</em></p>
    </>,
    related: [{ href: "/questions/gst-on-salon-services", label: "Do I charge GST on salon services?" }, { href: "/salon-software-winnipeg", label: "Salon software in Winnipeg" }, { href: "/salon-software-vancouver", label: "Salon software in Vancouver" }],
  },
  {
    kind: "guide", slug: "marketplace-commission-cost",
    title: "The real cost of marketplace commissions: one barbershop's year",
    titleTag: "The Real Cost of Booksy and Fresha Commissions | FlatPurse Flow",
    meta: "A worked example: one Edmonton barbershop's year of new-client commissions on Booksy Boost, Fresha and Flow.",
    answer: "Marketplace booking apps sell \"free\" new clients. They aren't free. Here is one example Edmonton barbershop's year, priced three ways.",
    body: <>
      <h2>The shop (worked example)</h2>
      <ul><li>3 barbers, 40 new marketplace clients a month</li><li>Average first-visit ticket: 45 dollars</li></ul>
      <h2>New-client commission, per year</h2>
      <div className="seo-table-wrap"><table>
        <thead><tr><th>Platform</th><th>New-client fee</th><th>Annual new-client cost</th></tr></thead>
        <tbody>
          <tr><td>Booksy Boost</td><td>30% of first visit, capped at USD 100</td><td>about 6,480 dollars</td></tr>
          <tr><td>Fresha</td><td>20% of first visit, minimum USD 6</td><td>about 4,320 dollars</td></tr>
          <tr><td>FlatPurse Flow</td><td>None</td><td>0 dollars</td></tr>
        </tbody>
      </table></div>
      <p>That&apos;s 40 clients × 45 dollars × the fee × 12 months. Fees per {src(SOURCES.booksy)} and {src(SOURCES.fresha)}, checked {COMPETITOR_CHECK_DATE}; both publish US terms.</p>
      <p><strong>The takeaway:</strong> the subscription is rarely the expensive part. Commission on growth is. On Flow, the same shop on Pro (CAD {PRICES.pro} a month, {(PRICES.pro * 12).toLocaleString("en-CA")} dollars a year) pays less for the software than one quarter of Booksy Boost commissions.</p>
    </>,
    related: [{ href: "/questions/fresha-booksy-new-client-commission", label: "Does Fresha or Booksy take a commission?" }, ...barberLinks.slice(0, 2)],
  },
  {
    kind: "guide", slug: "canadian-salon-software",
    title: "What Canadian salons should check before choosing booking software",
    titleTag: "8 Checks Before Choosing Salon Software in Canada | FlatPurse Flow",
    meta: "CAD pricing, Interac on a phone, GST/HST, data in Canada and no new-client commission: eight checks for Canadian salon owners.",
    answer: "Most booking software is built for the US market first. These are the eight checks we tell every Canadian salon owner to run, and how Flow answers each.",
    body: <>
      <div className="seo-table-wrap"><table>
        <thead><tr><th>Check</th><th>Why it matters</th><th>Flow</th></tr></thead>
        <tbody>
          <tr><td>Is the price in CAD?</td><td>USD pricing moves with the exchange rate</td><td>Yes</td></tr>
          <tr><td>Does it take Interac on a phone?</td><td>Many Canadian clients pay by debit</td><td>Yes, {RATES.interac} per tap</td></tr>
          <tr><td>Are GST/HST and PST handled correctly?</td><td>Your return depends on it</td><td>All 13 provinces and territories</td></tr>
          <tr><td>Where is client data stored?</td><td>PIPEDA and provincial privacy law</td><td>Canada</td></tr>
          <tr><td>Do marketing messages respect CASL?</td><td>Canadian consent rules are stricter</td><td>Messages go to clients who booked with you</td></tr>
          <tr><td>Is there a commission on new clients?</td><td>It grows as you grow</td><td>None</td></tr>
          <tr><td>What happens after a no-show?</td><td>Reminders alone don&apos;t recover revenue</td><td>Rebook message in about an hour</td></tr>
          <tr><td>Who answers when you&apos;re busy?</td><td>Missed messages are missed bookings</td><td>AI Front Desk</td></tr>
        </tbody>
      </table></div>
      <p>We built Flow in Edmonton to pass every check on day one.</p>
    </>,
    related: [{ href: "/compare/flow-vs-fresha-booksy-vagaro", label: "Flow vs Fresha, Booksy and Vagaro" }, ...salonLinks.slice(0, 2)],
  },
];

export function getArticle(kind: Article["kind"], slug: string): Article | undefined {
  return (kind === "question" ? QUESTIONS : GUIDES).find(a => a.slug === slug);
}
