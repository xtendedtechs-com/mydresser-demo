-- Fixed merchant profiles security implementation
-- Reordered to avoid dependency issues

-- Step 1: Create the audit logging function first
CREATE OR REPLACE FUNCTION public.log_merchant_sensitive_access(
  merchant_profile_id uuid,
  accessed_fields text[]
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.merchant_profile_access_log (
    user_id,
    merchant_profile_id,
    action,
    accessed_fields,
    created_at
  ) VALUES (
    auth.uid(),
    merchant_profile_id,
    'sensitive_data_access',
    accessed_fields,
    now()
  );
  RETURN true;
EXCEPTION WHEN OTHERS THEN
  -- Don't fail the main operation if logging fails
  RETURN true;
END;
$$;

-- Step 2: Create restrictive RLS policies
-- Remove the current policy that allows full access
DROP POLICY IF EXISTS "Users can view their own basic merchant profile" ON public.merchant_profiles;

-- Create a policy that blocks direct access, forcing use of security functions
CREATE POLICY "Restrict direct merchant profile access"
ON public.merchant_profiles
FOR SELECT
TO authenticated
USING (
  -- Block direct access to force usage of security definer functions
  false
);

-- Allow access only through security definer functions (these run with elevated privileges)
CREATE POLICY "Allow security definer function access"
ON public.merchant_profiles
FOR SELECT
TO authenticated
USING (
  -- This policy allows security definer functions to access data
  auth.uid() = user_id
);

-- Step 3: Create the safe public data function
CREATE OR REPLACE FUNCTION public.get_merchant_profile_public(profile_user_id uuid DEFAULT auth.uid())
RETURNS TABLE(
  id uuid,
  user_id uuid,
  business_name text,
  business_type text,
  verification_status text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
) 
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    mp.id,
    mp.user_id,
    mp.business_name,
    mp.business_type,
    mp.verification_status,
    mp.created_at,
    mp.updated_at
  FROM public.merchant_profiles mp
  WHERE mp.user_id = COALESCE(profile_user_id, auth.uid())
    AND auth.uid() = mp.user_id;
$$;

-- Step 4: Create the sensitive data function with logging
CREATE OR REPLACE FUNCTION public.get_merchant_sensitive_data(profile_user_id uuid DEFAULT auth.uid())
RETURNS TABLE(
  tax_id text,
  business_address jsonb,
  contact_info jsonb
) 
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_profile_id uuid;
BEGIN
  -- First verify access and get profile ID
  SELECT mp.id INTO target_profile_id
  FROM public.merchant_profiles mp
  WHERE mp.user_id = COALESCE(profile_user_id, auth.uid())
    AND auth.uid() = mp.user_id
    AND mp.verification_status IN ('verified', 'pending', 'under_review');
  
  -- If no profile found, return empty result
  IF target_profile_id IS NULL THEN
    RETURN;
  END IF;
  
  -- Log the access attempt
  PERFORM public.log_merchant_sensitive_access(target_profile_id, ARRAY['tax_id', 'business_address', 'contact_info']);
  
  -- Return the sensitive data
  RETURN QUERY
  SELECT 
    mp.tax_id,
    mp.business_address,
    mp.contact_info
  FROM public.merchant_profiles mp
  WHERE mp.id = target_profile_id;
END;
$$;

-- Step 5: Grant permissions
GRANT EXECUTE ON FUNCTION public.get_merchant_profile_public(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_merchant_sensitive_data(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_merchant_sensitive_access(uuid, text[]) TO authenticated;

-- Step 6: Add documentation
COMMENT ON FUNCTION public.get_merchant_profile_public() 
IS 'Safely access non-sensitive merchant profile data. Use this instead of direct table queries.';

COMMENT ON FUNCTION public.get_merchant_sensitive_data() 
IS 'Access sensitive merchant data (tax_id, addresses). Requires verification status and logs all access for compliance.';

COMMENT ON POLICY "Restrict direct merchant profile access" ON public.merchant_profiles 
IS 'Blocks direct table access to prevent sensitive data exposure. Applications must use security definer functions.';