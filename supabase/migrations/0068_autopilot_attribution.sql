-- FL-055: link a recovered booking to the AutoPilot message that caused it, so
-- cancelling the booking removes it from "revenue recovered".
alter table public.autopilot_events
  add column if not exists appointment_id uuid references public.appointments(id) on delete set null;
create index if not exists autopilot_events_appointment_idx on public.autopilot_events(appointment_id) where appointment_id is not null;
