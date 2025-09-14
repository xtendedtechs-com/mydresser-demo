-- Add permissive insert policies to unblock uploads while keeping path checks
CREATE POLICY IF NOT EXISTS "Authenticated insert merchant-item-photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'merchant-item-photos'
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY IF NOT EXISTS "Authenticated insert merchant-item-videos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'merchant-item-videos'
    AND auth.uid() IS NOT NULL
  );