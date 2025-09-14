-- Fix remaining function search path security issues

-- Update the update_contact_info_updated_at function to have secure search path
CREATE OR REPLACE FUNCTION public.update_contact_info_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;