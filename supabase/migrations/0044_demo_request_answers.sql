-- Answers from the /demo walkthrough funnel (business type, team size, how
-- clients book today). All optional: the home-4 form doesn't ask them, and
-- the funnel lets visitors skip the last two.
alter table public.demo_requests
  add column business_type text,
  add column team_size text,
  add column booking_method text;
