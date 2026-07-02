-- Dynamic admin access management, additive to the hardcoded root admin in admin-guard.ts.
create table public.admin_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  added_by text,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
-- No RLS policies — admin secret client only, same pattern as public.waitlist.
