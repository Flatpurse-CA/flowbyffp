create table public.frontdesk_conversations (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  client_email text not null,
  client_name text,
  channel text not null default 'email',
  status text not null default 'active' check (status = any (array['active', 'escalated', 'closed'])),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index frontdesk_conversations_shop_idx on public.frontdesk_conversations(shop_id);
create unique index frontdesk_conversations_shop_email_idx on public.frontdesk_conversations(shop_id, client_email);

create table public.frontdesk_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.frontdesk_conversations(id) on delete cascade,
  direction text not null check (direction = any (array['inbound', 'outbound'])),
  body text not null,
  classified_intent text,
  created_at timestamptz not null default now()
);

create index frontdesk_messages_conversation_idx on public.frontdesk_messages(conversation_id, created_at);

alter table public.frontdesk_conversations enable row level security;
alter table public.frontdesk_messages enable row level security;

create policy "Owners can view own frontdesk conversations"
  on public.frontdesk_conversations for select
  using (shop_id in (select id from public.shops where owner_id = auth.uid()));

create policy "Owners can view own frontdesk messages"
  on public.frontdesk_messages for select
  using (conversation_id in (
    select id from public.frontdesk_conversations
    where shop_id in (select id from public.shops where owner_id = auth.uid())
  ));
