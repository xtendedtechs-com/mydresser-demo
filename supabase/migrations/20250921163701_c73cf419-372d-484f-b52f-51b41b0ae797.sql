-- Harden merchant signup trigger to avoid ON CONFLICT dependency and duplicate-trigger issues
CREATE OR REPLACE FUNCTION public.handle_merchant_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.raw_user_meta_data->>'user_type' = 'merchant' THEN
    -- Ensure profile exists (idempotent)
    INSERT INTO public.profiles (user_id, email, full_name, role)
    SELECT NEW.id,
           NEW.email,
           COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
           'merchant'::user_role
    WHERE NOT EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.user_id = NEW.id
    );

    -- Upgrade role if needed
    UPDATE public.profiles
    SET role = 'merchant'::user_role,
        updated_at = now()
    WHERE user_id = NEW.id AND role <> 'merchant'::user_role;

    -- Ensure merchant profile exists (idempotent)
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