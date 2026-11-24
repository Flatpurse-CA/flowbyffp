-- Billing lifecycle (FL-023, FL-024, FL-070/071, FL-116-118).
-- payment_failed_at / dunning_step drive the day 0/3/5/7 dunning emails.
-- card_fingerprint enforces one free trial per card.
-- billing_notices records which one-off notices were sent (e11, r3, renewal
-- reminders keyed by invoice period) so retries and cron overlaps never repeat one.
alter table public.shops
  add column if not exists payment_failed_at timestamptz,
  add column if not exists dunning_step smallint not null default 0,
  add column if not exists card_fingerprint text,
  add column if not exists billing_notices jsonb not null default '{}'::jsonb;

create index if not exists shops_card_fingerprint_idx on public.shops (card_fingerprint) where card_fingerprint is not null;
create index if not exists shops_phone_idx on public.shops (phone) where phone is not null;
create index if not exists shops_payment_failed_idx on public.shops (payment_failed_at) where payment_failed_at is not null;
