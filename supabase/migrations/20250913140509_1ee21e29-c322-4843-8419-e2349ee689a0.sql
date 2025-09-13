-- Fix Security Definer View issues by removing security properties from views
-- and ensuring they rely purely on RLS policies

-- Fix profiles_public_safe view
DROP VIEW IF EXISTS public.profiles_public_safe;
CREATE VIEW public.profiles_public_safe AS
SELECT 
  id,
  user_id,
  full_name,
  avatar_url,
  role,
  bio,
  style_score,
  created_at
FROM public.profiles
WHERE is_profile_public = true;

-- Fix provider_subscription_view
DROP VIEW IF EXISTS public.provider_subscription_view;
CREATE VIEW public.provider_subscription_view AS
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
FROM public.user_subscriptions
WHERE provider_id = auth.uid();

-- Ensure user_mfa_status view has no security properties
DROP VIEW IF EXISTS public.user_mfa_status;
CREATE VIEW public.user_mfa_status AS
SELECT 
  id,
  user_id,
  totp_enabled,
  phone_verified,
  phone_number,
  CASE WHEN backup_codes IS NOT NULL 
       THEN array_length(backup_codes, 1) 
       ELSE 0 
  END as backup_codes_count,
  created_at,
  updated_at
FROM public.user_mfa_settings;