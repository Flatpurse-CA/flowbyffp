-- Lets admins edit the subject/heading/body/CTA copy of every transactional
-- email (src/lib/resend.ts) without a code deploy. Only subject/heading/body/
-- cta_label are stored — the actual data (dates, addresses, codes, links) and
-- CTA destination URLs stay code-driven, since those are either security-
-- sensitive (password reset/invite links) or purely computed from the booking.
-- Seeded with the copy that was already hardcoded, so behavior is unchanged
-- until an admin edits a row. src/lib/resend.ts falls back to its own
-- DEFAULT_TEMPLATES if a row is ever missing or the table can't be reached.
create table public.email_templates (
  key text primary key,
  subject text not null,
  heading text not null,
  body text not null,
  cta_label text,
  updated_at timestamptz not null default now()
);

alter table public.email_templates enable row level security;
-- No public/anon policies — only ever touched via the service-role admin
-- client from server actions and the resend.ts sender, both server-only.

insert into public.email_templates (key, subject, heading, body, cta_label) values
  ('otp', '{{code}} is your FlatPurse Flow verification code', 'Hi {{firstName}},', 'Your verification code is:', null),
  ('password_reset', 'Reset your FlatPurse Flow password', 'Reset your password', 'We got a request to reset your password. Click below to choose a new one.', 'Reset password'),
  ('staff_invite', 'You''ve been invited to join {{shopName}} on FlatPurse Flow', 'You''re invited to join {{shopName}}', 'Your shop has added you as a team member on FlatPurse Flow. Set your password to get access to your bookings.', 'Set your password'),
  ('booking_request_received', 'Booking request received: {{shopName}}', 'Your booking request is in', '{{serviceName}}{{stylistLine}} at {{shopName}}.

The shop will confirm shortly. You can view or cancel this booking anytime from your account.', null),
  ('welcome', 'Welcome to FlatPurse Flow', 'Hi {{firstName}}, you''re in', 'Your account is set up and ready to go. Glad to have you on FlatPurse Flow.', null),
  ('password_changed', 'Your FlatPurse Flow password was changed', 'Hi {{firstName}},', 'Your password was just changed. If this was you, no action is needed.', null),
  ('booking_confirmed', 'Booking confirmed: {{shopName}}', 'Your booking is confirmed', '{{serviceName}}{{stylistLine}} at {{shopName}}.', null),
  ('booking_declined', 'Your booking request at {{shopName}} was declined', 'Booking request declined', '{{shopName}} wasn''t able to take your {{serviceName}} request for {{when}}.

You can pick another time from their booking page.', null),
  ('booking_cancelled', 'Your appointment at {{shopName}} was cancelled', 'Appointment cancelled', 'Your {{serviceName}} appointment at {{shopName}} on {{when}} has been cancelled{{cancelledBySuffix}}.

You can book a new time anytime from their booking page.', null),
  ('booking_rescheduled', 'Your booking at {{shopName}} was moved', 'Your booking was rescheduled', '{{serviceName}}{{stylistLine}} at {{shopName}} has a new time.', null),
  ('appointment_reminder', 'Reminder: {{serviceName}} tomorrow at {{shopName}}', 'See you tomorrow', 'Reminder for your {{serviceName}}{{stylistLine}} at {{shopName}}.', null),
  ('no_show', 'We missed you at {{shopName}}', 'Sorry we missed you', 'You were booked in for {{serviceName}} at {{shopName}} on {{when}}, but the shop marked it as a no-show.

If this was a mistake, reach out to the shop directly. Otherwise, feel free to book again anytime.', null),
  ('review_request', 'How was your visit to {{shopName}}?', 'How did it go?', 'Thanks for visiting {{shopName}}. Got a minute to leave a review? It helps the shop a lot.', 'Leave a review'),
  ('new_booking_alert', 'New booking: {{clientName}} — {{serviceName}}', 'New booking request', '{{clientName}} requested {{serviceName}}{{stylistLine}}.', 'View in dashboard'),
  ('staff_activated', 'You''re all set at {{shopName}}', 'Hi {{firstName}}, you''re in', 'Your account is active — you can now log in and see your bookings at {{shopName}}.', null);
