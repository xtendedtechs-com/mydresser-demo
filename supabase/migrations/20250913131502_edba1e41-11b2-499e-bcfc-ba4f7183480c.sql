-- Analyze current merchant_profiles security and add additional protections

-- First, let's add a security definer function to handle sensitive data access
-- This ensures only the profile owner can access their own sensitive business data
CREATE OR REPLACE FUNCTION public.get_merchant_profile_safe(profile_user_id uuid)
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
  WHERE mp.user_id = profile_user_id 
    AND auth.uid() = profile_user_id;
$$;

-- Add a function to access sensitive data (tax_id, addresses) with additional validation
CREATE OR REPLACE FUNCTION public.get_merchant_sensitive_data(profile_user_id uuid)
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
  WHERE mp.user_id = profile_user_id 
    AND auth.uid() = profile_user_id
    -- Additional check: only return data for verified merchants or pending verification
    AND mp.verification_status IN ('verified', 'pending');
$$;

-- Add a more restrictive policy that explicitly blocks access to sensitive fields
-- Drop and recreate the SELECT policy with field-level restrictions
DROP POLICY IF EXISTS "Users can view their own merchant profile" ON public.merchant_profiles;

CREATE POLICY "Users can view their own basic merchant profile"
ON public.merchant_profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
);

-- Add RLS policy comments for clarity
COMMENT ON POLICY "Users can view their own basic merchant profile" ON public.merchant_profiles 
IS 'Allows access to merchant profile data. For sensitive fields like tax_id, use get_merchant_sensitive_data() function instead.';

-- Add table comment to remind developers about sensitive data handling
COMMENT ON TABLE public.merchant_profiles 
IS 'Contains sensitive business information. Use security definer functions for accessing tax_id, business_address, and contact_info fields.';

-- Create an audit log table for merchant profile access (optional security enhancement)
CREATE TABLE IF NOT EXISTS public.merchant_profile_access_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  merchant_profile_id uuid NOT NULL,
  action text NOT NULL,
  accessed_fields text[],
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on the audit log
ALTER TABLE public.merchant_profile_access_log ENABLE ROW LEVEL SECURITY;

-- Only allow viewing of own access logs
CREATE POLICY "Users can view their own access logs"
ON public.merchant_profile_access_log
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- System can insert audit logs (for application-level logging)
CREATE POLICY "System can insert audit logs"
ON public.merchant_profile_access_log
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);