-- Fix remaining search_path security warnings for database functions

-- Fix validate_user_session_robust function
CREATE OR REPLACE FUNCTION public.validate_user_session_robust()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_user_id uuid;
  user_metadata jsonb;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  SELECT raw_user_meta_data INTO user_metadata
  FROM auth.users
  WHERE id = current_user_id;
  
  RETURN user_metadata IS NOT NULL;
END;
$function$;

-- Fix mask_contact_data function
CREATE OR REPLACE FUNCTION public.mask_contact_data(data_text text, data_type text)
 RETURNS text
 LANGUAGE plpgsql
 IMMUTABLE
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF data_type = 'email' THEN
    RETURN LEFT(split_part(data_text, '@', 1), 2) || '***@' || split_part(data_text, '@', 2);
  ELSIF data_type = 'phone' THEN
    RETURN '***-***-' || RIGHT(data_text, 4);
  ELSIF data_type = 'social' THEN
    RETURN LEFT(data_text, 3) || '***';
  ELSE
    RETURN '***';
  END IF;
END;
$function$;

-- Fix sync_merchant_to_market trigger function
CREATE OR REPLACE FUNCTION public.sync_merchant_to_market()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.status = 'available' THEN
    INSERT INTO market_items (
      id,
      seller_id,
      name,
      description,
      category,
      brand,
      price,
      original_price,
      condition,
      color,
      size,
      material,
      occasion,
      season,
      photos,
      videos,
      tags,
      style_tags,
      stock_quantity,
      status,
      created_at,
      updated_at
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
      NEW.size,
      NEW.material,
      NEW.occasion,
      NEW.season,
      NEW.photos,
      NEW.videos,
      NEW.tags,
      NEW.style_tags,
      NEW.stock_quantity,
      'available',
      NEW.created_at,
      NEW.updated_at
    )
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      description = EXCLUDED.description,
      category = EXCLUDED.category,
      brand = EXCLUDED.brand,
      price = EXCLUDED.price,
      original_price = EXCLUDED.original_price,
      condition = EXCLUDED.condition,
      color = EXCLUDED.color,
      size = EXCLUDED.size,
      material = EXCLUDED.material,
      occasion = EXCLUDED.occasion,
      season = EXCLUDED.season,
      photos = EXCLUDED.photos,
      videos = EXCLUDED.videos,
      tags = EXCLUDED.tags,
      style_tags = EXCLUDED.style_tags,
      stock_quantity = EXCLUDED.stock_quantity,
      status = EXCLUDED.status,
      updated_at = EXCLUDED.updated_at;
  ELSIF OLD.status = 'available' AND NEW.status != 'available' THEN
    DELETE FROM market_items WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$function$;