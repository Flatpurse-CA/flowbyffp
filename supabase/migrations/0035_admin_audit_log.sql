-- Records every mutating action taken from the admin panel: who (admin
-- email), what (action key), on what (target type + id), and any relevant
-- detail (old/new values etc). No RLS policies granting access — only ever
-- read/written via the service-role admin client, same as every other
-- admin-only table in this app.
create table public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_email text not null,
  action text not null,
  target_type text not null,
  target_id text,
  details jsonb,
  created_at timestamptz not null default now()
);

create index admin_audit_log_created_idx on public.admin_audit_log (created_at desc);
create index admin_audit_log_admin_idx on public.admin_audit_log (admin_email);

alter table public.admin_audit_log enable row level security;
