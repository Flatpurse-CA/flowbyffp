alter table public.staff
  add column user_id uuid references auth.users(id) on delete set null,
  add column email text,
  add column invite_status text not null default 'not_invited'
    check (invite_status in ('not_invited', 'pending', 'accepted')),
  add column invited_at timestamptz,
  add column accepted_at timestamptz;

create unique index staff_user_id_idx on public.staff (user_id) where user_id is not null;

create policy "Staff can view own record" on public.staff
  for select
  using (auth.uid() = user_id);

create policy "Staff can view own shop" on public.shops
  for select
  using (id in (select shop_id from public.staff where user_id = auth.uid()));

create policy "Staff can manage own appointments" on public.appointments
  for all
  using (staff_id in (select id from public.staff where user_id = auth.uid()))
  with check (staff_id in (select id from public.staff where user_id = auth.uid()));
