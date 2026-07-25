-- Internal feature-flag infrastructure for staged rollouts of FlatPurse's own
-- app features (not the marketing-style A/B experiments from the AI Studio
-- export — there's no product-experimentation program to power that yet).
create table public.feature_flags (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  description text,
  enabled boolean not null default false,
  rollout_pct int not null default 100 check (rollout_pct between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.feature_flags enable row level security;

-- Readable by anyone (including the app at runtime, for both admin and shop
-- owners) — flags aren't sensitive. Writes only via the admin panel's
-- service-role client, same restriction pattern as founders_program.
create policy "Anyone can view feature flags" on public.feature_flags
  for select using (true);
