-- Fix the function name conflict by dropping and recreating
DROP FUNCTION IF EXISTS public.mask_contact_data(text, text);

-- Add missing database function for robust session validation
CREATE OR REPLACE FUNCTION public.validate_user_session_robust()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Simple session validation - check if user is authenticated
  RETURN auth.uid() IS NOT NULL;
END;
$$;

-- Add missing function for masking contact data with correct parameter names
CREATE OR REPLACE FUNCTION public.mask_contact_data(data_text text, data_type text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  CASE data_type
    WHEN 'email' THEN
      RETURN LEFT(split_part(data_text, '@', 1), 2) || '***@' || split_part(data_text, '@', 2);
    WHEN 'social' THEN
      RETURN LEFT(data_text, 3) || '***' || RIGHT(data_text, 2);
    ELSE
      RETURN '***';
  END CASE;
END;
$$;