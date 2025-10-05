-- Phase 29: Comprehensive Security Audit & Monitoring System

-- =====================================================
-- Security Incidents
-- =====================================================
CREATE TABLE IF NOT EXISTS public.security_incidents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  incident_type TEXT NOT NULL CHECK (incident_type IN (
    'unauthorized_access', 'data_breach', 'brute_force', 'suspicious_activity',
    'rate_limit_abuse', 'malware', 'phishing', 'credential_stuffing', 'other'
  )),
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low', 'info')),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  affected_resources TEXT[],
  incident_details JSONB NOT NULL DEFAULT '{}',
  threat_indicators JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'contained', 'resolved', 'false_positive')),
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolution_notes TEXT,
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.security_incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all security incidents"
  ON public.security_incidents FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Users can view their own incidents"
  ON public.security_incidents FOR SELECT
  USING (auth.uid() = user_id);

CREATE INDEX idx_security_incidents_severity ON public.security_incidents(severity, status);
CREATE INDEX idx_security_incidents_user ON public.security_incidents(user_id, detected_at DESC);
CREATE INDEX idx_security_incidents_detected ON public.security_incidents(detected_at DESC);

-- =====================================================
-- IP Reputation
-- =====================================================
CREATE TABLE IF NOT EXISTS public.ip_reputation (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address INET NOT NULL UNIQUE,
  reputation_score INTEGER DEFAULT 50 CHECK (reputation_score BETWEEN 0 AND 100),
  threat_level TEXT DEFAULT 'unknown' CHECK (threat_level IN ('safe', 'low', 'medium', 'high', 'critical', 'unknown')),
  is_blocked BOOLEAN DEFAULT false,
  block_reason TEXT,
  failed_attempts INTEGER DEFAULT 0,
  successful_logins INTEGER DEFAULT 0,
  last_seen_at TIMESTAMP WITH TIME ZONE,
  first_seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  country_code TEXT,
  asn TEXT,
  is_vpn BOOLEAN DEFAULT false,
  is_tor BOOLEAN DEFAULT false,
  is_proxy BOOLEAN DEFAULT false,
  threat_categories TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.ip_reputation ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage IP reputation"
  ON public.ip_reputation FOR ALL
  USING (is_admin(auth.uid()));

CREATE INDEX idx_ip_reputation_address ON public.ip_reputation(ip_address);
CREATE INDEX idx_ip_reputation_blocked ON public.ip_reputation(is_blocked) WHERE is_blocked = true;
CREATE INDEX idx_ip_reputation_score ON public.ip_reputation(reputation_score);

-- =====================================================
-- User Security Score
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_security_score (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  security_score INTEGER DEFAULT 100 CHECK (security_score BETWEEN 0 AND 100),
  risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('minimal', 'low', 'medium', 'high', 'critical')),
  failed_login_attempts INTEGER DEFAULT 0,
  successful_logins INTEGER DEFAULT 0,
  suspicious_activities INTEGER DEFAULT 0,
  rate_limit_violations INTEGER DEFAULT 0,
  mfa_enabled BOOLEAN DEFAULT false,
  password_last_changed TIMESTAMP WITH TIME ZONE,
  last_suspicious_activity TIMESTAMP WITH TIME ZONE,
  security_flags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_security_score ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own security score"
  ON public.user_security_score FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage security scores"
  ON public.user_security_score FOR ALL
  USING (true) WITH CHECK (true);

CREATE INDEX idx_user_security_score_user ON public.user_security_score(user_id);
CREATE INDEX idx_user_security_score_risk ON public.user_security_score(risk_level);

-- =====================================================
-- Session Security Log
-- =====================================================
CREATE TABLE IF NOT EXISTS public.session_security_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  device_fingerprint TEXT,
  location_data JSONB,
  session_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  session_end TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  anomaly_score INTEGER DEFAULT 0,
  security_flags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.session_security_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sessions"
  ON public.session_security_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage sessions"
  ON public.session_security_log FOR ALL
  USING (true) WITH CHECK (true);

CREATE INDEX idx_session_security_user ON public.session_security_log(user_id, session_start DESC);
CREATE INDEX idx_session_security_active ON public.session_security_log(is_active) WHERE is_active = true;

-- =====================================================
-- Data Access Patterns
-- =====================================================
CREATE TABLE IF NOT EXISTS public.data_access_patterns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_type TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  access_count INTEGER DEFAULT 1,
  time_window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT date_trunc('hour', now()),
  is_anomalous BOOLEAN DEFAULT false,
  anomaly_reasons TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.data_access_patterns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view access patterns"
  ON public.data_access_patterns FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "System can manage access patterns"
  ON public.data_access_patterns FOR ALL
  USING (true) WITH CHECK (true);

CREATE INDEX idx_data_access_user ON public.data_access_patterns(user_id, time_window_start DESC);
CREATE INDEX idx_data_access_anomalous ON public.data_access_patterns(is_anomalous) WHERE is_anomalous = true;

-- =====================================================
-- Security Alerts
-- =====================================================
CREATE TABLE IF NOT EXISTS public.security_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low', 'info')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  affected_users UUID[],
  alert_data JSONB DEFAULT '{}',
  is_acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID REFERENCES auth.users(id),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.security_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage security alerts"
  ON public.security_alerts FOR ALL
  USING (is_admin(auth.uid()));

CREATE INDEX idx_security_alerts_severity ON public.security_alerts(severity, resolved);
CREATE INDEX idx_security_alerts_created ON public.security_alerts(created_at DESC);

-- =====================================================
-- Compliance Audit Log
-- =====================================================
CREATE TABLE IF NOT EXISTS public.compliance_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  compliance_type TEXT NOT NULL CHECK (compliance_type IN ('gdpr', 'ccpa', 'pci_dss', 'hipaa', 'soc2')),
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  data_subject_id UUID,
  action_taken TEXT NOT NULL,
  legal_basis TEXT,
  consent_given BOOLEAN,
  data_categories TEXT[],
  processing_purpose TEXT,
  retention_period TEXT,
  event_details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.compliance_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view compliance logs"
  ON public.compliance_audit_log FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Users can view their own compliance records"
  ON public.compliance_audit_log FOR SELECT
  USING (auth.uid() = data_subject_id);

CREATE INDEX idx_compliance_audit_type ON public.compliance_audit_log(compliance_type, created_at DESC);
CREATE INDEX idx_compliance_audit_user ON public.compliance_audit_log(user_id);

-- =====================================================
-- Functions
-- =====================================================

-- Calculate User Security Score
CREATE OR REPLACE FUNCTION public.calculate_user_security_score(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_score INTEGER := 100;
  v_user_data RECORD;
BEGIN
  SELECT * INTO v_user_data
  FROM public.user_security_score
  WHERE user_id = p_user_id;
  
  IF v_user_data IS NULL THEN
    INSERT INTO public.user_security_score (user_id) VALUES (p_user_id);
    RETURN 100;
  END IF;
  
  -- Penalties
  v_score := v_score - (v_user_data.failed_login_attempts * 5);
  v_score := v_score - (v_user_data.suspicious_activities * 10);
  v_score := v_score - (v_user_data.rate_limit_violations * 3);
  
  -- Bonuses
  IF v_user_data.mfa_enabled THEN v_score := v_score + 10; END IF;
  IF v_user_data.password_last_changed > now() - interval '90 days' THEN v_score := v_score + 5; END IF;
  
  -- Clamp
  v_score := GREATEST(0, LEAST(100, v_score));
  
  -- Update score and risk level
  UPDATE public.user_security_score
  SET 
    security_score = v_score,
    risk_level = CASE
      WHEN v_score >= 90 THEN 'minimal'
      WHEN v_score >= 70 THEN 'low'
      WHEN v_score >= 50 THEN 'medium'
      WHEN v_score >= 30 THEN 'high'
      ELSE 'critical'
    END,
    updated_at = now()
  WHERE user_id = p_user_id;
  
  RETURN v_score;
END;
$$;

-- Check IP Reputation
CREATE OR REPLACE FUNCTION public.check_ip_reputation(p_ip_address INET)
RETURNS TABLE(
  reputation_score INTEGER,
  threat_level TEXT,
  is_blocked BOOLEAN
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_rep RECORD;
BEGIN
  SELECT * INTO v_rep
  FROM public.ip_reputation
  WHERE ip_address = p_ip_address;
  
  IF v_rep IS NULL THEN
    INSERT INTO public.ip_reputation (ip_address)
    VALUES (p_ip_address)
    RETURNING reputation_score, threat_level, is_blocked
    INTO v_rep;
  END IF;
  
  RETURN QUERY SELECT v_rep.reputation_score, v_rep.threat_level, v_rep.is_blocked;
END;
$$;

-- Log Security Incident
CREATE OR REPLACE FUNCTION public.log_security_incident(
  p_incident_type TEXT,
  p_severity TEXT,
  p_user_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_incident_id UUID;
BEGIN
  INSERT INTO public.security_incidents (
    incident_type, severity, user_id, incident_details, status
  ) VALUES (
    p_incident_type, p_severity, p_user_id, p_details, 'open'
  ) RETURNING id INTO v_incident_id;
  
  -- Create alert for high/critical incidents
  IF p_severity IN ('critical', 'high') THEN
    INSERT INTO public.security_alerts (
      alert_type, severity, title, message, affected_users
    ) VALUES (
      p_incident_type,
      p_severity,
      'Security Incident Detected',
      'A ' || p_severity || ' severity ' || p_incident_type || ' incident has been detected.',
      CASE WHEN p_user_id IS NOT NULL THEN ARRAY[p_user_id] ELSE ARRAY[]::UUID[] END
    );
  END IF;
  
  RETURN v_incident_id;
END;
$$;

-- Triggers
CREATE TRIGGER update_user_security_score_updated_at
  BEFORE UPDATE ON public.user_security_score
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ip_reputation_updated_at
  BEFORE UPDATE ON public.ip_reputation
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Permissions
GRANT EXECUTE ON FUNCTION public.calculate_user_security_score TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_ip_reputation TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_security_incident TO authenticated;