-- Fix merchant item publishing - ensure proper type casting in trigger
DROP TRIGGER IF EXISTS sync_merchant_to_market_trigger ON merchant_items;

CREATE OR REPLACE FUNCTION sync_merchant_to_market()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only sync if status is 'available' (published)
  IF NEW.status = 'available' THEN
    INSERT INTO market_items (
      id,
      seller_id,
      title,
      description,
      price,
      category,
      size,
      condition,
      brand,
      color,
      material,
      photos,
      tags,
      style_tags,
      is_featured,
      status,
      created_at,
      updated_at
    ) VALUES (
      NEW.id,
      NEW.merchant_id,
      NEW.name,
      NEW.description,
      NEW.price,
      NEW.category,
      to_jsonb(COALESCE(NEW.size, ARRAY[]::text[])),
      COALESCE(NEW.condition, 'new'),
      NEW.brand,
      NEW.color,
      NEW.material,
      COALESCE(NEW.photos, ARRAY[]::text[]),
      to_jsonb(COALESCE(NEW.tags, ARRAY[]::text[])),
      to_jsonb(COALESCE(NEW.style_tags, ARRAY[]::text[])),
      COALESCE(NEW.is_featured, false),
      'available',
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title,
      description = EXCLUDED.description,
      price = EXCLUDED.price,
      category = EXCLUDED.category,
      size = to_jsonb(COALESCE(NEW.size, ARRAY[]::text[])),
      condition = COALESCE(NEW.condition, 'new'),
      brand = EXCLUDED.brand,
      color = EXCLUDED.color,
      material = EXCLUDED.material,
      photos = EXCLUDED.photos,
      tags = to_jsonb(COALESCE(NEW.tags, ARRAY[]::text[])),
      style_tags = to_jsonb(COALESCE(NEW.style_tags, ARRAY[]::text[])),
      is_featured = EXCLUDED.is_featured,
      status = 'available',
      updated_at = NOW();
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'available' AND NEW.status != 'available' THEN
    -- If item is unpublished, remove from market
    DELETE FROM market_items WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER sync_merchant_to_market_trigger
AFTER INSERT OR UPDATE ON merchant_items
FOR EACH ROW
EXECUTE FUNCTION sync_merchant_to_market();