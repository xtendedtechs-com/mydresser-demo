-- Fix last remaining function without proper search_path

CREATE OR REPLACE FUNCTION public.calculate_vto_roi(
  merchant_id_param uuid, 
  start_date date DEFAULT (CURRENT_DATE - '30 days'::interval), 
  end_date date DEFAULT CURRENT_DATE
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
DECLARE
  total_sessions INTEGER;
  total_conversions INTEGER;
  conversion_rate NUMERIC;
  returns_avoided INTEGER;
  estimated_savings NUMERIC;
  result JSONB;
BEGIN
  -- Count total VTO sessions
  SELECT COUNT(*) INTO total_sessions
  FROM vto_analytics
  WHERE merchant_id = merchant_id_param
    AND event_type = 'session_complete'
    AND created_at BETWEEN start_date AND end_date;
  
  -- Count conversions from VTO
  SELECT COUNT(*) INTO total_conversions
  FROM vto_analytics
  WHERE merchant_id = merchant_id_param
    AND event_type = 'conversion'
    AND created_at BETWEEN start_date AND end_date;
  
  -- Calculate conversion rate
  IF total_sessions > 0 THEN
    conversion_rate := (total_conversions::NUMERIC / total_sessions) * 100;
  ELSE
    conversion_rate := 0;
  END IF;
  
  -- Count returns avoided
  SELECT COUNT(*) INTO returns_avoided
  FROM vto_analytics
  WHERE merchant_id = merchant_id_param
    AND event_type = 'return_avoided'
    AND created_at BETWEEN start_date AND end_date;
  
  -- Estimate savings (assuming $50 average return cost)
  estimated_savings := returns_avoided * 50;
  
  result := jsonb_build_object(
    'total_sessions', total_sessions,
    'total_conversions', total_conversions,
    'conversion_rate', conversion_rate,
    'returns_avoided', returns_avoided,
    'estimated_savings', estimated_savings,
    'period_start', start_date,
    'period_end', end_date
  );
  
  RETURN result;
END;
$function$;