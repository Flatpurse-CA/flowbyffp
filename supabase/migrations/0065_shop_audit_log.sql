-- FL-013: per-shop audit log of sensitive owner/staff actions.
create table if not exists public.shop_audit_log (
  id bigserial primary key,
  shop_id uuid not null references public.shops(id) on delete cascade,
  actor_id uuid,
  actor_role text,
  action text not null,
  detail jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index if not exists shop_audit_log_shop_idx on public.shop_audit_log(shop_id, created_at desc);
alter table public.shop_audit_log enable row level security;
create policy "owners read their audit log" on public.shop_audit_log
  for select using (exists (select 1 from public.shops s where s.id = shop_id and s.owner_id = auth.uid()));
