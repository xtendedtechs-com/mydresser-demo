-- Remove all potential SECURITY DEFINER views

-- Check for any other security definer views and recreate them properly
DROP VIEW IF EXISTS public.safe_contact_info CASCADE;

-- Recreate as a simple view without any security definer properties
CREATE VIEW public.safe_contact_info AS
SELECT 
  pci.user_id,
  pci.email,
  pci.social_instagram,
  pci.social_facebook,
  pci.social_tiktok,
  pci.created_at,
  pci.updated_at
FROM public.profile_contact_info pci
WHERE pci.user_id = auth.uid();

-- Enable RLS on the underlying table (already enabled, but ensuring it)
ALTER TABLE public.profile_contact_info ENABLE ROW LEVEL SECURITY;