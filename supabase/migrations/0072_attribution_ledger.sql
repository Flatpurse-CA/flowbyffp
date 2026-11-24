-- Attribution ledger (Spec 0 + 2): links a booking to the AutoPilot message that
-- produced it. Revenue recovered only counts once the booking is completed, so
-- autopilot_events.amount (what every dashboard sums) is set by this trigger.

create table if not exists public.attributions (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  appointment_id uuid not null unique references public.appointments(id) on delete cascade,
  autopilot_event_id uuid references public.autopilot_events(id) on delete set null,
  flow_key text,
  value_cents int not null default 0,
  status text not null default 'booked' check (status in ('booked', 'completed', 'cancelled')),
  attributed_at timestamptz not null default now(),
  completed_at timestamptz
);
create index if not exists attributions_shop_idx on public.attributions (shop_id, attributed_at desc);
alter table public.attributions enable row level security;
create policy "owners read their attributions" on public.attributions
  for select using (exists (select 1 from public.shops s where s.id = shop_id and s.owner_id = auth.uid()));

create or replace function public.attribution_follow_appointment() returns trigger
language plpgsql security definer set search_path = public as $$
declare v numeric;
begin
  if new.status = 'completed' then
    v := coalesce(new.paid_amount, new.price, 0);
    update attributions set status = 'completed', completed_at = coalesce(completed_at, now()), value_cents = round(v * 100)
     where appointment_id = new.id;
    update autopilot_events set amount = v where appointment_id = new.id;
  elsif new.status in ('cancelled', 'no_show') then
    update attributions set status = 'cancelled' where appointment_id = new.id;
    update autopilot_events set amount = null, outcome = 'sent', appointment_id = null where appointment_id = new.id;
  end if;
  return new;
end $$;

drop trigger if exists attribution_follow_appointment on public.appointments;
create trigger attribution_follow_appointment after update of status, paid_amount, price on public.appointments
  for each row execute function public.attribution_follow_appointment();

-- Backfill: existing attributed bookings get a ledger row; only completed ones keep their amount.
insert into public.attributions (shop_id, appointment_id, autopilot_event_id, flow_key, value_cents, status, attributed_at, completed_at)
select e.shop_id, e.appointment_id, e.id, e.flow_key,
       round(coalesce(a.paid_amount, a.price, e.amount, 0) * 100),
       case when a.status = 'completed' then 'completed' when a.status in ('cancelled', 'no_show') then 'cancelled' else 'booked' end,
       e.created_at, case when a.status = 'completed' then coalesce(a.completed_at, a.starts_at) end
  from public.autopilot_events e join public.appointments a on a.id = e.appointment_id
 where e.appointment_id is not null
on conflict (appointment_id) do nothing;

update public.autopilot_events e set amount = null
  from public.appointments a
 where a.id = e.appointment_id and a.status <> 'completed' and e.amount is not null;
