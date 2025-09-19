-- Create the missing validate_user_session_robust function used in RLS policies
CREATE OR REPLACE FUNCTION public.validate_user_session_robust()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_session_valid boolean := false;
BEGIN
  -- Check if user is authenticated and session is valid
  IF auth.uid() IS NOT NULL THEN
    -- Additional session validation checks can be added here
    -- For now, just check that the user exists and is authenticated
    SELECT EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
        AND email_confirmed_at IS NOT NULL
    ) INTO user_session_valid;
  END IF;
  
  RETURN user_session_valid;
END;
$$;