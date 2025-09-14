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

-- Add additional security logging for direct SELECT access attempts
CREATE OR REPLACE FUNCTION public.log_contact_info_direct_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Log direct access attempts for audit purposes
  INSERT INTO contact_info_access_log (
    user_id,
    action,
    accessed_fields,
    created_at
  ) VALUES (
    NEW.user_id,
    'direct_table_select',
    ARRAY['email', 'social_instagram', 'social_facebook', 'social_tiktok'],
    now()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to log all SELECT operations on contact info
CREATE TRIGGER log_contact_info_access_trigger
  AFTER SELECT ON public.profile_contact_info
  FOR EACH ROW
  EXECUTE FUNCTION public.log_contact_info_direct_access();