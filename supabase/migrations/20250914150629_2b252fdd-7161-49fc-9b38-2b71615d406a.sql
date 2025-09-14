-- Create storage buckets only (RLS policies need to be set in the Supabase dashboard)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'merchant-item-photos', 
    'merchant-item-photos', 
    true, 
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  ),
  (
    'merchant-item-videos', 
    'merchant-item-videos', 
    true, 
    104857600, -- 100MB limit
    ARRAY['video/mp4', 'video/webm', 'video/mov', 'video/avi']
  )
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;