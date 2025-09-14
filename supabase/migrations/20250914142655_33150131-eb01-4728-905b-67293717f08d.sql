-- Replace folder-based policies to avoid dependency on storage.foldername()
-- Use split_part(name,'/',1) which is standard Postgres

-- Photos bucket policies
drop policy if exists "Public read for merchant-item-photos" on storage.objects;
drop policy if exists "User folder write for merchant-item-photos" on storage.objects;
drop policy if exists "User folder update for merchant-item-photos" on storage.objects;
drop policy if exists "User folder delete for merchant-item-photos" on storage.objects;

create policy "Public read for merchant-item-photos"
  on storage.objects for select
  using (bucket_id = 'merchant-item-photos');

create policy "User folder write for merchant-item-photos"
  on storage.objects for insert
  with check (
    bucket_id = 'merchant-item-photos'
    and auth.uid() is not null
    and split_part(name, '/', 1) = auth.uid()::text
  );

create policy "User folder update for merchant-item-photos"
  on storage.objects for update
  using (
    bucket_id = 'merchant-item-photos'
    and auth.uid() is not null
    and split_part(name, '/', 1) = auth.uid()::text
  )
  with check (
    bucket_id = 'merchant-item-photos'
    and auth.uid() is not null
    and split_part(name, '/', 1) = auth.uid()::text
  );

create policy "User folder delete for merchant-item-photos"
  on storage.objects for delete
  using (
    bucket_id = 'merchant-item-photos'
    and auth.uid() is not null
    and split_part(name, '/', 1) = auth.uid()::text
  );

-- Videos bucket policies
drop policy if exists "Public read for merchant-item-videos" on storage.objects;
drop policy if exists "User folder write for merchant-item-videos" on storage.objects;
drop policy if exists "User folder update for merchant-item-videos" on storage.objects;
drop policy if exists "User folder delete for merchant-item-videos" on storage.objects;

create policy "Public read for merchant-item-videos"
  on storage.objects for select
  using (bucket_id = 'merchant-item-videos');

create policy "User folder write for merchant-item-videos"
  on storage.objects for insert
  with check (
    bucket_id = 'merchant-item-videos'
    and auth.uid() is not null
    and split_part(name, '/', 1) = auth.uid()::text
  );

create policy "User folder update for merchant-item-videos"
  on storage.objects for update
  using (
    bucket_id = 'merchant-item-videos'
    and auth.uid() is not null
    and split_part(name, '/', 1) = auth.uid()::text
  )
  with check (
    bucket_id = 'merchant-item-videos'
    and auth.uid() is not null
    and split_part(name, '/', 1) = auth.uid()::text
  );

create policy "User folder delete for merchant-item-videos"
  on storage.objects for delete
  using (
    bucket_id = 'merchant-item-videos'
    and auth.uid() is not null
    and split_part(name, '/', 1) = auth.uid()::text
  );