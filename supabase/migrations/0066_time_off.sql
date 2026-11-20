-- FL-087: time off / blocked time. staff_id null = whole shop closed.
create table if not exists public.time_off (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  staff_id uuid references public.staff(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null check (ends_at > starts_at),
  reason text,
  created_at timestamptz not null default now()
);
create index if not exists time_off_shop_idx on public.time_off(shop_id, starts_at);
alter table public.time_off enable row level security;
