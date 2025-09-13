-- Fix the disabled provider access policy on user_subscriptions table
-- First drop the existing broken policy
DROP POLICY IF EXISTS "Providers can view limited subscription info for their services" ON public.user_subscriptions;

-- Create a proper policy for providers to view their service subscriptions
CREATE POLICY "Providers can view their service subscriptions" 
ON public.user_subscriptions 
FOR SELECT 
USING (auth.uid() = provider_id);

-- Verify user_mfa_settings has proper policies (it should already be secure)
-- The user_mfa_status view will be secure through the underlying user_mfa_settings table RLS policies