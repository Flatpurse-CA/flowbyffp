-- Tracks whether the 24h reminder email has gone out for an appointment, so
-- the reminder cron (runs hourly, see appointment-reminders function) doesn't
-- re-send every time it sweeps the same upcoming window.
alter table public.appointments
  add column reminder_sent_at timestamptz;
