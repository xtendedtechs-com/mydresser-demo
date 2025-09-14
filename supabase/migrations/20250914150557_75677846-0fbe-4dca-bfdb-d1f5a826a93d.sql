-- Create buckets for merchant item media if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('merchant-item-photos', 'merchant-item-photos', true),
  ('merchant-item-videos', 'merchant-item-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Policy helpers: allow users to operate only within their own user-id folder
-- INSERT policies
DO $$
BEGIN
  -- Photos: INSERT
  BEGIN
    CREATE POLICY "Merchants can upload their own photos"
    ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
      bucket_id = 'merchant-item-photos'
      AND (storage.foldername(name))[1] = auth.uid()::text
    );
  EXCEPTION WHEN duplicate_object THEN NULL; END;

  -- Videos: INSERT
  BEGIN
    CREATE POLICY "Merchants can upload their own videos"
    ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
      bucket_id = 'merchant-item-videos'
      AND (storage.foldername(name))[1] = auth.uid()::text
    );
  EXCEPTION WHEN duplicate_object THEN NULL; END;
END$$;

-- UPDATE policies (e.g., changing metadata)
DO $$
BEGIN
  BEGIN
    CREATE POLICY "Merchants can update their own photos"
    ON storage.objects
    FOR UPDATE TO authenticated
    USING (
      bucket_id = 'merchant-item-photos'
      AND (storage.foldername(name))[1] = auth.uid()::text
    )
    WITH CHECK (
      bucket_id = 'merchant-item-photos'
      AND (storage.foldername(name))[1] = auth.uid()::text
    );
  EXCEPTION WHEN duplicate_object THEN NULL; END;

  BEGIN
    CREATE POLICY "Merchants can update their own videos"
    ON storage.objects
    FOR UPDATE TO authenticated
    USING (
      bucket_id = 'merchant-item-videos'
      AND (storage.foldername(name))[1] = auth.uid()::text
    )
    WITH CHECK (
      bucket_id = 'merchant-item-videos'
      AND (storage.foldername(name))[1] = auth.uid()::text
    );
  EXCEPTION WHEN duplicate_object THEN NULL; END;
END$$;

-- DELETE policies (removing files)
DO $$
BEGIN
  BEGIN
    CREATE POLICY "Merchants can delete their own photos"
    ON storage.objects
    FOR DELETE TO authenticated
    USING (
      bucket_id = 'merchant-item-photos'
      AND (storage.foldername(name))[1] = auth.uid()::text
    );
  EXCEPTION WHEN duplicate_object THEN NULL; END;

  BEGIN
    CREATE POLICY "Merchants can delete their own videos"
    ON storage.objects
    FOR DELETE TO authenticated
    USING (
      bucket_id = 'merchant-item-videos'
      AND (storage.foldername(name))[1] = auth.uid()::text
    );
  EXCEPTION WHEN duplicate_object THEN NULL; END;
END$$;

-- Optional: SELECT policies for authenticated users to list their own files (listing via SDK uses this)
DO $$
BEGIN
  BEGIN
    CREATE POLICY "Merchants can list their own photos"
    ON storage.objects
    FOR SELECT TO authenticated
    USING (
      bucket_id = 'merchant-item-photos'
      AND (storage.foldername(name))[1] = auth.uid()::text
    );
  EXCEPTION WHEN duplicate_object THEN NULL; END;

  BEGIN
    CREATE POLICY "Merchants can list their own videos"
    ON storage.objects
    FOR SELECT TO authenticated
    USING (
      bucket_id = 'merchant-item-videos'
      AND (storage.foldername(name))[1] = auth.uid()::text
    );
  EXCEPTION WHEN duplicate_object THEN NULL; END;
END$$;

-- Notes:
-- Buckets are public for CDN-style access via getPublicUrl; writes remain protected by RLS.
-- Path convention enforced: <bucket>/<user_id>/<filename>. FileUpload component already uses this convention.