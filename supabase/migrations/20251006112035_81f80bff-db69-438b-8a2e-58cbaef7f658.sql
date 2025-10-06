-- Fix sync_merchant_to_market to match market_items schema (no "name" column)
CREATE OR REPLACE FUNCTION public.sync_merchant_to_market()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only sync when merchant item is marked available
  IF NEW.status = 'available' THEN
    INSERT INTO public.market_items (
      id,
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
      updated_at,
      is_featured,
      sustainability_score,
      shipping_options
    ) VALUES (
      NEW.id,
      NEW.merchant_id,
      NEW.name, -- map merchant_items.name -> market_items.title
      NEW.description,
      NEW.category,
      NEW.brand,
      NEW.price,
      NEW.original_price,
      NEW.condition,
      NEW.color,
      NEW.material,
      CASE 
        WHEN NEW.size IS NOT NULL THEN 
          CASE 
            WHEN jsonb_typeof(NEW.size::jsonb) = 'array' THEN (NEW.size::jsonb->>0) -- first size if array
            ELSE NEW.size::text
          END
        ELSE NULL
      END,
      NEW.photos,
      NEW.tags,
      'available',
      COALESCE(NEW.location, 'Merchant Store'),
      NEW.created_at,
      NEW.updated_at,
      COALESCE(NEW.is_featured, false),
      COALESCE(NEW.sustainability_score, 75),
      COALESCE(NEW.shipping_options, jsonb_build_object('shipping_available', true, 'shipping_cost', 0, 'local_pickup', false))
    )
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title,
      description = EXCLUDED.description,
      category = EXCLUDED.category,
      brand = EXCLUDED.brand,
      price = EXCLUDED.price,
      original_price = EXCLUDED.original_price,
      condition = EXCLUDED.condition,
      color = EXCLUDED.color,
      material = EXCLUDED.material,
      size = EXCLUDED.size,
      photos = EXCLUDED.photos,
      tags = EXCLUDED.tags,
      status = EXCLUDED.status,
      updated_at = EXCLUDED.updated_at,
      is_featured = EXCLUDED.is_featured,
      sustainability_score = EXCLUDED.sustainability_score,
      shipping_options = EXCLUDED.shipping_options;
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'available' AND NEW.status <> 'available' THEN
    -- Remove from market when taken off availability
    DELETE FROM public.market_items WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$function$;

-- Ensure trigger exists and uses the corrected function
DROP TRIGGER IF EXISTS sync_merchant_items_to_market ON public.merchant_items;
CREATE TRIGGER sync_merchant_items_to_market
AFTER INSERT OR UPDATE ON public.merchant_items
FOR EACH ROW
EXECUTE FUNCTION public.sync_merchant_to_market();