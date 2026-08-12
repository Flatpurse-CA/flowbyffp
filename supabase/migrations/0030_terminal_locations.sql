-- Stripe Terminal Location per shop, required to register/discover a Tap to
-- Pay reader (0016_stripe_connect already added stripe_account_id).
alter table public.shops
  add column stripe_terminal_location_id text;
