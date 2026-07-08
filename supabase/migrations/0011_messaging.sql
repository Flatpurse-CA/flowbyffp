create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  staff_id uuid not null references public.staff(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (shop_id, staff_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index messages_conversation_created_idx on public.messages (conversation_id, created_at);

alter table public.conversations enable row level security;
alter table public.messages enable row level security;

-- One-directional references only (conversations -> shops/staff, messages -> conversations).
-- Neither shops nor staff gain any new policy referencing these tables, so this cannot
-- reproduce the shops<->staff circular-RLS recursion fixed in 0010.

create policy "Owners can manage own conversations" on public.conversations
  for all
  using (shop_id in (select id from public.shops where owner_id = auth.uid()))
  with check (shop_id in (select id from public.shops where owner_id = auth.uid()));

create policy "Staff can manage own conversation" on public.conversations
  for all
  using (staff_id in (select id from public.staff where user_id = auth.uid()))
  with check (staff_id in (select id from public.staff where user_id = auth.uid()));

create policy "Owners can manage messages in own conversations" on public.messages
  for all
  using (
    conversation_id in (
      select c.id from public.conversations c
      join public.shops s on s.id = c.shop_id
      where s.owner_id = auth.uid()
    )
  )
  with check (
    sender_id = auth.uid()
    and conversation_id in (
      select c.id from public.conversations c
      join public.shops s on s.id = c.shop_id
      where s.owner_id = auth.uid()
    )
  );

create policy "Staff can manage messages in own conversation" on public.messages
  for all
  using (
    conversation_id in (
      select c.id from public.conversations c
      join public.staff st on st.id = c.staff_id
      where st.user_id = auth.uid()
    )
  )
  with check (
    sender_id = auth.uid()
    and conversation_id in (
      select c.id from public.conversations c
      join public.staff st on st.id = c.staff_id
      where st.user_id = auth.uid()
    )
  );
