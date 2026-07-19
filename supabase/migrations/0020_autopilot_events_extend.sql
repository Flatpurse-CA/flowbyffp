alter table public.autopilot_events
  add column client_id uuid references public.clients(id) on delete set null,
  add column channel text not null default 'email',
  add column message_body text,
  add column outcome text not null default 'sent',
  add column error text;

alter table public.autopilot_events
  add constraint autopilot_events_outcome_check
  check (outcome = any (array['sent', 'booked', 'escalated', 'failed']));
