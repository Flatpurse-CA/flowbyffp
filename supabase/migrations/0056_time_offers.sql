-- Send Times (FL-046/047): staff send a client their next open times as one-tap links.
create table if not exists public.time_offers (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  sender_id uuid references auth.users(id) on delete set null,
  source text not null default 'manual' check (source in ('manual', 'front_desk', 'slot_filler')),
  service_id uuid not null references public.services(id) on delete cascade,
  staff_id uuid references public.staff(id) on delete set null,   -- null = anyone
  slot_times timestamptz[] not null,
  expires_at timestamptz not null,
  booked_slot timestamptz,
  booking_id uuid references public.appointments(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists time_offers_shop_idx on public.time_offers (shop_id, created_at desc);

-- One personal link per recipient (name/phone pre-filled, so known clients book in one tap).
create table if not exists public.time_offer_links (
  token text primary key,
  offer_id uuid not null references public.time_offers(id) on delete cascade,
  client_name text not null,
  client_phone text,
  client_email text,
  booking_id uuid references public.appointments(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists time_offer_links_offer_idx on public.time_offer_links (offer_id);

alter table public.time_offers enable row level security;
alter table public.time_offer_links enable row level security;
create policy "owners read their time offers" on public.time_offers
  for select using (exists (select 1 from public.shops s where s.id = shop_id and s.owner_id = auth.uid()));

alter table public.appointments add column if not exists booked_via text;

-- Live check + lock on tap. The offer row lock makes "first to tap wins" for a
-- group send; the per-shop advisory lock stops two taps on different offers
-- from taking the same staff slot. Runs as definer; only the service role calls it.
create or replace function public.book_time_offer(p_token text, p_slot timestamptz)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_link public.time_offer_links%rowtype;
  v_offer public.time_offers%rowtype;
  v_service record;
  v_staff uuid;
  v_staff_name text;
  v_candidates uuid[];
  v_free boolean;
  v_appt uuid;
  v_end timestamptz;
begin
  select * into v_link from public.time_offer_links where token = p_token;
  if not found then return jsonb_build_object('status', 'invalid'); end if;

  select * into v_offer from public.time_offers where id = v_link.offer_id for update;
  if v_offer.booking_id is not null then
    return jsonb_build_object('status', 'booked', 'starts_at', v_offer.booked_slot, 'mine', v_link.booking_id is not null);
  end if;
  if v_offer.expires_at < now() or p_slot < now() or not (p_slot = any (v_offer.slot_times)) then
    return jsonb_build_object('status', 'expired');
  end if;

  select id, name, price, duration_minutes into v_service from public.services where id = v_offer.service_id;
  v_end := p_slot + make_interval(mins => v_service.duration_minutes);

  perform pg_advisory_xact_lock(hashtext(v_offer.shop_id::text));

  if v_offer.staff_id is not null then
    v_candidates := array[v_offer.staff_id];
  else
    select array_agg(id) into v_candidates from public.staff where shop_id = v_offer.shop_id and active;
  end if;

  if v_candidates is null or array_length(v_candidates, 1) is null then
    -- Solo shop with no staff rows: one calendar.
    select not exists (
      select 1 from public.appointments a
      where a.shop_id = v_offer.shop_id and a.staff_id is null and a.status <> 'cancelled'
        and a.starts_at < v_end and a.starts_at + make_interval(mins => a.duration_minutes) > p_slot
    ) into v_free;
    if not v_free then return jsonb_build_object('status', 'taken'); end if;
    v_staff := null;
  else
    v_staff := null;
    foreach v_staff_name in array (select array_agg(x::text) from unnest(v_candidates) x) loop
      if not exists (
        select 1 from public.appointments a
        where a.shop_id = v_offer.shop_id and a.staff_id = v_staff_name::uuid and a.status <> 'cancelled'
          and a.starts_at < v_end and a.starts_at + make_interval(mins => a.duration_minutes) > p_slot
      ) then
        v_staff := v_staff_name::uuid;
        exit;
      end if;
    end loop;
    if v_staff is null then return jsonb_build_object('status', 'taken'); end if;
  end if;

  select full_name into v_staff_name from public.staff where id = v_staff;

  insert into public.appointments (shop_id, client_name, client_phone, client_email, service_name, stylist_name,
    staff_id, starts_at, duration_minutes, price, status, booked_via)
  values (v_offer.shop_id, v_link.client_name, v_link.client_phone, v_link.client_email, v_service.name, v_staff_name,
    v_staff, p_slot, v_service.duration_minutes, v_service.price, 'confirmed', 'send_times')
  returning id into v_appt;

  update public.time_offers set booking_id = v_appt, booked_slot = p_slot where id = v_offer.id;
  update public.time_offer_links set booking_id = v_appt where token = p_token;

  return jsonb_build_object('status', 'booked', 'starts_at', p_slot, 'appointment_id', v_appt, 'mine', true);
end;
$$;

revoke all on function public.book_time_offer(text, timestamptz) from public, anon, authenticated;
