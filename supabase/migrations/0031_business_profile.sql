-- Business profile fields the dashboard Settings > Business tab displays but
-- never actually had columns for (bio, phone) — the tab was hardcoded mock
-- UI with no save wiring at all.
alter table public.shops
  add column bio text,
  add column phone text;

-- Lets a shop change its booking handle without breaking links already
-- shared with clients: /book/[handle] falls back to this table and
-- redirects to the shop's current handle.
create table public.shop_handle_history (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  old_handle text not null unique,
  created_at timestamptz not null default now()
);
