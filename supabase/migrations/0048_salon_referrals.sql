-- Salon-to-salon referrals: each shop shares /r/<referral_code>. When a
-- referred shop completes its first paid checkout, both shops get one month
-- of their plan as Stripe customer-balance credit (the Stripe webhook does it).

-- Volatile default: every existing row gets its own code.
alter table public.shops
  add column referral_code text not null default upper(substr(md5(gen_random_uuid()::text), 1, 8)),
  add column referred_by_shop_id uuid references public.shops(id) on delete set null;

create unique index shops_referral_code_idx on public.shops (referral_code);

create table public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_shop_id uuid not null references public.shops(id) on delete cascade,
  referred_shop_id uuid not null unique references public.shops(id) on delete cascade,
  status text not null default 'signed_up' check (status in ('signed_up', 'rewarded')),
  -- 'owed' when the referrer had no Stripe customer yet; applied at their first checkout.
  referrer_credit text check (referrer_credit in ('applied', 'owed')),
  referrer_credit_cents int,
  created_at timestamptz not null default now(),
  rewarded_at timestamptz,
  check (referrer_shop_id <> referred_shop_id)
);

create index referrals_referrer_idx on public.referrals (referrer_shop_id, created_at desc);

alter table public.referrals enable row level security;

create policy "Owners can view referrals they made" on public.referrals
  for select
  using (referrer_shop_id in (select id from public.shops where owner_id = auth.uid()));
