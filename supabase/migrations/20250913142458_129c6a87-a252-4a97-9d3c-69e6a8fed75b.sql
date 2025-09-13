-- Fix security vulnerability: Recreate profiles_public_safe view to properly enforce security
-- The issue is that the view needs to respect the authentication context

-- Drop the existing insecure view
DROP VIEW IF EXISTS public.profiles_public_safe;

-- Recreate the view with proper security barriers and authentication checks
-- This view will only show profiles that are explicitly marked as public
-- AND only to authenticated users
CREATE VIEW public.profiles_public_safe 
WITH (security_barrier = true) AS
SELECT 
  p.id,
  p.user_id,
  p.full_name,
  p.avatar_url,
  p.role,
  p.bio,
  p.style_score,
  p.created_at
FROM public.profiles p
WHERE p.is_profile_public = true
  AND auth.uid() IS NOT NULL;  -- Only authenticated users can see public profiles

-- Grant appropriate permissions
GRANT SELECT ON public.profiles_public_safe TO authenticated;
REVOKE ALL ON public.profiles_public_safe FROM anon;