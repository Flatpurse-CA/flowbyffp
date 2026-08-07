// One-time setup: creates the Stripe Products/Prices for Pro + Pro+ (monthly and
// annual) and the two Founders-discount coupons on the PLATFORM Stripe account
// (STRIPE_SECRET_KEY) — not Connect. Safe to re-run: looks up existing objects by
// metadata/id before creating new ones.
//
// Usage:  node --env-file=.env.local scripts/stripe-setup-billing.js
//
// Prints the Price IDs to paste into .env.local as:
//   STRIPE_PRICE_PRO_MONTHLY=...
//   STRIPE_PRICE_PRO_ANNUAL=...
//   STRIPE_PRICE_PRO_PLUS_MONTHLY=...
//   STRIPE_PRICE_PRO_PLUS_ANNUAL=...

// eslint-disable-next-line @typescript-eslint/no-require-imports -- plain Node/CommonJS script, run directly via `node`, not part of the Next.js build
const Stripe = require("stripe");

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error("STRIPE_SECRET_KEY is not set. Run with: node --env-file=.env.local scripts/stripe-setup-billing.js");
  process.exit(1);
}
const stripe = new Stripe(key);

const PLAN_PRODUCTS = [
  { planKey: "pro", name: "FlatPurse Flow — Pro", monthly: 59, annual: 588 },
  { planKey: "pro_plus", name: "FlatPurse Flow — Pro+", monthly: 199, annual: 1980 },
];

const FOUNDERS_COUPONS = [
  { id: "founders-40-off", percent_off: 40, name: "Founders Beta — 40% off (12 months)" },
  { id: "founders-25-off", percent_off: 25, name: "Founders Beta — 25% off (forever)" },
];

async function findProductByPlanKey(planKey) {
  const products = await stripe.products.search({ query: `metadata['flatpurse_plan']:'${planKey}'` });
  return products.data[0] ?? null;
}

async function findPrice(productId, unitAmount, interval) {
  const prices = await stripe.prices.list({ product: productId, active: true, limit: 100 });
  return prices.data.find(p => p.unit_amount === unitAmount * 100 && p.recurring?.interval === interval) ?? null;
}

async function ensureProduct(planKey, name) {
  let product = await findProductByPlanKey(planKey);
  if (product) {
    console.log(`Product "${name}" already exists (${product.id})`);
    return product;
  }
  product = await stripe.products.create({ name, metadata: { flatpurse_plan: planKey } });
  console.log(`Created product "${name}" (${product.id})`);
  return product;
}

async function ensurePrice(product, amount, interval) {
  let price = await findPrice(product.id, amount, interval);
  if (price) {
    console.log(`  Price ${interval} C$${amount} already exists (${price.id})`);
    return price;
  }
  price = await stripe.prices.create({
    product: product.id,
    currency: "cad",
    unit_amount: amount * 100,
    recurring: { interval },
  });
  console.log(`  Created price ${interval} C$${amount} (${price.id})`);
  return price;
}

async function ensureCoupon({ id, percent_off, name }) {
  try {
    const coupon = await stripe.coupons.retrieve(id);
    console.log(`Coupon "${name}" already exists (${coupon.id})`);
    return coupon;
  } catch (e) {
    if (e.code !== "resource_missing") throw e;
  }
  const coupon = await stripe.coupons.create({ id, percent_off, duration: "forever", name });
  console.log(`Created coupon "${name}" (${coupon.id})`);
  return coupon;
}

async function main() {
  const envLines = [];

  for (const { planKey, name, monthly, annual } of PLAN_PRODUCTS) {
    const product = await ensureProduct(planKey, name);
    const monthlyPrice = await ensurePrice(product, monthly, "month");
    const annualPrice = await ensurePrice(product, annual, "year");
    const envPrefix = planKey.toUpperCase();
    envLines.push(`STRIPE_PRICE_${envPrefix}_MONTHLY=${monthlyPrice.id}`);
    envLines.push(`STRIPE_PRICE_${envPrefix}_ANNUAL=${annualPrice.id}`);
  }

  for (const coupon of FOUNDERS_COUPONS) {
    await ensureCoupon(coupon);
  }

  console.log("\nAdd these to .env.local:\n");
  console.log(envLines.join("\n"));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
