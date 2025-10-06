-- Fix the last remaining search_path security warning

CREATE OR REPLACE FUNCTION public.get_merchant_contact_safe(page_id uuid, requesting_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  page_record RECORD;
  safe_contact JSONB;
BEGIN
  SELECT merchant_id, contact_info INTO page_record
  FROM merchant_pages
  WHERE id = page_id;
  
  -- If requesting user is the merchant owner, return full contact info
  IF page_record.merchant_id = requesting_user_id THEN
    RETURN page_record.contact_info;
  END IF;
  
  -- Otherwise, return sanitized version (only business email, no personal info)
  safe_contact = jsonb_build_object(
    'business_email', page_record.contact_info->>'business_email',
    'website', page_record.contact_info->>'website'
  );
  
  RETURN safe_contact;
END;
$function$;