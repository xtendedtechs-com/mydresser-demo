-- Fix email exposure vulnerability in public profiles
-- Remove the policy that allows direct access to public profiles with all fields
DROP POLICY IF EXISTS "Users can view safe public profile data" ON public.profiles;

-- The existing get_public_profiles() function already provides safe access to public profile data
-- without exposing email addresses or other sensitive information
-- Users should access public profiles through this function instead of direct table queries

-- Verify no other policies expose sensitive data
-- The remaining policies only allow:
-- 1. Users to view their own complete profile
-- 2. Users to insert their own profile  
-- 3. Users to update their own profile