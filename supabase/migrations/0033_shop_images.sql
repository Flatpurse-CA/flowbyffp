-- Profile photo + cover photo for the public booking page
-- (src/app/book/[handle]/BookingClient.tsx already has the layout for
-- both, they were just hardcoded solid-color placeholders).
alter table public.shops
  add column profile_image_url text,
  add column cover_image_url text;

-- Public bucket: booking pages are public, anyone must be able to view
-- the images without auth. Write access is restricted below to the
-- owning shop via a path convention of `<shop_id>/<filename>`.
insert into storage.buckets (id, name, public)
values ('shop-assets', 'shop-assets', true)
on conflict (id) do nothing;

create policy "Anyone can view shop images"
on storage.objects for select
using (bucket_id = 'shop-assets');

create policy "Shop owners can upload their own images"
on storage.objects for insert
with check (
  bucket_id = 'shop-assets'
  and (storage.foldername(name))[1] in (select id::text from public.shops where owner_id = auth.uid())
);

create policy "Shop owners can update their own images"
on storage.objects for update
using (
  bucket_id = 'shop-assets'
  and (storage.foldername(name))[1] in (select id::text from public.shops where owner_id = auth.uid())
);

create policy "Shop owners can delete their own images"
on storage.objects for delete
using (
  bucket_id = 'shop-assets'
  and (storage.foldername(name))[1] in (select id::text from public.shops where owner_id = auth.uid())
);
