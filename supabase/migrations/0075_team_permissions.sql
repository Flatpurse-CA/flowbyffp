-- George Nov 21: refunds are owner-only with a grantable staff permission;
-- 2-step is optional, but the owner can require it for the whole team.
alter table public.staff add column if not exists can_refund boolean not null default false;
alter table public.shops add column if not exists require_team_2fa boolean not null default false;
