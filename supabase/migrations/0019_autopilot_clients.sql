create table public.clients (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  key text not null,
  full_name text not null,
  phone text,
  email text,
  date_of_birth date,
  visits_count int not null default 0,
  lifetime_value numeric(10,2) not null default 0,
  last_visit_at timestamptz,
  avg_interval_days numeric(6,2),
  preferred_service_name text,
  preferred_staff_id uuid references public.staff(id) on delete set null,
  tag text,
  updated_at timestamptz not null default now(),
  unique (shop_id, key)
);

create index clients_shop_idx on public.clients(shop_id);

alter table public.clients enable row level security;

create policy "Owners can view own clients"
  on public.clients for select
  using (shop_id in (select id from public.shops where owner_id = auth.uid()));
