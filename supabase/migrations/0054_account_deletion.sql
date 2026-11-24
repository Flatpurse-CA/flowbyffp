-- Account deletion (FL-069) and post-cancel data deletion (FL-068).
alter table public.shops
  add column if not exists deletion_scheduled_at timestamptz,  -- owner asked to delete; purge on this date
  add column if not exists deletion_code_hash text,
  add column if not exists deletion_code_expires_at timestamptz;

-- Minimal record kept after a purge (PIPEDA): which business, when, why.
create table if not exists public.deletion_log (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null,
  reason text not null check (reason in ('owner_request', 'post_cancel_90d')),
  deleted_at timestamptz not null default now()
);
alter table public.deletion_log enable row level security;
