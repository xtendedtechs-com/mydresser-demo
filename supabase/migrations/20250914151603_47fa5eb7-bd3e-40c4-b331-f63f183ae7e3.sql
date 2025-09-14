-- Ensure merchant media buckets exist and are public
insert into storage.buckets (id, name, public)
values
  ('merchant-item-photos', 'merchant-item-photos', true),
  ('merchant-item-videos', 'merchant-item-videos', true)
on conflict (id) do update set public = excluded.public;

-- Clean up legacy/conflicting policies if they exist
DO $$
BEGIN
  -- Drop various previously-created insert policies
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND polname = 'Authenticated users can upload photos to their folder'
  ) THEN
    EXECUTE 'DROP POLICY "Authenticated users can upload photos to their folder" ON storage.objects';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND polname = 'Authenticated users can upload videos to their folder'
  ) THEN
    EXECUTE 'DROP POLICY "Authenticated users can upload videos to their folder" ON storage.objects';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND polname = 'Allow authenticated insert merchant item photos'
  ) THEN
    EXECUTE 'DROP POLICY "Allow authenticated insert merchant item photos" ON storage.objects';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND polname = 'Allow authenticated insert merchant item videos'
  ) THEN
    EXECUTE 'DROP POLICY "Allow authenticated insert merchant item videos" ON storage.objects';
  END IF;

  -- Drop profile-photo-named policies that were repurposed for merchant buckets
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND polname = 'Users can upload their own profile photos'
  ) THEN
    EXECUTE 'DROP POLICY "Users can upload their own profile photos" ON storage.objects';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND polname = 'Users can delete their own profile photos'
  ) THEN
    EXECUTE 'DROP POLICY "Users can delete their own profile photos" ON storage.objects';
  END IF;

  -- Drop our unified policies if they exist to allow re-creation idempotently
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND polname = 'Public can read merchant media'
  ) THEN
    EXECUTE 'DROP POLICY "Public can read merchant media" ON storage.objects';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND polname = 'Users can insert into their merchant media folder'
  ) THEN
    EXECUTE 'DROP POLICY "Users can insert into their merchant media folder" ON storage.objects';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND polname = 'Users can update their merchant media folder'
  ) THEN
    EXECUTE 'DROP POLICY "Users can update their merchant media folder" ON storage.objects';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND polname = 'Users can delete from their merchant media folder'
  ) THEN
    EXECUTE 'DROP POLICY "Users can delete from their merchant media folder" ON storage.objects';
  END IF;
END $$;

-- Public read for merchant media buckets (to allow public URLs and listings)
CREATE POLICY "Public can read merchant media"
ON storage.objects
FOR SELECT TO public
USING (
  bucket_id IN ('merchant-item-photos','merchant-item-videos')
);

-- Authenticated users can write within their own user-id folder for both buckets
CREATE POLICY "Users can insert into their merchant media folder"
ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id IN ('merchant-item-photos','merchant-item-videos')
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their merchant media folder"
ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id IN ('merchant-item-photos','merchant-item-videos')
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id IN ('merchant-item-photos','merchant-item-videos')
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete from their merchant media folder"
ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id IN ('merchant-item-photos','merchant-item-videos')
  AND (storage.foldername(name))[1] = auth.uid()::text
);
