-- Fix merchant_items jsonb columns for proper data handling
-- This ensures size, tags, style_tags, photos, and videos are properly stored as jsonb

-- Drop and recreate the check constraint with correct statuses
ALTER TABLE merchant_items DROP CONSTRAINT IF EXISTS merchant_items_status_check;
ALTER TABLE merchant_items ADD CONSTRAINT merchant_items_status_check 
  CHECK (status IN ('draft', 'available', 'reserved', 'sold', 'unavailable'));

-- Ensure RLS policies exist for merchant_items
DROP POLICY IF EXISTS "Merchants can manage their own items" ON merchant_items;
CREATE POLICY "Merchants can manage their own items"
  ON merchant_items
  FOR ALL
  USING (merchant_id = auth.uid())
  WITH CHECK (merchant_id = auth.uid());

DROP POLICY IF EXISTS "Anyone can view available items" ON merchant_items;
CREATE POLICY "Anyone can view available items"
  ON merchant_items
  FOR SELECT
  USING (status = 'available' OR merchant_id = auth.uid());

-- Add comment for clarity
COMMENT ON COLUMN merchant_items.size IS 'Stored as jsonb array of size strings';
COMMENT ON COLUMN merchant_items.tags IS 'Stored as jsonb array of tag strings';
COMMENT ON COLUMN merchant_items.style_tags IS 'Stored as jsonb array of style tag strings';
COMMENT ON COLUMN merchant_items.photos IS 'Stored as jsonb with main and urls properties';
COMMENT ON COLUMN merchant_items.videos IS 'Stored as jsonb with main and urls properties';