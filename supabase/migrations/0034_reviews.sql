create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (shop_id, customer_id)
);

create index reviews_shop_idx on public.reviews (shop_id);

alter table public.reviews enable row level security;

-- Reviews are shown on the public booking page, so read access is open.
create policy "Anyone can view reviews" on public.reviews
  for select using (true);

-- A customer can only write their own review, and only for a shop where
-- they have a completed appointment (enforced here as defense-in-depth —
-- the server action in book/[handle]/actions.ts checks this too, for a
-- friendlier error message than a bare RLS rejection).
create policy "Customers can manage own review" on public.reviews
  for all
  using (customer_id in (select id from public.customers where user_id = auth.uid()))
  with check (
    customer_id in (select id from public.customers where user_id = auth.uid())
    and exists (
      select 1 from public.appointments
      where appointments.shop_id = reviews.shop_id
        and appointments.customer_id = reviews.customer_id
        and appointments.status = 'completed'
    )
  );
