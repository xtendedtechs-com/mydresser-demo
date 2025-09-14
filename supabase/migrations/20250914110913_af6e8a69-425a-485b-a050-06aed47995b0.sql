-- Harden contact info access: block direct SELECT on profile_contact_info
DO $$
BEGIN
  -- Drop existing SELECT policy if present
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='profile_contact_info' 
      AND policyname='Robust contact info select policy' AND cmd='SELECT'
  ) THEN
    DROP POLICY "Robust contact info select policy" ON public.profile_contact_info;
  END IF;
END $$;

-- Optional: document intent with a deny-all select policy (USING false)
CREATE POLICY "No direct select on contact info" ON public.profile_contact_info
FOR SELECT
USING (false);

-- Keep INSERT/UPDATE/DELETE policies as-is to allow user-managed updates and deletions
-- All reads must go through SECURITY DEFINER RPC: get_user_contact_info_secure(mask_data boolean)

-- Audit log of policy hardening
INSERT INTO security_audit_log (action, resource, success, details)
VALUES (
  'policy_update',
  'profile_contact_info',
  true,
  jsonb_build_object('change', 'disable_direct_select', 'timestamp', now())
);