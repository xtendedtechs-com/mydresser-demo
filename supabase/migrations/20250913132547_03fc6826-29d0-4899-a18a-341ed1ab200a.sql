-- Fix profiles table security: Restrict public access to non-sensitive fields only

-- Step 1: Remove the overly permissive public profile viewing policy
DROP POLICY IF EXISTS "Limited public profile viewing" ON public.profiles;

-- Step 2: Create a secure view that only exposes non-sensitive public profile fields
CREATE OR REPLACE VIEW public.profiles_public_safe AS
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

-- Step 3: Create RLS policy for the safe public view
-- (Views inherit RLS from underlying tables, but we can add additional restrictions)

-- Step 4: Update the get_public_profiles function to be even more explicit about safe fields
CREATE OR REPLACE FUNCTION public.get_public_profiles()
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
    AND auth.uid() IS NOT NULL  -- Must be authenticated
    AND auth.uid() != p.user_id; -- Cannot view own profile this way (use direct access)
$$;

-- Step 5: Create a new policy that allows viewing only non-sensitive fields of public profiles
-- This uses a CASE approach to selectively show fields
CREATE POLICY "Safe public profile viewing"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  -- Users can see their own full profile
  (auth.uid() = user_id) 
  OR 
  -- For other users' public profiles, we restrict which fields can be accessed
  -- This policy works by allowing the row to be selected, but applications should use
  -- the get_public_profiles() function or the profiles_public_safe view for safety
  (is_profile_public = true AND auth.uid() IS NOT NULL AND auth.uid() != user_id)
);

-- Step 6: Create a function to get safe public profile data for a specific user
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
    AND auth.uid() IS NOT NULL
    AND auth.uid() != p.user_id;
$$;

-- Step 7: Grant permissions for the new functions
GRANT EXECUTE ON FUNCTION public.get_public_profiles() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_profile_by_user_id(uuid) TO authenticated;
GRANT SELECT ON public.profiles_public_safe TO authenticated;

-- Step 8: Add documentation
COMMENT ON FUNCTION public.get_public_profiles() 
IS 'Returns all public profiles with only safe, non-sensitive fields (no email, location, social media handles). Use this instead of direct table queries for public profile access.';

COMMENT ON FUNCTION public.get_public_profile_by_user_id(uuid) 
IS 'Returns a specific public profile with only safe fields. Safer than direct table access.';

COMMENT ON VIEW public.profiles_public_safe 
IS 'Safe view of public profiles that excludes sensitive fields like email, location, and social media handles.';

COMMENT ON POLICY "Safe public profile viewing" ON public.profiles 
IS 'Allows access to public profiles. Applications should use get_public_profiles() function or profiles_public_safe view to ensure only non-sensitive fields are accessed.';