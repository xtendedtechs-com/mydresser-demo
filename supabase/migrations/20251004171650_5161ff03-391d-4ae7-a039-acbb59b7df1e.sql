-- CRITICAL SECURITY FIX: Create proper user roles system
-- This prevents privilege escalation attacks

-- 1. Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'merchant', 'professional', 'user');

-- 2. Create user_roles table with proper RLS
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  assigned_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 4. Create session validation function (was missing)
CREATE OR REPLACE FUNCTION public.validate_user_session_robust()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
  session_valid boolean := false;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if user exists and is not deleted
  SELECT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = current_user_id 
    AND deleted_at IS NULL
  ) INTO session_valid;
  
  RETURN session_valid;
END;
$$;

-- 5. Migrate existing roles from profiles to user_roles
INSERT INTO public.user_roles (user_id, role, assigned_by)
SELECT 
  user_id,
  role::text::public.app_role,
  user_id -- self-assigned for existing users
FROM public.profiles
WHERE role IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- 6. RLS policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- 7. Create data masking functions for sensitive data
CREATE OR REPLACE FUNCTION public.mask_email(email text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF email IS NULL THEN
    RETURN NULL;
  END IF;
  RETURN LEFT(split_part(email, '@', 1), 2) || '***@' || split_part(email, '@', 2);
END;
$$;

CREATE OR REPLACE FUNCTION public.mask_phone(phone text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF phone IS NULL THEN
    RETURN NULL;
  END IF;
  RETURN '***-***-' || RIGHT(phone, 4);
END;
$$;

-- 8. Create secure contact info access function
CREATE OR REPLACE FUNCTION public.get_profile_contact_safe()
RETURNS TABLE(
  email text,
  social_instagram text,
  social_facebook text,
  social_tiktok text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate session
  IF NOT public.validate_user_session_robust() THEN
    RAISE EXCEPTION 'Invalid session';
  END IF;
  
  -- Log access
  INSERT INTO public.contact_info_access_log (
    user_id, action, accessed_fields
  ) VALUES (
    auth.uid(),
    'secure_read',
    ARRAY['email', 'social_instagram', 'social_facebook', 'social_tiktok']
  );
  
  RETURN QUERY
  SELECT 
    pci.email,
    pci.social_instagram,
    pci.social_facebook,
    pci.social_tiktok
  FROM public.profile_contact_info pci
  WHERE pci.user_id = auth.uid();
END;
$$;

-- 9. Create secure merchant contact access function
CREATE OR REPLACE FUNCTION public.get_merchant_contact_public(page_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  page_record RECORD;
  safe_contact jsonb;
BEGIN
  SELECT merchant_id, contact_info INTO page_record
  FROM public.merchant_pages
  WHERE id = page_id AND is_published = true;
  
  IF NOT FOUND THEN
    RETURN '{}'::jsonb;
  END IF;
  
  -- Only return business email and website (no personal info)
  safe_contact := jsonb_build_object(
    'business_email', page_record.contact_info->>'business_email',
    'website', page_record.contact_info->>'website'
  );
  
  -- Log access
  INSERT INTO public.contact_info_access_log (
    user_id, action, accessed_fields
  ) VALUES (
    COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
    'merchant_contact_view',
    ARRAY['business_email', 'website']
  );
  
  RETURN safe_contact;
END;
$$;

-- 10. Update merchant_profiles RLS to use has_role
DROP POLICY IF EXISTS "Secure merchant profile select" ON public.merchant_profiles;
DROP POLICY IF EXISTS "Secure merchant profile insert" ON public.merchant_profiles;
DROP POLICY IF EXISTS "Secure merchant profile update" ON public.merchant_profiles;
DROP POLICY IF EXISTS "Secure merchant profile delete" ON public.merchant_profiles;
DROP POLICY IF EXISTS "Users can manage their own merchant profile" ON public.merchant_profiles;

CREATE POLICY "Merchants can view own profile"
ON public.merchant_profiles
FOR SELECT
USING (
  auth.uid() = user_id 
  AND public.has_role(auth.uid(), 'merchant')
);

CREATE POLICY "Merchants can create own profile"
ON public.merchant_profiles
FOR INSERT
WITH CHECK (
  auth.uid() = user_id 
  AND public.has_role(auth.uid(), 'merchant')
);

CREATE POLICY "Merchants can update own profile"
ON public.merchant_profiles
FOR UPDATE
USING (
  auth.uid() = user_id 
  AND public.has_role(auth.uid(), 'merchant')
);

CREATE POLICY "Merchants can delete own profile"
ON public.merchant_profiles
FOR DELETE
USING (
  auth.uid() = user_id 
  AND public.has_role(auth.uid(), 'merchant')
);

-- 11. Secure orders table - prevent direct customer data access
DROP POLICY IF EXISTS "Merchants can manage their orders" ON public.orders;

CREATE POLICY "Merchants can view order IDs only"
ON public.orders
FOR SELECT
USING (
  merchant_id = auth.uid() 
  AND public.has_role(auth.uid(), 'merchant')
);

CREATE POLICY "Merchants can update order status"
ON public.orders
FOR UPDATE
USING (
  merchant_id = auth.uid() 
  AND public.has_role(auth.uid(), 'merchant')
)
WITH CHECK (
  merchant_id = auth.uid() 
  AND public.has_role(auth.uid(), 'merchant')
);

-- 12. Add search_path to existing critical functions
CREATE OR REPLACE FUNCTION public.is_merchant(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(COALESCE(_user_id, auth.uid()), 'merchant');
$$;

-- 13. Create admin check function
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(COALESCE(_user_id, auth.uid()), 'admin');
$$;

-- 14. Update handle_new_user to use user_roles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name')
  );
  
  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  -- If merchant signup, assign merchant role and create profile
  IF NEW.raw_user_meta_data->>'user_type' = 'merchant' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'merchant')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    INSERT INTO public.merchant_profiles (
      user_id, business_name, business_type, verification_status
    ) VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'business_name', 'Business Name'),
      COALESCE(NEW.raw_user_meta_data->>'business_type', 'Fashion Retailer'),
      'pending'
    );
  END IF;
  
  RETURN NEW;
END;
$$;