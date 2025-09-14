-- Create a sample merchant profile for testing (replace with actual business info)
INSERT INTO public.merchant_profiles (user_id, business_name, business_type, verification_status)
VALUES (auth.uid(), 'Sample Merchant Store', 'retail', 'verified')
ON CONFLICT (user_id) DO NOTHING;