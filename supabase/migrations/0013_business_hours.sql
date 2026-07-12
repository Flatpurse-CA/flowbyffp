alter table public.shops
  add column booking_open_time time not null default '09:00',
  add column booking_close_time time not null default '18:00',
  add column booking_closed_weekdays int[] not null default '{0}'; -- 0=Sunday
