-- 0009 introduced circular RLS: shops."Staff can view own shop" queries staff,
-- and staff."Owners can manage own staff" queries shops — Postgres detects this
-- as infinite recursion (42P17) and errors the whole query, breaking owner
-- access to their own shop. Fix: resolve the staff->shop_id lookup through a
-- security definer function, which runs with RLS bypassed internally, breaking
-- the cycle without changing the actual access rule.

create or replace function public.staff_shop_id_for(uid uuid)
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select shop_id from public.staff where user_id = uid limit 1;
$$;

drop policy "Staff can view own shop" on public.shops;

create policy "Staff can view own shop" on public.shops
  for select
  using (id = public.staff_shop_id_for(auth.uid()));
