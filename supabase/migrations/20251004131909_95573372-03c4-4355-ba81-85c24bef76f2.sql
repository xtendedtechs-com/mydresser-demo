-- Add VTO photo support to user preferences
ALTER TABLE public.user_preferences
ADD COLUMN IF NOT EXISTS vto_photo_url TEXT;

-- Create storage bucket for user photos if not exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-photos',
  'user-photos',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for user photos
CREATE POLICY "Users can upload their own photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'user-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'user-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'user-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "User photos are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'user-photos');