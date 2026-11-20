-- Auto-applied AutoPilot offers (FL-052/054): win-back 15% / 14 days, birthday 10% / 30 days.
-- The token rides on the client's personal booking link; it only works for that client
-- (matched on email or phone), once, before it expires.
create table if not exists public.client_offers (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  token text not null unique,
  flow_key text not null check (flow_key in ('winback', 'birthday')),
  percent_off numeric(5,2) not null check (percent_off > 0 and percent_off <= 100),
  client_email text,
  client_phone text,
  expires_at timestamptz not null,
  used_at timestamptz,
  appointment_id uuid,
  created_at timestamptz not null default now()
);
create index if not exists client_offers_shop_idx on public.client_offers (shop_id, created_at desc);
alter table public.client_offers enable row level security;
create policy "owners read their offers" on public.client_offers
  for select using (exists (select 1 from public.shops s where s.id = shop_id and s.owner_id = auth.uid()));

-- Owner-adjustable offer sizes (0 turns the offer off).
alter table public.shops
  add column if not exists winback_offer_pct numeric(5,2) not null default 15,
  add column if not exists birthday_offer_pct numeric(5,2) not null default 10;

-- Personal link sent with a queued ("Ask me first") message.
alter table public.autopilot_events add column if not exists link text;
