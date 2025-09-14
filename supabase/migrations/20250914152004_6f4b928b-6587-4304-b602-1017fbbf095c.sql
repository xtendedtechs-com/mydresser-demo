-- Ensure merchant media buckets exist and are public
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('merchant-item-photos', 'merchant-item-photos', true),
  ('merchant-item-videos', 'merchant-item-videos', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- Drop ALL existing policies on storage.objects that reference our merchant buckets (photos/videos)
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND (
        COALESCE(qual::text, '') ILIKE '%merchant-item-photos%'
        OR COALESCE(qual::text, '') ILIKE '%merchant-item-videos%'
        OR COALESCE(with_check::text, '') ILIKE '%merchant-item-photos%'
        OR COALESCE(with_check::text, '') ILIKE '%merchant-item-videos%'
      )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
  END LOOP;
END $$;

-- Recreate a clean, minimal policy set
-- 1) Public read for both merchant media buckets
CREATE POLICY "public_select_merchant_media"
ON storage.objects
FOR SELECT TO public
USING (
  bucket_id IN ('merchant-item-photos','merchant-item-videos')
);

-- 2) Authenticated users can insert only into their own user-id folder
CREATE POLICY "auth_insert_own_folder_merchant_media"
ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id IN ('merchant-item-photos','merchant-item-videos')
  AND split_part(name, '/', 1) = auth.uid()::text
);

-- 3) Authenticated users can update only files in their own user-id folder
CREATE POLICY "auth_update_own_folder_merchant_media"
ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id IN ('merchant-item-photos','merchant-item-videos')
  AND split_part(name, '/', 1) = auth.uid()::text
)
WITH CHECK (
  bucket_id IN ('merchant-item-photos','merchant-item-videos')
  AND split_part(name, '/', 1) = auth.uid()::text
);

-- 4) Authenticated users can delete only files in their own user-id folder
CREATE POLICY "auth_delete_own_folder_merchant_media"
ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id IN ('merchant-item-photos','merchant-item-videos')
  AND split_part(name, '/', 1) = auth.uid()::text
);
