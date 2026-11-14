import Link from "next/link";

/** FAQs 09 to 12, appended to the shared FAQ list on the homepage. */
export const EXTRA_FAQS: { q: string; a: React.ReactNode }[] = [
  { q: "Does Flow work for a business like mine?", a: "Flow is built for appointment-based shops: salons, barbershops, spas, and nail and beauty studios. It suits a solo owner through to a multi-chair team, and Enterprise covers three or more locations. The dashboard and walkthrough on this site use sample data. The 14-day trial is the real test, with your own services and clients." },
  { q: "How hard is switching to Flow?", a: "You set up your services, staff, hours and payments. You can bring your client list over from your current booking app with the Switch to Flow tool in your dashboard." },
  { q: "Which plan includes AutoPilot?", a: <>Pro+ at C$189 a month includes all six AutoPilot flows, Flow Coach and business insights. Pro at C$89 a month includes AI Front Desk and the Daily Brief. Starter at C$39 a month covers booking, client management and payments. Card processing fees apply on every plan. <Link href="/pricing">Compare plans</Link>.</> },
  { q: "What happens after I click Start free trial?", a: "You create your account and get 14 days of Pro+. You choose a plan and add a card, and you are not charged until the trial ends. Founders pricing is applied automatically while spots remain." },
];
