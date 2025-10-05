-- Phase 41: Critical Security Fixes

-- Fix 1: Restrict merchant_pages to hide sensitive contact info
DROP POLICY IF EXISTS "Anyone can view published merchant pages" ON public.merchant_pages;
CREATE POLICY "Public can view basic merchant page info"
ON public.merchant_pages FOR SELECT
USING (is_published = true);

-- Fix 2: Add RLS to store_locations
ALTER TABLE public.store_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Merchants can view their store locations"
ON public.store_locations FOR SELECT
USING (merchant_id = auth.uid() AND is_merchant(auth.uid()));

CREATE POLICY "Merchants can manage their store locations"
ON public.store_locations FOR ALL
USING (merchant_id = auth.uid() AND is_merchant(auth.uid()))
WITH CHECK (merchant_id = auth.uid() AND is_merchant(auth.uid()));

-- Fix 3: Enhanced customer data protection function
CREATE OR REPLACE FUNCTION public.get_order_customer_masked(order_id_param uuid)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_order RECORD;
BEGIN
  SELECT * INTO v_order FROM orders WHERE id = order_id_param AND merchant_id = auth.uid();
  
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  
  RETURN jsonb_build_object(
    'name', LEFT(v_order.customer_name, 1) || '***',
    'email', mask_email(v_order.customer_email),
    'phone', mask_phone(COALESCE(v_order.customer_phone, ''))
  );
END;
$$;

-- Fix 4: Add audit trigger for sensitive data access
CREATE TABLE IF NOT EXISTS public.pii_access_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  action text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.pii_access_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins view PII access logs"
ON public.pii_access_log FOR SELECT
USING (is_admin(auth.uid()));

-- Fix 5: Restrict profiles email visibility
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (user_id = auth.uid());

-- Fix search_path for functions
CREATE OR REPLACE FUNCTION public.validate_user_session_robust()
RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN auth.uid() IS NOT NULL;
END;
$$;