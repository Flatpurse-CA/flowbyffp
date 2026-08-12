// One-time/idempotent setup: creates a Stripe Terminal "Location" on each
// shop's own CONNECTED account (not the platform account) so Tap to Pay
// readers have somewhere to register. Skips shops that haven't connected
// Stripe yet or are missing street address fields (0018_shops_address.sql),
// and skips shops that already have a stripe_terminal_location_id saved.
//
// Usage:  node --env-file=.env.local scripts/stripe-setup-terminal-locations.js

// eslint-disable-next-line @typescript-eslint/no-require-imports -- plain Node/CommonJS script, run directly via `node`, not part of the Next.js build
const Stripe = require("stripe");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createClient } = require("@supabase/supabase-js");

const stripeKey = process.env.STRIPE_SECRET_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!stripeKey || !supabaseUrl || !supabaseSecretKey) {
  console.error(
    "STRIPE_SECRET_KEY, NEXT_PUBLIC_SUPABASE_URL, and SUPABASE_SECRET_KEY must all be set. Run with: node --env-file=.env.local scripts/stripe-setup-terminal-locations.js",
  );
  process.exit(1);
}

const stripe = new Stripe(stripeKey);
const supabase = createClient(supabaseUrl, supabaseSecretKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Stripe wants an ISO 3166-1 alpha-2 country code, shops.country stores the
// full name (defaults to 'Canada' per 0018_shops_address.sql).
const COUNTRY_CODES = { canada: "CA", "united states": "US" };
function toCountryCode(country) {
  return COUNTRY_CODES[(country ?? "").trim().toLowerCase()] ?? "CA";
}

async function main() {
  const { data: shops, error } = await supabase
    .from("shops")
    .select("id, name, stripe_account_id, stripe_terminal_location_id, street_address, city, province, postal_code, country");

  if (error) {
    console.error("Failed to load shops:", error.message);
    process.exit(1);
  }

  for (const shop of shops ?? []) {
    if (!shop.stripe_account_id) {
      console.log(`Skip "${shop.name}" (${shop.id}) — Stripe not connected yet`);
      continue;
    }
    if (shop.stripe_terminal_location_id) {
      console.log(`Skip "${shop.name}" (${shop.id}) — already has a Terminal Location (${shop.stripe_terminal_location_id})`);
      continue;
    }
    if (!shop.street_address || !shop.city || !shop.postal_code) {
      console.log(`Skip "${shop.name}" (${shop.id}) — missing street address/city/postal code, ask the owner to fill in shop address first`);
      continue;
    }

    try {
      const location = await stripe.terminal.locations.create(
        {
          display_name: shop.name,
          address: {
            line1: shop.street_address,
            city: shop.city,
            state: shop.province ?? undefined,
            postal_code: shop.postal_code,
            country: toCountryCode(shop.country),
          },
        },
        { stripeAccount: shop.stripe_account_id },
      );

      const { error: updateError } = await supabase
        .from("shops")
        .update({ stripe_terminal_location_id: location.id })
        .eq("id", shop.id);

      if (updateError) {
        console.error(`Created Location ${location.id} for "${shop.name}" but failed to save it:`, updateError.message);
        continue;
      }

      console.log(`Created Location ${location.id} for "${shop.name}"`);
    } catch (err) {
      console.error(`Failed to create Location for "${shop.name}" (${shop.id}):`, err instanceof Error ? err.message : err);
    }
  }
}

main();
