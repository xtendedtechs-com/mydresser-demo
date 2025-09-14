-- Create storage buckets for merchant item media
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('merchant-item-photos', 'merchant-item-photos', true),
  ('merchant-item-videos', 'merchant-item-videos', true);

-- Storage policies for merchant item photos
CREATE POLICY "Merchants can upload their item photos"
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'merchant-item-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND EXISTS (
    SELECT 1 FROM merchant_profiles 
    WHERE user_id = auth.uid() 
    AND verification_status IN ('verified', 'pending')
  )
);

CREATE POLICY "Anyone can view merchant item photos"
ON storage.objects FOR SELECT 
USING (bucket_id = 'merchant-item-photos');

CREATE POLICY "Merchants can update their item photos"
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'merchant-item-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Merchants can delete their item photos"
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'merchant-item-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policies for merchant item videos
CREATE POLICY "Merchants can upload their item videos"
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'merchant-item-videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND EXISTS (
    SELECT 1 FROM merchant_profiles 
    WHERE user_id = auth.uid() 
    AND verification_status IN ('verified', 'pending')
  )
);

CREATE POLICY "Anyone can view merchant item videos"
ON storage.objects FOR SELECT 
USING (bucket_id = 'merchant-item-videos');

CREATE POLICY "Merchants can update their item videos"
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'merchant-item-videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Merchants can delete their item videos"
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'merchant-item-videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);