-- Fix search path for the support ticket trigger function
DROP FUNCTION IF EXISTS update_support_ticket_updated_at() CASCADE;

CREATE OR REPLACE FUNCTION update_support_ticket_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER support_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_support_ticket_updated_at();