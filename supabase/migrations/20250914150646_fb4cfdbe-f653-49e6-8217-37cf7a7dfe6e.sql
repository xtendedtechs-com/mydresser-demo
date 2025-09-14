-- Add missing INSERT policies for authenticated users to upload to their own folders
-- These policies allow authenticated users to upload to buckets using their user ID as folder name

-- Drop the overly restrictive INSERT policies that require merchant verification
DROP POLICY IF EXISTS "Allow authenticated insert merchant item photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated insert merchant item videos" ON storage.objects;

-- Create simple INSERT policies for authenticated users
CREATE POLICY "Authenticated users can upload photos to their folder"
ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'merchant-item-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Authenticated users can upload videos to their folder" 
ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'merchant-item-videos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);