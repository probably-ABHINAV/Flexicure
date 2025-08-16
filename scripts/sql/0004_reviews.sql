-- Reviews and ratings enhancements

-- Add indexes for better review queries
create index if not exists idx_reviews_therapist_rating on public.reviews(therapist_id, rating);
create index if not exists idx_reviews_patient on public.reviews(patient_id);
create index if not exists idx_reviews_created_at on public.reviews(created_at);

-- Function to get therapist average rating
create or replace function public.get_therapist_rating(therapist_uuid uuid)
returns json language sql stable as $$
  select json_build_object(
    'average_rating', coalesce(avg(rating), 0),
    'review_count', count(*),
    'rating_distribution', json_build_object(
      '5', count(*) filter (where rating = 5),
      '4', count(*) filter (where rating = 4),
      '3', count(*) filter (where rating = 3),
      '2', count(*) filter (where rating = 2),
      '1', count(*) filter (where rating = 1)
    )
  )
  from public.reviews
  where therapist_id = therapist_uuid;
$$;

-- Function to automatically mark sessions as completed (can be called by cron)
create or replace function public.mark_completed_sessions()
returns void language sql as $$
  update public.bookings 
  set status = 'completed'
  where status = 'accepted' 
    and end_time < now() - interval '1 hour'
    and payment_status = 'paid';
$$;

-- View for therapist listings with ratings
create or replace view public.therapists_with_ratings as
select 
  t.id,
  p.full_name,
  t.specialties,
  t.experience_years,
  t.photo_url,
  t.status,
  coalesce(avg(r.rating), 0) as average_rating,
  count(r.id) as review_count
from public.therapists t
join public.profiles p on p.id = t.id
left join public.reviews r on r.therapist_id = t.id
where t.status = 'approved'
group by t.id, p.full_name, t.specialties, t.experience_years, t.photo_url, t.status
order by average_rating desc, review_count desc, p.full_name;

-- RLS for the new view
grant select on public.therapists_with_ratings to authenticated, anon;

-- Update reviews RLS to allow patients to insert reviews for their completed bookings
drop policy if exists "reviews_insert_patient" on public.reviews;
create policy "reviews_insert_patient" on public.reviews for insert 
  with check (
    patient_id = auth.uid() 
    and exists (
      select 1 from public.bookings b 
      where b.id = booking_id 
        and b.patient_id = auth.uid() 
        and b.status = 'completed'
    )
  );

-- Allow patients to update their own reviews
create policy "reviews_update_patient" on public.reviews for update 
  using (patient_id = auth.uid());
