-- MyDresser AI Application: Critical Database Functions & RLS Policies
-- Phase 1B: Security Functions, Triggers, and Row Level Security

-- Critical validation function (mandatory from specification)
CREATE OR REPLACE FUNCTION public.validate_user_session_robust()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND email_confirmed_at IS NOT NULL
    )
  );
END;
$$;

-- User management triggers
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, role)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    CASE 
      WHEN NEW.raw_user_meta_data->>'user_type' = 'merchant' THEN 'merchant'::user_role
      WHEN NEW.raw_user_meta_data->>'user_type' = 'professional' THEN 'professional'::user_role
      ELSE 'private'::user_role
    END
  );
  RETURN NEW;
END;
$$;

-- Merchant signup handler (critical from specification)
CREATE OR REPLACE FUNCTION public.handle_merchant_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user_type is merchant from metadata
  IF NEW.raw_user_meta_data->>'user_type' = 'merchant' THEN
    -- Create merchant profile
    INSERT INTO public.merchant_profiles (
      user_id,
      business_name,
      business_type,
      verification_status
    ) VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'business_name', 'Business Name'),
      COALESCE(NEW.raw_user_meta_data->>'business_type', 'Fashion Retailer'),
      'pending'
    ) ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- User preferences initialization
CREATE OR REPLACE FUNCTION public.handle_new_user_preferences()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;

-- Enhanced rate limiting function
CREATE OR REPLACE FUNCTION public.enhanced_rate_limit_check(
  identifier_key text,
  action_type text,
  max_requests integer DEFAULT 10,
  window_minutes integer DEFAULT 60,
  user_agent_string text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count integer;
  current_window_start timestamp with time zone;
  blocked boolean := false;
BEGIN
  current_window_start := now() - (window_minutes || ' minutes')::interval;
  
  -- Clean up old entries
  DELETE FROM rate_limits 
  WHERE rate_limits.window_start < now() - interval '24 hours';
  
  -- Get current count
  SELECT COALESCE(SUM(count), 0) INTO current_count
  FROM rate_limits
  WHERE identifier = identifier_key 
    AND action = action_type
    AND rate_limits.window_start > current_window_start;
  
  -- Check if limit exceeded
  IF current_count >= max_requests THEN
    blocked := true;
    
    -- Log rate limit violation
    INSERT INTO security_audit_log (
      user_id, action, resource, success, details
    ) VALUES (
      auth.uid(),
      'rate_limit_exceeded',
      'rate_limits',
      false,
      jsonb_build_object(
        'identifier', identifier_key,
        'action_type', action_type,
        'current_count', current_count,
        'limit', max_requests
      )
    );
  ELSE
    -- Record this request
    INSERT INTO rate_limits (identifier, action, count, window_start)
    VALUES (identifier_key, action_type, 1, now())
    ON CONFLICT (identifier, action) DO UPDATE SET
      count = rate_limits.count + 1,
      window_start = GREATEST(rate_limits.window_start, current_window_start);
  END IF;
  
  RETURN jsonb_build_object(
    'allowed', NOT blocked,
    'current_count', current_count,
    'limit', max_requests,
    'window_minutes', window_minutes
  );
END;
$$;

-- Update timestamps function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

DROP TRIGGER IF EXISTS on_auth_user_merchant_signup ON auth.users;
CREATE TRIGGER on_auth_user_merchant_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_merchant_signup();

DROP TRIGGER IF EXISTS on_auth_user_preferences ON auth.users;
CREATE TRIGGER on_auth_user_preferences
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_preferences();

-- Update timestamp triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON public.user_preferences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_wardrobes_updated_at BEFORE UPDATE ON public.wardrobes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_wardrobe_items_updated_at BEFORE UPDATE ON public.wardrobe_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_outfits_updated_at BEFORE UPDATE ON public.outfits FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON public.collections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_merchant_profiles_updated_at BEFORE UPDATE ON public.merchant_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();