-- Client list computed in the database instead of shipping every appointment
-- to the page. Returns one JSON array (not a row set) so PostgREST's 1000-row
-- cap never truncates it. security invoker: the caller's RLS still applies,
-- so staff only see clients from their own appointments, as before.
--
-- The key expression and tag rules mirror keyFor()/deriveClients() in
-- src/lib/dashboard/clients.ts; keep them in sync.

create index if not exists appointments_client_key_idx on public.appointments (
  shop_id,
  (lower(btrim(coalesce(customer_id::text, nullif(client_phone, ''), nullif(client_email, ''), client_name))))
);

create or replace function public.shop_client_summaries(p_shop_id uuid)
returns json
language sql
stable
security invoker
set search_path = public
as $$
  with appts as (
    select
      lower(btrim(coalesce(customer_id::text, nullif(client_phone, ''), nullif(client_email, ''), client_name))) as key,
      client_name, client_phone, client_email, starts_at, price, status
    from appointments
    where shop_id = p_shop_id and status <> 'cancelled'
  ),
  grouped as (
    select
      key,
      (array_agg(client_name  order by starts_at desc))[1] as name,
      (array_agg(client_phone order by starts_at desc))[1] as phone,
      (array_agg(client_email order by starts_at desc))[1] as email,
      (count(*) filter (where status = 'completed'))::int as visits,
      coalesce(sum(price) filter (where status = 'completed'), 0)::float8 as ltv,
      max(starts_at) filter (where status = 'completed') as last_visit,
      min(starts_at) filter (where status = 'completed') as first_visit
    from appts
    group by key
  ),
  derived as (
    select key, name, phone, email, visits, ltv, last_visit,
      case when visits >= 2 then (extract(epoch from last_visit - first_visit) / 86400 / (visits - 1))::float8 end as avg_interval,
      'derived'::text as src
    from grouped
  ),
  -- Imported clients who haven't booked in Flow yet.
  stored as (
    select c.key, c.full_name, c.phone, c.email, c.visits_count, c.lifetime_value::float8, c.last_visit_at, null::float8, 'stored'::text
    from clients c
    where c.shop_id = p_shop_id
      and not exists (select 1 from grouped g where g.key = c.key)
  ),
  all_clients as (
    select *, case when last_visit is null then null else (extract(epoch from now() - last_visit) / 86400)::float8 end as days_since
    from (select * from derived union all select * from stored) u
  )
  select coalesce(json_agg(json_build_object(
    'key', key,
    'name', name,
    'phone', phone,
    'email', email,
    'visits', visits,
    'ltv', ltv,
    'lastVisitAt', last_visit,
    'avgIntervalDays', avg_interval,
    'daysSinceLastVisit', days_since,
    'tag', case
      when src = 'stored' then case when visits >= 5 and ltv >= 500 then 'VIP' when visits >= 3 then 'Loyal' else 'New' end
      when visits <= 1 then 'New'
      when avg_interval > 0 and days_since > avg_interval * 2.5 then 'Churn risk'
      when avg_interval > 0 and days_since > avg_interval * 1.5 then 'Overdue'
      when visits >= 5 and ltv >= 500 then 'VIP'
      when visits >= 3 then 'Loyal'
    end
  ) order by ltv desc), '[]'::json)
  from all_clients;
$$;

-- One client's full history for their profile page.
create or replace function public.client_appointments(p_shop_id uuid, p_key text)
returns setof public.appointments
language sql
stable
security invoker
set search_path = public
as $$
  select *
  from appointments
  where shop_id = p_shop_id
    and lower(btrim(coalesce(customer_id::text, nullif(client_phone, ''), nullif(client_email, ''), client_name))) = p_key
  order by starts_at desc;
$$;

grant execute on function public.shop_client_summaries(uuid) to authenticated;
grant execute on function public.client_appointments(uuid, text) to authenticated;
