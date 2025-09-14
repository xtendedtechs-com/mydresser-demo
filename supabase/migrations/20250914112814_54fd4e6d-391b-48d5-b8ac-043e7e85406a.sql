-- Fix inconsistent security model for profile_contact_info table
-- Replace blanket denial SELECT policy with proper user-specific RLS policy

-- Drop the problematic blanket denial policy
DROP POLICY IF EXISTS "No direct select on contact info" ON public.profile_contact_info;

-- Create a proper user-specific SELECT policy that matches the other policies
CREATE POLICY "Robust contact info select policy" 
ON public.profile_contact_info 
FOR SELECT 
USING (
  (auth.uid() IS NOT NULL) 
  AND (auth.uid() = user_id) 
  AND validate_user_session_robust()
);