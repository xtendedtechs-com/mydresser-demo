-- Create user account deletion function for GDPR compliance
CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated to delete account';
  END IF;
  
  -- Log the deletion request
  INSERT INTO security_audit_log (
    user_id, action, resource, success, details
  ) VALUES (
    current_user_id,
    'account_deletion_requested',
    'auth.users',
    true,
    jsonb_build_object(
      'deletion_method', 'user_initiated',
      'compliance', 'GDPR_Article_17'
    )
  );
  
  -- The actual user deletion will be handled by Supabase Auth
  -- This function serves as an audit trail and validation point
  RETURN true;
END;
$$;

-- Enhanced bot detection and rate limiting
CREATE OR REPLACE FUNCTION public.detect_bot_patterns(
  user_agent_string text DEFAULT NULL,
  request_frequency integer DEFAULT 1,
  ip_address inet DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  bot_score integer := 0;
  bot_indicators text[] := ARRAY[]::text[];
  risk_level text := 'low';
BEGIN
  -- Check User-Agent patterns
  IF user_agent_string IS NOT NULL THEN
    -- Common bot indicators
    IF user_agent_string ~* '(bot|crawler|spider|scraper|wget|curl)' THEN
      bot_score := bot_score + 50;
      bot_indicators := array_append(bot_indicators, 'suspicious_user_agent');
    END IF;
    
    -- Very short or missing User-Agent
    IF length(user_agent_string) < 20 THEN
      bot_score := bot_score + 30;
      bot_indicators := array_append(bot_indicators, 'short_user_agent');
    END IF;
  END IF;
  
  -- Check request frequency (simplified version)
  IF request_frequency > 100 THEN
    bot_score := bot_score + 40;
    bot_indicators := array_append(bot_indicators, 'high_request_frequency');
  END IF;
  
  -- Determine risk level
  IF bot_score >= 70 THEN
    risk_level := 'high';
  ELSIF bot_score >= 40 THEN
    risk_level := 'medium';
  END IF;
  
  -- Log suspicious activity
  IF bot_score > 30 THEN
    INSERT INTO security_audit_log (
      user_id, action, resource, success, details
    ) VALUES (
      auth.uid(),
      'bot_detection_triggered',
      'rate_limits',
      true,
      jsonb_build_object(
        'bot_score', bot_score,
        'indicators', bot_indicators,
        'risk_level', risk_level,
        'user_agent', user_agent_string,
        'ip_address', ip_address
      )
    );
  END IF;
  
  RETURN jsonb_build_object(
    'bot_score', bot_score,
    'risk_level', risk_level,
    'indicators', bot_indicators,
    'blocked', bot_score >= 70
  );
END;
$$;

-- Enhanced rate limiting with bot detection
CREATE OR REPLACE FUNCTION public.enhanced_rate_limit_check(
  identifier_key text,
  action_type text,
  max_requests integer DEFAULT 10,
  window_minutes integer DEFAULT 60,
  user_agent_string text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count integer;
  window_start timestamp with time zone;
  bot_analysis jsonb;
  blocked boolean := false;
BEGIN
  window_start := now() - (window_minutes || ' minutes')::interval;
  
  -- Check for bot patterns first
  bot_analysis := public.detect_bot_patterns(user_agent_string, max_requests);
  
  -- If high bot score, apply stricter limits
  IF (bot_analysis->>'risk_level')::text = 'high' THEN
    max_requests := max_requests / 4; -- 75% reduction for suspected bots
  ELSIF (bot_analysis->>'risk_level')::text = 'medium' THEN
    max_requests := max_requests / 2; -- 50% reduction for suspicious activity
  END IF;
  
  -- Clean up old entries
  DELETE FROM rate_limits 
  WHERE window_start < now() - interval '24 hours';
  
  -- Get current count
  SELECT COALESCE(SUM(count), 0) INTO current_count
  FROM rate_limits
  WHERE identifier = identifier_key 
    AND action = action_type
    AND window_start > now() - (window_minutes || ' minutes')::interval;
  
  -- Check if limit exceeded
  IF current_count >= max_requests THEN
    blocked := true;
    
    -- Log rate limit violation
    INSERT INTO security_audit_log (
      user_id, action, resource, success, details
    ) VALUES (
      auth.uid(),
      'rate_limit_exceeded',
      'rate_limits',
      false,
      jsonb_build_object(
        'identifier', identifier_key,
        'action_type', action_type,
        'current_count', current_count,
        'limit', max_requests,
        'bot_analysis', bot_analysis
      )
    );
  ELSE
    -- Record this request
    INSERT INTO rate_limits (identifier, action, count, window_start)
    VALUES (identifier_key, action_type, 1, now())
    ON CONFLICT (identifier, action) DO UPDATE SET
      count = rate_limits.count + 1,
      window_start = GREATEST(rate_limits.window_start, window_start);
  END IF;
  
  RETURN jsonb_build_object(
    'allowed', NOT blocked,
    'current_count', current_count,
    'limit', max_requests,
    'bot_analysis', bot_analysis,
    'window_minutes', window_minutes
  );
END;
$$;