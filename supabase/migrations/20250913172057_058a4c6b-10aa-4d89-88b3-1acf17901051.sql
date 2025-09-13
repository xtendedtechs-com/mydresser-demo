-- Fix the security warning by setting search path on the function
DROP FUNCTION IF EXISTS public.update_laundry_schedules_updated_at();

CREATE OR REPLACE FUNCTION public.update_laundry_schedules_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;