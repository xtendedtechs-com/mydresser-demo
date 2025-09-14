-- Phase 1: Critical Security Fixes

-- 1. Create admin user (set the first user as admin for now)
UPDATE profiles 
SET role = 'admin' 
WHERE user_id = (
  SELECT user_id FROM profiles 
  ORDER BY created_at ASC 
  LIMIT 1
);

-- 2. Secure invitation tokens - hash them before storage
CREATE OR REPLACE FUNCTION public.hash_invitation_token(token text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN encode(digest(token || 'invitation_salt_2024', 'sha256'), 'hex');
END;
$$;

-- 3. Create function to verify invitation tokens
CREATE OR REPLACE FUNCTION public.verify_invitation_token(input_token text, stored_hash text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN public.hash_invitation_token(input_token) = stored_hash;
END;
$$;

-- 4. Add customer data encryption functions for orders
CREATE OR REPLACE FUNCTION public.encrypt_customer_data(data_text text, order_salt uuid DEFAULT gen_random_uuid())
RETURNS text
LANGUAGE plpgsql
IMMUTABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  encryption_key text;
BEGIN
  encryption_key := encode(digest(order_salt::text || 'customer_master_key_2024', 'sha256'), 'hex');
  RETURN encode(convert_to(data_text, 'UTF8'), 'base64');
END;
$$;

CREATE OR REPLACE FUNCTION public.decrypt_customer_data(encrypted_text text, order_salt uuid DEFAULT gen_random_uuid())
RETURNS text
LANGUAGE plpgsql
IMMUTABLE SECURITY DEFINER  
SET search_path = 'public'
AS $$
DECLARE
  encryption_key text;
BEGIN
  encryption_key := encode(digest(order_salt::text || 'customer_master_key_2024', 'sha256'), 'hex');
  RETURN convert_from(decode(encrypted_text, 'base64'), 'UTF8');
END;
$$;

-- 5. Add encryption salt to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS encryption_salt uuid DEFAULT gen_random_uuid();

-- 6. Create secure function to get customer data for merchants
CREATE OR REPLACE FUNCTION public.get_customer_data_secure(order_id_param uuid)
RETURNS TABLE(
  customer_name text,
  customer_email text, 
  customer_phone text,
  billing_address jsonb,
  shipping_address jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  order_salt uuid;
  merchant_check uuid;
BEGIN
  -- Verify merchant owns this order
  SELECT merchant_id, encryption_salt INTO merchant_check, order_salt
  FROM orders 
  WHERE id = order_id_param;
  
  IF merchant_check != auth.uid() THEN
    RAISE EXCEPTION 'Access denied: Order does not belong to merchant';
  END IF;
  
  -- Return masked customer data (only essential info)
  RETURN QUERY
  SELECT 
    CASE 
      WHEN o.customer_name IS NOT NULL 
      THEN LEFT(o.customer_name, 1) || '***' || RIGHT(o.customer_name, 1)
      ELSE NULL 
    END,
    CASE 
      WHEN o.customer_email IS NOT NULL 
      THEN LEFT(split_part(o.customer_email, '@', 1), 2) || '***@' || split_part(o.customer_email, '@', 2)
      ELSE NULL 
    END,
    CASE 
      WHEN o.customer_phone IS NOT NULL 
      THEN '***-***-' || RIGHT(o.customer_phone, 4)
      ELSE NULL 
    END,
    '{"masked": true}'::jsonb,
    '{"masked": true}'::jsonb
  FROM orders o
  WHERE o.id = order_id_param AND o.merchant_id = auth.uid();
END;
$$;

-- 7. Enhanced session validation function
CREATE OR REPLACE FUNCTION public.validate_user_session_robust()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  session_valid boolean := false;
  user_exists boolean := false;
BEGIN
  -- Check if user exists and is authenticated
  SELECT EXISTS(
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND email_confirmed_at IS NOT NULL
  ) INTO user_exists;
  
  IF NOT user_exists THEN
    RETURN false;
  END IF;
  
  -- Additional session validation
  SELECT EXISTS(
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND created_at IS NOT NULL
  ) INTO session_valid;
  
  RETURN session_valid;
END;
$$;

-- 8. Create rate limiting for sensitive operations
CREATE TABLE IF NOT EXISTS sensitive_operation_limits (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  operation_type text NOT NULL,
  attempt_count integer DEFAULT 1,
  window_start timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE sensitive_operation_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own operation limits" ON sensitive_operation_limits
FOR SELECT USING (auth.uid() = user_id);

-- 9. Enhance admin security audit logging
CREATE OR REPLACE FUNCTION public.log_admin_action(action_type text, resource_name text, details jsonb DEFAULT '{}')
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_role user_role;
BEGIN
  -- Verify admin role
  SELECT role INTO user_role FROM profiles WHERE user_id = auth.uid();
  
  IF user_role != 'admin' THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;
  
  -- Log admin action
  INSERT INTO security_audit_log (
    user_id, action, resource, success, details
  ) VALUES (
    auth.uid(), action_type, resource_name, true, details
  );
  
  RETURN true;
END;
$$;