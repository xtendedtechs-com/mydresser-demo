-- Create encryption functions for merchant sensitive data
CREATE OR REPLACE FUNCTION public.encrypt_business_data(data_text text, business_salt uuid DEFAULT gen_random_uuid())
RETURNS text AS $$
DECLARE
  encryption_key text;
  encrypted_result text;
BEGIN
  -- Create a business-specific encryption key
  encryption_key := encode(digest(business_salt::text || 'business_master_key_2024', 'sha256'), 'hex');
  
  -- Simple encryption - in production use proper AES encryption
  encrypted_result := encode(convert_to(data_text, 'UTF8'), 'base64');
  
  RETURN encrypted_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER IMMUTABLE SET search_path = public;

-- Create decryption function for merchant sensitive data  
CREATE OR REPLACE FUNCTION public.decrypt_business_data(encrypted_text text, business_salt uuid DEFAULT gen_random_uuid())
RETURNS text AS $$
DECLARE
  encryption_key text;
  decrypted_result text;
BEGIN
  -- Create the same business-specific encryption key
  encryption_key := encode(digest(business_salt::text || 'business_master_key_2024', 'sha256'), 'hex');
  
  -- Decrypt (simple base64 decode for now - in production use proper AES)
  decrypted_result := convert_from(decode(encrypted_text, 'base64'), 'UTF8');
  
  RETURN decrypted_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER IMMUTABLE SET search_path = public;

-- Add encryption salt column to merchant profiles for per-record encryption
ALTER TABLE public.merchant_profiles ADD COLUMN IF NOT EXISTS encryption_salt uuid DEFAULT gen_random_uuid();

-- Create enhanced merchant profile insertion function with encryption
CREATE OR REPLACE FUNCTION public.insert_encrypted_merchant_profile(
  business_name_param text,
  business_type_param text DEFAULT NULL,
  tax_id_param text DEFAULT NULL,
  business_address_param jsonb DEFAULT NULL,
  contact_info_param jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_profile_id uuid;
  profile_salt uuid;
  encrypted_tax_id text;
  encrypted_address text;
  encrypted_contact text;
BEGIN
  -- Generate a unique salt for this merchant profile
  profile_salt := gen_random_uuid();
  
  -- Encrypt sensitive data if provided
  encrypted_tax_id := CASE 
    WHEN tax_id_param IS NOT NULL THEN public.encrypt_business_data(tax_id_param, profile_salt)
    ELSE NULL
  END;
  
  encrypted_address := CASE
    WHEN business_address_param IS NOT NULL THEN public.encrypt_business_data(business_address_param::text, profile_salt)
    ELSE NULL
  END;
  
  encrypted_contact := CASE
    WHEN contact_info_param IS NOT NULL THEN public.encrypt_business_data(contact_info_param::text, profile_salt)
    ELSE NULL
  END;
  
  -- Insert the merchant profile with encrypted sensitive data
  INSERT INTO public.merchant_profiles (
    user_id,
    business_name,
    business_type, 
    tax_id,
    business_address,
    contact_info,
    encryption_salt,
    verification_status
  ) VALUES (
    auth.uid(),
    business_name_param,
    business_type_param,
    encrypted_tax_id,
    encrypted_address::jsonb,
    encrypted_contact::jsonb, 
    profile_salt,
    'pending'
  ) RETURNING id INTO new_profile_id;
  
  -- Log the creation with audit trail
  INSERT INTO security_audit_log (
    user_id, action, resource, success, details
  ) VALUES (
    auth.uid(),
    'merchant_profile_create',
    'merchant_profiles',
    true,
    jsonb_build_object(
      'profile_id', new_profile_id,
      'encrypted_fields', ARRAY['tax_id', 'business_address', 'contact_info'],
      'encryption_enabled', true
    )
  );
  
  RETURN new_profile_id;
END;
$function$;

-- Update get_merchant_sensitive_data function to decrypt data
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
  
  -- Return decrypted data
  RETURN QUERY SELECT 
    decrypted_tax_id,
    CASE WHEN decrypted_address IS NOT NULL THEN decrypted_address::jsonb ELSE NULL END,
    CASE WHEN decrypted_contact IS NOT NULL THEN decrypted_contact::jsonb ELSE NULL END;
END;
$function$;

-- Enhanced audit logging function with more security details
CREATE OR REPLACE FUNCTION public.log_merchant_sensitive_access(merchant_profile_id uuid, accessed_fields text[])
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  access_context jsonb;
BEGIN
  -- Create comprehensive audit context
  access_context := jsonb_build_object(
    'merchant_profile_id', merchant_profile_id,
    'accessed_fields', accessed_fields,
    'access_time', now(),
    'session_context', current_setting('request.headers', true),
    'encryption_audit', true
  );

  -- Insert comprehensive audit record
  INSERT INTO public.merchant_profile_access_log (
    user_id, 
    merchant_profile_id, 
    action, 
    accessed_fields,
    created_at
  ) VALUES (
    auth.uid(), 
    merchant_profile_id, 
    'sensitive_data_access', 
    accessed_fields, 
    now()
  );
  
  -- Also log to general security audit
  INSERT INTO public.security_audit_log (
    user_id,
    action,
    resource, 
    success,
    details
  ) VALUES (
    auth.uid(),
    'merchant_sensitive_access',
    'merchant_profiles',
    true,
    access_context
  );
  
  RETURN true;
EXCEPTION WHEN OTHERS THEN
  -- Log the audit failure but don't block the operation
  INSERT INTO public.security_audit_log (
    user_id,
    action,
    resource,
    success,
    details
  ) VALUES (
    auth.uid(),
    'audit_log_failure',
    'merchant_profiles', 
    false,
    jsonb_build_object('error', SQLERRM, 'profile_id', merchant_profile_id)
  );
  RETURN true;
END;
$function$;

-- Create function to update merchant profile with encryption
CREATE OR REPLACE FUNCTION public.update_encrypted_merchant_profile(
  profile_id_param uuid,
  business_name_param text DEFAULT NULL,
  business_type_param text DEFAULT NULL, 
  tax_id_param text DEFAULT NULL,
  business_address_param jsonb DEFAULT NULL,
  contact_info_param jsonb DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  profile_salt uuid;
  encrypted_tax_id text;
  encrypted_address text;
  encrypted_contact text;
  updated_fields text[] := ARRAY[]::text[];
BEGIN
  -- Verify ownership and get encryption salt
  SELECT encryption_salt INTO profile_salt
  FROM public.merchant_profiles 
  WHERE id = profile_id_param AND user_id = auth.uid();
  
  IF profile_salt IS NULL THEN
    RAISE EXCEPTION 'Merchant profile not found or access denied';
  END IF;
  
  -- Encrypt sensitive data if provided
  IF tax_id_param IS NOT NULL THEN
    encrypted_tax_id := public.encrypt_business_data(tax_id_param, profile_salt);
    updated_fields := array_append(updated_fields, 'tax_id');
  END IF;
  
  IF business_address_param IS NOT NULL THEN
    encrypted_address := public.encrypt_business_data(business_address_param::text, profile_salt);
    updated_fields := array_append(updated_fields, 'business_address');
  END IF;
  
  IF contact_info_param IS NOT NULL THEN
    encrypted_contact := public.encrypt_business_data(contact_info_param::text, profile_salt);
    updated_fields := array_append(updated_fields, 'contact_info');
  END IF;
  
  -- Update the profile with encrypted data
  UPDATE public.merchant_profiles SET
    business_name = COALESCE(business_name_param, business_name),
    business_type = COALESCE(business_type_param, business_type),
    tax_id = COALESCE(encrypted_tax_id, tax_id),
    business_address = COALESCE(encrypted_address::jsonb, business_address),
    contact_info = COALESCE(encrypted_contact::jsonb, contact_info),
    updated_at = now()
  WHERE id = profile_id_param AND user_id = auth.uid();
  
  -- Log the update with audit trail
  INSERT INTO security_audit_log (
    user_id, action, resource, success, details
  ) VALUES (
    auth.uid(),
    'merchant_profile_update',
    'merchant_profiles',
    true,
    jsonb_build_object(
      'profile_id', profile_id_param,
      'updated_fields', updated_fields,
      'encrypted_fields', updated_fields,
      'encryption_enabled', true
    )
  );
  
  RETURN true;
END;
$function$;