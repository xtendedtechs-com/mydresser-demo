-- Create a helper function to ensure a minimum set of sample wardrobe items for the current user
CREATE OR REPLACE FUNCTION public.ensure_minimum_sample_wardrobe_items(min_count integer DEFAULT 8)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_count integer;
BEGIN
  SELECT COUNT(*) INTO current_count FROM wardrobe_items WHERE user_id = auth.uid();
  IF current_count >= min_count THEN
    RETURN;
  END IF;

  -- Insert additional items until we reach min_count
  WHILE current_count < min_count LOOP
    INSERT INTO public.wardrobe_items (
      user_id, name, category, brand, color, size, season, occasion, material, condition, purchase_price, notes, tags, photos, is_favorite
    ) VALUES (
      auth.uid(),
      'Sample Item ' || (current_count + 1),
      (ARRAY['tops','bottoms','outerwear','shoes','dresses'])[1 + (random()*4)::int],
      (ARRAY['Zara','H&M','Uniqlo','Levis','Nike'])[1 + (random()*4)::int],
      (ARRAY['Black','White','Blue','Gray','Navy'])[1 + (random()*4)::int],
      'M',
      'all-season',
      (ARRAY['casual','business','formal'])[1 + (random()*2)::int],
      (ARRAY['Cotton','Denim','Wool Blend','Synthetic'])[1 + (random()*3)::int],
      'good',
      round((random()*200 + 20)::numeric, 2),
      'Auto-generated sample',
      ARRAY['sample','auto'],
      '{"main": "/placeholder.svg"}',
      false
    );
    current_count := current_count + 1;
  END LOOP;
END;
$$;