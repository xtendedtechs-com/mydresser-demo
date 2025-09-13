-- Fix the Security Definer View issue created in the previous migration
-- The provider_subscription_view needs to be recreated without security definer properties

-- Drop the problematic view
DROP VIEW IF EXISTS public.provider_subscription_view;

-- Recreate the view with security_invoker = true to respect RLS policies
CREATE VIEW public.provider_subscription_view 
WITH (security_invoker = true) AS
SELECT 
  id,
  subscriber_id,
  provider_id,
  subscription_type,
  plan_name,
  status,
  started_at,
  expires_at,
  auto_renew,
  created_at,
  updated_at
  -- Explicitly exclude sensitive payment fields: price, billing_cycle
FROM public.user_subscriptions
WHERE provider_id = auth.uid(); -- Add RLS-like filtering at the view level

-- Grant access to the view
GRANT SELECT ON public.provider_subscription_view TO authenticated;

-- Add security documentation
COMMENT ON VIEW public.provider_subscription_view 
IS 'SECURITY FIX: Secure view using security_invoker = true that allows providers to see non-sensitive subscription data for their services only. Excludes payment details (price, billing_cycle).';