-- FL-038/039: refunds with reason (tax reversed proportionally), dispute deadlines.
alter table public.appointments add column if not exists stripe_payment_intent text;
alter table public.appointments add column if not exists refunded_amount numeric not null default 0;
create table if not exists public.refunds (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  appointment_id uuid references public.appointments(id) on delete set null,
  amount numeric not null check (amount > 0),
  tax_amount numeric not null default 0,
  reason text not null,
  refunded_by uuid,
  stripe_refund_id text,
  created_at timestamptz not null default now()
);
create index if not exists refunds_shop_idx on public.refunds(shop_id, created_at desc);
alter table public.refunds enable row level security;
create policy "owners read their refunds" on public.refunds
  for select using (exists (select 1 from public.shops s where s.id = shop_id and s.owner_id = auth.uid()));
alter table public.disputes add column if not exists evidence_due_by timestamptz;
alter table public.disputes add column if not exists alerted_at timestamptz;
