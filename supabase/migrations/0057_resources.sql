-- FL-042: rooms and equipment. A service can need one or more resources; a time
-- is only offered when every needed resource has free capacity.
create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  name text not null,
  kind text not null default 'room' check (kind in ('room','equipment')),
  capacity int not null default 1 check (capacity between 1 and 50),
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists resources_shop_idx on public.resources(shop_id);
create table if not exists public.service_resources (
  service_id uuid not null references public.services(id) on delete cascade,
  resource_id uuid not null references public.resources(id) on delete cascade,
  primary key (service_id, resource_id)
);
alter table public.resources enable row level security;
alter table public.service_resources enable row level security;
create policy "owners read their resources" on public.resources
  for select using (exists (select 1 from public.shops s where s.id = shop_id and s.owner_id = auth.uid()));
