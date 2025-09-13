-- Fix security definer view issue by using SECURITY INVOKER
-- This ensures the view respects Row Level Security policies of the querying user

-- Drop the existing view that uses SECURITY DEFINER (the problematic default)
DROP VIEW IF EXISTS public.profiles_public_safe;

-- Recreate the view with SECURITY INVOKER to respect RLS policies
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

-- Set security barrier to ensure RLS is properly applied
ALTER VIEW public.profiles_public_safe SET (security_barrier = true);

-- Grant SELECT permission to authenticated users
GRANT SELECT ON public.profiles_public_safe TO authenticated;

-- Update documentation to reflect the security fix
COMMENT ON VIEW public.profiles_public_safe 
IS 'SECURITY: Safe view of public profiles using SECURITY INVOKER to respect RLS policies. Excludes sensitive fields like email, location, and social media handles.';

-- Additional security note in the migration
-- IMPORTANT: The view now uses SECURITY INVOKER which means:
-- 1. It respects Row Level Security policies of the querying user
-- 2. It no longer bypasses RLS like the default SECURITY DEFINER would
-- 3. This ensures that even through the view, users can only see data they're authorized to see