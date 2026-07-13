import Stripe from "stripe";

let cached: Stripe | null = null;

// Lazily-constructed server-side Stripe client — mirrors src/lib/resend.ts's client()
// pattern. Throws clearly if STRIPE_SECRET_KEY is unset rather than failing silently.
export function stripe(): Stripe {
  if (cached) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set — add it to .env.local before using Stripe.",
    );
  }
  cached = new Stripe(key);
  return cached;
}
