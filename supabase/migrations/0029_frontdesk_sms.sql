alter table public.shops add column frontdesk_enabled boolean not null default false;

alter table public.frontdesk_conversations
  add column client_phone text,
  alter column client_email drop not null;

alter table public.frontdesk_conversations
  add constraint frontdesk_conversations_identity_check
  check (client_email is not null or client_phone is not null);

drop index if exists frontdesk_conversations_shop_email_idx;

create unique index frontdesk_conversations_shop_email_idx
  on public.frontdesk_conversations(shop_id, client_email) where client_email is not null;

create unique index frontdesk_conversations_shop_phone_idx
  on public.frontdesk_conversations(shop_id, client_phone) where client_phone is not null;
