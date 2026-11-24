-- FL-003/004/005 (Spec 0 shared services): shop timezone, local-time job queue,
-- and one log of every message Flow sends.

create or replace function public.tz_for_province(p text) returns text
language sql immutable as $$
  select case lower(trim(coalesce(p, '')))
    when 'bc' then 'America/Vancouver' when 'british columbia' then 'America/Vancouver'
    when 'ab' then 'America/Edmonton' when 'alberta' then 'America/Edmonton'
    when 'sk' then 'America/Regina' when 'saskatchewan' then 'America/Regina'
    when 'mb' then 'America/Winnipeg' when 'manitoba' then 'America/Winnipeg'
    when 'on' then 'America/Toronto' when 'ontario' then 'America/Toronto'
    when 'qc' then 'America/Toronto' when 'quebec' then 'America/Toronto' when 'québec' then 'America/Toronto'
    when 'nb' then 'America/Moncton' when 'new brunswick' then 'America/Moncton'
    when 'ns' then 'America/Halifax' when 'nova scotia' then 'America/Halifax'
    when 'pe' then 'America/Halifax' when 'pei' then 'America/Halifax' when 'prince edward island' then 'America/Halifax'
    when 'nl' then 'America/St_Johns' when 'newfoundland and labrador' then 'America/St_Johns' when 'newfoundland' then 'America/St_Johns'
    when 'yt' then 'America/Whitehorse' when 'yukon' then 'America/Whitehorse'
    when 'nt' then 'America/Yellowknife' when 'northwest territories' then 'America/Yellowknife'
    when 'nu' then 'America/Iqaluit' when 'nunavut' then 'America/Iqaluit'
    else 'America/Edmonton' end
$$;

alter table public.shops add column if not exists timezone text;
update public.shops set timezone = public.tz_for_province(province) where timezone is null;
alter table public.shops alter column timezone set default 'America/Edmonton';

create or replace function public.shops_set_timezone() returns trigger
language plpgsql as $$
begin
  if new.timezone is null or (tg_op = 'UPDATE' and new.province is distinct from old.province and new.timezone = old.timezone) then
    new.timezone := public.tz_for_province(new.province);
  end if;
  return new;
end $$;
drop trigger if exists shops_set_timezone on public.shops;
create trigger shops_set_timezone before insert or update of province on public.shops
  for each row execute function public.shops_set_timezone();

-- Unified messaging log.
create table if not exists public.message_log (
  id bigserial primary key,
  shop_id uuid references public.shops(id) on delete cascade,
  channel text not null check (channel in ('email', 'sms', 'push')),
  audience text not null default 'client' check (audience in ('client', 'owner', 'staff', 'system')),
  kind text,
  recipient text not null,
  subject text,
  status text not null check (status in ('sent', 'failed', 'queued', 'skipped')),
  provider_id text,
  error text,
  created_at timestamptz not null default now()
);
create index if not exists message_log_shop_idx on public.message_log (shop_id, created_at desc);
create index if not exists message_log_created_idx on public.message_log (created_at desc);
alter table public.message_log enable row level security;
create policy "owners read their message log" on public.message_log
  for select using (exists (select 1 from public.shops s where s.id = shop_id and s.owner_id = auth.uid()));

-- Delayed / recurring jobs, run at a time worked out in the shop's timezone.
create table if not exists public.scheduled_jobs (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid references public.shops(id) on delete cascade,
  kind text not null,
  run_at timestamptz not null,
  payload jsonb not null default '{}',
  status text not null default 'pending' check (status in ('pending', 'running', 'done', 'failed', 'cancelled')),
  attempts int not null default 0,
  last_error text,
  dedupe_key text unique,
  created_at timestamptz not null default now(),
  finished_at timestamptz
);
create index if not exists scheduled_jobs_due_idx on public.scheduled_jobs (run_at) where status = 'pending';
alter table public.scheduled_jobs enable row level security;

-- Claims due jobs atomically so two runners never run the same job.
create or replace function public.claim_due_jobs(p_limit int default 50)
returns setof public.scheduled_jobs language sql security definer set search_path = public as $$
  update scheduled_jobs j set status = 'running', attempts = j.attempts + 1
   where j.id in (
     select id from scheduled_jobs where status = 'pending' and run_at <= now()
      order by run_at limit p_limit for update skip locked)
  returning j.*;
$$;
revoke all on function public.claim_due_jobs(int) from public, anon, authenticated;
grant execute on function public.claim_due_jobs(int) to service_role;
