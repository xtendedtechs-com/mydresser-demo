-- Add missing database functions for a complete app

-- Create validate_user_session_robust function if not exists
CREATE OR REPLACE FUNCTION public.validate_user_session_robust()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if user is authenticated and session is valid
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  
  -- Additional session validation can be added here
  -- For now, just check if user exists and is authenticated
  RETURN true;
EXCEPTION WHEN OTHERS THEN
  -- On any error, return false for security
  RETURN false;
END;
$$;

-- Ensure sample wardrobe items function
CREATE OR REPLACE FUNCTION public.ensure_minimum_sample_wardrobe_items(min_count integer DEFAULT 8)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_count integer;
  user_uuid uuid;
BEGIN
  user_uuid := auth.uid();
  
  IF user_uuid IS NULL THEN
    RETURN;
  END IF;
  
  SELECT COUNT(*) INTO current_count FROM wardrobe_items WHERE user_id = user_uuid;
  
  IF current_count < min_count THEN
    -- Insert sample items
    INSERT INTO wardrobe_items (user_id, name, category, brand, color, size, season, occasion, condition, wear_count, is_favorite, material, notes, tags, photos)
    SELECT 
      user_uuid,
      sample_name,
      sample_category,
      sample_brand,
      sample_color,
      sample_size,
      sample_season,
      sample_occasion,
      'excellent',
      0,
      false,
      sample_material,
      sample_notes,
      sample_tags,
      sample_photos
    FROM (
      VALUES 
        ('Classic White Button Shirt', 'tops', 'Ralph Lauren', 'White', 'M', 'all-season', 'business', 'Cotton', 'Perfect for professional meetings', ARRAY['business', 'versatile', 'classic'], '{"main": "/placeholder.svg"}'),
        ('Dark Denim Jeans', 'bottoms', 'Levis', 'Dark Blue', '32', 'all-season', 'casual', 'Denim', 'Comfortable everyday jeans', ARRAY['casual', 'denim', 'everyday'], '{"main": "/placeholder.svg"}'),
        ('Black Blazer', 'outerwear', 'Hugo Boss', 'Black', 'M', 'fall', 'business', 'Wool Blend', 'Sharp blazer for important occasions', ARRAY['formal', 'business', 'sophisticated'], '{"main": "/placeholder.svg"}'),
        ('Casual Sneakers', 'shoes', 'Nike', 'White', '10', 'all-season', 'casual', 'Synthetic', 'Comfortable for daily wear', ARRAY['comfortable', 'sporty', 'daily'], '{"main": "/placeholder.svg"}'),
        ('Summer Dress', 'dresses', 'Zara', 'Floral', 'S', 'summer', 'casual', 'Cotton', 'Light and breezy for hot days', ARRAY['feminine', 'summer', 'floral'], '{"main": "/placeholder.svg"}'),
        ('Leather Jacket', 'outerwear', 'AllSaints', 'Black', 'M', 'fall', 'casual', 'Leather', 'Edgy leather jacket', ARRAY['edgy', 'cool', 'leather'], '{"main": "/placeholder.svg"}'),
        ('Running Shoes', 'shoes', 'Adidas', 'Gray', '10', 'all-season', 'sports', 'Mesh', 'Lightweight running shoes', ARRAY['athletic', 'running', 'comfortable'], '{"main": "/placeholder.svg"}'),
        ('Wool Sweater', 'tops', 'Uniqlo', 'Gray', 'L', 'winter', 'casual', 'Wool', 'Warm and cozy sweater', ARRAY['warm', 'cozy', 'winter'], '{"main": "/placeholder.svg"}')
    ) AS samples(sample_name, sample_category, sample_brand, sample_color, sample_size, sample_season, sample_occasion, sample_material, sample_notes, sample_tags, sample_photos)
    LIMIT (min_count - current_count);
  END IF;
END;
$$;