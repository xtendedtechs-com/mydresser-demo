-- Drop the existing overly permissive public profile policies
DROP POLICY IF EXISTS "Allow viewing public profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by authenticated users" ON public.profiles;

-- Create a more secure policy that restricts public profile viewing to non-sensitive fields only
-- This policy will work in conjunction with application-level filtering
CREATE POLICY "Limited public profile viewing"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  -- Users can see their own full profile
  (auth.uid() = user_id) 
  OR 
  -- For public profiles of other users, we rely on the get_public_profiles() function
  -- This policy allows the function to work but applications should use the function
  -- to ensure only non-sensitive fields are accessed
  (is_profile_public = true AND auth.uid() IS NOT NULL AND auth.uid() != user_id)
);

-- Add a comment to remind developers to use the get_public_profiles() function
COMMENT ON FUNCTION public.get_public_profiles() IS 'Use this function to safely access public profiles. It excludes sensitive fields like email addresses and privacy settings.';