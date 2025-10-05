-- Fix remaining search_path issues for security functions
ALTER FUNCTION public.validate_user_session_robust() SET search_path = 'public';
ALTER FUNCTION public.mask_contact_data(text, text) SET search_path = 'public';

-- Ensure market items are visible globally
DROP POLICY IF EXISTS "Anyone can view available market items" ON market_items;
CREATE POLICY "Anyone can view available market items"
  ON market_items FOR SELECT
  USING (status = 'available');

-- Ensure merchants can manage their own market items
DROP POLICY IF EXISTS "Sellers can manage their market items" ON market_items;
CREATE POLICY "Sellers can manage their market items"
  ON market_items FOR ALL
  USING (seller_id = auth.uid())
  WITH CHECK (seller_id = auth.uid());

-- Fix merchant_items status and ensure proper RLS
ALTER TABLE merchant_items DROP CONSTRAINT IF EXISTS merchant_items_status_check;
ALTER TABLE merchant_items ADD CONSTRAINT merchant_items_status_check 
  CHECK (status IN ('draft', 'available', 'unavailable', 'reserved', 'sold', 'archived'));

-- Ensure merchants can manage their own items
DROP POLICY IF EXISTS "Merchants manage own items" ON merchant_items;
CREATE POLICY "Merchants manage own items"
  ON merchant_items FOR ALL
  USING (merchant_id = auth.uid())
  WITH CHECK (merchant_id = auth.uid());

-- Improved sync trigger to handle all merchant item changes
CREATE OR REPLACE FUNCTION sync_merchant_to_market()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only sync if status is 'available'
  IF NEW.status = 'available' THEN
    INSERT INTO market_items (
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
      NEW.name,
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
            WHEN jsonb_typeof(NEW.size::jsonb) = 'array' THEN (NEW.size::jsonb->>0)
            ELSE NEW.size::text
          END
        ELSE NULL
      END,
      NEW.photos,
      NEW.tags,
      'available',
      'Merchant Store',
      NEW.created_at,
      NEW.updated_at,
      COALESCE(NEW.is_featured, false),
      75,
      jsonb_build_object('shipping_available', true, 'shipping_cost', 0, 'local_pickup', false)
    )
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title,
      description = EXCLUDED.description,
      price = EXCLUDED.price,
      original_price = EXCLUDED.original_price,
      photos = EXCLUDED.photos,
      tags = EXCLUDED.tags,
      status = EXCLUDED.status,
      updated_at = EXCLUDED.updated_at,
      is_featured = EXCLUDED.is_featured;
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'available' AND NEW.status != 'available' THEN
    -- Remove from market if status changed from available
    DELETE FROM market_items WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_merchant_items_to_market ON merchant_items;
CREATE TRIGGER sync_merchant_items_to_market
  AFTER INSERT OR UPDATE ON merchant_items
  FOR EACH ROW
  EXECUTE FUNCTION sync_merchant_to_market();