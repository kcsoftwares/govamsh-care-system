-- SUPABASE STORAGE SETUP FOR COW PHOTOS
-- Run this in your Supabase SQL Editor

-- 1. Create a public storage bucket named 'cow_photos'
insert into storage.buckets (id, name, public)
values ('cow_photos', 'cow_photos', true)
on conflict (id) do nothing;

-- 2. Setup Security Policies (RLS) for the bucket
-- Allow public read access to the photos
create policy "Public Access to Cow Photos"
on storage.objects for select
to public
using ( bucket_id = 'cow_photos' );

-- Allow authenticated users (Managers/Caretakers) to upload photos
create policy "Authenticated users can upload photos"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'cow_photos' );

-- Allow authenticated users to update/delete photos
create policy "Authenticated users can update photos"
on storage.objects for update
to authenticated
using ( bucket_id = 'cow_photos' );

create policy "Authenticated users can delete photos"
on storage.objects for delete
to authenticated
using ( bucket_id = 'cow_photos' );
