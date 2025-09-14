-- Add unique constraint on user_id and create sample merchant profile
ALTER TABLE public.merchant_profiles ADD CONSTRAINT merchant_profiles_user_id_key UNIQUE (user_id);

-- Create a sample merchant profile for testing
INSERT INTO public.merchant_profiles (user_id, business_name, business_type, verification_status)
VALUES (auth.uid(), 'Sample Merchant Store', 'retail', 'verified');