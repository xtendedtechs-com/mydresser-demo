-- Security Fix: Remove insecure profiles_public_safe view
-- This view had no RLS policies and exposed user profile data publicly
-- The secure alternatives get_public_profiles() and get_public_profile_by_user_id() functions already exist

DROP VIEW IF EXISTS public.profiles_public_safe;