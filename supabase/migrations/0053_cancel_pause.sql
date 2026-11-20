-- Cancel flow, save offers, pause (FL-066/067/068).
alter table public.shops
  add column if not exists cancel_at timestamptz,          -- plan ends on this date (cancel at period end)
  add column if not exists plan_ended_at timestamptz,      -- subscription actually ended; starts the C3-C9 emails
  add column if not exists save_offer_at timestamptz,      -- one save offer per 12 months
  add column if not exists paused_until timestamptz,       -- owner pause (Stripe pause_collection)
  add column if not exists pause_history jsonb not null default '[]'::jsonb; -- [{from, until, months}]

create table if not exists public.cancellation_feedback (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  reason text not null,
  comment text,
  detail text,            -- "which feature" / "which tool"
  offer text,             -- offer shown
  outcome text not null check (outcome in ('kept', 'accepted', 'paused', 'downgraded', 'cancelled')),
  created_at timestamptz not null default now()
);
create index if not exists cancellation_feedback_created_idx on public.cancellation_feedback (created_at desc);
alter table public.cancellation_feedback enable row level security;
