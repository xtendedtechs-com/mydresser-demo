-- Fix merchant_profiles_safe security by creating a security definer function instead of relying on direct view access

-- Drop the existing view
DROP VIEW IF EXISTS public.merchant_profiles_safe;

-- Create a security definer function that replaces the view functionality
CREATE OR REPLACE FUNCTION public.get_merchant_profiles_safe()
RETURNS TABLE(
  id uuid,
  user_id uuid, 
  business_name text,
  business_type text,
  verification_status text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  tax_id_status text,
  address_status text,
  contact_status text
) 
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT 
    mp.id,
    mp.user_id,
    mp.business_name,
    mp.business_type,
    mp.verification_status,
    mp.created_at,
    mp.updated_at,
    CASE
      WHEN mp.verification_status = 'verified' THEN 'VERIFIED'
      ELSE 'HIDDEN'
    END AS tax_id_status,
    CASE
      WHEN mp.business_address IS NOT NULL THEN 'PROVIDED'
      ELSE 'NOT_PROVIDED'
    END AS address_status,
    CASE
      WHEN mp.contact_info IS NOT NULL THEN 'PROVIDED'
      ELSE 'NOT_PROVIDED'
    END AS contact_status
  FROM public.merchant_profiles mp
  WHERE mp.user_id = auth.uid();  -- Only return current user's profile
$$;

-- Grant execute permission to authenticated users only
REVOKE ALL ON FUNCTION public.get_merchant_profiles_safe() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_merchant_profiles_safe() TO authenticated;

-- Add security comment
COMMENT ON FUNCTION public.get_merchant_profiles_safe() IS 'Secure function to access merchant profile safe data. Restricts access to current user profile only.';