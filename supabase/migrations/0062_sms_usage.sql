-- FL-075: monthly SMS usage per shop for plan allowances.
create table if not exists public.sms_usage (
  shop_id uuid not null references public.shops(id) on delete cascade,
  month text not null,
  sent int not null default 0,
  warned_at timestamptz,
  primary key (shop_id, month)
);
alter table public.sms_usage enable row level security;
create policy "owners read their sms usage" on public.sms_usage
  for select using (exists (select 1 from public.shops s where s.id = shop_id and s.owner_id = auth.uid()));

create or replace function public.bump_sms_usage(p_shop uuid, p_month text)
returns int language sql security definer set search_path = public as $$
  insert into sms_usage(shop_id, month, sent) values (p_shop, p_month, 1)
  on conflict (shop_id, month) do update set sent = sms_usage.sent + 1
  returning sent;
$$;
revoke execute on function public.bump_sms_usage(uuid, text) from public, anon, authenticated;
