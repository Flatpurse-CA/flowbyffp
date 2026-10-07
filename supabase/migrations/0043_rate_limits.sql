-- Shared rate-limit counters. The in-memory limiter in src/lib/rateLimit.ts
-- is per serverless instance, so under load a brute-force client could get
-- limit x instanceCount attempts through. This table + function make the
-- limit hold across every instance. Fixed window per key.

create table if not exists public.rate_limits (
  key          text primary key,
  window_start timestamptz not null default now(),
  hits         integer     not null default 0
);

alter table public.rate_limits enable row level security;
-- No policies: only the service role (which bypasses RLS) touches this table.

-- Atomically records one hit for `p_key` and returns true if it is still
-- within `p_limit` hits for the current `p_window_seconds` window.
create or replace function public.check_rate_limit(p_key text, p_limit integer, p_window_seconds integer)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_hits integer;
begin
  insert into public.rate_limits as r (key, window_start, hits)
  values (p_key, now(), 1)
  on conflict (key) do update
    set hits = case when r.window_start < now() - make_interval(secs => p_window_seconds) then 1 else r.hits + 1 end,
        window_start = case when r.window_start < now() - make_interval(secs => p_window_seconds) then now() else r.window_start end
  returning hits into v_hits;

  return v_hits <= p_limit;
end;
$$;

revoke all on function public.check_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.check_rate_limit(text, integer, integer) to service_role;

-- Housekeeping: drop counters idle for a day.
create or replace function public.prune_rate_limits()
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.rate_limits where window_start < now() - interval '1 day';
$$;

revoke all on function public.prune_rate_limits() from public, anon, authenticated;
grant execute on function public.prune_rate_limits() to service_role;

select cron.schedule('prune-rate-limits-daily', '15 3 * * *', $$select public.prune_rate_limits()$$);
