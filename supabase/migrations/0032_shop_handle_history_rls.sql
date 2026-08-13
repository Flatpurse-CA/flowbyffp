-- 0031 created shop_handle_history without RLS, which would let the anon
-- key read/write it directly via PostgREST. The owner-scoped client
-- (updateBusinessProfile in dashboard/settings/actions.ts) needs write
-- access for their own shop; the public /book/[handle] redirect lookup
-- uses the service-role admin client and is unaffected by RLS.
alter table public.shop_handle_history enable row level security;

create policy "Owners can manage own shop handle history" on public.shop_handle_history
  for all
  using (shop_id in (select id from public.shops where owner_id = auth.uid()))
  with check (shop_id in (select id from public.shops where owner_id = auth.uid()));
