-- Strengthen RLS policies for merchant profiles with additional security layers
-- Drop existing policies to recreate with enhanced security
DROP POLICY IF EXISTS "Merchants can only access their own profile" ON public.merchant_profiles;
DROP POLICY IF EXISTS "Users can create their own merchant profile" ON public.merchant_profiles;
DROP POLICY IF EXISTS "Users can update their own merchant profile" ON public.merchant_profiles;
DROP POLICY IF EXISTS "Users can view their own merchant profile" ON public.merchant_profiles;

-- Enhanced RLS policies with additional verification checks
CREATE POLICY "Secure merchant profile select" ON public.merchant_profiles
FOR SELECT
USING (
  auth.uid() = user_id 
  AND auth.uid() IS NOT NULL
  AND (
    -- Allow access only for verified sessions with proper auth level
    EXISTS (
      SELECT 1 FROM auth.users au 
      WHERE au.id = auth.uid() 
      AND au.email_confirmed_at IS NOT NULL
    )
  )
);

CREATE POLICY "Secure merchant profile insert" ON public.merchant_profiles  
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND auth.uid() IS NOT NULL
  AND (
    -- Ensure user has a valid profile before creating merchant profile
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid()
      AND p.created_at IS NOT NULL
    )
  )
);

CREATE POLICY "Secure merchant profile update" ON public.merchant_profiles
FOR UPDATE  
USING (
  auth.uid() = user_id
  AND auth.uid() IS NOT NULL
  AND verification_status IN ('pending', 'under_review', 'verified')
)
WITH CHECK (
  auth.uid() = user_id
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Secure merchant profile delete" ON public.merchant_profiles
FOR DELETE
USING (
  auth.uid() = user_id
  AND auth.uid() IS NOT NULL
  AND verification_status IN ('pending', 'rejected') -- Only allow deletion of unverified profiles
);

-- Create additional security view that masks sensitive data by default
CREATE OR REPLACE VIEW public.merchant_profiles_safe AS
SELECT 
  id,
  user_id,
  business_name,
  business_type,
  verification_status,
  created_at,
  updated_at,
  -- Mask sensitive fields
  CASE WHEN verification_status = 'verified' THEN 'VERIFIED' ELSE 'HIDDEN' END as tax_id_status,
  CASE WHEN business_address IS NOT NULL THEN 'PROVIDED' ELSE 'NOT_PROVIDED' END as address_status,
  CASE WHEN contact_info IS NOT NULL THEN 'PROVIDED' ELSE 'NOT_PROVIDED' END as contact_status
FROM public.merchant_profiles
WHERE auth.uid() = user_id;

-- Grant access to the safe view
GRANT SELECT ON public.merchant_profiles_safe TO authenticated;

-- Create rate limiting for sensitive merchant operations
CREATE OR REPLACE FUNCTION public.check_merchant_rate_limit(operation text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_hour timestamp;
  operation_count integer;
  max_operations integer;
BEGIN
  current_hour := date_trunc('hour', now());
  
  -- Set limits based on operation type
  max_operations := CASE operation
    WHEN 'sensitive_access' THEN 20  -- Max 20 sensitive data accesses per hour
    WHEN 'profile_update' THEN 10    -- Max 10 profile updates per hour  
    WHEN 'profile_create' THEN 3     -- Max 3 profile creations per hour
    ELSE 5
  END;
  
  -- Count operations in current hour
  SELECT COUNT(*) INTO operation_count
  FROM security_audit_log
  WHERE user_id = auth.uid()
    AND action LIKE '%merchant%'
    AND created_at >= current_hour
    AND details->>'operation_type' = operation;
  
  -- Check if under limit
  IF operation_count >= max_operations THEN
    -- Log rate limit exceeded
    INSERT INTO security_audit_log (
      user_id, action, resource, success, details
    ) VALUES (
      auth.uid(),
      'merchant_rate_limit_exceeded',
      'merchant_profiles',
      false,
      jsonb_build_object(
        'operation', operation,
        'count', operation_count,
        'limit', max_operations,
        'window', current_hour
      )
    );
    RETURN false;
  END IF;
  
  RETURN true;
END;
$function$;

-- Update the sensitive data access function with rate limiting
CREATE OR REPLACE FUNCTION public.get_merchant_sensitive_data(profile_user_id uuid DEFAULT auth.uid())
RETURNS TABLE(tax_id text, business_address jsonb, contact_info jsonb)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE 
  target_profile_id uuid;
  profile_salt uuid;
  decrypted_tax_id text;
  decrypted_address text;
  decrypted_contact text;
BEGIN
  -- Check rate limiting first
  IF NOT public.check_merchant_rate_limit('sensitive_access') THEN
    RAISE EXCEPTION 'Rate limit exceeded for sensitive data access';
  END IF;

  -- Get profile info with strict verification checks
  SELECT mp.id, mp.encryption_salt INTO target_profile_id, profile_salt
  FROM public.merchant_profiles mp
  WHERE mp.user_id = COALESCE(profile_user_id, auth.uid())
    AND auth.uid() = mp.user_id
    AND mp.verification_status IN ('verified','pending','under_review');

  IF target_profile_id IS NULL THEN
    RETURN;
  END IF;

  -- Enhanced audit logging with more details
  PERFORM public.log_merchant_sensitive_access(
    target_profile_id, 
    ARRAY['tax_id','business_address','contact_info']
  );

  -- Get encrypted data and decrypt it
  SELECT 
    CASE 
      WHEN mp.tax_id IS NOT NULL THEN public.decrypt_business_data(mp.tax_id, profile_salt)
      ELSE NULL
    END,
    CASE
      WHEN mp.business_address IS NOT NULL THEN public.decrypt_business_data(mp.business_address::text, profile_salt)
      ELSE NULL  
    END,
    CASE
      WHEN mp.contact_info IS NOT NULL THEN public.decrypt_business_data(mp.contact_info::text, profile_salt)
      ELSE NULL
    END
  INTO decrypted_tax_id, decrypted_address, decrypted_contact
  FROM public.merchant_profiles mp
  WHERE mp.id = target_profile_id;
  
  -- Log successful access with operation type
  INSERT INTO security_audit_log (
    user_id, action, resource, success, details
  ) VALUES (
    auth.uid(),
    'merchant_sensitive_data_accessed',
    'merchant_profiles', 
    true,
    jsonb_build_object(
      'profile_id', target_profile_id,
      'operation_type', 'sensitive_access',
      'fields_accessed', ARRAY['tax_id','business_address','contact_info'],
      'encrypted_source', true
    )
  );
  
  -- Return decrypted data
  RETURN QUERY SELECT 
    decrypted_tax_id,
    CASE WHEN decrypted_address IS NOT NULL THEN decrypted_address::jsonb ELSE NULL END,
    CASE WHEN decrypted_contact IS NOT NULL THEN decrypted_contact::jsonb ELSE NULL END;
END;
$function$;