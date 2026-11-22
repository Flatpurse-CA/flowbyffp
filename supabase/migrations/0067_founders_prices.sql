-- FL-022 (Nov 21 decisions): Founders is a set of separate locked prices, not a
-- coupon. 40 locations or Jan 31 2027 23:59 Mountain Time, whichever first.
-- A spot counts at the first paid charge; in-person testers are held from the
-- day their free test starts.

alter table public.founders_program
  add column if not exists cap int not null default 40,
  add column if not exists deadline timestamptz not null default '2027-02-01 06:59:00+00';

alter table public.shops
  add column if not exists founder_status text check (founder_status in ('held', 'claimed'));

update public.shops set founder_status = 'claimed' where is_founder and founder_status is null;

drop function if exists public.claim_founder_spot();

-- Called from the Stripe webhook on the first paid invoice. Idempotent per shop.
create or replace function public.claim_founder_spot(p_shop uuid)
returns boolean language plpgsql security definer set search_path = public as $$
declare
  st text;
  prog record;
begin
  select * into prog from founders_program where id = true for update;
  select founder_status into st from shops where id = p_shop for update;
  if st = 'claimed' then return true; end if;
  if st = 'held' then
    update shops set founder_status = 'claimed', is_founder = true, founder_discount_claimed_at = now() where id = p_shop;
    return true;
  end if;
  if prog.spots_remaining <= 0 or now() > prog.deadline then return false; end if;
  update founders_program set spots_remaining = spots_remaining - 1 where id = true;
  update shops set founder_status = 'claimed', is_founder = true, founder_discount_claimed_at = now() where id = p_shop;
  return true;
end $$;

-- Admin holds a spot for an in-person tester.
create or replace function public.hold_founder_spot(p_shop uuid)
returns boolean language plpgsql security definer set search_path = public as $$
declare
  st text;
  prog record;
begin
  select * into prog from founders_program where id = true for update;
  select founder_status into st from shops where id = p_shop for update;
  if st is not null then return true; end if;
  if prog.spots_remaining <= 0 or now() > prog.deadline then return false; end if;
  update founders_program set spots_remaining = spots_remaining - 1 where id = true;
  update shops set founder_status = 'held' where id = p_shop;
  return true;
end $$;

revoke all on function public.claim_founder_spot(uuid) from public, anon, authenticated;
revoke all on function public.hold_founder_spot(uuid) from public, anon, authenticated;
grant execute on function public.claim_founder_spot(uuid) to service_role;
grant execute on function public.hold_founder_spot(uuid) to service_role;
