-- Create profile-photos storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload their own profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Profile photos are publicly accessible" ON storage.objects;

-- Allow authenticated users to upload their own profile photos
CREATE POLICY "Users can upload their own profile photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update their own profile photos
CREATE POLICY "Users can update their own profile photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own profile photos
CREATE POLICY "Users can delete their own profile photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow anyone to view profile photos (public bucket)
CREATE POLICY "Profile photos are publicly accessible"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'profile-photos');