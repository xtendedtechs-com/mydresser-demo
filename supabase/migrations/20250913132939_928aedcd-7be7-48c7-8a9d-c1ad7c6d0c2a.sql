-- Fix Security Definer View issue: Convert to Security Invoker
-- This addresses linter error 0010_security_definer_view

-- Drop the existing view that has security definer issues
DROP VIEW IF EXISTS public.profiles_public_safe;

-- Recreate the view with security_invoker = true (modern approach for Postgres 15+)
-- This ensures the view uses the permissions of the querying user, not the view creator
-- This properly respects Row Level Security (RLS) policies
CREATE VIEW public.profiles_public_safe 
WITH (security_invoker = true) AS
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

-- Grant appropriate permissions
GRANT SELECT ON public.profiles_public_safe TO authenticated;

-- Add security documentation
COMMENT ON VIEW public.profiles_public_safe 
IS 'SECURITY FIX: Secure view of public profiles using security_invoker = true to respect RLS policies. Only shows safe, non-sensitive fields for public profiles.';