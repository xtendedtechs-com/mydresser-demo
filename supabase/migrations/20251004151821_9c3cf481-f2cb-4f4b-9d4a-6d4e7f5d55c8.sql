-- Create VTO photos storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('vto-photos', 'vto-photos', false)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for VTO photos bucket
CREATE POLICY "Users can upload their own VTO photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'vto-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own VTO photos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'vto-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own VTO photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'vto-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);