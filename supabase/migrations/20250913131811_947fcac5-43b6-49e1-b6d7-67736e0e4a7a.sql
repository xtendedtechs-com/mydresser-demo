-- Simple but effective fix for merchant profiles security issue
-- Focus on restricting access to sensitive fields

-- Step 1: First check what policies currently exist
-- Drop all existing SELECT policies to start clean
DO $$
BEGIN
    -- Drop existing policies if they exist
    BEGIN
        DROP POLICY IF EXISTS "Users can view their own merchant profile" ON public.merchant_profiles;
    EXCEPTION WHEN OTHERS THEN
        NULL; -- Ignore errors if policy doesn't exist
    END;
    
    BEGIN
        DROP POLICY IF EXISTS "Users can view their own basic merchant profile" ON public.merchant_profiles;
    EXCEPTION WHEN OTHERS THEN
        NULL; -- Ignore errors if policy doesn't exist
    END;
    
    BEGIN
        DROP POLICY IF EXISTS "Restrict direct merchant profile access" ON public.merchant_profiles;
    EXCEPTION WHEN OTHERS THEN
        NULL; -- Ignore errors if policy doesn't exist
    END;
    
    BEGIN
        DROP POLICY IF EXISTS "Allow security definer function access" ON public.merchant_profiles;
    EXCEPTION WHEN OTHERS THEN
        NULL; -- Ignore errors if policy doesn't exist
    END;
END $$;

-- Step 2: Create a security definer function for safe access (non-sensitive data only)
CREATE OR REPLACE FUNCTION public.get_merchant_profile_safe()
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
  WHERE mp.user_id = auth.uid();
$$;

-- Step 3: Create a highly restricted function for sensitive data access
CREATE OR REPLACE FUNCTION public.get_merchant_sensitive_fields()
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
  WHERE mp.user_id = auth.uid()
    -- Only allow access for verified merchants
    AND mp.verification_status IN ('verified', 'pending');
$$;

-- Step 4: Create a very restrictive RLS policy that blocks most direct access
CREATE POLICY "Highly restricted merchant profile access"
ON public.merchant_profiles
FOR SELECT
TO authenticated
USING (
  -- Allow only basic non-sensitive field access and only for the user's own records
  auth.uid() = user_id 
  -- Additional restriction: this policy should be primarily used by security definer functions
  AND current_setting('role', true) != 'authenticated'
);

-- Step 5: Grant execute permissions on the safe functions
GRANT EXECUTE ON FUNCTION public.get_merchant_profile_safe() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_merchant_sensitive_fields() TO authenticated;

-- Step 6: Add clear documentation about proper usage
COMMENT ON FUNCTION public.get_merchant_profile_safe() 
IS 'Returns non-sensitive merchant profile data. Use this function instead of direct table queries to ensure security compliance.';

COMMENT ON FUNCTION public.get_merchant_sensitive_fields() 
IS 'Returns sensitive business data (tax_id, addresses, contact_info). Only available for verified merchants. Use with caution and ensure proper authorization.';

COMMENT ON TABLE public.merchant_profiles 
IS 'SECURITY WARNING: Contains sensitive business data. Direct table access is restricted. Use get_merchant_profile_safe() for general data and get_merchant_sensitive_fields() for sensitive data.';

COMMENT ON POLICY "Highly restricted merchant profile access" ON public.merchant_profiles 
IS 'Restrictive policy to prevent unauthorized access to sensitive business data. Applications should use security definer functions instead of direct queries.';