-- Update sync_merchant_to_market to use 'available' status instead of 'published'
CREATE OR REPLACE FUNCTION sync_merchant_to_market()
RETURNS TRIGGER AS $$
BEGIN
  -- When merchant item is available, create/update market item
  IF NEW.status = 'available' AND (TG_OP = 'INSERT' OR OLD.status != 'available') THEN
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
      
  -- When merchant item is not available, remove from market
  ELSIF NEW.status != 'available' AND OLD.status = 'available' THEN
    DELETE FROM public.market_items 
    WHERE seller_id = NEW.merchant_id 
      AND title = NEW.name;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add unique constraint to merchant_pages table
ALTER TABLE public.merchant_pages
ADD CONSTRAINT merchant_pages_merchant_id_unique UNIQUE (merchant_id);