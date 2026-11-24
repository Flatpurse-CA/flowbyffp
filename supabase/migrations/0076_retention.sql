-- Retention rules (George Nov 21): an account is purged 30 days after the owner
-- asks; tax records are kept 6 years and signed intake forms 7 years, then
-- deleted automatically. Purging only runs when DATA_DELETION_ENABLED=true.

-- Tax records (CRA: keep books 6 years). No client contact details.
create table if not exists public.retained_tax_records (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null,
  shop_name text,
  appointment_id uuid,
  occurred_at timestamptz not null,
  service_name text,
  price numeric, paid_amount numeric, tip_amount numeric, tax_amount numeric, tax_breakdown jsonb,
  refunded_amount numeric, payment_method text, stripe_payment_intent text,
  retain_until timestamptz not null,
  archived_at timestamptz not null default now()
);
create index if not exists retained_tax_shop_idx on public.retained_tax_records (shop_id);
create index if not exists retained_tax_until_idx on public.retained_tax_records (retain_until);
alter table public.retained_tax_records enable row level security;

-- Signed intake forms (health records, 7 years). Answers stay encrypted.
create table if not exists public.retained_intake_records (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null,
  shop_name text,
  response_id uuid,
  appointment_id uuid,
  client_name text not null,
  form_name text,
  answers_enc text not null,
  signed_at timestamptz not null,
  retain_until timestamptz not null,
  archived_at timestamptz not null default now()
);
create index if not exists retained_intake_shop_idx on public.retained_intake_records (shop_id);
create index if not exists retained_intake_until_idx on public.retained_intake_records (retain_until);
alter table public.retained_intake_records enable row level security;
-- No policies on either table: service role only.

-- Archive what the law says to keep, log the deletion, then delete the shop (cascades).
create or replace function public.purge_shop(p_shop uuid, p_reason text)
returns void language plpgsql security definer set search_path = public as $$
declare v_name text;
begin
  select name into v_name from shops where id = p_shop for update;
  if not found then return; end if;

  insert into retained_tax_records (shop_id, shop_name, appointment_id, occurred_at, service_name, price, paid_amount,
    tip_amount, tax_amount, tax_breakdown, refunded_amount, payment_method, stripe_payment_intent, retain_until)
  select a.shop_id, v_name, a.id, coalesce(a.completed_at, a.starts_at), a.service_name, a.price, a.paid_amount,
         a.tip_amount, a.tax_amount, a.tax_breakdown, a.refunded_amount, a.payment_method, a.stripe_payment_intent,
         coalesce(a.completed_at, a.starts_at) + interval '6 years'
    from appointments a
   where a.shop_id = p_shop and (a.paid_amount is not null or a.status = 'completed' or coalesce(a.fee_amount, 0) > 0);

  insert into retained_intake_records (shop_id, shop_name, response_id, appointment_id, client_name, form_name, answers_enc, signed_at, retain_until)
  select r.shop_id, v_name, r.id, r.appointment_id, r.client_name, f.name, r.answers_enc, r.created_at, r.created_at + interval '7 years'
    from intake_responses r left join intake_forms f on f.id = r.form_id
   where r.shop_id = p_shop;

  insert into deletion_log (shop_id, reason) values (p_shop, p_reason);
  delete from shops where id = p_shop;
end $$;
revoke all on function public.purge_shop(uuid, text) from public, anon, authenticated;
grant execute on function public.purge_shop(uuid, text) to service_role;

-- Delete archived records once their retention period is over (daily).
create or replace function public.prune_retained_records() returns void
language sql security definer set search_path = public as $$
  delete from retained_tax_records where retain_until < now();
  delete from retained_intake_records where retain_until < now();
$$;
select cron.unschedule('prune-retained-records') where exists (select 1 from cron.job where jobname = 'prune-retained-records');
select cron.schedule('prune-retained-records', '30 3 * * *', $$select public.prune_retained_records()$$);
