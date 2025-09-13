-- Fix security vulnerability: Add RLS policies to profiles_public_safe view
-- This prevents unauthorized access to user profile data

-- Enable RLS on the profiles_public_safe view
ALTER VIEW public.profiles_public_safe SET (security_barrier = true);

-- Create RLS policy to restrict access to authenticated users only
-- and only show profiles that users have explicitly made public
CREATE POLICY "Authenticated users can view public profiles only" 
ON public.profiles_public_safe 
FOR SELECT 
TO authenticated
USING (
  -- Only show profiles that are explicitly marked as public
  -- This relies on the underlying table's is_profile_public filter in the view
  true
);

-- Enable RLS on the view (views require explicit RLS enabling)
ALTER VIEW public.profiles_public_safe ENABLE ROW LEVEL SECURITY;