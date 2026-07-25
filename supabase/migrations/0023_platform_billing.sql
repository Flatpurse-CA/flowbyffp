-- Platform subscription billing (FlatPurse charging shop owners), separate from
-- stripe_account_id/stripe_connected (0016) which is the Connect payout account
-- shops use to accept payments from their own clients.
alter table public.shops
  add column stripe_customer_id text,
  add column subscription_id text,
  add column subscription_status text,
  add column billing_interval text check (billing_interval in ('monthly', 'annual')),
  add column is_founder boolean not null default false,
  add column founder_discount_claimed_at timestamptz;

create unique index shops_stripe_customer_id_idx on public.shops (stripe_customer_id) where stripe_customer_id is not null;

-- Single-row counter so claiming a Founders spot is an atomic
-- `update ... set spots_remaining = spots_remaining - 1 where spots_remaining > 0`
-- rather than a check-then-insert race between two simultaneous signups.
create table public.founders_program (
  id boolean primary key default true check (id),
  spots_remaining int not null default 40
);
insert into public.founders_program (id, spots_remaining) values (true, 40);

alter table public.founders_program enable row level security;
create policy "Anyone can view founders spots remaining" on public.founders_program
  for select using (true);

-- No direct update policy on founders_program — claiming a spot only happens
-- through this function (security definer), which does the check-and-decrement
-- as a single atomic UPDATE so two simultaneous signups can't both claim the
-- last spot.
create or replace function public.claim_founder_spot()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  claimed boolean;
begin
  update public.founders_program
  set spots_remaining = spots_remaining - 1
  where id = true and spots_remaining > 0;
  claimed := found;
  return claimed;
end;
$$;

grant execute on function public.claim_founder_spot() to authenticated, service_role;
