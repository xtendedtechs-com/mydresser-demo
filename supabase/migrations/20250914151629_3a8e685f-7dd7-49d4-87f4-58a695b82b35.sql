-- Ensure merchant media buckets exist and are public
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('merchant-item-photos', 'merchant-item-photos', true),
  ('merchant-item-videos', 'merchant-item-videos', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- Drop all existing policies for merchant media buckets to start clean
DROP POLICY IF EXISTS "Authenticated users can upload photos to their folder" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload videos to their folder" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated insert merchant item photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated insert merchant item videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Public can read merchant media" ON storage.objects;
DROP POLICY IF EXISTS "Users can insert into their merchant media folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their merchant media folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete from their merchant media folder" ON storage.objects;

-- Create unified policies for merchant media buckets
-- Public read access for merchant media (needed for public URLs)
CREATE POLICY "Public can read merchant media"
ON storage.objects
FOR SELECT TO public
USING (
  bucket_id IN ('merchant-item-photos', 'merchant-item-videos')
);

-- Authenticated users can upload to their own user-id folder
CREATE POLICY "Users can insert into their merchant media folder"
ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id IN ('merchant-item-photos', 'merchant-item-videos')
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Authenticated users can update files in their own user-id folder
CREATE POLICY "Users can update their merchant media folder"
ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id IN ('merchant-item-photos', 'merchant-item-videos')
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id IN ('merchant-item-photos', 'merchant-item-videos')
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Authenticated users can delete files from their own user-id folder
CREATE POLICY "Users can delete from their merchant media folder"
ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id IN ('merchant-item-photos', 'merchant-item-videos')
  AND (storage.foldername(name))[1] = auth.uid()::text
);