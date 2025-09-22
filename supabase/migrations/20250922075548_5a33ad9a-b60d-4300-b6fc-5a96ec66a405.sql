-- Fix storage policies for merchant uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('merchant-uploads', 'merchant-uploads', false) 
ON CONFLICT (id) DO NOTHING;

-- Storage policies for merchant uploads
CREATE POLICY "Merchants can upload their own files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'merchant-uploads' 
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() 
      AND role = 'merchant'::user_role
    )
  );

CREATE POLICY "Merchants can view their own uploaded files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'merchant-uploads' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Anyone can view published merchant files" ON storage.objects
  FOR SELECT USING (bucket_id = 'merchant-uploads');

CREATE POLICY "Merchants can delete their own files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'merchant-uploads' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create trigger to sync published merchant items to market
CREATE OR REPLACE FUNCTION sync_merchant_to_market()
RETURNS TRIGGER AS $$
BEGIN
  -- When merchant item is published, create/update market item
  IF NEW.status = 'published' AND (TG_OP = 'INSERT' OR OLD.status != 'published') THEN
    INSERT INTO public.market_items (
      seller_id,
      title,
      description,
      category,
      brand,
      price,
      original_price,
      condition,
      color,
      material,
      size,
      photos,
      tags,
      status,
      location,
      created_at,
      updated_at
    )
    VALUES (
      NEW.merchant_id,
      NEW.name,
      NEW.description,
      NEW.category,
      NEW.brand,
      NEW.price,
      NEW.original_price,
      NEW.condition,
      NEW.color,
      NEW.material,
      array_to_string(NEW.size, ','),
      NEW.photos,
      NEW.tags,
      'available',
      'Merchant Store',
      NEW.created_at,
      NEW.updated_at
    )
    ON CONFLICT (seller_id, title) DO UPDATE SET
      description = EXCLUDED.description,
      price = EXCLUDED.price,
      original_price = EXCLUDED.original_price,
      photos = EXCLUDED.photos,
      updated_at = now();
      
  -- When merchant item is unpublished, remove from market
  ELSIF NEW.status != 'published' AND OLD.status = 'published' THEN
    DELETE FROM public.market_items 
    WHERE seller_id = NEW.merchant_id 
      AND title = NEW.name;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists and create new one
DROP TRIGGER IF EXISTS sync_merchant_items_trigger ON merchant_items;
CREATE TRIGGER sync_merchant_items_trigger
  AFTER INSERT OR UPDATE ON merchant_items
  FOR EACH ROW EXECUTE FUNCTION sync_merchant_to_market();