-- Switch-from-another-platform imports (Fresha, Vagaro, Square, Mindbody,
-- Phorest, Setmore, Lightspeed, or any CSV). Every row an import writes is
-- stamped with its import_id so the whole import can be undone in one click.

create table public.imports (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  source text not null,
  status text not null default 'running'
    check (status in ('running', 'completed', 'undone')),
  counts jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  undone_at timestamptz
);

create index imports_shop_idx on public.imports (shop_id, created_at desc);

alter table public.imports enable row level security;

create policy "Owners can view own imports" on public.imports
  for select
  using (shop_id in (select id from public.shops where owner_id = auth.uid()));

alter table public.clients      add column import_id uuid references public.imports(id) on delete set null;
alter table public.services     add column import_id uuid references public.imports(id) on delete set null;
alter table public.staff        add column import_id uuid references public.imports(id) on delete set null;
alter table public.appointments add column import_id uuid references public.imports(id) on delete set null;

-- Notes carried over from the old platform (allergies, formulas, preferences).
alter table public.clients add column notes text;

create index clients_import_idx      on public.clients (import_id)      where import_id is not null;
create index services_import_idx     on public.services (import_id)     where import_id is not null;
create index staff_import_idx        on public.staff (import_id)        where import_id is not null;
create index appointments_import_idx on public.appointments (import_id) where import_id is not null;
