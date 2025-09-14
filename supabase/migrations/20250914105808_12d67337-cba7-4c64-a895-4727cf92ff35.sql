-- Ensure signup is disabled by default and require invitations
INSERT INTO admin_settings (setting_key, setting_value) 
VALUES ('signup_allowed', 'false'::jsonb)
ON CONFLICT (setting_key) DO UPDATE SET 
  setting_value = 'false'::jsonb,
  updated_at = now();

-- Add invitation management functions
CREATE OR REPLACE FUNCTION public.create_invitation_admin(
  invitation_email text,
  invited_by_admin uuid DEFAULT auth.uid()
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_token text;
  admin_role user_role;
  invitation_id uuid;
BEGIN
  -- Verify admin permissions
  SELECT role INTO admin_role FROM profiles WHERE user_id = auth.uid();
  IF admin_role != 'admin' THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;
  
  -- Generate secure token
  new_token := encode(gen_random_bytes(32), 'base64url');
  
  -- Create invitation
  INSERT INTO user_invitations (email, token, invited_by, expires_at)
  VALUES (
    invitation_email, 
    new_token, 
    invited_by_admin, 
    now() + interval '30 days'
  ) RETURNING id INTO invitation_id;
  
  -- Log the creation
  INSERT INTO security_audit_log (
    user_id, action, resource, success, details
  ) VALUES (
    auth.uid(),
    'invitation_created',
    'user_invitations',
    true,
    jsonb_build_object(
      'invitation_id', invitation_id,
      'email', invitation_email,
      'expires_at', now() + interval '30 days'
    )
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'token', new_token,
    'expires_at', now() + interval '30 days'
  );
END;
$$;

-- Function to list active invitations
CREATE OR REPLACE FUNCTION public.list_invitations_admin()
RETURNS TABLE(
  id uuid,
  email text,
  token text,
  invited_by uuid,
  expires_at timestamp with time zone,
  used_at timestamp with time zone,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_role user_role;
BEGIN
  SELECT role INTO admin_role FROM profiles WHERE user_id = auth.uid();
  IF admin_role != 'admin' THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;
  
  RETURN QUERY
  SELECT 
    ui.id, ui.email, ui.token, ui.invited_by, 
    ui.expires_at, ui.used_at, ui.created_at
  FROM user_invitations ui
  ORDER BY ui.created_at DESC;
END;
$$;

-- Function to revoke invitation
CREATE OR REPLACE FUNCTION public.revoke_invitation_admin(invitation_token text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_role user_role;
  invitation_id uuid;
BEGIN
  SELECT role INTO admin_role FROM profiles WHERE user_id = auth.uid();
  IF admin_role != 'admin' THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;
  
  -- Mark as used to effectively revoke
  UPDATE user_invitations 
  SET used_at = now()
  WHERE token = invitation_token AND used_at IS NULL
  RETURNING id INTO invitation_id;
  
  IF invitation_id IS NOT NULL THEN
    INSERT INTO security_audit_log (
      user_id, action, resource, success, details
    ) VALUES (
      auth.uid(),
      'invitation_revoked',
      'user_invitations',
      true,
      jsonb_build_object('revoked_invitation_id', invitation_id)
    );
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;