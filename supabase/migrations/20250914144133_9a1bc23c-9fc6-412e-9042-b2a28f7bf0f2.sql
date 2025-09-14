-- Broaden insert to guarantee uploads work for authenticated users (bucket-scoped)
-- Photos
DROP POLICY IF EXISTS "Allow authenticated insert merchant item photos" ON storage.objects;
CREATE POLICY "Allow authenticated insert merchant item photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'merchant-item-photos'
    AND auth.role() = 'authenticated'
  );

-- Videos
DROP POLICY IF EXISTS "Allow authenticated insert merchant item videos" ON storage.objects;
CREATE POLICY "Allow authenticated insert merchant item videos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'merchant-item-videos'
    AND auth.role() = 'authenticated'
  );