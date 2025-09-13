-- Add policy to allow viewing public profiles while protecting sensitive data
-- This policy allows SELECT access to public profiles, but applications should use
-- the get_public_profiles() function or select only safe fields to avoid exposing sensitive data

CREATE POLICY "Allow viewing public profiles" 
ON public.profiles 
FOR SELECT 
USING (
  (is_profile_public = true) 
  AND (auth.uid() IS NOT NULL)
);

-- Add helpful comment
COMMENT ON POLICY "Allow viewing public profiles" ON public.profiles IS 
'Allows authenticated users to view public profiles. Applications should use get_public_profiles() function or select only safe fields (id, user_id, full_name, avatar_url, role, bio, location, social_*, style_score, created_at) to avoid exposing sensitive data like email addresses.';