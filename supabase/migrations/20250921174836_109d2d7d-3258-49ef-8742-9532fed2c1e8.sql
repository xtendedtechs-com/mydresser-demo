-- Create storage bucket for merchant uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('merchant-uploads', 'merchant-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for merchant uploads
CREATE POLICY "Merchants can upload their own files"
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'merchant-uploads' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Merchants can view their own files"
ON storage.objects FOR SELECT 
USING (
  bucket_id = 'merchant-uploads' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Merchants can update their own files"
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'merchant-uploads' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Merchants can delete their own files"
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'merchant-uploads' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public access to merchant upload files
CREATE POLICY "Public access to merchant files"
ON storage.objects FOR SELECT 
USING (bucket_id = 'merchant-uploads');