export type PlanKey = "starter" | "pro" | "pro_plus" | "enterprise";
export type BillingInterval = "monthly" | "annual";

export type Plan = {
  key: PlanKey;
  label: string;
  tagline: string;
  perfectFor: string;
  description: string;
  badge?: string;
  /** null = no self-serve price (Enterprise is sales-negotiated) */
  monthlyPrice: number | null;
  annualPrice: number | null;
  priceLabel: string;
  features: string[];
  /** null = unlimited */
  teamMemberLimit: number | null;
  bookingLimitPerMonth: number | null;
  color: string;
  bg: string;
  border: string;
};

export const PLANS: Plan[] = [
  {
    key: "starter",
    label: "Starter",
    tagline: "Get Started",
    perfectFor: "Solo businesses getting started.",
    description: "Everything you need to start accepting bookings.",
    monthlyPrice: 0,
    annualPrice: 0,
    priceLabel: "Free Forever",
    features: [
      "Dashboard", "Calendar", "Bookings", "Clients", "Online Booking Page", "Payments",
      "Business Setup", "Email Reminders", "1 Team Member", "Up to 30 bookings/month",
      "Basic Support",
    ],
    teamMemberLimit: 1,
    bookingLimitPerMonth: 30,
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
    annualPrice: 590,
    priceLabel: "C$59/month or C$590/year",
    features: [
      "AI Front Desk", "AI Daily Brief", "Unlimited Bookings", "Family Hours",
      "Advanced Permissions", "Up to 10 Team Members", "Priority Support",
    ],
    teamMemberLimit: 10,
    bookingLimitPerMonth: null,
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
    monthlyPrice: 119,
    annualPrice: 1190,
    priceLabel: "C$119/month or C$1,190/year",
    features: [
      "Flow Coach™ (Business Health Score, Revenue Forecasting, Pricing Recommendations, Staffing Recommendations, Customer Retention Insights, Marketing Recommendations, Goal Tracking, Predictive Analytics)",
      "AI Autopilot (Marketing Automation, Customer Reactivation, Waitlist Automation, Workflow Automation, Follow-ups)",
      "Advanced Analytics Dashboard", "Revenue Optimization", "Priority AI Processing",
      "Early Access to New AI Features", "Up to 25 Team Members",
    ],
    teamMemberLimit: 25,
    bookingLimitPerMonth: null,
    color: "rgb(167,139,250)",
    bg: "rgba(109,40,217,0.1)",
    border: "rgba(139,92,246,0.2)",
  },
  {
    key: "enterprise",
    label: "Enterprise",
    tagline: "Scale Your Business",
    perfectFor: "Multi-location businesses and larger organizations.",
    description: "Everything in Pro+, plus enterprise-grade management and support.",
    monthlyPrice: null,
    annualPrice: null,
    priceLabel: "Custom Pricing",
    features: [
      "Unlimited Team Members", "Unlimited Locations", "Multi-location Management",
      "Centralized Dashboard", "Enterprise Roles & Permissions", "Dedicated Onboarding",
      "Dedicated Customer Success Manager", "Enterprise Security", "API Access (Future)",
      "Custom Integrations (Future)", "Priority SLA Support",
    ],
    teamMemberLimit: null,
    bookingLimitPerMonth: null,
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
  if (!id) throw new Error(`${envName} is not set — run scripts/stripe-setup-billing.ts and add the printed IDs to .env.local`);
  return id;
}
