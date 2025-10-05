-- Phase 40: Fix Market Visibility & Publishing Workflow
-- Fix market_items RLS to allow anonymous viewing of available items

-- Drop existing policy
DROP POLICY IF EXISTS "Anyone can view available market items" ON public.market_items;

-- Create permissive policy for viewing available items (no auth required)
CREATE POLICY "Public can view available market items"
ON public.market_items
FOR SELECT
USING (status = 'available' OR auth.uid() = seller_id);

-- Ensure sync trigger is complete and handles all fields
CREATE OR REPLACE FUNCTION public.sync_merchant_to_market()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- When merchant item becomes available, create/update market item
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
      created_at,
      updated_at,
      is_featured
    )
    VALUES (
      NEW.merchant_id,
      NEW.name,
      NEW.description,
      NEW.category,
      NEW.brand,
      NEW.price,
      NEW.original_price,
      COALESCE(NEW.condition, 'new'),
      NEW.color,
      NEW.material,
      CASE 
        WHEN NEW.size IS NOT NULL THEN array_to_string(NEW.size, ',')
        ELSE NULL
      END,
      NEW.photos,
      NEW.tags,
      'available',
      NEW.created_at,
      NEW.updated_at,
      COALESCE(NEW.is_featured, false)
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
      is_featured = EXCLUDED.is_featured;
  
  -- When item becomes unavailable, update market_items status
  ELSIF NEW.status != 'available' AND OLD.status = 'available' THEN
    UPDATE public.market_items
    SET status = 'sold', updated_at = now()
    WHERE seller_id = NEW.merchant_id 
      AND title = NEW.name;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recreate triggers to ensure they're active
DROP TRIGGER IF EXISTS sync_merchant_items_trigger ON public.merchant_items;
DROP TRIGGER IF EXISTS trigger_sync_merchant_to_market ON public.merchant_items;

CREATE TRIGGER trigger_sync_merchant_to_market
AFTER INSERT OR UPDATE ON public.merchant_items
FOR EACH ROW
EXECUTE FUNCTION public.sync_merchant_to_market();

-- Add helper function to publish merchant items
CREATE OR REPLACE FUNCTION public.publish_merchant_item(item_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item RECORD;
  v_result jsonb;
BEGIN
  -- Verify merchant owns this item
  SELECT * INTO v_item
  FROM public.merchant_items
  WHERE id = item_id AND merchant_id = auth.uid();
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Item not found or access denied'
    );
  END IF;
  
  -- Update status to available (trigger will sync to market)
  UPDATE public.merchant_items
  SET status = 'available', updated_at = now()
  WHERE id = item_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Item published to market'
  );
END;
$$;

-- Backfill: Sync any existing 'available' merchant items to market
-- This ensures items that were already available get synced
DO $$
DECLARE
  v_item RECORD;
BEGIN
  FOR v_item IN 
    SELECT * FROM public.merchant_items WHERE status = 'available'
  LOOP
    INSERT INTO public.market_items (
      seller_id, title, description, category, brand, price, 
      original_price, condition, color, material, size, photos, 
      tags, status, created_at, updated_at, is_featured
    )
    VALUES (
      v_item.merchant_id,
      v_item.name,
      v_item.description,
      v_item.category,
      v_item.brand,
      v_item.price,
      v_item.original_price,
      COALESCE(v_item.condition, 'new'),
      v_item.color,
      v_item.material,
      CASE WHEN v_item.size IS NOT NULL THEN array_to_string(v_item.size, ',') ELSE NULL END,
      v_item.photos,
      v_item.tags,
      'available',
      v_item.created_at,
      v_item.updated_at,
      COALESCE(v_item.is_featured, false)
    )
    ON CONFLICT (id) DO NOTHING;
  END LOOP;
END $$;