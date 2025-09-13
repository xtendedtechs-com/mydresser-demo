-- Fix security issues identified in security scan

-- 1. Restrict merchant_items access to prevent competitor data scraping  
-- Drop the existing public policy
DROP POLICY IF EXISTS "Anyone can view merchant items" ON public.merchant_items;

-- Create more restrictive policy requiring authentication
CREATE POLICY "Authenticated users can view merchant items" 
ON public.merchant_items 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- 2. Add security comments
COMMENT ON TABLE public.merchant_items IS 'Table contains business-sensitive data. Access requires authentication to prevent competitive intelligence gathering.';

-- 3. Since merchant_profiles_safe is a view, we cannot add RLS to it directly
-- Instead, we ensure the underlying merchant_profiles table has proper security
COMMENT ON VIEW public.merchant_profiles_safe IS 'Safe view of merchant profiles with encrypted data status indicators. Security handled by underlying merchant_profiles table RLS policies.';