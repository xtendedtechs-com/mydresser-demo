-- Create trigger to automatically set merchant role and create merchant profile on signup
CREATE OR REPLACE FUNCTION public.handle_merchant_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Check if user_type is merchant from metadata
  IF NEW.raw_user_meta_data->>'user_type' = 'merchant' THEN
    -- Update the profile to merchant role
    UPDATE public.profiles 
    SET role = 'merchant'::user_role 
    WHERE user_id = NEW.id;
    
    -- Create merchant profile if it doesn't exist
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

-- Create trigger that fires after user creation
DROP TRIGGER IF EXISTS on_merchant_user_created ON auth.users;
CREATE TRIGGER on_merchant_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_merchant_signup();