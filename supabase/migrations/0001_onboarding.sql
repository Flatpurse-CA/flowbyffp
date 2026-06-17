create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  created_at timestamptz not null default now()
);

create table public.shops (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references auth.users(id) on delete cascade,
  name text not null,
  business_type text not null,
  city text not null,
  province text not null,
  plan text not null default 'starter',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.shops enable row level security;

create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Owners can view own shop" on public.shops
  for select using (auth.uid() = owner_id);
create policy "Owners can update own shop" on public.shops
  for update using (auth.uid() = owner_id);
