-- Stripe disputes/chargebacks, both platform-level (subscription charges) and
-- per-shop (Connect charges from a shop's own clients). Admin-only table — no
-- owner-facing RLS policy, matches founders_program's write-restriction pattern.
create table public.disputes (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid references public.shops(id) on delete set null,
  stripe_dispute_id text not null unique,
  stripe_charge_id text not null,
  amount numeric(10,2) not null,
  currency text not null default 'cad',
  reason text,
  status text not null,
  is_platform boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index disputes_shop_idx on public.disputes (shop_id);
alter table public.disputes enable row level security;
