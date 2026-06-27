-- email_sequences: the template library (one row per email in the drip)
create table public.email_sequences (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null,
  subject     text        not null,
  body        text        not null default '',
  delay_days  integer     not null default 0,
  position    integer     not null default 0,
  is_active   boolean     not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- email_sends: one row per (subscriber × sequence email)
create table public.email_sends (
  id             uuid        primary key default gen_random_uuid(),
  subscriber_id  uuid        not null references public.waitlist(id) on delete cascade,
  sequence_id    uuid        not null references public.email_sequences(id) on delete cascade,
  scheduled_at   timestamptz not null,
  sent_at        timestamptz,
  status         text        not null default 'pending', -- pending | sent | failed
  error_message  text,
  created_at     timestamptz not null default now(),
  unique (subscriber_id, sequence_id)
);

alter table public.email_sequences enable row level security;
alter table public.email_sends     enable row level security;

-- Seed the 8-email waitlist drip sequence
insert into public.email_sequences (name, subject, body, delay_days, position, is_active) values
  (
    'Confirmation',
    'You''re on the list.',
    '<p>Hi [First Name],</p><p>You''re officially on the FlatPurse Flow Founder Beta waitlist.</p><p>We''re limiting the beta to the first 40 businesses. When your spot opens, you''ll be the first to know.</p><p>— George &amp; Maxwell, FlatPurse Flow</p>',
    0, 1, true
  ),
  (
    'Day 1 — Cost of manual booking',
    'The real cost of manual booking',
    '<p>Hi [First Name],</p><p>Placeholder — edit this body in the admin email editor.</p>',
    1, 2, true
  ),
  (
    'Day 3 — Native AI',
    'What "native AI" actually means for your shop',
    '<p>Hi [First Name],</p><p>Placeholder — edit this body in the admin email editor.</p>',
    3, 3, true
  ),
  (
    'Day 7 — Lagos story',
    'A story about a barbershop in Lagos',
    '<p>Hi [First Name],</p><p>Placeholder — edit this body in the admin email editor.</p>',
    7, 4, true
  ),
  (
    'Day 14 — Re-engagement',
    'Still there?',
    '<p>Hi [First Name],</p><p>Placeholder — edit this body in the admin email editor.</p>',
    14, 5, true
  ),
  (
    'Day 21 — Beta open',
    'The beta is open — here''s your deal',
    '<p>Hi [First Name],</p><p>Placeholder — edit this body in the admin email editor.</p>',
    21, 6, true
  ),
  (
    'Day 28 — 3 days left',
    '3 days left',
    '<p>Hi [First Name],</p><p>Placeholder — edit this body in the admin email editor.</p>',
    28, 7, true
  ),
  (
    'Day 30 — Last call',
    'Last call',
    '<p>Hi [First Name],</p><p>Placeholder — edit this body in the admin email editor.</p>',
    30, 8, true
  );
