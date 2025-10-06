-- Drop all existing triggers with CASCADE
DROP FUNCTION IF EXISTS public.sync_merchant_to_market() CASCADE;

-- Recreate the function with proper jsonb handling
-- This function syncs merchant items to market_items when status is 'available'
CREATE OR REPLACE FUNCTION public.sync_merchant_to_market()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only sync items that are 'available' status (published)
  IF NEW.status = 'available' THEN
    -- Insert or update in market_items
    INSERT INTO public.market_items (
      id,
      seller_id,
      wardrobe_item_id,
      title,
      description,
      price,
      original_price,
      category,
      brand,
      color,
      size,
      material,
      tags,
      condition,
      photos,
      status,
      location,
      created_at,
      updated_at
    ) VALUES (
      NEW.id,
      NEW.merchant_id,
      NULL, -- merchant items don't have wardrobe_item_id
      NEW.name,
      NEW.description,
      NEW.price,
      NEW.original_price,
      NEW.category,
      NEW.brand,
      NEW.color,
      COALESCE(NEW.size::text, 'Unknown'), -- Convert jsonb to text
      NEW.material,
      ARRAY[]::text[], -- Convert jsonb tags to text array if needed
      COALESCE(NEW.condition, 'new'),
      NEW.photos,
      'available', -- Use 'available' for market status
      NEW.location,
      NEW.created_at,
      NEW.updated_at
    )
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title,
      description = EXCLUDED.description,
      price = EXCLUDED.price,
      original_price = EXCLUDED.original_price,
      category = EXCLUDED.category,
      brand = EXCLUDED.brand,
      color = EXCLUDED.color,
      size = EXCLUDED.size,
      material = EXCLUDED.material,
      tags = EXCLUDED.tags,
      condition = EXCLUDED.condition,
      photos = EXCLUDED.photos,
      status = EXCLUDED.status,
      location = EXCLUDED.location,
      updated_at = EXCLUDED.updated_at;
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'available' AND NEW.status != 'available' THEN
    -- If status changed from available to something else, remove from market
    DELETE FROM public.market_items WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$;

-- Recreate single trigger
CREATE TRIGGER sync_merchant_to_market
AFTER INSERT OR UPDATE ON public.merchant_items
FOR EACH ROW
EXECUTE FUNCTION public.sync_merchant_to_market();

-- Clean up invalid market items (those without a seller or that shouldn't be there)
DELETE FROM public.market_items
WHERE seller_id IS NULL
   OR (wardrobe_item_id IS NULL AND id NOT IN (SELECT id FROM public.merchant_items WHERE status = 'available'));

-- Security: Ensure merchant_pages has proper RLS
ALTER TABLE public.merchant_pages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Merchants can manage their pages" ON public.merchant_pages;
CREATE POLICY "Merchants can manage their pages"
ON public.merchant_pages
FOR ALL
USING (auth.uid() = merchant_id)
WITH CHECK (auth.uid() = merchant_id);

DROP POLICY IF EXISTS "Public can view published pages" ON public.merchant_pages;
CREATE POLICY "Public can view published pages"
ON public.merchant_pages
FOR SELECT
USING (is_published = true);