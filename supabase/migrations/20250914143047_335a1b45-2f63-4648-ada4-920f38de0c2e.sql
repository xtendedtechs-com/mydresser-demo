-- Strengthen and align storage policies with owner checks
-- Photos bucket
DROP POLICY IF EXISTS "Public read for merchant-item-photos" ON storage.objects;
DROP POLICY IF EXISTS "User folder write for merchant-item-photos" ON storage.objects;
DROP POLICY IF EXISTS "User folder update for merchant-item-photos" ON storage.objects;
DROP POLICY IF EXISTS "User folder delete for merchant-item-photos" ON storage.objects;

CREATE POLICY "Public read for merchant-item-photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'merchant-item-photos');

CREATE POLICY "User folder write for merchant-item-photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'merchant-item-photos'
    AND auth.uid() IS NOT NULL
    AND owner = auth.uid()
    AND split_part(name, '/', 1) = auth.uid()::text
  );

CREATE POLICY "User folder update for merchant-item-photos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'merchant-item-photos'
    AND auth.uid() IS NOT NULL
    AND owner = auth.uid()
    AND split_part(name, '/', 1) = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'merchant-item-photos'
    AND auth.uid() IS NOT NULL
    AND owner = auth.uid()
    AND split_part(name, '/', 1) = auth.uid()::text
  );

CREATE POLICY "User folder delete for merchant-item-photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'merchant-item-photos'
    AND auth.uid() IS NOT NULL
    AND owner = auth.uid()
    AND split_part(name, '/', 1) = auth.uid()::text
  );

-- Videos bucket
DROP POLICY IF EXISTS "Public read for merchant-item-videos" ON storage.objects;
DROP POLICY IF EXISTS "User folder write for merchant-item-videos" ON storage.objects;
DROP POLICY IF EXISTS "User folder update for merchant-item-videos" ON storage.objects;
DROP POLICY IF EXISTS "User folder delete for merchant-item-videos" ON storage.objects;

CREATE POLICY "Public read for merchant-item-videos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'merchant-item-videos');

CREATE POLICY "User folder write for merchant-item-videos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'merchant-item-videos'
    AND auth.uid() IS NOT NULL
    AND owner = auth.uid()
    AND split_part(name, '/', 1) = auth.uid()::text
  );

CREATE POLICY "User folder update for merchant-item-videos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'merchant-item-videos'
    AND auth.uid() IS NOT NULL
    AND owner = auth.uid()
    AND split_part(name, '/', 1) = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'merchant-item-videos'
    AND auth.uid() IS NOT NULL
    AND owner = auth.uid()
    AND split_part(name, '/', 1) = auth.uid()::text
  );

CREATE POLICY "User folder delete for merchant-item-videos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'merchant-item-videos'
    AND auth.uid() IS NOT NULL
    AND owner = auth.uid()
    AND split_part(name, '/', 1) = auth.uid()::text
  );