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
    label: "Starter",
    tagline: "Get Started",
    perfectFor: "Solo businesses getting started.",
    description: "Everything you need to start accepting bookings.",
    monthlyPrice: 39,
    annualPrice: 390,
    priceLabel: "C$39/month or C$32.50/month billed annually",
    features: [
      "Home Dashboard & booking calendar",
      "Full POS, payments & Tap to Pay",
      "Client CRM & appointment history",
      "Reviews & business settings",
      "Up to 2 Team Members",
    ],
    teamMemberLimit: 2,
    bookingLimitPerMonth: null,
    annualMonthlyEquivalent: 32.5,
    annualSavingsLabel: "Save $78/yr",
    cardFee: "2.7% + $0.05 + C$0.10/txn platform fee (in-person) · 2.9% + $0.30 + C$0.20/txn (online)",
    interacFee: "1% + $0.30",
    smsIncluded: "None: pay-as-you-go",
    smsOverageRate: "$0.05/message",
    support: "Community",
    payoutSpeed: "Standard (2–3 days)",
    // A fixed slate tone (not a theme-relative white/black alpha) since this
    // is used only in the admin panel's light theme — the previous
    // "rgba(255,255,255,...)" values were tuned for a dark background and
    // read as a near-invisible white-on-white pill once the panel got a
    // light theme.
    color: "rgb(100,116,139)",
    bg: "rgba(100,116,139,0.14)",
    border: "rgba(100,116,139,0.3)",
  },
  {
    key: "pro",
    label: "Pro",
    tagline: "Run Your Business",
    perfectFor: "Growing service businesses.",
    description: "Your AI-powered business assistant.",
    monthlyPrice: 89,
    annualPrice: 890,
    priceLabel: "C$89/month or C$74.17/month billed annually",
    features: [
      "Everything in Starter",
      "AutoPilot: no-show recovery, win-backs, AI Front Desk",
      "Daily Brief: morning business summary",
      "Client segmentation & churn-risk alerts",
      "Up to 10 Team Members",
    ],
    teamMemberLimit: 10,
    bookingLimitPerMonth: null,
    annualMonthlyEquivalent: 74.17,
    annualSavingsLabel: "Save $178/yr",
    cardFee: "2.7% + $0.05 + C$0.07/txn platform fee (in-person) · 2.9% + $0.30 + C$0.15/txn (online)",
    interacFee: "1% + $0.30",
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
    badge: "Most Popular",
    perfectFor: "Businesses focused on growth.",
    description: "Everything in Pro, plus advanced AI that improves revenue, profitability and decision-making.",
    monthlyPrice: 189,
    annualPrice: 1890,
    priceLabel: "C$189/month or C$157.50/month billed annually",
    features: [
      "Everything in Pro",
      "Flow Coach™: your AI business consultant",
      "Business Health Score & revenue forecasting",
      "Staffing & retention insights",
      "Up to 25 Team Members",
    ],
    teamMemberLimit: 25,
    bookingLimitPerMonth: null,
    annualMonthlyEquivalent: 157.5,
    annualSavingsLabel: "Save $378/yr",
    cardFee: "2.7% + $0.05 + C$0.05/txn platform fee (in-person) · 2.9% + $0.30 + C$0.10/txn (online)",
    interacFee: "1% + $0.30",
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
    priceLabel: "Custom — talk to us",
    features: [
      "Everything in Pro+",
      "Multi-location dashboard",
      "Advanced reporting & priority support",
      "Dedicated onboarding",
      "Unlimited Team Members",
      "Unlimited Locations",
    ],
    teamMemberLimit: null,
    bookingLimitPerMonth: null,
    annualMonthlyEquivalent: null,
    annualSavingsLabel: null,
    cardFee: "2.7% + $0.05 (platform fee waived) · 2.9% + $0.30 (online, waived)",
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

export const PLAN_COLORS = Object.fromEntries(PLANS.map(p => [p.key, p.color]))  as Record<string, string>;
export const PLAN_BG     = Object.fromEntries(PLANS.map(p => [p.key, p.bg]))     as Record<string, string>;
export const PLAN_BORDER = Object.fromEntries(PLANS.map(p => [p.key, p.border])) as Record<string, string>;

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
