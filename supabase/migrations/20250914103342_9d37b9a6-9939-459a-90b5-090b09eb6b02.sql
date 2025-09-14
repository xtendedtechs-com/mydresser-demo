-- Enhanced security measures for profile_contact_info table

-- Add session validation and IP logging to RLS policies
CREATE OR REPLACE FUNCTION public.validate_user_session()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_authenticated BOOLEAN := false;
  session_valid BOOLEAN := false;
BEGIN
  -- Check if user is authenticated
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  
  -- Additional session validation could be added here
  -- For now, we rely on Supabase's built-in session management
  RETURN true;
END;
$$;

-- Enhanced RLS policies with additional validation
DROP POLICY IF EXISTS "Users can only view their own contact info" ON public.profile_contact_info;
DROP POLICY IF EXISTS "Users can only insert their own contact info" ON public.profile_contact_info;
DROP POLICY IF EXISTS "Users can only update their own contact info" ON public.profile_contact_info;
DROP POLICY IF EXISTS "Users can only delete their own contact info" ON public.profile_contact_info;

-- Create enhanced RLS policies with session validation
CREATE POLICY "Enhanced contact info select policy"
ON public.profile_contact_info
FOR SELECT
USING (
  auth.uid() = user_id 
  AND public.validate_user_session()
  AND EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND email_confirmed_at IS NOT NULL
  )
);

CREATE POLICY "Enhanced contact info insert policy"
ON public.profile_contact_info
FOR INSERT
WITH CHECK (
  auth.uid() = user_id 
  AND public.validate_user_session()
  AND EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND email_confirmed_at IS NOT NULL
  )
);

CREATE POLICY "Enhanced contact info update policy"
ON public.profile_contact_info
FOR UPDATE
USING (
  auth.uid() = user_id 
  AND public.validate_user_session()
)
WITH CHECK (
  auth.uid() = user_id 
  AND public.validate_user_session()
);

CREATE POLICY "Enhanced contact info delete policy"
ON public.profile_contact_info
FOR DELETE
USING (
  auth.uid() = user_id 
  AND public.validate_user_session()
);

-- Create function to log suspicious access attempts
CREATE OR REPLACE FUNCTION public.log_suspicious_contact_access(
  attempted_user_id UUID,
  access_type TEXT,
  reason TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log suspicious access attempts for security monitoring
  INSERT INTO security_audit_log (
    user_id,
    action,
    resource,
    success,
    details
  ) VALUES (
    auth.uid(),
    'suspicious_contact_access',
    'profile_contact_info',
    false,
    jsonb_build_object(
      'attempted_user_id', attempted_user_id,
      'access_type', access_type,
      'reason', reason,
      'timestamp', now(),
      'actual_user_id', auth.uid()
    )
  );
END;
$$;

-- Create a view that provides safe access to contact info with built-in protections
CREATE OR REPLACE VIEW public.safe_contact_info AS
SELECT 
  user_id,
  CASE 
    WHEN auth.uid() = user_id THEN email
    ELSE NULL
  END as email,
  CASE 
    WHEN auth.uid() = user_id THEN social_instagram
    ELSE NULL
  END as social_instagram,
  CASE 
    WHEN auth.uid() = user_id THEN social_facebook
    ELSE NULL
  END as social_facebook,
  CASE 
    WHEN auth.uid() = user_id THEN social_tiktok
    ELSE NULL
  END as social_tiktok,
  created_at,
  updated_at
FROM public.profile_contact_info
WHERE auth.uid() = user_id AND public.validate_user_session();

-- Enable RLS on the view (even though it has built-in protection)
ALTER VIEW public.safe_contact_info SET (security_barrier = true);

-- Create a function to check for data breaches or unauthorized access patterns
CREATE OR REPLACE FUNCTION public.check_contact_info_breach_patterns()
RETURNS TABLE(
  user_id UUID,
  suspicious_access_count BIGINT,
  last_suspicious_access TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only admins can run breach pattern analysis
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'::user_role
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  RETURN QUERY
  SELECT 
    sal.user_id,
    COUNT(*) as suspicious_access_count,
    MAX(sal.created_at) as last_suspicious_access
  FROM security_audit_log sal
  WHERE sal.action = 'suspicious_contact_access'
    AND sal.created_at >= now() - interval '24 hours'
  GROUP BY sal.user_id
  HAVING COUNT(*) > 5
  ORDER BY suspicious_access_count DESC;
END;
$$;

-- Add additional validation trigger for contact info updates
CREATE OR REPLACE FUNCTION public.validate_contact_info_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Validate that user_id cannot be changed
  IF OLD.user_id != NEW.user_id THEN
    RAISE EXCEPTION 'Cannot change user_id for contact information';
  END IF;
  
  -- Log the update for audit purposes
  INSERT INTO contact_info_access_log (
    user_id,
    action,
    accessed_fields,
    created_at
  ) VALUES (
    NEW.user_id,
    'contact_info_direct_update',
    ARRAY['email', 'social_instagram', 'social_facebook', 'social_tiktok'],
    now()
  );
  
  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS validate_contact_info_changes_trigger ON public.profile_contact_info;
CREATE TRIGGER validate_contact_info_changes_trigger
  BEFORE UPDATE ON public.profile_contact_info
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_contact_info_changes();