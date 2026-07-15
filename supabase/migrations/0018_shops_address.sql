alter table public.shops
  add column if not exists street_address text,
  add column if not exists postal_code text,
  add column if not exists country text default 'Canada';
