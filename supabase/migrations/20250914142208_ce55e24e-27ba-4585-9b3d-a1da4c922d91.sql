-- Create storage buckets for merchant item media (idempotent)
insert into storage.buckets (id, name, public)
values ('merchant-item-photos', 'merchant-item-photos', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('merchant-item-videos', 'merchant-item-videos', true)
on conflict (id) do nothing;

-- Clean up any old/conflicting policies for photos bucket
drop policy if exists "Public read for merchant-item-photos" on storage.objects;
drop policy if exists "User folder write for merchant-item-photos" on storage.objects;
drop policy if exists "User folder update for merchant-item-photos" on storage.objects;
drop policy if exists "User folder delete for merchant-item-photos" on storage.objects;

-- Photos: public read access
create policy "Public read for merchant-item-photos"
  on storage.objects for select
  using (bucket_id = 'merchant-item-photos');

-- Photos: authenticated users can upload to their own folder (first path segment must be their user id)
create policy "User folder write for merchant-item-photos"
  on storage.objects for insert
  with check (
    bucket_id = 'merchant-item-photos'
    and auth.uid() is not null
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Photos: allow updates only within own folder
create policy "User folder update for merchant-item-photos"
  on storage.objects for update
  using (
    bucket_id = 'merchant-item-photos'
    and auth.uid() is not null
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'merchant-item-photos'
    and auth.uid() is not null
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Photos: allow deletes only within own folder
create policy "User folder delete for merchant-item-photos"
  on storage.objects for delete
  using (
    bucket_id = 'merchant-item-photos'
    and auth.uid() is not null
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Clean up any old/conflicting policies for videos bucket
drop policy if exists "Public read for merchant-item-videos" on storage.objects;
drop policy if exists "User folder write for merchant-item-videos" on storage.objects;
drop policy if exists "User folder update for merchant-item-videos" on storage.objects;
drop policy if exists "User folder delete for merchant-item-videos" on storage.objects;

-- Videos: public read access (optional, aligns with current getPublicUrl usage)
create policy "Public read for merchant-item-videos"
  on storage.objects for select
  using (bucket_id = 'merchant-item-videos');

-- Videos: authenticated users can upload to their own folder
create policy "User folder write for merchant-item-videos"
  on storage.objects for insert
  with check (
    bucket_id = 'merchant-item-videos'
    and auth.uid() is not null
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Videos: allow updates only within own folder
create policy "User folder update for merchant-item-videos"
  on storage.objects for update
  using (
    bucket_id = 'merchant-item-videos'
    and auth.uid() is not null
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'merchant-item-videos'
    and auth.uid() is not null
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Videos: allow deletes only within own folder
create policy "User folder delete for merchant-item-videos"
  on storage.objects for delete
  using (
    bucket_id = 'merchant-item-videos'
    and auth.uid() is not null
    and auth.uid()::text = (storage.foldername(name))[1]
  );