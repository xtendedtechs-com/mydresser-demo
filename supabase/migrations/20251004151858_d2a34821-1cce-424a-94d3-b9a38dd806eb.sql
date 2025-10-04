-- Fix search_path for calculate_vto_roi function (make it more secure)
CREATE OR REPLACE FUNCTION public.calculate_vto_roi(
  merchant_id_param UUID,
  start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  end_date DATE DEFAULT CURRENT_DATE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  total_sessions INTEGER;
  total_conversions INTEGER;
  conversion_rate NUMERIC;
  returns_avoided INTEGER;
  estimated_savings NUMERIC;
  result JSONB;
BEGIN
  -- Count total VTO sessions (fully qualified)
  SELECT COUNT(*) INTO total_sessions
  FROM public.vto_analytics
  WHERE merchant_id = merchant_id_param
    AND event_type = 'session_complete'
    AND created_at BETWEEN start_date AND end_date;
  
  -- Count conversions from VTO (fully qualified)
  SELECT COUNT(*) INTO total_conversions
  FROM public.vto_analytics
  WHERE merchant_id = merchant_id_param
    AND event_type = 'conversion'
    AND created_at BETWEEN start_date AND end_date;
  
  -- Calculate conversion rate
  IF total_sessions > 0 THEN
    conversion_rate := (total_conversions::NUMERIC / total_sessions) * 100;
  ELSE
    conversion_rate := 0;
  END IF;
  
  -- Count returns avoided (fully qualified)
  SELECT COUNT(*) INTO returns_avoided
  FROM public.vto_analytics
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
$$;