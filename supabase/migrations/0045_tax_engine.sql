-- Province-aware sales tax (src/lib/tax.ts). Replaces the single free-typed
-- tax_rate with a province code plus the few choices the rules leave to the
-- owner. tax_rate stays as the effective service rate for older readers.

alter table public.shops
  add column province_code text check (province_code in ('AB','BC','MB','NB','NL','NS','NT','NU','ON','PE','QC','SK','YT')),
  add column tax_registered boolean not null default true,
  add column tax_number text,
  add column pst_on_services boolean not null default false;

update public.shops set province_code = case upper(trim(province))
  when 'AB' then 'AB' when 'ALBERTA' then 'AB'
  when 'BC' then 'BC' when 'BRITISH COLUMBIA' then 'BC'
  when 'MB' then 'MB' when 'MANITOBA' then 'MB'
  when 'NB' then 'NB' when 'NEW BRUNSWICK' then 'NB'
  when 'NL' then 'NL' when 'NEWFOUNDLAND AND LABRADOR' then 'NL'
  when 'NS' then 'NS' when 'NOVA SCOTIA' then 'NS'
  when 'NT' then 'NT' when 'NORTHWEST TERRITORIES' then 'NT'
  when 'NU' then 'NU' when 'NUNAVUT' then 'NU'
  when 'ON' then 'ON' when 'ONTARIO' then 'ON'
  when 'PE' then 'PE' when 'PRINCE EDWARD ISLAND' then 'PE' when 'PEI' then 'PE'
  when 'QC' then 'QC' when 'QUEBEC' then 'QC' when 'QUÉBEC' then 'QC'
  when 'SK' then 'SK' when 'SASKATCHEWAN' then 'SK'
  when 'YT' then 'YT' when 'YUKON' then 'YT'
  else null end
where province_code is null;

-- A service the owner marks exempt (e.g. massage by a therapist in a province
-- where the profession is regulated) is never taxed.
alter table public.services
  add column tax_exempt boolean not null default false;

-- What was actually charged at close-out, so the GST/HST report uses real
-- figures rather than re-deriving them from a rate that may have changed.
alter table public.appointments
  add column tax_amount numeric(10,2),
  add column tax_breakdown jsonb;
