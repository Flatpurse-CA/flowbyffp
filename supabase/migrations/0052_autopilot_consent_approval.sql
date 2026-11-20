-- AutoPilot compliance + control (FL-006, FL-007, FL-029/061, FL-049).

-- Consent per client. null/'none' = transactional-only (imported clients default
-- here, FL-061); 'express' = opted in; implied consent comes from a Flow visit
-- in the last 2 years and is worked out by the engine, not stored.
alter table public.clients
  add column if not exists marketing_consent text check (marketing_consent in ('express', 'none')),
  add column if not exists do_not_automate boolean not null default false;

-- STOP on the platform number blocks every shop (Twilio blocks the number too).
create table if not exists public.sms_opt_outs (
  phone text primary key,
  created_at timestamptz not null default now(),
  source text not null default 'sms_stop'
);
alter table public.sms_opt_outs enable row level security;

-- Append-only CASL ledger: who opted in/out, when, how.
create table if not exists public.consent_events (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid references public.shops(id) on delete cascade,
  phone text,
  email text,
  action text not null check (action in ('opt_in', 'opt_out', 'help')),
  source text not null,
  created_at timestamptz not null default now()
);
create index if not exists consent_events_shop_idx on public.consent_events (shop_id, created_at desc);
alter table public.consent_events enable row level security;
create policy "owners read their consent ledger" on public.consent_events
  for select using (exists (select 1 from public.shops s where s.id = shop_id and s.owner_id = auth.uid()));

-- "Ask me first": until this time, AutoPilot queues messages for approval.
-- null = created_at + 14 days (worked out in code); owner can switch early.
alter table public.shops add column if not exists autopilot_approval_until timestamptz;

alter table public.autopilot_events drop constraint if exists autopilot_events_outcome_check;
alter table public.autopilot_events
  add constraint autopilot_events_outcome_check
  check (outcome = any (array['sent', 'booked', 'escalated', 'failed', 'disabled', 'pending', 'skipped']));
