-- **CRITICAL SECURITY FIXES**

-- Fix broken merchant profile RLS policy
DROP POLICY IF EXISTS "Highly restricted merchant profile access" ON public.merchant_profiles;

-- Create proper RLS policy for merchant profiles (owner access only)
CREATE POLICY "Merchants can only access their own profile"
ON public.merchant_profiles
FOR ALL
USING (auth.uid() = user_id);

-- Restrict emotes table to authenticated users only (prevent competitor copying)
DROP POLICY IF EXISTS "Anyone can view emotes" ON public.emotes;
CREATE POLICY "Only authenticated users can view emotes"
ON public.emotes
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Restrict reactions to authenticated users only (prevent tracking)
DROP POLICY IF EXISTS "Users can view all reactions" ON public.reactions;
CREATE POLICY "Users can only view reactions they're involved with"
ON public.reactions 
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND (
    auth.uid() = user_id OR 
    target_type = 'public_item'
  )
);

-- **SIGNUP RESTRICTION SYSTEM**
-- Create admin_settings table for controlling signup access
CREATE TABLE IF NOT EXISTS public.admin_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on admin settings
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can access admin settings
CREATE POLICY "Only admins can manage admin settings"
ON public.admin_settings
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Insert signup restriction setting (disabled by default)
INSERT INTO public.admin_settings (setting_key, setting_value) 
VALUES ('signup_enabled', '{"enabled": false, "reason": "Invite only during production launch"}'::jsonb)
ON CONFLICT (setting_key) DO NOTHING;

-- Create invitation system
CREATE TABLE IF NOT EXISTS public.user_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on invitations
ALTER TABLE public.user_invitations ENABLE ROW LEVEL SECURITY;

-- Policies for invitations
CREATE POLICY "Admins can manage invitations"
ON public.user_invitations
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- **SECURITY AUDIT LOG**
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource TEXT,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN NOT NULL DEFAULT true,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only admins can view security audit logs"
ON public.security_audit_log
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- **MFA SUPPORT TABLES**
CREATE TABLE IF NOT EXISTS public.user_mfa_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number TEXT,
  phone_verified BOOLEAN DEFAULT false,
  totp_secret TEXT,
  totp_enabled BOOLEAN DEFAULT false,
  backup_codes TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on MFA settings
ALTER TABLE public.user_mfa_settings ENABLE ROW LEVEL SECURITY;

-- Users can only access their own MFA settings
CREATE POLICY "Users can manage their own MFA settings"
ON public.user_mfa_settings
FOR ALL
USING (auth.uid() = user_id);

-- **RATE LIMITING TABLES**
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier TEXT NOT NULL, -- IP address or user ID
  action TEXT NOT NULL, -- login, signup, api_call, etc.
  count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(identifier, action, window_start)
);

-- Enable RLS on rate limits (system managed)
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Only system/admin can access rate limits
CREATE POLICY "Only system can manage rate limits"
ON public.rate_limits
FOR ALL
USING (false); -- No user access, system only

-- **SECURITY INDEXES FOR PERFORMANCE**
CREATE INDEX IF NOT EXISTS idx_security_audit_user_id ON public.security_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_action ON public.security_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_security_audit_created_at ON public.security_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier ON public.rate_limits(identifier);
CREATE INDEX IF NOT EXISTS idx_rate_limits_action ON public.rate_limits(action);
CREATE INDEX IF NOT EXISTS idx_user_invitations_token ON public.user_invitations(token);
CREATE INDEX IF NOT EXISTS idx_user_invitations_email ON public.user_invitations(email);