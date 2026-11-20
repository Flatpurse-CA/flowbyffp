-- FL-058/059: Mobile Mode. Service area by postal-code prefix (FSA, e.g. "T2P"),
-- flat travel fee, drive-time buffer between mobile visits.
alter table public.shops
  add column if not exists mobile_enabled boolean not null default false,
  add column if not exists service_fsas text[] not null default '{}',
  add column if not exists travel_fee numeric not null default 0,
  add column if not exists drive_buffer_min int not null default 30 check (drive_buffer_min between 0 and 180);
alter table public.appointments
  add column if not exists location_address text,
  add column if not exists travel_fee numeric,
  add column if not exists eta_sent_at timestamptz;
