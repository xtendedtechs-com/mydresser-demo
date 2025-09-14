-- Fix security definer view issue

-- Recreate the safe_contact_info view without SECURITY DEFINER
DROP VIEW IF EXISTS public.safe_contact_info;

CREATE VIEW public.safe_contact_info AS
SELECT 
  user_id,
  CASE 
    WHEN auth.uid() = user_id THEN email
    ELSE NULL
  END as email,
  CASE 
    WHEN auth.uid() = user_id THEN social_instagram
    ELSE NULL
  END as social_instagram,
  CASE 
    WHEN auth.uid() = user_id THEN social_facebook
    ELSE NULL
  END as social_facebook,
  CASE 
    WHEN auth.uid() = user_id THEN social_tiktok
    ELSE NULL
  END as social_tiktok,
  created_at,
  updated_at
FROM public.profile_contact_info
WHERE auth.uid() = user_id AND public.validate_user_session();

-- The view doesn't need security_barrier since it has built-in RLS protection