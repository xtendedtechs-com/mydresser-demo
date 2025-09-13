-- Fix Security Issue: Separate sensitive contact information from profiles table
-- This addresses the risk of exposing customer email addresses and social media profiles

-- Create a new table for sensitive contact information
CREATE TABLE public.profile_contact_info (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  email TEXT,
  social_instagram TEXT,
  social_facebook TEXT,
  social_tiktok TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security with strict policies
ALTER TABLE public.profile_contact_info ENABLE ROW LEVEL SECURITY;

-- Create very strict RLS policies - only the owner can access their contact info
CREATE POLICY "Users can only view their own contact info"
ON public.profile_contact_info
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own contact info"
ON public.profile_contact_info
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own contact info"
ON public.profile_contact_info
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own contact info"
ON public.profile_contact_info
FOR DELETE
USING (auth.uid() = user_id);

-- Migrate existing contact data to the new table
INSERT INTO public.profile_contact_info (user_id, email, social_instagram, social_facebook, social_tiktok)
SELECT user_id, email, social_instagram, social_facebook, social_tiktok
FROM public.profiles
WHERE email IS NOT NULL 
   OR social_instagram IS NOT NULL 
   OR social_facebook IS NOT NULL 
   OR social_tiktok IS NOT NULL;

-- Remove sensitive contact fields from profiles table
ALTER TABLE public.profiles DROP COLUMN IF EXISTS email;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS social_instagram;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS social_facebook;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS social_tiktok;

-- Create updated_at trigger for the new table
CREATE TRIGGER update_profile_contact_info_updated_at
BEFORE UPDATE ON public.profile_contact_info
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create a secure function to get contact info (only for the user themselves)
CREATE OR REPLACE FUNCTION public.get_user_contact_info()
RETURNS TABLE(
  email TEXT,
  social_instagram TEXT,
  social_facebook TEXT,
  social_tiktok TEXT
)
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    pci.email,
    pci.social_instagram,
    pci.social_facebook,
    pci.social_tiktok
  FROM public.profile_contact_info pci
  WHERE pci.user_id = auth.uid();
$$;

-- Add security documentation
COMMENT ON TABLE public.profile_contact_info 
IS 'SECURITY: Sensitive contact information separated from main profiles table with strict RLS policies. Only the user themselves can access their contact data.';

COMMENT ON FUNCTION public.get_user_contact_info()
IS 'SECURITY: Secure function to retrieve user contact information with proper authentication checks.';