alter table customers add column stripe_customer_id text;
create unique index customers_stripe_customer_id_idx on customers(stripe_customer_id) where stripe_customer_id is not null;
