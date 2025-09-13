-- Fix security definer view issue
-- Drop and recreate the view without security definer property
DROP VIEW IF EXISTS public.user_mfa_status;

-- Create regular view (not security definer) that relies on RLS
CREATE VIEW public.user_mfa_status AS
SELECT 
  id,
  user_id,
  totp_enabled,
  phone_verified,
  phone_number,
  CASE WHEN backup_codes IS NOT NULL 
       THEN array_length(backup_codes, 1) 
       ELSE 0 
  END as backup_codes_count,
  created_at,
  updated_at
FROM public.user_mfa_settings;