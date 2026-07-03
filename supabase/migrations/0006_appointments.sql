create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,

  client_name text not null,
  client_phone text,
  client_email text,
  client_notes text,

  service_name text not null,
  stylist_name text,

  starts_at timestamptz not null,
  duration_minutes integer not null default 30,
  price numeric(10,2) not null default 0,
  deposit_amount numeric(10,2),

  status text not null default 'confirmed'
    check (status in ('confirmed', 'pending', 'deposit', 'completed', 'cancelled')),

  tip_amount numeric(10,2),
  payment_method text,
  paid_amount numeric(10,2),
  completed_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index appointments_shop_starts_idx on public.appointments (shop_id, starts_at);

alter table public.appointments enable row level security;

create policy "Owners can manage own appointments" on public.appointments
  for all
  using (shop_id in (select id from public.shops where owner_id = auth.uid()))
  with check (shop_id in (select id from public.shops where owner_id = auth.uid()));
