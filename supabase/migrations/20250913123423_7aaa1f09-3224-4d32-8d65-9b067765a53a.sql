-- Fix the policy conflict by dropping existing policies first and recreating them properly

-- Drop all existing SELECT policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view limited public profiles" ON public.profiles;

-- Recreate the policies with proper security controls
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

-- This policy allows viewing public profiles but the application MUST use column-level SELECT
-- to exclude sensitive fields like email, auth_level, privacy_settings
CREATE POLICY "Authenticated users can view public profiles safely" 
ON public.profiles FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND is_profile_public = true 
  AND auth.uid() != user_id
);