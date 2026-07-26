-- Real feature-usage event log. Starts empty and fills in as
-- src/lib/featureUsage.ts's logFeatureUsage() is called from real page loads
-- (Flow Coach, AutoPilot, Daily Brief) -- no synthetic seed data.
create table public.feature_usage_events (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  feature_key text not null,
  occurred_at timestamptz not null default now()
);

create index feature_usage_events_feature_idx on public.feature_usage_events (feature_key, occurred_at desc);
create index feature_usage_events_shop_idx on public.feature_usage_events (shop_id);

alter table public.feature_usage_events enable row level security;

create policy "Owners can insert their own shop's usage events" on public.feature_usage_events
  for insert
  with check (shop_id in (select id from public.shops where owner_id = auth.uid()));
