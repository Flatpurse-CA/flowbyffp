-- E0-E3 + staff invite reminder (Nov 21 "now" list). One row per email actually
-- sent, so the lifecycle job never sends the same step twice.
create table if not exists public.lifecycle_emails (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  code text not null,
  ref text not null default '',
  sent_at timestamptz not null default now(),
  unique (user_id, code, ref)
);
alter table public.lifecycle_emails enable row level security;
-- No policies: service role only.

-- E0 copy: only replace the verification email if it was never edited in admin.
update public.email_templates
   set subject = 'Your Flow code: {{code}}', body = 'Here''s your code to finish creating your Flow account:'
 where key = 'otp' and subject = '{{code}} is your FlatPurse Flow verification code';
