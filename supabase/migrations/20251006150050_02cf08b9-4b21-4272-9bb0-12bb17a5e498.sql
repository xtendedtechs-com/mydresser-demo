-- Fix sync_merchant_to_market to remove reference to NEW.location, handle DELETE, and ensure triggers
-- plus cleanup stale market items

-- 1) Replace trigger function
CREATE OR REPLACE FUNCTION public.sync_merchant_to_market()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Handle DELETE: remove from market when merchant_item is deleted
  IF TG_OP = 'DELETE' THEN
    DELETE FROM public.market_items WHERE id = OLD.id;
    RETURN OLD;
  END IF;

  -- For INSERT/UPDATE, only sync when status is 'available'
  IF NEW.status = 'available' THEN
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
      -- location column intentionally set to NULL to avoid referencing non-existent NEW.location
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
      COALESCE(NEW.size::text, 'Unknown'),
      NEW.material,
      COALESCE(NEW.tags::text[], ARRAY[]::text[]),
      COALESCE(NEW.condition, 'new'),
      NEW.photos,
      'available',
      NULL, -- no direct location on merchant_items
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
    -- If status changed away from available, remove from market
    DELETE FROM public.market_items WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$;

-- 2) Ensure trigger exists for INSERT/UPDATE/DELETE
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trg_sync_merchant_to_market'
  ) THEN
    -- Drop and recreate to include DELETE
    DROP TRIGGER trg_sync_merchant_to_market ON public.merchant_items;
  END IF;

  CREATE TRIGGER trg_sync_merchant_to_market
  AFTER INSERT OR UPDATE OR DELETE ON public.merchant_items
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_merchant_to_market();
END$$;

-- 3) One-time cleanup of stale market items
-- Remove market entries that no longer have a backing merchant item (merchant-sourced)
DELETE FROM public.market_items m
WHERE m.wardrobe_item_id IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.merchant_items mi WHERE mi.id = m.id
  );

-- Remove market entries for user listings whose wardrobe item no longer exists
DELETE FROM public.market_items m
WHERE m.wardrobe_item_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.wardrobe_items wi WHERE wi.id = m.wardrobe_item_id
  );