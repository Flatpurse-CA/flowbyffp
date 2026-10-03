create table public.demo_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  business text not null,
  phone text,
  marketing_opt_in boolean not null default false,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

alter table public.demo_requests enable row level security;
-- No RLS policies — admin secret client only, same pattern as public.waitlist.
