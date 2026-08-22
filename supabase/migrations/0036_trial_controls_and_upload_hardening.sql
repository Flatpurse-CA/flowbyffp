-- Trial clock as its own field, separate from created_at (real signup date —
-- used elsewhere for cohorts/joined-date display, shouldn't be touched by an
-- admin "restart trial" action) + an admin override to permanently bypass
-- trial/grace gating for a shop ("turn off" trial enforcement for them).
alter table public.shops
  add column trial_started_at timestamptz,
  add column trial_override boolean not null default false;

-- Backfill existing shops from their real created_at, then switch the
-- column's default to now() so it only applies going forward — a bare
-- `default now()` on the add-column step above would stamp EVERY existing
-- row with today's date instead of preserving history.
update public.shops set trial_started_at = created_at where trial_started_at is null;
alter table public.shops alter column trial_started_at set default now();
alter table public.shops alter column trial_started_at set not null;

-- Defense in depth for the profile/cover photo upload path: the app now
-- validates type/size server-side (updateShopImage), but the bucket itself
-- had no limit, so a valid session calling storage.upload() directly (not
-- through the app) could still push an oversized or non-image file.
update storage.buckets
set file_size_limit = 5242880, -- 5MB, matches MAX_IMAGE_BYTES in settings/actions.ts
    allowed_mime_types = array['image/png','image/jpeg','image/webp','image/gif']
where id = 'shop-assets';
