-- Fix ambiguous column reference in enhanced_rate_limit_check function
CREATE OR REPLACE FUNCTION public.enhanced_rate_limit_check(identifier_key text, action_type text, max_requests integer DEFAULT 10, window_minutes integer DEFAULT 60, user_agent_string text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_count integer;
  current_window_start timestamp with time zone;
  bot_analysis jsonb;
  blocked boolean := false;
BEGIN
  current_window_start := now() - (window_minutes || ' minutes')::interval;
  
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
  WHERE rate_limits.window_start < now() - interval '24 hours';
  
  -- Get current count
  SELECT COALESCE(SUM(count), 0) INTO current_count
  FROM rate_limits
  WHERE identifier = identifier_key 
    AND action = action_type
    AND rate_limits.window_start > current_window_start;
  
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
      window_start = GREATEST(rate_limits.window_start, current_window_start);
  END IF;
  
  RETURN jsonb_build_object(
    'allowed', NOT blocked,
    'current_count', current_count,
    'limit', max_requests,
    'bot_analysis', bot_analysis,
    'window_minutes', window_minutes
  );
END;
$function$;