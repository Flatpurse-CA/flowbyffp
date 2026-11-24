-- Privacy policy s.7 (Nov 25): tax records 6 years from the END of the tax year
-- they relate to; intake forms 7 years from the client's LAST appointment.
create or replace function public.purge_shop(p_shop uuid, p_reason text)
returns void language plpgsql security definer set search_path = public as $$
declare v_name text;
begin
  select name into v_name from shops where id = p_shop for update;
  if not found then return; end if;

  insert into retained_tax_records (shop_id, shop_name, appointment_id, occurred_at, service_name, price, paid_amount,
    tip_amount, tax_amount, tax_breakdown, refunded_amount, payment_method, stripe_payment_intent, retain_until)
  select a.shop_id, v_name, a.id, coalesce(a.completed_at, a.starts_at), a.service_name, a.price, a.paid_amount,
         a.tip_amount, a.tax_amount, a.tax_breakdown, a.refunded_amount, a.payment_method, a.stripe_payment_intent,
         -- end of that calendar (tax) year + 6 years
         (date_trunc('year', coalesce(a.completed_at, a.starts_at)) + interval '1 year') + interval '6 years'
    from appointments a
   where a.shop_id = p_shop and (a.paid_amount is not null or a.status = 'completed' or coalesce(a.fee_amount, 0) > 0);

  insert into retained_intake_records (shop_id, shop_name, response_id, appointment_id, client_name, form_name, answers_enc, signed_at, retain_until)
  select r.shop_id, v_name, r.id, r.appointment_id, r.client_name, f.name, r.answers_enc, r.created_at,
         greatest(r.created_at, coalesce(last.at, r.created_at)) + interval '7 years'
    from intake_responses r
    left join intake_forms f on f.id = r.form_id
    left join lateral (
      -- the client's last appointment at this shop, matched by the intake's appointment or the client's name
      select max(a.starts_at) as at from appointments a
       where a.shop_id = p_shop and a.status <> 'cancelled'
         and (lower(a.client_name) = lower(r.client_name)
              or (r.appointment_id is not null and (a.client_email, a.client_phone) is not distinct from
                  (select b.client_email, b.client_phone from appointments b where b.id = r.appointment_id)))
    ) last on true
   where r.shop_id = p_shop;

  insert into deletion_log (shop_id, reason) values (p_shop, p_reason);
  delete from shops where id = p_shop;
end $$;
revoke all on function public.purge_shop(uuid, text) from public, anon, authenticated;
grant execute on function public.purge_shop(uuid, text) to service_role;
