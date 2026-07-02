alter table public.shops
  add column handle text unique;

create index if not exists shops_handle_idx on public.shops (handle);
