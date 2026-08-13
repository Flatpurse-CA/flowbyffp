export type PlanKey = "starter" | "pro" | "pro_plus" | "enterprise";
export type BillingInterval = "monthly" | "annual";

export type Plan = {
  key: PlanKey;
  label: string;
  tagline: string;
  perfectFor: string;
  description: string;
  badge?: string;
  /** null = no self-serve price (Enterprise is sales-negotiated, per-location) */
  monthlyPrice: number | null;
  annualPrice: number | null;
  priceLabel: string;
  features: string[];
  /** null = unlimited */
  teamMemberLimit: number | null;
  bookingLimitPerMonth: number | null;
  /** Effective $/mo when billed annually (annualPrice / 12), for display next to the yearly total. */
  annualMonthlyEquivalent: number | null;
  annualSavingsLabel: string | null;
  cardFee: string;
  interacFee: string;
  smsIncluded: string;
  smsOverageRate: string;
  support: string;
  payoutSpeed: string;
  color: string;
  bg: string;
  border: string;
};

/** No tier charges a new-client or marketplace commission — a deliberate difference from competitors like Fresha. */
export const NO_MARKETPLACE_FEE_NOTE = "No new-client or marketplace commission on any plan.";

export const PLANS: Plan[] = [
  {
    key: "starter",
    label: "Basic",
    tagline: "Get Started",
    perfectFor: "Solo businesses getting started.",
    description: "Everything you need to start accepting bookings.",
    monthlyPrice: 0,
    annualPrice: 0,
    priceLabel: "Free Forever",
    features: [
      "Dashboard", "Calendar", "Bookings", "Clients", "Online Booking Page",
      "Basic POS (single item/service checkout)", "Tap to Pay: no hardware required",
      "AI Front Desk & Daily Brief (pay-per-use credits: 10/$12, 25/$25, 50/$42)",
      "Business Setup", "Email Reminders", "1 Team Member", "Up to 50 bookings/month",
      "Community Support",
    ],
    teamMemberLimit: 1,
    bookingLimitPerMonth: 50,
    annualMonthlyEquivalent: null,
    annualSavingsLabel: null,
    cardFee: "3.4% + $0.35",
    interacFee: "$0.15 flat",
    smsIncluded: "None: pay-as-you-go",
    smsOverageRate: "$0.05/message",
    support: "Community",
    payoutSpeed: "Standard (2–3 days)",
    color: "rgba(255,255,255,0.45)",
    bg: "rgba(255,255,255,0.06)",
    border: "rgba(255,255,255,0.1)",
  },
  {
    key: "pro",
    label: "Pro",
    tagline: "Run Your Business",
    badge: "Most Popular",
    perfectFor: "Growing service businesses.",
    description: "Your AI-powered business assistant.",
    monthlyPrice: 59,
    annualPrice: 588,
    priceLabel: "C$59/month or C$49/month billed annually",
    features: [
      "Unlimited Bookings", "Full POS (multi-item checkout, inventory, commissions)",
      "Quick Charge terminal + Tap to Pay", "Website Builder",
      "AI Front Desk: bundled, unlimited", "AI Daily Brief: bundled, unlimited",
      "Staff Commissions", "Basic Memberships", "500 SMS reminders/month",
      "Advanced Permissions", "Up to 10 Team Members", "Standard Support",
    ],
    teamMemberLimit: 10,
    bookingLimitPerMonth: null,
    annualMonthlyEquivalent: 49,
    annualSavingsLabel: "Save $120/yr",
    cardFee: "3.1% + $0.32",
    interacFee: "$0.10 flat",
    smsIncluded: "500/month",
    smsOverageRate: "$0.04/message",
    support: "Standard",
    payoutSpeed: "Standard",
    color: "rgb(96,165,250)",
    bg: "rgba(59,130,246,0.1)",
    border: "rgba(59,130,246,0.2)",
  },
  {
    key: "pro_plus",
    label: "Pro+",
    tagline: "Grow Your Business",
    perfectFor: "Businesses focused on growth.",
    description: "Everything in Pro, plus advanced AI that improves revenue, profitability and decision-making.",
    monthlyPrice: 199,
    annualPrice: 1980,
    priceLabel: "C$199/month or C$165/month billed annually",
    features: [
      "Everything in Pro",
      "Flow Coach™: exclusive AI business advisor",
      "AI Autopilot: exclusive automated workflows",
      "Advanced Memberships", "Multi-Location Support", "AI Marketing",
      "1,000 SMS reminders/month", "Priority Support",
      "Advanced Analytics Dashboard", "Revenue Optimization", "Priority AI Processing",
      "Early Access to New AI Features", "Up to 25 Team Members",
    ],
    teamMemberLimit: 25,
    bookingLimitPerMonth: null,
    annualMonthlyEquivalent: 165,
    annualSavingsLabel: "Save $408/yr",
    cardFee: "3.0% + $0.31",
    interacFee: "$0.08 flat",
    smsIncluded: "1,000/month",
    smsOverageRate: "$0.035/message",
    support: "Priority",
    payoutSpeed: "Next-day",
    color: "rgb(167,139,250)",
    bg: "rgba(109,40,217,0.1)",
    border: "rgba(139,92,246,0.2)",
  },
  {
    key: "enterprise",
    label: "Enterprise",
    tagline: "Scale Your Business",
    perfectFor: "Multi-location businesses and larger organizations.",
    description: "Everything in Pro+, applied per location, with volume-discounted pricing and a dedicated SLA.",
    monthlyPrice: null,
    annualPrice: null,
    priceLabel: "From $179/location/mo",
    features: [
      "Everything in Pro+, per location", "Website Builder + White-Label",
      "Volume pricing: $179–$159/location",
      "500 SMS reminders/location/month", "Advanced Memberships", "Custom Integrations",
      "Dedicated SLA", "Priority Roadmap Access", "Licensing / White-Label (custom-quoted)",
      "Next-day/custom payout", "Unlimited Team Members", "Unlimited Locations",
      "Multi-location Management", "Centralized Dashboard", "Enterprise Roles & Permissions",
      "Dedicated Onboarding", "Dedicated Customer Success Manager", "Enterprise Security",
    ],
    teamMemberLimit: null,
    bookingLimitPerMonth: null,
    annualMonthlyEquivalent: null,
    annualSavingsLabel: null,
    cardFee: "Interchange + ~0.4%",
    interacFee: "Negotiated",
    smsIncluded: "500/location/month",
    smsOverageRate: "$0.03/message (negotiable)",
    support: "Dedicated SLA",
    payoutSpeed: "Custom",
    color: "rgb(251,191,36)",
    bg: "rgba(245,158,11,0.1)",
    border: "rgba(245,158,11,0.2)",
  },
];

export const PLAN_COLORS = Object.fromEntries(PLANS.map(p => [p.key, p.color])) as Record<string, string>;
export const PLAN_BG     = Object.fromEntries(PLANS.map(p => [p.key, p.bg]))    as Record<string, string>;

export function getPlan(key: string): Plan {
  return PLANS.find(p => p.key === key) ?? PLANS[0];
}

/** Display label for a plan key — plan keys like "pro_plus" aren't fit for rendering directly (would read "Pro_plus" capitalized). */
export function planLabel(key: string): string {
  return getPlan(key).label;
}

/** Monthly price used for revenue estimates (e.g. admin MRR). Enterprise is sales-negotiated so it counts as 0 here. */
export function planPrice(key: string): number {
  return getPlan(key).monthlyPrice ?? 0;
}

export function formatCAD(amount: number): string {
  return `C$${amount.toLocaleString("en-CA")}`;
}

/** Env var names holding the live Stripe Price IDs, created once by scripts/stripe-setup-billing.ts */
const STRIPE_PRICE_ENV: Record<"pro" | "pro_plus", Record<BillingInterval, string>> = {
  pro:      { monthly: "STRIPE_PRICE_PRO_MONTHLY",      annual: "STRIPE_PRICE_PRO_ANNUAL" },
  pro_plus: { monthly: "STRIPE_PRICE_PRO_PLUS_MONTHLY", annual: "STRIPE_PRICE_PRO_PLUS_ANNUAL" },
};

export function getStripePriceId(key: "pro" | "pro_plus", interval: BillingInterval): string {
  const envName = STRIPE_PRICE_ENV[key][interval];
  const id = process.env[envName];
  if (!id) throw new Error(`${envName} is not set, run scripts/stripe-setup-billing.ts and add the printed IDs to .env.local`);
  return id;
}
