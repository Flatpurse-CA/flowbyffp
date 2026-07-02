export type PlanKey = "founders" | "unlimited" | "pro" | "starter";

export const PLANS: {
  key: PlanKey;
  label: string;
  price: number;
  priceLabel: string;
  color: string;
  bg: string;
  border: string;
}[] = [
  { key: "founders",  label: "Founders",  price: 29,  priceLabel: "C$29/mo",  color: "rgb(251,191,36)",        bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.2)" },
  { key: "unlimited", label: "Unlimited", price: 274, priceLabel: "C$274/mo", color: "rgb(167,139,250)",       bg: "rgba(109,40,217,0.1)",  border: "rgba(139,92,246,0.2)" },
  { key: "pro",       label: "Pro",       price: 49,  priceLabel: "C$49/mo",  color: "rgb(96,165,250)",        bg: "rgba(59,130,246,0.1)",  border: "rgba(59,130,246,0.2)" },
  { key: "starter",   label: "Starter",   price: 0,   priceLabel: "Free",     color: "rgba(255,255,255,0.45)", bg: "rgba(255,255,255,0.06)", border: "rgba(255,255,255,0.1)" },
];

export const PLAN_COLORS = Object.fromEntries(PLANS.map(p => [p.key, p.color])) as Record<string, string>;
export const PLAN_BG     = Object.fromEntries(PLANS.map(p => [p.key, p.bg]))    as Record<string, string>;

export function planPrice(key: string): number {
  return PLANS.find(p => p.key === key)?.price ?? 0;
}

export function formatCAD(amount: number): string {
  return `C$${amount.toLocaleString("en-CA")}`;
}
