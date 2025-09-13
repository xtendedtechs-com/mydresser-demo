-- Drop the security definer views that bypass RLS policies
-- These views should not exist as they circumvent row-level security

-- Drop provider_subscription_view (users should query user_subscriptions directly with RLS)
DROP VIEW IF EXISTS public.provider_subscription_view CASCADE;

-- Drop user_mfa_status view (users should use the secure functions for MFA data)  
DROP VIEW IF EXISTS public.user_mfa_status CASCADE;

-- The underlying tables already have proper RLS policies:
-- 1. user_subscriptions has policies for subscribers and providers
-- 2. user_mfa_settings has restrictive policies that only allow function access

-- Users should now query the underlying tables directly, which will enforce RLS properly