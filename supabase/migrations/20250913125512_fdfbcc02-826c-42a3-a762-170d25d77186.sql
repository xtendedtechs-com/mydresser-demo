-- Add policy to allow viewing public profiles while protecting sensitive data
CREATE POLICY "Public profiles are viewable by authenticated users" 
ON public.profiles 
FOR SELECT 
USING (
  (is_profile_public = true) 
  AND (auth.uid() IS NOT NULL)
);

-- Add helpful comment about safe usage
COMMENT ON POLICY "Public profiles are viewable by authenticated users" ON public.profiles IS 
'Allows authenticated users to view public profiles. Use get_public_profiles() function or select only safe fields to avoid exposing sensitive data like email addresses.';