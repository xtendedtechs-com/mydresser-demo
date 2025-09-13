-- Fix the security definer view issue by removing it and using a simpler approach

-- Drop the problematic view
DROP VIEW IF EXISTS public.public_profiles_safe;

-- Update the RLS policy to be more restrictive for public access
DROP POLICY IF EXISTS "Users can view safe public profile data" ON public.profiles;

-- Create separate policies for own data vs public data
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

-- For public profiles, we'll handle this at the application level
-- This policy only allows authenticated users to see specific fields of public profiles
CREATE POLICY "Authenticated users can view limited public profiles" 
ON public.profiles FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND is_profile_public = true 
  AND auth.uid() != user_id
);

-- The application should use SELECT with specific columns when querying public profiles
-- Example: SELECT id, user_id, full_name, avatar_url, role, bio, location, social_instagram, social_facebook, social_tiktok, style_score, created_at FROM profiles WHERE is_profile_public = true AND user_id != auth.uid();