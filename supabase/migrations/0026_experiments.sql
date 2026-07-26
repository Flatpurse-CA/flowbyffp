-- Real, minimal A/B experimentation framework. An experiment is a feature
-- flag (traffic split via rollout_pct) plus a measured outcome. No separate
-- "assignments" table: variant is a deterministic hash of (shop_id, experiment
-- key), reproducible on demand for any shop at any time — same technique as
-- feature_flags' rollout. Conversion is measured against real appointment
-- activity, not a fabricated event stream.
create table public.experiments (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  hypothesis text,
  variant_a_label text not null default 'Control',
  variant_b_label text not null default 'Variant B',
  feature_flag_key text not null references public.feature_flags(key) on delete cascade,
  status text not null default 'draft' check (status in ('draft', 'running', 'paused', 'completed', 'archived')),
  started_at timestamptz,
  ended_at timestamptz,
  winner text check (winner in ('a', 'b')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.experiments enable row level security;

-- Release-safety metrics with admin-editable thresholds, computed live from
-- real platform data (cancellation rate, open disputes, average fill rate) —
-- not the export's canned guardrail numbers.
create table public.guardrail_metrics (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  label text not null,
  comparison text not null check (comparison in ('above_bad', 'below_bad')),
  threshold numeric not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.guardrail_metrics enable row level security;

insert into public.guardrail_metrics (key, label, comparison, threshold) values
  ('cancellation_rate', 'Platform cancellation rate', 'above_bad', 15),
  ('open_disputes', 'Open disputes', 'above_bad', 5),
  ('avg_fill_rate', 'Average shop fill rate', 'below_bad', 20);
