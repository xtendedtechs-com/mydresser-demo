-- Fix merchant signup trigger order issue
-- The handle_new_user trigger creates profile with default role first,
-- then handle_merchant_signup tries to insert but fails due to existing profile
-- We need to fix the merchant trigger to properly handle this

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if this is a merchant signup - if so, create merchant profile directly
  IF NEW.raw_user_meta_data->>'user_type' = 'merchant' THEN
    INSERT INTO public.profiles (user_id, email, full_name, role)
    VALUES (
      NEW.id, 
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
      'merchant'::user_role
    );
  ELSE
    -- Regular user signup
    INSERT INTO public.profiles (user_id, email, full_name)
    VALUES (
      NEW.id, 
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name')
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Simplify merchant signup trigger since handle_new_user now handles merchant profiles correctly
CREATE OR REPLACE FUNCTION public.handle_merchant_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.raw_user_meta_data->>'user_type' = 'merchant' THEN
    -- Only create merchant profile (profile already created by handle_new_user with correct role)
    INSERT INTO public.merchant_profiles (
      user_id, business_name, business_type, verification_status
    )
    SELECT NEW.id,
           COALESCE(NEW.raw_user_meta_data->>'business_name', 'Business Name'),
           COALESCE(NEW.raw_user_meta_data->>'business_type', 'Fashion Retailer'),
           'pending'
    WHERE NOT EXISTS (
      SELECT 1 FROM public.merchant_profiles mp WHERE mp.user_id = NEW.id
    );
  END IF;

  RETURN NEW;
END;
$$;