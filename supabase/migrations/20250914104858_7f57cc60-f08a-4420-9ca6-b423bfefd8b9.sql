-- Fix security vulnerabilities in profile_contact_info table with robust fail-safe measures

-- First, create a more robust user session validation function with explicit error handling
CREATE OR REPLACE FUNCTION public.validate_user_session_robust()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_user_id UUID;
  user_confirmed BOOLEAN := false;
  session_valid BOOLEAN := false;
BEGIN
  -- Get current user ID with explicit null check
  current_user_id := auth.uid();
  
  -- FAIL-SAFE: If no authenticated user, always deny
  IF current_user_id IS NULL THEN
    -- Log suspicious access attempt
    INSERT INTO security_audit_log (
      user_id, action, resource, success, details
    ) VALUES (
      NULL,
      'unauthenticated_contact_access_attempt',
      'profile_contact_info',
      false,
      jsonb_build_object(
        'timestamp', now(),
        'reason', 'no_authenticated_user'
      )
    );
    RETURN false;
  END IF;
  
  -- Check if user's email is confirmed (fail-safe approach)
  BEGIN
    SELECT 
      CASE 
        WHEN email_confirmed_at IS NOT NULL THEN true 
        ELSE false 
      END
    INTO user_confirmed
    FROM auth.users
    WHERE id = current_user_id;
    
    -- If user not found in auth.users, deny access
    IF NOT FOUND THEN
      INSERT INTO security_audit_log (
        user_id, action, resource, success, details
      ) VALUES (
        current_user_id,
        'invalid_user_contact_access_attempt',
        'profile_contact_info',
        false,
        jsonb_build_object(
          'timestamp', now(),
          'reason', 'user_not_found_in_auth'
        )
      );
      RETURN false;
    END IF;
    
  EXCEPTION WHEN OTHERS THEN
    -- If any error occurs in validation, deny access
    INSERT INTO security_audit_log (
      user_id, action, resource, success, details
    ) VALUES (
      current_user_id,
      'validation_error_contact_access',
      'profile_contact_info',
      false,
      jsonb_build_object(
        'timestamp', now(),
        'reason', 'validation_exception',
        'error', SQLERRM
      )
    );
    RETURN false;
  END;
  
  -- FAIL-SAFE: If email not confirmed, deny access
  IF NOT user_confirmed THEN
    INSERT INTO security_audit_log (
      user_id, action, resource, success, details
    ) VALUES (
      current_user_id,
      'unconfirmed_user_contact_access_attempt',
      'profile_contact_info',
      false,
      jsonb_build_object(
        'timestamp', now(),
        'reason', 'email_not_confirmed'
      )
    );
    RETURN false;
  END IF;
  
  -- All validations passed
  RETURN true;
  
EXCEPTION WHEN OTHERS THEN
  -- Ultimate fail-safe: any unexpected error denies access
  INSERT INTO security_audit_log (
    user_id, action, resource, success, details
  ) VALUES (
    COALESCE(current_user_id, auth.uid()),
    'critical_validation_error',
    'profile_contact_info',
    false,
    jsonb_build_object(
      'timestamp', now(),
      'reason', 'unexpected_exception',
      'error', SQLERRM
    )
  );
  RETURN false;
END;
$$;

-- Create simplified, robust RLS policies that are easier to validate and debug
DROP POLICY IF EXISTS "Enhanced contact info select policy" ON public.profile_contact_info;
DROP POLICY IF EXISTS "Enhanced contact info insert policy" ON public.profile_contact_info;
DROP POLICY IF EXISTS "Enhanced contact info update policy" ON public.profile_contact_info;
DROP POLICY IF EXISTS "Enhanced contact info delete policy" ON public.profile_contact_info;

-- Create new robust RLS policies with fail-safe design
CREATE POLICY "Robust contact info select policy"
ON public.profile_contact_info
FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid() = user_id 
  AND public.validate_user_session_robust()
);

CREATE POLICY "Robust contact info insert policy"
ON public.profile_contact_info
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND auth.uid() = user_id 
  AND public.validate_user_session_robust()
);

CREATE POLICY "Robust contact info update policy"
ON public.profile_contact_info
FOR UPDATE
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid() = user_id 
  AND public.validate_user_session_robust()
)
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND auth.uid() = user_id 
  AND public.validate_user_session_robust()
);

CREATE POLICY "Robust contact info delete policy"
ON public.profile_contact_info
FOR DELETE
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid() = user_id 
  AND public.validate_user_session_robust()
);

-- Add additional security constraint at database level
ALTER TABLE public.profile_contact_info 
ADD CONSTRAINT user_id_not_null CHECK (user_id IS NOT NULL);

-- Create a security testing function for admins to validate policies
CREATE OR REPLACE FUNCTION public.test_contact_info_security(test_user_id UUID DEFAULT NULL)
RETURNS TABLE(
  test_name TEXT,
  result BOOLEAN,
  details TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_user_role user_role;
  test_target_id UUID;
BEGIN
  -- Only admins can run security tests
  SELECT role INTO current_user_role
  FROM profiles 
  WHERE user_id = auth.uid();
  
  IF current_user_role != 'admin'::user_role THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required for security testing';
  END IF;
  
  test_target_id := COALESCE(test_user_id, auth.uid());
  
  -- Test 1: Verify RLS is enabled
  RETURN QUERY
  SELECT 
    'RLS Enabled'::TEXT,
    (SELECT rowsecurity FROM pg_tables WHERE tablename = 'profile_contact_info' AND schemaname = 'public'),
    'Row Level Security must be enabled'::TEXT;
  
  -- Test 2: Verify validate_user_session_robust function exists and works
  RETURN QUERY
  SELECT 
    'Session Validation Function'::TEXT,
    public.validate_user_session_robust(),
    'User session validation must pass for authenticated users'::TEXT;
  
  -- Test 3: Count active policies
  RETURN QUERY
  SELECT 
    'Active RLS Policies'::TEXT,
    (SELECT COUNT(*) >= 4 FROM pg_policies WHERE tablename = 'profile_contact_info' AND schemaname = 'public'),
    'Must have at least 4 RLS policies (SELECT, INSERT, UPDATE, DELETE)'::TEXT;
    
  -- Test 4: Verify policies reference validate_user_session_robust
  RETURN QUERY
  SELECT 
    'Policies Use Robust Validation'::TEXT,
    (SELECT COUNT(*) >= 4 FROM pg_policies 
     WHERE tablename = 'profile_contact_info' 
     AND schemaname = 'public' 
     AND (qual LIKE '%validate_user_session_robust%' OR with_check LIKE '%validate_user_session_robust%')),
    'All policies must use validate_user_session_robust function'::TEXT;
    
END;
$$;

-- Create a function to monitor and alert on failed access attempts
CREATE OR REPLACE FUNCTION public.get_recent_contact_security_incidents(hours_back INTEGER DEFAULT 24)
RETURNS TABLE(
  incident_time TIMESTAMP WITH TIME ZONE,
  user_id UUID,
  action TEXT,
  failure_reason TEXT,
  incident_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_user_role user_role;
BEGIN
  -- Only admins can view security incidents
  SELECT role INTO current_user_role
  FROM profiles 
  WHERE user_id = auth.uid();
  
  IF current_user_role != 'admin'::user_role THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;
  
  RETURN QUERY
  SELECT 
    sal.created_at as incident_time,
    sal.user_id,
    sal.action,
    sal.details->>'reason' as failure_reason,
    COUNT(*) as incident_count
  FROM security_audit_log sal
  WHERE sal.resource = 'profile_contact_info'
    AND sal.success = false
    AND sal.created_at >= now() - (hours_back || ' hours')::interval
    AND sal.action LIKE '%contact%'
  GROUP BY sal.created_at, sal.user_id, sal.action, sal.details->>'reason'
  ORDER BY incident_time DESC;
END;
$$;