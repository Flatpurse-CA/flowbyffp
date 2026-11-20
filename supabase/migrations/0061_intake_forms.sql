-- FL-043: intake forms. Answers are encrypted in the app (AES-256-GCM, own key)
-- before they reach the database; every view is logged.
create table if not exists public.intake_forms (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  name text not null,
  fields jsonb not null default '[]',
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists intake_forms_shop_idx on public.intake_forms(shop_id);
create table if not exists public.intake_responses (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  form_id uuid references public.intake_forms(id) on delete set null,
  appointment_id uuid references public.appointments(id) on delete set null,
  client_name text not null,
  answers_enc text not null,
  created_at timestamptz not null default now()
);
create index if not exists intake_responses_shop_idx on public.intake_responses(shop_id, created_at desc);
create table if not exists public.intake_views (
  id bigserial primary key,
  response_id uuid not null references public.intake_responses(id) on delete cascade,
  viewer_id uuid,
  viewer_role text,
  viewed_at timestamptz not null default now()
);
alter table public.intake_forms enable row level security;
alter table public.intake_responses enable row level security;
alter table public.intake_views enable row level security;
-- No client-side policies: all access goes through server code that checks role and logs views.
