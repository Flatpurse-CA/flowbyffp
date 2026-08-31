-- Lets an admin pause a shop's trial/grace clock (e.g. while a billing issue
-- is being sorted out manually) without losing the remaining time. While
-- paused, computeAccessStatus freezes the shop at "trialing". On resume,
-- trial_started_at is shifted forward by the paused duration so the
-- remaining days are preserved exactly rather than reset to zero.
alter table public.shops
  add column trial_paused_at timestamptz;
