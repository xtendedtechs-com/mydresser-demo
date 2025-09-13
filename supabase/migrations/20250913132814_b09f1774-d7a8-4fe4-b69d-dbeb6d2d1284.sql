-- Fix profiles table security: Final version with proper cleanup
-- This addresses the sensitive data exposure in public profiles

-- Step 1: Clean up existing policies
DROP POLICY IF EXISTS "Limited public profile viewing" ON public.profiles;
DROP POLICY IF EXISTS "Safe public profile viewing" ON public.profiles;

-- Step 2: Drop and recreate the get_public_profiles function with correct signature
DROP FUNCTION IF EXISTS public.get_public_profiles();

CREATE FUNCTION public.get_public_profiles()
RETURNS TABLE(
  id uuid, 
  user_id uuid, 
  full_name text, 
  avatar_url text, 
  role user_role, 
  bio text, 
  style_score integer, 
  created_at timestamp with time zone
) 
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
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
    AND auth.uid() IS NOT NULL;
$$;

-- Step 3: Create a secure view that only exposes safe, non-sensitive fields
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

-- Enable security barrier
ALTER VIEW public.profiles_public_safe SET (security_barrier = true);

-- Step 4: Create a function for getting a specific user's safe public profile
CREATE OR REPLACE FUNCTION public.get_public_profile_by_user_id(target_user_id uuid)
RETURNS TABLE(
  id uuid, 
  user_id uuid, 
  full_name text, 
  avatar_url text, 
  role user_role, 
  bio text, 
  style_score integer, 
  created_at timestamp with time zone
) 
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
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
  WHERE p.user_id = target_user_id
    AND p.is_profile_public = true
    AND auth.uid() IS NOT NULL;
$$;

-- Step 5: Create the new restrictive policy
CREATE POLICY "Secure profile access"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  -- Users can always see their own full profile
  auth.uid() = user_id
  -- Note: Removed public profile access through direct table queries
  -- Public profiles must be accessed via secure functions/views that exclude sensitive fields
);

-- Step 6: Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.get_public_profiles() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_profile_by_user_id(uuid) TO authenticated;
GRANT SELECT ON public.profiles_public_safe TO authenticated;

-- Step 7: Add security documentation
COMMENT ON FUNCTION public.get_public_profiles() 
IS 'SECURITY FIX: Returns public profiles with ONLY safe fields (full_name, avatar_url, role, bio, style_score, created_at). EXCLUDES sensitive data: email, location, social_instagram, social_facebook, social_tiktok, privacy_settings. Use this instead of direct table queries.';

COMMENT ON FUNCTION public.get_public_profile_by_user_id(uuid) 
IS 'SECURITY FIX: Returns a specific public profile with only safe, non-sensitive fields. Prevents exposure of email addresses and personal information.';

COMMENT ON VIEW public.profiles_public_safe 
IS 'SECURITY FIX: Safe view of public profiles excluding sensitive fields like email, location, and social media handles. Use for UI components displaying public profiles.';

COMMENT ON POLICY "Secure profile access" ON public.profiles 
IS 'SECURITY FIX: Restricts direct table access to owner only. Public profile viewing must use secure functions (get_public_profiles, get_public_profile_by_user_id) or safe view (profiles_public_safe) to prevent sensitive data exposure.';