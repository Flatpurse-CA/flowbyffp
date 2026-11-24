-- FL-037/041: deposit rules, cancellation window, late-cancel and no-show fees,
-- and a private manage link per booking.
alter table public.shops
  add column if not exists deposit_mode text not null default 'percent' check (deposit_mode in ('none','fixed','percent')),
  add column if not exists deposit_value numeric not null default 20,
  add column if not exists cancel_window_hours int not null default 24 check (cancel_window_hours between 0 and 168),
  add column if not exists late_cancel_fee_mode text not null default 'none' check (late_cancel_fee_mode in ('none','fixed','percent')),
  add column if not exists late_cancel_fee_value numeric not null default 0,
  add column if not exists no_show_fee_mode text not null default 'none' check (no_show_fee_mode in ('none','fixed','percent')),
  add column if not exists no_show_fee_value numeric not null default 0;
alter table public.appointments
  add column if not exists manage_token text unique,
  add column if not exists card_consent_at timestamptz,
  add column if not exists fee_kind text,
  add column if not exists fee_amount numeric,
  add column if not exists fee_charged_at timestamptz,
  add column if not exists fee_payment_intent text;
