create table public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  shop_type text,
  status text not null default 'pending',
  notes text,
  created_at timestamptz not null default now(),
  approved_at timestamptz
);

alter table public.waitlist enable row level security;
-- No RLS policies — admin secret client only
