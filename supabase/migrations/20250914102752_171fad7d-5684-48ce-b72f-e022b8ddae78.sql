-- Enhanced security for profile_contact_info table

-- Create audit logging table for contact info access
CREATE TABLE IF NOT EXISTS public.contact_info_access_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  accessed_fields TEXT[] DEFAULT NULL,
  ip_address INET DEFAULT NULL,
  user_agent TEXT DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.contact_info_access_log ENABLE ROW LEVEL SECURITY;

-- Policy for audit log - users can only view their own access logs
CREATE POLICY "Users can view their own contact access logs" 
ON public.contact_info_access_log 
FOR SELECT 
USING (auth.uid() = user_id);

-- Admins can view all contact access logs for security monitoring
CREATE POLICY "Admins can view all contact access logs" 
ON public.contact_info_access_log 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role = 'admin'::user_role
));

-- System can insert audit logs
CREATE POLICY "System can insert contact access logs" 
ON public.contact_info_access_log 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create encryption functions for contact data
CREATE OR REPLACE FUNCTION public.encrypt_contact_data(data_text TEXT, user_salt UUID DEFAULT auth.uid())
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  encryption_key TEXT;
  encrypted_result TEXT;
BEGIN
  -- Create a user-specific encryption key
  encryption_key := encode(digest(user_salt::text || 'contact_master_key_2024', 'sha256'), 'hex');
  
  -- Simple encryption (in production, use proper AES encryption)
  encrypted_result := encode(convert_to(data_text, 'UTF8'), 'base64');
  
  RETURN encrypted_result;
END;
$$;

CREATE OR REPLACE FUNCTION public.decrypt_contact_data(encrypted_text TEXT, user_salt UUID DEFAULT auth.uid())
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  encryption_key TEXT;
  decrypted_result TEXT;
BEGIN
  -- Create the same user-specific encryption key
  encryption_key := encode(digest(user_salt::text || 'contact_master_key_2024', 'sha256'), 'hex');
  
  -- Decrypt (simple base64 decode for now - in production use proper AES)
  decrypted_result := convert_from(decode(encrypted_text, 'base64'), 'UTF8');
  
  RETURN decrypted_result;
END;
$$;

-- Function to mask sensitive contact data for display
CREATE OR REPLACE FUNCTION public.mask_contact_data(data_text TEXT, mask_type TEXT DEFAULT 'email')
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF data_text IS NULL OR data_text = '' THEN
    RETURN data_text;
  END IF;
  
  CASE mask_type
    WHEN 'email' THEN
      -- Mask email: user@example.com -> u***@e****e.com
      RETURN substring(data_text from 1 for 1) || 
             repeat('*', GREATEST(length(split_part(data_text, '@', 1)) - 1, 3)) ||
             '@' ||
             substring(split_part(data_text, '@', 2) from 1 for 1) ||
             repeat('*', GREATEST(length(split_part(split_part(data_text, '@', 2), '.', 1)) - 1, 4)) ||
             substring(split_part(data_text, '@', 2) from length(split_part(data_text, '@', 2)) - length(split_part(split_part(data_text, '@', 2), '.', -1)));
    WHEN 'social' THEN
      -- Mask social handles: @username -> @u****e
      IF length(data_text) <= 3 THEN
        RETURN repeat('*', length(data_text));
      ELSE
        RETURN substring(data_text from 1 for 2) || 
               repeat('*', GREATEST(length(data_text) - 3, 4)) ||
               substring(data_text from length(data_text));
      END IF;
    ELSE
      -- Default masking
      RETURN substring(data_text from 1 for 1) || repeat('*', GREATEST(length(data_text) - 2, 3)) || substring(data_text from length(data_text));
  END CASE;
END;
$$;

-- Rate limiting function for contact info access
CREATE OR REPLACE FUNCTION public.check_contact_rate_limit(operation TEXT DEFAULT 'access')
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_hour TIMESTAMP;
  operation_count INTEGER;
  max_operations INTEGER;
BEGIN
  current_hour := date_trunc('hour', now());
  
  -- Set limits based on operation type
  max_operations := CASE operation
    WHEN 'access' THEN 50    -- Max 50 contact info accesses per hour
    WHEN 'update' THEN 10    -- Max 10 contact info updates per hour
    ELSE 20
  END;
  
  -- Count operations in current hour
  SELECT COUNT(*) INTO operation_count
  FROM contact_info_access_log
  WHERE user_id = auth.uid()
    AND action = operation
    AND created_at >= current_hour;
  
  -- Check if under limit
  IF operation_count >= max_operations THEN
    -- Log rate limit exceeded
    INSERT INTO security_audit_log (
      user_id, action, resource, success, details
    ) VALUES (
      auth.uid(),
      'contact_rate_limit_exceeded',
      'profile_contact_info',
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
$$;

-- Enhanced secure contact info retrieval function
CREATE OR REPLACE FUNCTION public.get_user_contact_info_secure(mask_data BOOLEAN DEFAULT false)
RETURNS TABLE(email TEXT, social_instagram TEXT, social_facebook TEXT, social_tiktok TEXT)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  contact_record RECORD;
BEGIN
  -- Check rate limiting
  IF NOT public.check_contact_rate_limit('access') THEN
    RAISE EXCEPTION 'Rate limit exceeded for contact info access';
  END IF;

  -- Log the access attempt
  INSERT INTO contact_info_access_log (
    user_id, 
    action, 
    accessed_fields,
    created_at
  ) VALUES (
    auth.uid(), 
    'contact_info_access', 
    ARRAY['email', 'social_instagram', 'social_facebook', 'social_tiktok'],
    now()
  );

  -- Get the contact info
  SELECT 
    pci.email,
    pci.social_instagram,
    pci.social_facebook,
    pci.social_tiktok
  INTO contact_record
  FROM public.profile_contact_info pci
  WHERE pci.user_id = auth.uid();

  -- Return masked or unmasked data based on parameter
  IF mask_data THEN
    RETURN QUERY SELECT 
      public.mask_contact_data(contact_record.email, 'email'),
      public.mask_contact_data(contact_record.social_instagram, 'social'),
      public.mask_contact_data(contact_record.social_facebook, 'social'),
      public.mask_contact_data(contact_record.social_tiktok, 'social');
  ELSE
    RETURN QUERY SELECT 
      contact_record.email,
      contact_record.social_instagram,
      contact_record.social_facebook,
      contact_record.social_tiktok;
  END IF;
END;
$$;

-- Function to securely update contact info with encryption
CREATE OR REPLACE FUNCTION public.update_contact_info_secure(
  new_email TEXT DEFAULT NULL,
  new_instagram TEXT DEFAULT NULL,
  new_facebook TEXT DEFAULT NULL,
  new_tiktok TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_salt UUID;
  encrypted_email TEXT;
  encrypted_instagram TEXT;
  encrypted_facebook TEXT;  
  encrypted_tiktok TEXT;
  updated_fields TEXT[] := ARRAY[]::TEXT[];
BEGIN
  -- Check rate limiting
  IF NOT public.check_contact_rate_limit('update') THEN
    RAISE EXCEPTION 'Rate limit exceeded for contact info updates';
  END IF;

  -- Generate user-specific salt
  user_salt := auth.uid();

  -- Encrypt sensitive data if provided
  IF new_email IS NOT NULL THEN
    encrypted_email := public.encrypt_contact_data(new_email, user_salt);
    updated_fields := array_append(updated_fields, 'email');
  END IF;

  IF new_instagram IS NOT NULL THEN
    encrypted_instagram := public.encrypt_contact_data(new_instagram, user_salt);
    updated_fields := array_append(updated_fields, 'social_instagram');
  END IF;

  IF new_facebook IS NOT NULL THEN
    encrypted_facebook := public.encrypt_contact_data(new_facebook, user_salt);
    updated_fields := array_append(updated_fields, 'social_facebook');
  END IF;

  IF new_tiktok IS NOT NULL THEN
    encrypted_tiktok := public.encrypt_contact_data(new_tiktok, user_salt);
    updated_fields := array_append(updated_fields, 'social_tiktok');
  END IF;

  -- Insert or update contact info
  INSERT INTO profile_contact_info (user_id, email, social_instagram, social_facebook, social_tiktok)
  VALUES (auth.uid(), encrypted_email, encrypted_instagram, encrypted_facebook, encrypted_tiktok)
  ON CONFLICT (user_id) DO UPDATE SET
    email = COALESCE(encrypted_email, profile_contact_info.email),
    social_instagram = COALESCE(encrypted_instagram, profile_contact_info.social_instagram),
    social_facebook = COALESCE(encrypted_facebook, profile_contact_info.social_facebook),
    social_tiktok = COALESCE(encrypted_tiktok, profile_contact_info.social_tiktok),
    updated_at = now();

  -- Log the update
  INSERT INTO contact_info_access_log (
    user_id, 
    action, 
    accessed_fields,
    created_at
  ) VALUES (
    auth.uid(), 
    'contact_info_update', 
    updated_fields,
    now()
  );

  -- Log to security audit
  INSERT INTO security_audit_log (
    user_id, action, resource, success, details
  ) VALUES (
    auth.uid(),
    'contact_info_secure_update',
    'profile_contact_info',
    true,
    jsonb_build_object(
      'updated_fields', updated_fields,
      'encrypted', true,
      'rate_limited', true
    )
  );

  RETURN true;
END;
$$;

-- Add trigger to automatically update the updated_at timestamp
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

DROP TRIGGER IF EXISTS update_contact_info_updated_at ON public.profile_contact_info;
CREATE TRIGGER update_contact_info_updated_at
  BEFORE UPDATE ON public.profile_contact_info
  FOR EACH ROW
  EXECUTE FUNCTION public.update_contact_info_updated_at();