-- Create public wardrobe storage bucket and policies
insert into storage.buckets (id, name, public)
values ('wardrobe', 'wardrobe', true)
on conflict (id) do nothing;

-- Public read access to wardrobe bucket (need to use create policy without if not exists first)
drop policy if exists "Public can read wardrobe images" on storage.objects;
create policy "Public can read wardrobe images"
on storage.objects
for select
using (bucket_id = 'wardrobe');

-- Authenticated users can upload to their own folder (first path segment = user_id)
drop policy if exists "Users can upload wardrobe images to their own folder" on storage.objects;
create policy "Users can upload wardrobe images to their own folder"
on storage.objects
for insert
with check (
  bucket_id = 'wardrobe'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Authenticated users can update images in their own folder
drop policy if exists "Users can update their own wardrobe images" on storage.objects;
create policy "Users can update their own wardrobe images"
on storage.objects
for update
using (
  bucket_id = 'wardrobe' and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'wardrobe' and auth.uid()::text = (storage.foldername(name))[1]
);