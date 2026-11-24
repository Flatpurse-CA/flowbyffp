-- FL-060/061 (Spec 7): AutoPilot does not message imported clients until the
-- owner reviews the import and turns it on.
alter table public.imports add column if not exists autopilot_enabled boolean not null default false;
