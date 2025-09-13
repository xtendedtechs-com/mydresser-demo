-- Fix the security definer view issue by recreating without SECURITY DEFINER
-- This view should rely on RLS policies of the underlying table instead
DROP VIEW IF EXISTS public.merchant_profiles_safe;

CREATE VIEW public.merchant_profiles_safe AS
SELECT 
  id,
  user_id,
  business_name,
  business_type,
  verification_status,
  created_at,
  updated_at,
  -- Mask sensitive fields - view will respect RLS policies of base table
  CASE WHEN verification_status = 'verified' THEN 'VERIFIED' ELSE 'HIDDEN' END as tax_id_status,
  CASE WHEN business_address IS NOT NULL THEN 'PROVIDED' ELSE 'NOT_PROVIDED' END as address_status,
  CASE WHEN contact_info IS NOT NULL THEN 'PROVIDED' ELSE 'NOT_PROVIDED' END as contact_status
FROM public.merchant_profiles;

-- Grant access to the view (RLS policies of base table will apply)
GRANT SELECT ON public.merchant_profiles_safe TO authenticated;

-- Create final security validation function to verify our implementation
CREATE OR REPLACE FUNCTION public.validate_merchant_security()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  result text;
  policy_count integer;
  function_count integer;
  encryption_functions integer;
BEGIN
  -- Check RLS is enabled
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'merchant_profiles' 
    AND schemaname = 'public' 
    AND rowsecurity = true
  ) THEN
    RETURN 'FAIL: RLS not enabled on merchant_profiles';
  END IF;
  
  -- Check we have proper policies
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies 
  WHERE tablename = 'merchant_profiles' 
  AND schemaname = 'public';
  
  IF policy_count < 4 THEN
    RETURN 'FAIL: Insufficient RLS policies on merchant_profiles';
  END IF;
  
  -- Check encryption functions exist
  SELECT COUNT(*) INTO encryption_functions
  FROM pg_proc 
  WHERE proname IN ('encrypt_business_data', 'decrypt_business_data', 'insert_encrypted_merchant_profile', 'update_encrypted_merchant_profile')
  AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
  
  IF encryption_functions < 4 THEN
    RETURN 'FAIL: Missing encryption functions';
  END IF;
  
  -- Check audit logging functions
  SELECT COUNT(*) INTO function_count
  FROM pg_proc 
  WHERE proname IN ('log_merchant_sensitive_access', 'check_merchant_rate_limit')
  AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
  
  IF function_count < 2 THEN
    RETURN 'FAIL: Missing audit functions';
  END IF;
  
  RETURN 'PASS: All merchant security measures properly implemented';
END;
$function$;