-- Daily Brief email (7am local, owner can change the hour) and recaps on the
-- local-time scheduler. pg_cron calls the job runner every 10 minutes so jobs
-- land on time in every timezone; the runner token lives in Vault, never in code.
alter table public.shops add column if not exists daily_brief_hour int not null default 7 check (daily_brief_hour between 0 and 23);

do $$
begin
  if not exists (select 1 from vault.secrets where name = 'jobs_runner_token') then
    perform vault.create_secret(encode(gen_random_bytes(32), 'hex'), 'jobs_runner_token', 'Bearer token pg_cron uses to call /api/cron/jobs');
  end if;
end $$;

create or replace function public.verify_jobs_token(p_token text) returns boolean
language sql stable security definer set search_path = public, vault as $$
  select exists (select 1 from vault.decrypted_secrets where name = 'jobs_runner_token' and decrypted_secret = p_token);
$$;
revoke all on function public.verify_jobs_token(text) from public, anon, authenticated;
grant execute on function public.verify_jobs_token(text) to service_role;

select cron.unschedule('flow-jobs-runner') where exists (select 1 from cron.job where jobname = 'flow-jobs-runner');
select cron.schedule('flow-jobs-runner', '*/10 * * * *', $cron$
  select net.http_get(
    url := 'https://flow.flatpurse.com/api/cron/jobs',
    headers := jsonb_build_object('Authorization', 'Bearer jobs:' || (select decrypted_secret from vault.decrypted_secrets where name = 'jobs_runner_token')),
    timeout_milliseconds := 60000
  );
$cron$);
