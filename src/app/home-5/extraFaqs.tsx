import Link from "next/link";

/** home-4 FAQs that home-3's FAQ didn't already cover; appended to home-3's FAQ on home-5. */
export const EXTRA_FAQS: { q: string; a: React.ReactNode }[] = [
  { q: "Does Flow actually work for a business like mine?", a: <>Flow is designed for independent salons and barbershops. The walkthrough shows an example workflow with demo data, not verified customer results. <a href="#demo">Request a personal demo</a> to explore how it fits your services, team and booking process.</> },
  { q: "How hard is switching to Flow?", a: "You’ll need to set up your services, staff, booking availability and payment settings. Before switching, contact us to confirm which client records can be imported from your current system and what setup help is available." },
  { q: "Which plan includes AutoPilot?", a: <>Starter begins at C$39/month for booking, client management and payments. Pro starts at C$89/month and adds AutoPilot and AI Front Desk. Pro+ starts at C$189/month and adds Flow Coach and business insights. Card processing and platform fees apply. <Link href="/pricing">Compare all features and fees</Link>.</> },
  { q: "What happens after I click Start free trial?", a: <>You’ll go to Flow’s signup page to create your account. No credit card is required to get started. Confirm the current trial duration, included features and any beta offer during signup, or <a href="#demo">ask us before joining</a>.</> },
];
