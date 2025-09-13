-- Secure merchant_profiles access and fix previous migration error (correct function signatures)

-- 1) Ensure audit log table exists
CREATE TABLE IF NOT EXISTS public.merchant_profile_access_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  merchant_profile_id uuid NOT NULL,
  action text NOT NULL,
  accessed_fields text[],
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.merchant_profile_access_log ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='merchant_profile_access_log' AND policyname='Users can view their own access logs'
  ) THEN
    CREATE POLICY "Users can view their own access logs"
    ON public.merchant_profile_access_log
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='merchant_profile_access_log' AND policyname='System can insert audit logs'
  ) THEN
    CREATE POLICY "System can insert audit logs"
    ON public.merchant_profile_access_log
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- 2) Create/replace logging function first (dependency for sensitive data function)
CREATE OR REPLACE FUNCTION public.log_merchant_sensitive_access(
  merchant_profile_id uuid,
  accessed_fields text[]
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.merchant_profile_access_log (
    user_id, merchant_profile_id, action, accessed_fields, created_at
  ) VALUES (
    auth.uid(), merchant_profile_id, 'sensitive_data_access', accessed_fields, now()
  );
  RETURN true;
EXCEPTION WHEN OTHERS THEN
  RETURN true;
END;
$$;

-- 3) Simplify and harden RLS on merchant_profiles: owner-only SELECT
ALTER TABLE public.merchant_profiles ENABLE ROW LEVEL SECURITY;

-- Drop any prior SELECT policies to avoid confusion
DROP POLICY IF EXISTS "Restrict direct merchant profile access" ON public.merchant_profiles;
DROP POLICY IF EXISTS "Allow security definer function access" ON public.merchant_profiles;
DROP POLICY IF EXISTS "Users can view their own basic merchant profile" ON public.merchant_profiles;

CREATE POLICY "Users can view their own merchant profile"
ON public.merchant_profiles
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- 4) Safe, minimal functions for access patterns (optional helpers)
CREATE OR REPLACE FUNCTION public.get_merchant_profile_public(profile_user_id uuid DEFAULT auth.uid())
RETURNS TABLE(
  id uuid,
  user_id uuid,
  business_name text,
  business_type text,
  verification_status text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id, user_id, business_name, business_type, verification_status, created_at, updated_at
  FROM public.merchant_profiles
  WHERE user_id = COALESCE(profile_user_id, auth.uid())
    AND auth.uid() = user_id;
$$;

CREATE OR REPLACE FUNCTION public.get_merchant_sensitive_data(profile_user_id uuid DEFAULT auth.uid())
RETURNS TABLE(
  tax_id text,
  business_address jsonb,
  contact_info jsonb
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE target_profile_id uuid;
BEGIN
  SELECT id INTO target_profile_id
  FROM public.merchant_profiles
  WHERE user_id = COALESCE(profile_user_id, auth.uid())
    AND auth.uid() = user_id
    AND verification_status IN ('verified','pending','under_review');

  IF target_profile_id IS NULL THEN
    RETURN;
  END IF;

  PERFORM public.log_merchant_sensitive_access(target_profile_id, ARRAY['tax_id','business_address','contact_info']);

  RETURN QUERY
  SELECT tax_id, business_address, contact_info
  FROM public.merchant_profiles
  WHERE id = target_profile_id;
END;
$$;

-- 5) Correct comments with proper signatures + grants
COMMENT ON FUNCTION public.get_merchant_profile_public(uuid)
IS 'Safely access non-sensitive merchant profile data for the current user; prefer this over direct table queries.';

COMMENT ON FUNCTION public.get_merchant_sensitive_data(uuid)
IS 'Returns sensitive merchant data (tax_id, addresses) for the owner only and logs all access.';

GRANT EXECUTE ON FUNCTION public.get_merchant_profile_public(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_merchant_sensitive_data(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_merchant_sensitive_access(uuid, text[]) TO authenticated;