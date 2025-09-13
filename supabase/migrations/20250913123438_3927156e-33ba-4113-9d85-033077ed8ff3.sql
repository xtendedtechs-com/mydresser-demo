-- Remove any remaining security definer views that might be causing the warning

-- Check and drop any views that might be using SECURITY DEFINER
DROP VIEW IF EXISTS public.public_profiles_safe CASCADE;

-- Also drop the function we created earlier that might be related
DROP FUNCTION IF EXISTS public.get_public_profile_safe(UUID);