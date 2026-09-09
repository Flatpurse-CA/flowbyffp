-- Adds a distinct "no_show" outcome, separate from "cancelled" — a shop marks
-- this after a confirmed appointment's time has passed and the client never
-- turned up, whereas "cancelled" means the booking was called off ahead of time.
alter table public.appointments
  drop constraint appointments_status_check;

alter table public.appointments
  add constraint appointments_status_check
  check (status in ('confirmed', 'pending', 'deposit', 'completed', 'cancelled', 'no_show'));
