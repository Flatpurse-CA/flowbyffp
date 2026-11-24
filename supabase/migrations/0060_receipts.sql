-- FL-044: practitioner registration number for insurance-ready receipts.
alter table public.staff add column if not exists registration_number text;
alter table public.staff add column if not exists registration_body text;
