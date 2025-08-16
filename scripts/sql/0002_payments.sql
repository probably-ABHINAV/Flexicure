-- Additional indexes and constraints for payments and bookings

create index if not exists idx_payments_booking_id on public.payments(booking_id);
create index if not exists idx_payments_status on public.payments(status);
create index if not exists idx_payments_created_at on public.payments(created_at);
create index if not exists idx_bookings_patient on public.bookings(patient_id);
create index if not exists idx_bookings_therapist on public.bookings(therapist_id);

-- Ensure provider_reference is unique per provider to avoid duplicates
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'payments_provider_reference_unique'
  ) then
    alter table public.payments add constraint payments_provider_reference_unique unique (provider, provider_reference);
  end if;
end $$;
