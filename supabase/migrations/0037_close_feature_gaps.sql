-- Notification preferences (Settings > Notifications tab currently renders
-- hardcoded on={true}/on={false} literals with no persistence at all).
alter table public.shops
  add column notification_prefs jsonb not null default '{
    "new_booking": true,
    "cancellation": true,
    "no_show_alert": true,
    "payment_received": false,
    "autopilot_win": true,
    "daily_brief": true,
    "weekly_revenue_recap": true,
    "monthly_statement": false
  }'::jsonb;

-- Tax & GST (Settings tab UI already exists with a rate input + inclusive
-- toggle, but they're local useState only — no column to save to, no save
-- action exists).
alter table public.shops
  add column tax_rate numeric,
  add column tax_inclusive boolean not null default false;

-- AutoPilot per-flow toggles — same pattern as the existing, already-real
-- frontdesk_enabled (0029_frontdesk_sms.sql). The other 5 flows in Settings
-- currently only flip local React state.
alter table public.shops
  add column noshow_recovery_enabled boolean not null default true,
  add column filler_enabled boolean not null default true,
  add column winback_enabled boolean not null default true,
  add column reminders_enabled boolean not null default true,
  add column birthday_enabled boolean not null default true;

-- Per-staff availability, mirroring business_hours (0013) exactly but scoped
-- to one staff member instead of the whole shop. Absence of rows for a given
-- staff_id means "use shop-wide business_hours" (handled in app code, not
-- here) — so this is backward-compatible with every staff member that
-- exists today.
create table public.staff_hours (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  staff_id uuid not null references public.staff(id) on delete cascade,
  weekday integer not null check (weekday between 0 and 6), -- 0=Sunday
  open boolean not null default true,
  start_time time not null default '09:00',
  end_time time not null default '18:00',
  unique (staff_id, weekday)
);

create index staff_hours_shop_idx on public.staff_hours (shop_id);
create index staff_hours_staff_idx on public.staff_hours (staff_id);

alter table public.staff_hours enable row level security;

create policy "Owners can manage own staff hours" on public.staff_hours
  for all
  using (shop_id in (select id from public.shops where owner_id = auth.uid()))
  with check (shop_id in (select id from public.shops where owner_id = auth.uid()));

-- Staff-to-staff team channel: one shared conversation per shop, alongside
-- the existing owner<->staff 1:1 conversations (0011_messaging.sql). Reusing
-- the same conversations/messages tables rather than a parallel schema —
-- 'kind' distinguishes the two, staff_id becomes nullable since a team
-- channel isn't tied to one specific staff member.
alter table public.conversations
  add column kind text not null default 'owner_staff' check (kind in ('owner_staff', 'team_channel')),
  alter column staff_id drop not null;

-- Exactly one team channel per shop.
create unique index conversations_team_channel_unique
  on public.conversations (shop_id) where kind = 'team_channel';

-- Existing "Owners can manage own conversations" / "...messages in own
-- conversations" policies are shop_id-scoped (not staff_id-scoped), so they
-- already cover the team channel for owners with no changes needed.

create policy "Staff can access own shop's team channel" on public.conversations
  for all
  using (
    kind = 'team_channel'
    and shop_id in (select shop_id from public.staff where user_id = auth.uid())
  )
  with check (
    kind = 'team_channel'
    and shop_id in (select shop_id from public.staff where user_id = auth.uid())
  );

create policy "Staff can manage messages in own shop's team channel" on public.messages
  for all
  using (
    conversation_id in (
      select c.id from public.conversations c
      join public.staff st on st.shop_id = c.shop_id
      where c.kind = 'team_channel' and st.user_id = auth.uid()
    )
  )
  with check (
    sender_id = auth.uid()
    and conversation_id in (
      select c.id from public.conversations c
      join public.staff st on st.shop_id = c.shop_id
      where c.kind = 'team_channel' and st.user_id = auth.uid()
    )
  );
