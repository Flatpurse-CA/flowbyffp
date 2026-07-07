create table public.staff (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,

  full_name text not null,
  role text,
  color text not null default 'rgb(139,92,246)',
  active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index staff_shop_idx on public.staff (shop_id);

alter table public.staff enable row level security;

create policy "Owners can manage own staff" on public.staff
  for all
  using (shop_id in (select id from public.shops where owner_id = auth.uid()))
  with check (shop_id in (select id from public.shops where owner_id = auth.uid()));

alter table public.appointments
  add column staff_id uuid references public.staff(id) on delete set null;

create index appointments_staff_idx on public.appointments (staff_id);
