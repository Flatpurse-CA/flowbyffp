create table public.services (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,

  name text not null,
  price numeric(10,2) not null,
  duration_minutes integer not null,
  category text,
  active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index services_shop_idx on public.services (shop_id);

alter table public.services enable row level security;

create policy "Owners can manage own services" on public.services
  for all
  using (shop_id in (select id from public.shops where owner_id = auth.uid()))
  with check (shop_id in (select id from public.shops where owner_id = auth.uid()));
