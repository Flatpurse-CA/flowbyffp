-- FL-088 commissions (Spec Part 2 item 7 + George Nov 21): % per service with a
-- per-staff override, on the service price after discounts and before tax.
-- Tips always go 100% to the staff member. Flow reports; it does not run payroll.
alter table public.services add column if not exists commission_pct numeric check (commission_pct between 0 and 100);

alter table public.staff
  add column if not exists commission_type text not null default 'percent' check (commission_type in ('percent', 'flat', 'none', 'renter')),
  add column if not exists commission_pct numeric check (commission_pct between 0 and 100),
  add column if not exists commission_flat numeric check (commission_flat >= 0),
  add column if not exists rent_amount numeric check (rent_amount >= 0),
  add column if not exists rent_period text check (rent_period in ('week', 'month'));

alter table public.shops
  add column if not exists default_commission_pct numeric not null default 0 check (default_commission_pct between 0 and 100),
  add column if not exists commission_on_fees boolean not null default false;
