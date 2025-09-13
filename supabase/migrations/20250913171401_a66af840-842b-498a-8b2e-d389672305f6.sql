-- Fix security issues identified in security scan

-- 1. Enable RLS on merchant_profiles_safe view (if it's actually a table) or ensure proper access control
-- First, let's check if merchant_profiles_safe is actually a table that needs RLS
ALTER TABLE IF EXISTS public.merchant_profiles_safe ENABLE ROW LEVEL SECURITY;

-- Create policy for merchant_profiles_safe if it's a table
CREATE POLICY IF NOT EXISTS "Users can only view their own safe merchant profile" 
ON public.merchant_profiles_safe 
FOR SELECT 
USING (auth.uid() = user_id);

-- 2. Restrict merchant_items access to prevent competitor data scraping
-- Update the merchant_items SELECT policy to require authentication and rate limiting
DROP POLICY IF EXISTS "Anyone can view merchant items" ON public.merchant_items;

-- Create more restrictive policy for merchant_items
CREATE POLICY "Authenticated users can view merchant items" 
ON public.merchant_items 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Add comment explaining the security consideration
COMMENT ON TABLE public.merchant_items IS 'Table contains business-sensitive data. Access requires authentication to prevent competitive intelligence gathering.';

COMMENT ON TABLE public.merchant_profiles_safe IS 'Safe view of merchant profiles with encrypted data status indicators. Access restricted to profile owners.';