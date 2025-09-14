-- PART 2: Enhanced Security Functions and Data Protection

-- 1. Create secure contact info functions with enhanced validation
CREATE OR REPLACE FUNCTION public.get_user_contact_info_secure(mask_data boolean DEFAULT false)
RETURNS TABLE(email text, social_instagram text, social_facebook text, social_tiktok text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rate_limit_result jsonb;
  user_confirmed boolean := false;
BEGIN
  -- Enhanced rate limiting
  rate_limit_result := public.enhanced_rate_limit_check(
    auth.uid()::text, 
    'contact_info_access', 
    10, -- Max 10 accesses per hour
    60
  );
  
  IF NOT (rate_limit_result->>'allowed')::boolean THEN
    RAISE EXCEPTION 'Rate limit exceeded for contact information access';
  END IF;

  -- Validate user session with enhanced checks
  IF NOT public.validate_user_session_robust() THEN
    RAISE EXCEPTION 'Invalid session for contact information access';
  END IF;

  -- Log the access attempt
  PERFORM public.log_sensitive_data_access(
    'profile_contact_info',
    'secure_access',
    ARRAY['email', 'social_instagram', 'social_facebook', 'social_tiktok']
  );

  -- Return data (masked or unmasked based on parameter)
  IF mask_data THEN
    RETURN QUERY
    SELECT 
      CASE WHEN pci.email IS NOT NULL THEN public.mask_contact_data(pci.email, 'email') ELSE NULL END,
      CASE WHEN pci.social_instagram IS NOT NULL THEN public.mask_contact_data(pci.social_instagram, 'social') ELSE NULL END,
      CASE WHEN pci.social_facebook IS NOT NULL THEN public.mask_contact_data(pci.social_facebook, 'social') ELSE NULL END,
      CASE WHEN pci.social_tiktok IS NOT NULL THEN public.mask_contact_data(pci.social_tiktok, 'social') ELSE NULL END
    FROM public.profile_contact_info pci
    WHERE pci.user_id = auth.uid();
  ELSE
    RETURN QUERY
    SELECT pci.email, pci.social_instagram, pci.social_facebook, pci.social_tiktok
    FROM public.profile_contact_info pci
    WHERE pci.user_id = auth.uid();
  END IF;
END;
$$;

-- 2. Create secure contact info update function
CREATE OR REPLACE FUNCTION public.update_contact_info_secure(
  new_email text DEFAULT NULL,
  new_instagram text DEFAULT NULL,
  new_facebook text DEFAULT NULL,
  new_tiktok text DEFAULT NULL
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rate_limit_result jsonb;
  updated_fields text[] := ARRAY[]::text[];
BEGIN
  -- Enhanced rate limiting for updates
  rate_limit_result := public.enhanced_rate_limit_check(
    auth.uid()::text, 
    'contact_info_update', 
    5, -- Max 5 updates per hour
    60
  );
  
  IF NOT (rate_limit_result->>'allowed')::boolean THEN
    RAISE EXCEPTION 'Rate limit exceeded for contact information updates';
  END IF;

  -- Validate user session
  IF NOT public.validate_user_session_robust() THEN
    RAISE EXCEPTION 'Invalid session for contact information update';
  END IF;

  -- Track which fields are being updated
  IF new_email IS NOT NULL THEN updated_fields := array_append(updated_fields, 'email'); END IF;
  IF new_instagram IS NOT NULL THEN updated_fields := array_append(updated_fields, 'social_instagram'); END IF;
  IF new_facebook IS NOT NULL THEN updated_fields := array_append(updated_fields, 'social_facebook'); END IF;
  IF new_tiktok IS NOT NULL THEN updated_fields := array_append(updated_fields, 'social_tiktok'); END IF;

  -- Log the update attempt
  PERFORM public.log_sensitive_data_access(
    'profile_contact_info',
    'secure_update',
    updated_fields
  );

  -- Perform the update
  INSERT INTO public.profile_contact_info (user_id, email, social_instagram, social_facebook, social_tiktok)
  VALUES (auth.uid(), new_email, new_instagram, new_facebook, new_tiktok)
  ON CONFLICT (user_id) DO UPDATE SET
    email = COALESCE(new_email, profile_contact_info.email),
    social_instagram = COALESCE(new_instagram, profile_contact_info.social_instagram),
    social_facebook = COALESCE(new_facebook, profile_contact_info.social_facebook),
    social_tiktok = COALESCE(new_tiktok, profile_contact_info.social_tiktok),
    updated_at = now();

  RETURN true;
END;
$$;

-- 3. Enhanced merchant profile security
CREATE OR REPLACE FUNCTION public.secure_merchant_data_access()
RETURNS TABLE(
  business_name text,
  business_type text,
  verification_status text,
  tax_id_masked text,
  address_summary text,
  contact_summary text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rate_limit_result jsonb;
BEGIN
  -- Rate limit merchant data access
  rate_limit_result := public.enhanced_rate_limit_check(
    auth.uid()::text, 
    'merchant_data_access', 
    20, -- Max 20 accesses per hour
    60
  );
  
  IF NOT (rate_limit_result->>'allowed')::boolean THEN
    RAISE EXCEPTION 'Rate limit exceeded for merchant data access';
  END IF;

  -- Log the access
  PERFORM public.log_sensitive_data_access(
    'merchant_profiles',
    'secure_access',
    ARRAY['business_name', 'business_type', 'tax_id', 'business_address', 'contact_info']
  );

  RETURN QUERY
  SELECT 
    mp.business_name,
    mp.business_type,
    mp.verification_status,
    CASE 
      WHEN mp.tax_id IS NOT NULL THEN '***-**-' || RIGHT(mp.tax_id, 4)
      ELSE NULL 
    END as tax_id_masked,
    CASE 
      WHEN mp.business_address IS NOT NULL THEN 'Address on file'
      ELSE 'No address' 
    END as address_summary,
    CASE 
      WHEN mp.contact_info IS NOT NULL THEN 'Contact info on file'
      ELSE 'No contact info' 
    END as contact_summary
  FROM public.merchant_profiles mp
  WHERE mp.user_id = auth.uid();
END;
$$;

-- 4. Add data breach detection
CREATE OR REPLACE FUNCTION public.detect_potential_data_breach(
  table_accessed text,
  access_count integer DEFAULT 1
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_access_count integer;
  suspicious_patterns jsonb;
BEGIN
  -- Count recent access attempts from this user
  SELECT COUNT(*) INTO recent_access_count
  FROM contact_info_access_log
  WHERE user_id = auth.uid()
    AND created_at > now() - interval '10 minutes'
    AND action LIKE '%' || table_accessed || '%';

  -- Detect suspicious patterns
  suspicious_patterns := jsonb_build_object(
    'rapid_access', recent_access_count > 50,
    'unusual_volume', access_count > 100,
    'risk_score', LEAST(recent_access_count * 2, 100)
  );

  -- Log if suspicious
  IF (suspicious_patterns->>'risk_score')::integer > 20 THEN
    INSERT INTO security_audit_log (
      user_id, action, resource, success, details
    ) VALUES (
      auth.uid(),
      'potential_data_breach_detected',
      table_accessed,
      true,
      suspicious_patterns
    );
  END IF;

  RETURN suspicious_patterns;
END;
$$;