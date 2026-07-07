alter table public.shops
  add column stripe_connected boolean not null default false,
  add column family_hours_enabled boolean not null default false,
  add column family_hours_start time not null default '18:00',
  add column family_hours_end time not null default '20:00',
  add column family_hours_streak integer not null default 0,
  add column family_hours_last_credited_date date,
  add column daily_brief_email_enabled boolean not null default true;

create table public.autopilot_events (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,

  flow_key text not null
    check (flow_key in ('noshow', 'filler', 'winback', 'frontdesk', 'reminders', 'birthday')),
  event_text text not null,
  amount numeric(10,2),
  client_name text,
  appointment_id uuid references public.appointments(id) on delete set null,

  created_at timestamptz not null default now()
);

create index autopilot_events_shop_created_idx on public.autopilot_events (shop_id, created_at desc);

alter table public.autopilot_events enable row level security;

create policy "Owners can manage own autopilot events" on public.autopilot_events
  for all
  using (shop_id in (select id from public.shops where owner_id = auth.uid()))
  with check (shop_id in (select id from public.shops where owner_id = auth.uid()));
