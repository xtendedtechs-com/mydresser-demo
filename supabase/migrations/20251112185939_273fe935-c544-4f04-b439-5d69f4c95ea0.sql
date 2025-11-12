-- Phase 1: Remove overly permissive merchant_items policy
DROP POLICY IF EXISTS "Authenticated users can view merchant items" ON merchant_items;

-- Phase 2: Add search_path to security definer functions
CREATE OR REPLACE FUNCTION public.encrypt_merchant_tax_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
BEGIN
  IF NEW.tax_id IS NOT NULL AND length(NEW.tax_id) <= 20 THEN
    NEW.tax_id = encode(digest(NEW.tax_id || NEW.encryption_salt::text, 'sha256'), 'hex');
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_notification_preferences_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;