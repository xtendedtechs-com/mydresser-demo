-- Create storage bucket for profile photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('profile-photos', 'profile-photos', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']);

-- Create policies for profile photo uploads
CREATE POLICY "Users can upload their own profile photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'profile-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view all profile photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'profile-photos');

CREATE POLICY "Users can update their own profile photos" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'profile-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own profile photos" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'profile-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Insert some fake wardrobe items for demo purposes
INSERT INTO public.wardrobe_items (
  user_id, 
  name, 
  category, 
  brand, 
  color, 
  size, 
  season, 
  occasion, 
  material, 
  condition, 
  purchase_price,
  notes,
  tags,
  photos,
  is_favorite
) VALUES
-- Generate items for any authenticated user (will use auth.uid() dynamically)
(auth.uid(), 'Classic White Button Shirt', 'tops', 'Ralph Lauren', 'White', 'M', 'all-season', 'business', 'Cotton', 'excellent', 89.99, 'Perfect for professional meetings', ARRAY['business', 'versatile', 'classic'], '{"main": "/placeholder.svg"}', false),
(auth.uid(), 'Dark Denim Jeans', 'bottoms', 'Levis', 'Dark Blue', '32', 'all-season', 'casual', 'Denim', 'good', 79.99, 'Comfortable everyday jeans', ARRAY['casual', 'denim', 'everyday'], '{"main": "/placeholder.svg"}', true),
(auth.uid(), 'Black Blazer', 'outerwear', 'Hugo Boss', 'Black', 'M', 'fall', 'business', 'Wool Blend', 'excellent', 299.99, 'Sharp blazer for important occasions', ARRAY['formal', 'business', 'sophisticated'], '{"main": "/placeholder.svg"}', true),
(auth.uid(), 'Casual Sneakers', 'shoes', 'Nike', 'White', '10', 'all-season', 'casual', 'Synthetic', 'good', 120.00, 'Comfortable for daily wear', ARRAY['comfortable', 'sporty', 'daily'], '{"main": "/placeholder.svg"}', false),
(auth.uid(), 'Summer Dress', 'dresses', 'Zara', 'Floral', 'S', 'summer', 'casual', 'Cotton', 'excellent', 49.99, 'Light and breezy for hot days', ARRAY['feminine', 'summer', 'floral'], '{"main": "/placeholder.svg"}', true)
ON CONFLICT DO NOTHING;