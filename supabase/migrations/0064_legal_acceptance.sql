-- FL-018: record which Terms/Privacy version each owner accepted, when, from where;
-- marketing emails only with an unticked-by-default opt-in.
create table if not exists public.legal_acceptances (
  id bigserial primary key,
  user_id uuid not null,
  document text not null check (document in ('terms','privacy')),
  version text not null,
  accepted_at timestamptz not null default now(),
  ip text,
  user_agent text
);
create index if not exists legal_acceptances_user_idx on public.legal_acceptances(user_id);
alter table public.legal_acceptances enable row level security;
alter table public.profiles add column if not exists marketing_opt_in boolean not null default false;
alter table public.profiles add column if not exists marketing_opt_in_at timestamptz;
