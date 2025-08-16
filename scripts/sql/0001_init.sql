-- Supabase schema for Flexicure

-- 1) Enum types
create type public.user_role as enum ('patient', 'therapist', 'admin');
create type public.booking_status as enum ('pending', 'accepted', 'rejected', 'completed', 'cancelled');
create type public.payment_status as enum ('unpaid', 'paid', 'refunded');

-- 2) Profiles (mirrors auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role public.user_role not null default 'patient',
  avatar_url text,
  created_at timestamptz default now()
);

-- 3) Therapists
create table if not exists public.therapists (
  id uuid primary key references public.profiles(id) on delete cascade,
  qualifications text,
  experience_years int,
  specialties text[],
  photo_url text,
  status text not null default 'pending' -- 'pending' | 'approved' | 'rejected'
);

-- 4) Availability (simple)
create table if not exists public.availability (
  id uuid primary key default gen_random_uuid(),
  therapist_id uuid not null references public.therapists(id) on delete cascade,
  day_of_week int not null check (day_of_week between 0 and 6), -- 0 Sun
  start_time time not null,
  end_time time not null
);

-- 5) Bookings
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles(id) on delete cascade,
  therapist_id uuid not null references public.therapists(id) on delete restrict,
  start_time timestamptz not null,
  end_time timestamptz not null,
  timezone text not null default 'UTC',
  status public.booking_status not null default 'pending',
  payment_status public.payment_status not null default 'unpaid',
  amount_cents int not null default 5000,
  currency text not null default 'INR',
  daily_room_url text,
  created_at timestamptz default now()
);

-- 6) Payments
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  provider text not null, -- 'razorpay' or 'stripe'
  status text not null, -- 'created' | 'paid' | 'refunded'
  amount_cents int not null,
  currency text not null,
  provider_reference text,
  provider_payment_id text,
  receipt_url text,
  created_at timestamptz default now()
);

-- 7) Session notes
create table if not exists public.session_notes (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid unique not null references public.bookings(id) on delete cascade,
  notes text, -- sanitized HTML/markdown (sanitize in app)
  exercise_plan_url text,
  created_at timestamptz default now()
);

-- 8) Reviews
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid unique not null references public.bookings(id) on delete cascade,
  patient_id uuid not null references public.profiles(id) on delete cascade,
  therapist_id uuid not null references public.therapists(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now()
);

-- 9) Newsletter
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz default now()
);

-- Views for quick joins
create or replace view public.bookings_view as
select
  b.*,
  p1.full_name as patient_name,
  p2.full_name as therapist_name
from public.bookings b
join public.profiles p1 on p1.id = b.patient_id
join public.profiles p2 on p2.id = b.therapist_id;

create or replace view public.therapists_view as
select
  t.id,
  p.full_name,
  t.status,
  t.specialties,
  t.photo_url
from public.therapists t
join public.profiles p on p.id = t.id;

-- Function for admin metrics
create or replace function public.dashboard_metrics()
returns json language sql stable as $$
  select json_build_object(
    'users_count', (select count(*) from public.profiles),
    'bookings_30d', (select count(*) from public.bookings where start_time > now() - interval '30 days'),
    'payments_sum_30d_cents', coalesce((select sum(amount_cents) from public.payments where created_at > now() - interval '30 days' and status = 'paid'),0),
    'currency', 'INR'
  );
$$;

-- Trigger to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
declare intended text;
begin
  intended := new.raw_user_meta_data->>'intended_role';
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name',
          case when intended in ('patient','therapist','admin') then intended::public.user_role else 'patient'::public.user_role end);
  if intended = 'therapist' then
    insert into public.therapists (id, status) values (new.id, 'pending');
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.therapists enable row level security;
alter table public.availability enable row level security;
alter table public.bookings enable row level security;
alter table public.payments enable row level security;
alter table public.session_notes enable row level security;
alter table public.reviews enable row level security;
alter table public.newsletter_subscribers enable row level security;

-- Profiles: owner can read/update, admin can manage
create policy "profiles_self_read" on public.profiles for select
  using (auth.uid() = id or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "profiles_self_update" on public.profiles for update
  using (auth.uid() = id or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Therapists: public can read approved names for discovery, owner/admin can update
create policy "therapists_read_public" on public.therapists for select using (status = 'approved');
create policy "therapists_owner_read" on public.therapists for select using (id = auth.uid());
create policy "therapists_owner_update" on public.therapists for update using (id = auth.uid());
create policy "therapists_admin_all" on public.therapists for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role='admin'));

-- Bookings: patient or therapist can read/write their own, admin all
create policy "bookings_read_own" on public.bookings for select using (patient_id = auth.uid() or therapist_id = auth.uid() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role='admin'));
create policy "bookings_insert_patient" on public.bookings for insert with check (patient_id = auth.uid());
create policy "bookings_update_own" on public.bookings for update using (patient_id = auth.uid() or therapist_id = auth.uid() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role='admin'));

-- Payments: visible to owners/admin
create policy "payments_read_own" on public.payments for select using (exists(select 1 from public.bookings b where b.id = booking_id and (b.patient_id = auth.uid() or b.therapist_id = auth.uid())) or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role='admin'));
create policy "payments_insert_server" on public.payments as permissive for insert with check (true);

-- Session notes: therapist owner can upsert, patient can read
create policy "notes_read" on public.session_notes for select using (exists(select 1 from public.bookings b where b.id = booking_id and (b.patient_id = auth.uid() or b.therapist_id = auth.uid())));
create policy "notes_write_therapist" on public.session_notes for all using (exists(select 1 from public.bookings b where b.id = booking_id and b.therapist_id = auth.uid()));

-- Reviews: patient can insert for completed booking, therapist can read
create policy "reviews_read" on public.reviews for select using (exists(select 1 from public.bookings b where b.id = booking_id and (b.patient_id = auth.uid() or b.therapist_id = auth.uid())));
create policy "reviews_insert_patient" on public.reviews for insert with check (patient_id = auth.uid());

-- Newsletter: public can insert, admin read
create policy "newsletter_insert" on public.newsletter_subscribers for insert with check (true);
create policy "newsletter_admin_read" on public.newsletter_subscribers for select using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role='admin'));
