-- Phase 26: Virtual Try-On (MyMirror) Security & Rate Limiting

-- =====================================================
-- VTO Generation Audit Log
-- =====================================================
CREATE TABLE IF NOT EXISTS public.vto_generation_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wardrobe_item_id UUID REFERENCES public.wardrobe_items(id) ON DELETE SET NULL,
  user_photo_url TEXT,
  result_url TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'success', 'failed')),
  error_message TEXT,
  processing_time_ms INTEGER,
  image_size_bytes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.vto_generation_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own VTO logs"
  ON public.vto_generation_log
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert VTO logs"
  ON public.vto_generation_log
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update VTO logs"
  ON public.vto_generation_log
  FOR UPDATE
  USING (true);

-- Indexes for performance
CREATE INDEX idx_vto_log_user_created ON public.vto_generation_log(user_id, created_at DESC);
CREATE INDEX idx_vto_log_status ON public.vto_generation_log(status);

-- =====================================================
-- VTO Rate Limiting
-- =====================================================
CREATE TABLE IF NOT EXISTS public.vto_rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hourly_count INTEGER NOT NULL DEFAULT 0,
  daily_count INTEGER NOT NULL DEFAULT 0,
  last_generation_at TIMESTAMP WITH TIME ZONE,
  hourly_reset_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '1 hour'),
  daily_reset_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (date_trunc('day', now() + interval '1 day')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.vto_rate_limits ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own rate limits"
  ON public.vto_rate_limits
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage rate limits"
  ON public.vto_rate_limits
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Index for quick lookups
CREATE INDEX idx_vto_rate_limits_user ON public.vto_rate_limits(user_id);

-- =====================================================
-- VTO Quality Metrics
-- =====================================================
CREATE TABLE IF NOT EXISTS public.vto_quality_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vto_log_id UUID NOT NULL REFERENCES public.vto_generation_log(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quality_rating INTEGER CHECK (quality_rating BETWEEN 1 AND 5),
  feedback_comment TEXT,
  reported_issues TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vto_quality_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own quality metrics"
  ON public.vto_quality_metrics
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quality metrics"
  ON public.vto_quality_metrics
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Index
CREATE INDEX idx_vto_quality_user ON public.vto_quality_metrics(user_id, created_at DESC);
CREATE INDEX idx_vto_quality_log ON public.vto_quality_metrics(vto_log_id);

-- =====================================================
-- Rate Limit Check Function
-- =====================================================
CREATE OR REPLACE FUNCTION public.check_vto_rate_limit(p_user_id UUID)
RETURNS TABLE(
  allowed BOOLEAN,
  hourly_remaining INTEGER,
  daily_remaining INTEGER,
  reset_time TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_hourly_limit INTEGER := 10;
  v_daily_limit INTEGER := 50;
  v_hourly_count INTEGER;
  v_daily_count INTEGER;
  v_hourly_reset TIMESTAMP WITH TIME ZONE;
  v_daily_reset TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get or create rate limit record
  INSERT INTO public.vto_rate_limits (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Get current counts
  SELECT 
    CASE 
      WHEN hourly_reset_at < now() THEN 0 
      ELSE hourly_count 
    END,
    CASE 
      WHEN daily_reset_at < now() THEN 0 
      ELSE daily_count 
    END,
    CASE 
      WHEN hourly_reset_at < now() THEN now() + interval '1 hour'
      ELSE hourly_reset_at
    END,
    CASE 
      WHEN daily_reset_at < now() THEN date_trunc('day', now() + interval '1 day')
      ELSE daily_reset_at
    END
  INTO v_hourly_count, v_daily_count, v_hourly_reset, v_daily_reset
  FROM public.vto_rate_limits
  WHERE user_id = p_user_id;
  
  -- Return result
  RETURN QUERY SELECT 
    (v_hourly_count < v_hourly_limit AND v_daily_count < v_daily_limit)::BOOLEAN,
    (v_hourly_limit - v_hourly_count)::INTEGER,
    (v_daily_limit - v_daily_count)::INTEGER,
    v_hourly_reset;
END;
$$;

-- =====================================================
-- Log VTO Generation Function
-- =====================================================
CREATE OR REPLACE FUNCTION public.log_vto_generation(
  p_user_id UUID,
  p_wardrobe_item_id UUID,
  p_user_photo_url TEXT,
  p_status TEXT,
  p_result_url TEXT DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL,
  p_processing_time_ms INTEGER DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  -- Insert log entry
  INSERT INTO public.vto_generation_log (
    user_id,
    wardrobe_item_id,
    user_photo_url,
    status,
    result_url,
    error_message,
    processing_time_ms,
    completed_at
  ) VALUES (
    p_user_id,
    p_wardrobe_item_id,
    p_user_photo_url,
    p_status,
    p_result_url,
    p_error_message,
    p_processing_time_ms,
    CASE WHEN p_status IN ('success', 'failed') THEN now() ELSE NULL END
  )
  RETURNING id INTO v_log_id;
  
  -- Update rate limits if successful
  IF p_status = 'success' THEN
    INSERT INTO public.vto_rate_limits (
      user_id,
      hourly_count,
      daily_count,
      last_generation_at
    ) VALUES (
      p_user_id,
      1,
      1,
      now()
    )
    ON CONFLICT (user_id) DO UPDATE SET
      hourly_count = CASE 
        WHEN vto_rate_limits.hourly_reset_at < now() THEN 1
        ELSE vto_rate_limits.hourly_count + 1
      END,
      daily_count = CASE 
        WHEN vto_rate_limits.daily_reset_at < now() THEN 1
        ELSE vto_rate_limits.daily_count + 1
      END,
      hourly_reset_at = CASE 
        WHEN vto_rate_limits.hourly_reset_at < now() THEN now() + interval '1 hour'
        ELSE vto_rate_limits.hourly_reset_at
      END,
      daily_reset_at = CASE 
        WHEN vto_rate_limits.daily_reset_at < now() THEN date_trunc('day', now() + interval '1 day')
        ELSE vto_rate_limits.daily_reset_at
      END,
      last_generation_at = now(),
      updated_at = now();
  END IF;
  
  RETURN v_log_id;
END;
$$;

-- =====================================================
-- Analyze VTO Quality Function
-- =====================================================
CREATE OR REPLACE FUNCTION public.analyze_vto_quality(
  p_log_id UUID,
  p_quality_rating INTEGER,
  p_feedback_comment TEXT DEFAULT NULL,
  p_reported_issues TEXT[] DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_metric_id UUID;
  v_user_id UUID;
BEGIN
  -- Get user_id from log
  SELECT user_id INTO v_user_id
  FROM public.vto_generation_log
  WHERE id = p_log_id;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'VTO log not found';
  END IF;
  
  -- Insert quality metric
  INSERT INTO public.vto_quality_metrics (
    vto_log_id,
    user_id,
    quality_rating,
    feedback_comment,
    reported_issues
  ) VALUES (
    p_log_id,
    v_user_id,
    p_quality_rating,
    p_feedback_comment,
    p_reported_issues
  )
  RETURNING id INTO v_metric_id;
  
  RETURN v_metric_id;
END;
$$;

-- =====================================================
-- Trigger for updated_at
-- =====================================================
CREATE TRIGGER update_vto_rate_limits_updated_at
  BEFORE UPDATE ON public.vto_rate_limits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- Grant necessary permissions
-- =====================================================
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT ON public.vto_generation_log TO authenticated;
GRANT SELECT ON public.vto_rate_limits TO authenticated;
GRANT SELECT, INSERT ON public.vto_quality_metrics TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_vto_rate_limit TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_vto_generation TO authenticated;
GRANT EXECUTE ON FUNCTION public.analyze_vto_quality TO authenticated;