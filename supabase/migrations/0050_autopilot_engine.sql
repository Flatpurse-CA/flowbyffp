-- AutoPilot engine (src/lib/autopilot/engine.ts, run by /api/cron/autopilot).
-- dedupe_key makes each send idempotent: the engine claims a row before it
-- messages anyone, so overlapping runs can never message a client twice.
alter table public.autopilot_events
  add column if not exists dedupe_key text,
  add column if not exists client_phone text;

create unique index if not exists autopilot_events_dedupe_idx
  on public.autopilot_events (shop_id, flow_key, dedupe_key)
  where dedupe_key is not null;

create index if not exists autopilot_events_shop_phone_idx
  on public.autopilot_events (shop_id, client_phone)
  where client_phone is not null;

-- Front Desk already writes outcome 'disabled', which the old check rejected.
alter table public.autopilot_events drop constraint if exists autopilot_events_outcome_check;
alter table public.autopilot_events
  add constraint autopilot_events_outcome_check
  check (outcome = any (array['sent', 'booked', 'escalated', 'failed', 'disabled']));
