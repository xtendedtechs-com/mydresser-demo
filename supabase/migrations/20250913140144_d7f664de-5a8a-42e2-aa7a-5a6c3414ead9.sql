-- Create secure view for MFA status (no secrets exposed)
CREATE OR REPLACE VIEW public.user_mfa_status AS
SELECT 
  id,
  user_id,
  totp_enabled,
  phone_verified,
  phone_number, -- Phone number is less sensitive, can be shown
  CASE WHEN backup_codes IS NOT NULL 
       THEN array_length(backup_codes, 1) 
       ELSE 0 
  END as backup_codes_count,
  created_at,
  updated_at
FROM public.user_mfa_settings
WHERE user_id = auth.uid();

-- Enable RLS on the view (security barrier)
ALTER VIEW public.user_mfa_status SET (security_barrier = true);

-- Grant appropriate permissions
GRANT SELECT ON public.user_mfa_status TO authenticated;