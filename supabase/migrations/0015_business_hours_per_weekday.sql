-- 0013 added flat booking_open_time/booking_close_time/booking_closed_weekdays columns,
-- but the Settings "Hours" tab UI (already built, pre-dating this feature) models real
-- per-weekday hours. Replace the flat columns with a proper table to match it, rather
-- than downgrade the existing UI to a single daily window.

alter table public.shops
  drop column booking_open_time,
  drop column booking_close_time,
  drop column booking_closed_weekdays;

create table public.business_hours (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  weekday integer not null check (weekday between 0 and 6), -- 0=Sunday
  open boolean not null default true,
  start_time time not null default '09:00',
  end_time time not null default '18:00',
  unique (shop_id, weekday)
);

create index business_hours_shop_idx on public.business_hours (shop_id);

alter table public.business_hours enable row level security;

create policy "Owners can manage own business hours" on public.business_hours
  for all
  using (shop_id in (select id from public.shops where owner_id = auth.uid()))
  with check (shop_id in (select id from public.shops where owner_id = auth.uid()));
