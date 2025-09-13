-- Address the security definer view warning by dropping the problematic view
DROP VIEW IF EXISTS public.merchant_profiles_safe;

-- Recreate the view without SECURITY DEFINER to rely on RLS policies
CREATE VIEW public.merchant_profiles_safe AS
SELECT 
  id,
  user_id,
  business_name,
  business_type,
  verification_status,
  created_at,
  updated_at,
  -- Status fields for sensitive data (masked for security)
  CASE WHEN verification_status = 'verified' THEN 'VERIFIED' ELSE 'HIDDEN' END as tax_id_status,
  CASE WHEN business_address IS NOT NULL THEN 'PROVIDED' ELSE 'NOT_PROVIDED' END as address_status,
  CASE WHEN contact_info IS NOT NULL THEN 'PROVIDED' ELSE 'NOT_PROVIDED' END as contact_status
FROM public.merchant_profiles;

-- Grant appropriate permissions to authenticated users
GRANT SELECT ON public.merchant_profiles_safe TO authenticated;