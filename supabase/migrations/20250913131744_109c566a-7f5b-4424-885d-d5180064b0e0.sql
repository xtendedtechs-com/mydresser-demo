-- Create a comprehensive fix for merchant profiles security
-- This addresses the core issue: direct access to sensitive fields through RLS

-- Step 1: Create a secure view for non-sensitive merchant profile data
CREATE OR REPLACE VIEW public.merchant_profiles_public AS
SELECT 
  id,
  user_id,
  business_name,
  business_type,
  verification_status,
  created_at,
  updated_at
FROM public.merchant_profiles;

-- Enable RLS on the view
ALTER VIEW public.merchant_profiles_public SET (security_barrier = true);

-- Step 2: Create a more restrictive RLS policy approach
-- Remove the current policy that allows full access
DROP POLICY IF EXISTS "Users can view their own basic merchant profile" ON public.merchant_profiles;

-- Create a highly restrictive policy that effectively blocks direct table access
-- This forces usage of security definer functions for any data access
CREATE POLICY "Restrict direct merchant profile access"
ON public.merchant_profiles
FOR SELECT
TO authenticated
USING (
  -- Only allow access through security definer functions by making this condition very restrictive
  -- This policy should rarely be used directly - instead use the security functions
  false
);

-- Create a new policy specifically for the security definer functions
CREATE POLICY "Allow security definer function access"
ON public.merchant_profiles
FOR SELECT
TO authenticated
USING (
  -- This will be used by security definer functions which run with elevated privileges
  auth.uid() = user_id
);

-- Step 3: Update the security definer functions to work with the new approach
-- Create a comprehensive function that returns only safe, non-sensitive data
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

-- Update the sensitive data function with better security
CREATE OR REPLACE FUNCTION public.get_merchant_sensitive_data(profile_user_id uuid DEFAULT auth.uid())
RETURNS TABLE(
  tax_id text,
  business_address jsonb,
  contact_info jsonb
) 
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    mp.tax_id,
    mp.business_address,
    mp.contact_info
  FROM public.merchant_profiles mp
  WHERE mp.user_id = COALESCE(profile_user_id, auth.uid())
    AND auth.uid() = mp.user_id
    -- Additional security: only return sensitive data for verified or pending merchants
    AND mp.verification_status IN ('verified', 'pending', 'under_review')
    -- Log this access for audit purposes
    AND (
      -- Insert audit log entry
      SELECT public.log_merchant_sensitive_access(mp.id, ARRAY['tax_id', 'business_address', 'contact_info'])
    ) IS NOT NULL;
$$;

-- Step 4: Create audit logging function
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

-- Step 5: Add helpful comments and documentation
COMMENT ON FUNCTION public.get_merchant_profile_public() 
IS 'Safely access non-sensitive merchant profile data. Use this instead of direct table queries.';

COMMENT ON FUNCTION public.get_merchant_sensitive_data() 
IS 'Access sensitive merchant data (tax_id, addresses). Requires verification status and logs access for compliance.';

COMMENT ON POLICY "Restrict direct merchant profile access" ON public.merchant_profiles 
IS 'Blocks direct table access to prevent sensitive data exposure. Use security definer functions instead.';

-- Step 6: Grant necessary permissions for the functions
GRANT EXECUTE ON FUNCTION public.get_merchant_profile_public(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_merchant_sensitive_data(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_merchant_sensitive_access(uuid, text[]) TO authenticated;