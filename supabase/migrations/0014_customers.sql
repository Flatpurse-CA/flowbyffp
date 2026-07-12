create table public.customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,

  full_name text not null,
  phone text,
  email text not null,

  created_at timestamptz not null default now()
);

alter table public.customers enable row level security;

create policy "Customers can manage own record" on public.customers
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

alter table public.appointments
  add column customer_id uuid references public.customers(id) on delete set null;

create index appointments_customer_idx on public.appointments (customer_id);

create policy "Customers can view own appointments" on public.appointments
  for select
  using (customer_id in (select id from public.customers where user_id = auth.uid()));
