-- Client-to-client referrals inside one shop. A client shares
-- /book/<handle>?ref=<code>; a new client booking through it gets the shop's
-- reward off that booking, and once that visit is completed the referrer gets
-- the same amount off their next booking. Discounts are capped at half the
-- service price in code so a booking never reaches $0.

alter table public.shops
  add column client_referrals_enabled boolean not null default false,
  add column client_referral_reward numeric(10,2) not null default 10
    check (client_referral_reward >= 0 and client_referral_reward <= 500);

alter table public.appointments
  add column discount_amount numeric(10,2),
  add column discount_reason text;

-- One code per client per shop. Server-only (no policies).
create table public.client_referral_codes (
  shop_id uuid not null references public.shops(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  code text not null unique,
  created_at timestamptz not null default now(),
  primary key (shop_id, customer_id)
);

alter table public.client_referral_codes enable row level security;

create table public.client_referrals (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  referrer_customer_id uuid not null references public.customers(id) on delete cascade,
  referred_customer_id uuid not null references public.customers(id) on delete cascade,
  -- No FKs on the appointment ids: both are claimed with the new booking's id
  -- just before that booking is inserted, so the claim can't race.
  referred_appointment_id uuid,
  reward numeric(10,2) not null,
  -- Set when the referrer's reward is spent on one of their bookings.
  referrer_reward_appointment_id uuid,
  created_at timestamptz not null default now(),
  unique (shop_id, referred_customer_id),
  check (referrer_customer_id <> referred_customer_id)
);

create index client_referrals_referrer_idx on public.client_referrals (shop_id, referrer_customer_id);

alter table public.client_referrals enable row level security;

create policy "Owners can view own client referrals" on public.client_referrals
  for select
  using (shop_id in (select id from public.shops where owner_id = auth.uid()));
