-- Add video call tracking and session notes

-- Add video call status to bookings (optional enhancement)
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'bookings' and column_name = 'video_status') then
    alter table public.bookings add column video_status text default 'not_started';
  end if;
end $$;

-- Add session notes table if not exists (already in 0001 but ensuring)
create table if not exists public.session_notes (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid unique not null references public.bookings(id) on delete cascade,
  notes text,
  exercise_plan_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Add indexes for video and session queries
create index if not exists idx_bookings_daily_room on public.bookings(daily_room_url) where daily_room_url is not null;
create index if not exists idx_bookings_video_status on public.bookings(video_status);
create index if not exists idx_session_notes_booking on public.session_notes(booking_id);

-- Update RLS for session notes (therapist can write, patient can read)
drop policy if exists "session_notes_read" on public.session_notes;
drop policy if exists "session_notes_write_therapist" on public.session_notes;

create policy "session_notes_read" on public.session_notes for select 
  using (exists(
    select 1 from public.bookings b 
    where b.id = booking_id 
    and (b.patient_id = auth.uid() or b.therapist_id = auth.uid())
  ));

create policy "session_notes_write_therapist" on public.session_notes for all 
  using (exists(
    select 1 from public.bookings b 
    where b.id = booking_id 
    and b.therapist_id = auth.uid()
  ));
