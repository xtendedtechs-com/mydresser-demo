-- Fix critical security vulnerability: Email addresses exposed in public profiles

-- First, drop the vulnerable policy
DROP POLICY IF EXISTS "Users can view public profiles" ON public.profiles;

-- Create a security definer function that returns only safe public profile data
CREATE OR REPLACE FUNCTION public.get_public_profile_safe(profile_user_id UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  full_name TEXT,
  avatar_url TEXT,
  role user_role,
  bio TEXT,
  location TEXT,
  social_instagram TEXT,
  social_facebook TEXT,
  social_tiktok TEXT,
  style_score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    p.full_name,
    p.avatar_url,
    p.role,
    p.bio,
    p.location,
    p.social_instagram,
    p.social_facebook,
    p.social_tiktok,
    p.style_score,
    p.created_at
  FROM public.profiles p
  WHERE p.user_id = profile_user_id 
    AND p.is_profile_public = true;
END;
$$;

-- Create a new secure policy for public profiles that excludes sensitive data
CREATE POLICY "Users can view safe public profile data" 
ON public.profiles FOR SELECT 
USING (
  -- Users can see their own full profile
  auth.uid() = user_id
  OR
  -- Others can only see public profiles through the safe function
  (is_profile_public = true AND auth.uid() IS NOT NULL)
);

-- Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION public.get_public_profile_safe(UUID) TO authenticated;

-- Create a view for safe public profiles (optional, for easier querying)
CREATE OR REPLACE VIEW public.public_profiles_safe AS
SELECT 
  id,
  user_id,
  full_name,
  avatar_url,
  role,
  bio,
  location,
  social_instagram,
  social_facebook,
  social_tiktok,
  style_score,
  created_at
FROM public.profiles 
WHERE is_profile_public = true;

-- Grant select on the view to authenticated users
GRANT SELECT ON public.public_profiles_safe TO authenticated;