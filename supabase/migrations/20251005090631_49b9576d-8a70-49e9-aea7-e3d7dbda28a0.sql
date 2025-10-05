-- Phase 33: AI-Powered Style Assistant & Personalization Engine
-- Intelligent style recommendations with comprehensive security

-- User Style Profiles with AI analysis
CREATE TABLE IF NOT EXISTS public.user_style_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  style_personality TEXT[] DEFAULT ARRAY[]::TEXT[],
  color_palette JSONB DEFAULT '{"primary": [], "secondary": [], "accent": []}',
  body_type TEXT,
  preferred_fits TEXT[] DEFAULT ARRAY[]::TEXT[],
  style_preferences JSONB DEFAULT '{}',
  budget_range JSONB DEFAULT '{"min": 0, "max": 1000}',
  sustainability_preference TEXT DEFAULT 'medium' CHECK (sustainability_preference IN ('low', 'medium', 'high')),
  brand_preferences TEXT[] DEFAULT ARRAY[]::TEXT[],
  avoided_brands TEXT[] DEFAULT ARRAY[]::TEXT[],
  occasion_frequency JSONB DEFAULT '{}',
  style_evolution_data JSONB DEFAULT '[]',
  last_analysis_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- AI Chat Sessions for style advice
CREATE TABLE IF NOT EXISTS public.ai_style_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_type TEXT NOT NULL CHECK (session_type IN ('style_advice', 'outfit_help', 'shopping_assistant', 'wardrobe_analysis')),
  conversation_history JSONB DEFAULT '[]',
  context_data JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  total_messages INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- AI Style Recommendations log
CREATE TABLE IF NOT EXISTS public.ai_style_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  recommendation_type TEXT NOT NULL CHECK (recommendation_type IN ('outfit', 'item', 'color', 'style', 'occasion')),
  recommendation_data JSONB NOT NULL,
  reasoning TEXT,
  confidence_score NUMERIC(3,2) DEFAULT 0.80,
  context JSONB DEFAULT '{}',
  was_accepted BOOLEAN,
  user_feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Style Analysis History
CREATE TABLE IF NOT EXISTS public.style_analysis_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  analysis_type TEXT NOT NULL CHECK (analysis_type IN ('color_analysis', 'body_type', 'style_personality', 'wardrobe_audit')),
  analysis_results JSONB NOT NULL,
  insights TEXT[],
  recommendations TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);

-- AI Usage Tracking for rate limiting
CREATE TABLE IF NOT EXISTS public.ai_usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  service_type TEXT NOT NULL CHECK (service_type IN ('chat', 'recommendation', 'analysis', 'image_generation')),
  tokens_used INTEGER DEFAULT 0,
  cost_credits NUMERIC(10,4) DEFAULT 0,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Style Trend Analysis
CREATE TABLE IF NOT EXISTS public.style_trends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trend_name TEXT NOT NULL,
  trend_category TEXT NOT NULL,
  description TEXT,
  popularity_score INTEGER DEFAULT 50,
  season TEXT[] DEFAULT ARRAY[]::TEXT[],
  demographics JSONB DEFAULT '{}',
  related_items JSONB DEFAULT '[]',
  trend_status TEXT DEFAULT 'emerging' CHECK (trend_status IN ('emerging', 'trending', 'mainstream', 'declining')),
  first_detected_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Personal Style Evolution tracking
CREATE TABLE IF NOT EXISTS public.style_evolution_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  style_metrics JSONB NOT NULL,
  outfit_choices JSONB DEFAULT '[]',
  color_usage JSONB DEFAULT '{}',
  brand_diversity NUMERIC(3,2),
  experimentation_score NUMERIC(3,2),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Occasion-based outfit templates
CREATE TABLE IF NOT EXISTS public.occasion_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  occasion_name TEXT NOT NULL,
  occasion_category TEXT NOT NULL,
  formality_level INTEGER DEFAULT 5 CHECK (formality_level BETWEEN 1 AND 10),
  season_suitability TEXT[] DEFAULT ARRAY[]::TEXT[],
  weather_conditions JSONB DEFAULT '{}',
  time_of_day TEXT[] DEFAULT ARRAY[]::TEXT[],
  template_rules JSONB NOT NULL,
  example_outfits JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- AI Rate Limit Configuration per user tier
CREATE TABLE IF NOT EXISTS public.ai_rate_limits_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_tier TEXT NOT NULL UNIQUE CHECK (user_tier IN ('free', 'basic', 'premium', 'unlimited')),
  daily_chat_messages INTEGER DEFAULT 50,
  daily_recommendations INTEGER DEFAULT 20,
  daily_analyses INTEGER DEFAULT 5,
  daily_image_generations INTEGER DEFAULT 10,
  max_session_duration_minutes INTEGER DEFAULT 60,
  max_tokens_per_day INTEGER DEFAULT 100000,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default rate limits
INSERT INTO public.ai_rate_limits_config (user_tier, daily_chat_messages, daily_recommendations, daily_analyses, daily_image_generations) VALUES
('free', 10, 5, 2, 3),
('basic', 50, 20, 5, 10),
('premium', 200, 100, 20, 50),
('unlimited', 999999, 999999, 999999, 999999)
ON CONFLICT (user_tier) DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_style_profiles_user ON public.user_style_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_style_sessions_user ON public.ai_style_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_style_sessions_active ON public.ai_style_sessions(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_user ON public.ai_style_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_type ON public.ai_style_recommendations(recommendation_type);
CREATE INDEX IF NOT EXISTS idx_style_analysis_user ON public.style_analysis_history(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_tracking_user ON public.ai_usage_tracking(user_id, window_start);
CREATE INDEX IF NOT EXISTS idx_style_evolution_user_date ON public.style_evolution_log(user_id, date);
CREATE INDEX IF NOT EXISTS idx_occasion_templates_category ON public.occasion_templates(occasion_category);

-- Enable RLS
ALTER TABLE public.user_style_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_style_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_style_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.style_analysis_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.style_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.style_evolution_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.occasion_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_rate_limits_config ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_style_profiles
CREATE POLICY "Users can manage their own style profile"
  ON public.user_style_profiles
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for ai_style_sessions
CREATE POLICY "Users can manage their own AI sessions"
  ON public.ai_style_sessions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for ai_style_recommendations
CREATE POLICY "Users can view their own recommendations"
  ON public.ai_style_recommendations
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can create recommendations"
  ON public.ai_style_recommendations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update feedback on recommendations"
  ON public.ai_style_recommendations
  FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for style_analysis_history
CREATE POLICY "Users can view their own analysis history"
  ON public.style_analysis_history
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for ai_usage_tracking
CREATE POLICY "Users can view their own usage"
  ON public.ai_usage_tracking
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all usage"
  ON public.ai_usage_tracking
  FOR SELECT
  USING (public.is_admin(auth.uid()));

-- RLS Policies for style_trends
CREATE POLICY "Anyone can view trends"
  ON public.style_trends
  FOR SELECT
  USING (true);

-- RLS Policies for style_evolution_log
CREATE POLICY "Users can view their style evolution"
  ON public.style_evolution_log
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for occasion_templates
CREATE POLICY "Anyone can view occasion templates"
  ON public.occasion_templates
  FOR SELECT
  USING (true);

-- RLS Policies for ai_rate_limits_config
CREATE POLICY "Anyone can view rate limits"
  ON public.ai_rate_limits_config
  FOR SELECT
  USING (true);

-- Security Functions

-- Check AI rate limit
CREATE OR REPLACE FUNCTION public.check_ai_rate_limit(
  p_user_id UUID,
  p_service_type TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_tier TEXT := 'free';
  v_rate_config RECORD;
  v_current_usage RECORD;
  v_window_start TIMESTAMPTZ;
  v_allowed BOOLEAN := false;
BEGIN
  v_window_start := date_trunc('day', now());
  
  -- Get user tier (simplified - in production would check subscription)
  -- For now, all users are 'free' tier
  
  -- Get rate limit configuration
  SELECT * INTO v_rate_config
  FROM public.ai_rate_limits_config
  WHERE user_tier = v_user_tier;
  
  -- Get current usage
  SELECT 
    COALESCE(SUM(request_count), 0) as total_requests,
    COALESCE(SUM(tokens_used), 0) as total_tokens
  INTO v_current_usage
  FROM public.ai_usage_tracking
  WHERE user_id = p_user_id
    AND window_start >= v_window_start
    AND service_type = p_service_type;
  
  -- Check limits based on service type
  CASE p_service_type
    WHEN 'chat' THEN
      v_allowed := v_current_usage.total_requests < v_rate_config.daily_chat_messages;
    WHEN 'recommendation' THEN
      v_allowed := v_current_usage.total_requests < v_rate_config.daily_recommendations;
    WHEN 'analysis' THEN
      v_allowed := v_current_usage.total_requests < v_rate_config.daily_analyses;
    WHEN 'image_generation' THEN
      v_allowed := v_current_usage.total_requests < v_rate_config.daily_image_generations;
    ELSE
      v_allowed := false;
  END CASE;
  
  -- Log if rate limit exceeded
  IF NOT v_allowed THEN
    INSERT INTO public.security_audit_log (
      user_id, action, resource, success, details
    ) VALUES (
      p_user_id,
      'ai_rate_limit_exceeded',
      'ai_usage_tracking',
      false,
      jsonb_build_object(
        'service_type', p_service_type,
        'current_usage', v_current_usage.total_requests,
        'limit', CASE p_service_type
          WHEN 'chat' THEN v_rate_config.daily_chat_messages
          WHEN 'recommendation' THEN v_rate_config.daily_recommendations
          WHEN 'analysis' THEN v_rate_config.daily_analyses
          WHEN 'image_generation' THEN v_rate_config.daily_image_generations
        END
      )
    );
  END IF;
  
  RETURN jsonb_build_object(
    'allowed', v_allowed,
    'current_usage', v_current_usage.total_requests,
    'limit', CASE p_service_type
      WHEN 'chat' THEN v_rate_config.daily_chat_messages
      WHEN 'recommendation' THEN v_rate_config.daily_recommendations
      WHEN 'analysis' THEN v_rate_config.daily_analyses
      WHEN 'image_generation' THEN v_rate_config.daily_image_generations
    END,
    'reset_at', v_window_start + interval '1 day'
  );
END;
$$;

-- Track AI usage
CREATE OR REPLACE FUNCTION public.track_ai_usage(
  p_user_id UUID,
  p_service_type TEXT,
  p_tokens_used INTEGER DEFAULT 0,
  p_cost_credits NUMERIC DEFAULT 0
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_window_start TIMESTAMPTZ;
BEGIN
  v_window_start := date_trunc('day', now());
  
  INSERT INTO public.ai_usage_tracking (
    user_id,
    service_type,
    tokens_used,
    cost_credits,
    request_count,
    window_start
  ) VALUES (
    p_user_id,
    p_service_type,
    p_tokens_used,
    p_cost_credits,
    1,
    v_window_start
  )
  ON CONFLICT (user_id, service_type, window_start) 
  DO UPDATE SET
    request_count = ai_usage_tracking.request_count + 1,
    tokens_used = ai_usage_tracking.tokens_used + p_tokens_used,
    cost_credits = ai_usage_tracking.cost_credits + p_cost_credits;
END;
$$;

-- Analyze user style profile
CREATE OR REPLACE FUNCTION public.analyze_user_style(
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_wardrobe_data JSONB;
  v_style_profile RECORD;
  v_analysis JSONB;
BEGIN
  -- Check rate limit
  IF NOT (public.check_ai_rate_limit(p_user_id, 'analysis')->>'allowed')::BOOLEAN THEN
    RAISE EXCEPTION 'AI analysis rate limit exceeded';
  END IF;
  
  -- Get user's wardrobe
  SELECT jsonb_agg(
    jsonb_build_object(
      'category', category,
      'color', color,
      'brand', brand,
      'style', style
    )
  ) INTO v_wardrobe_data
  FROM public.wardrobe_items
  WHERE user_id = p_user_id;
  
  -- Get existing style profile
  SELECT * INTO v_style_profile
  FROM public.user_style_profiles
  WHERE user_id = p_user_id;
  
  -- Track usage
  PERFORM public.track_ai_usage(p_user_id, 'analysis', 500, 0.05);
  
  -- Return analysis structure (AI would fill this in production)
  v_analysis := jsonb_build_object(
    'wardrobe_size', (SELECT COUNT(*) FROM wardrobe_items WHERE user_id = p_user_id),
    'dominant_colors', ARRAY['blue', 'black', 'white'],
    'style_personality', ARRAY['casual', 'minimalist'],
    'recommendations', ARRAY['Add more color variety', 'Consider sustainable brands'],
    'analysis_timestamp', now()
  );
  
  -- Log the analysis
  INSERT INTO public.style_analysis_history (
    user_id,
    analysis_type,
    analysis_results,
    insights,
    recommendations
  ) VALUES (
    p_user_id,
    'wardrobe_audit',
    v_analysis,
    ARRAY['Good basics collection', 'Lacks variety in colors'],
    ARRAY['Add accent colors', 'Explore different styles']
  );
  
  RETURN v_analysis;
END;
$$;

-- Create or update style profile
CREATE OR REPLACE FUNCTION public.upsert_style_profile(
  p_user_id UUID,
  p_profile_data JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile_id UUID;
BEGIN
  INSERT INTO public.user_style_profiles (
    user_id,
    style_personality,
    color_palette,
    body_type,
    preferred_fits,
    style_preferences,
    budget_range,
    sustainability_preference,
    brand_preferences,
    avoided_brands,
    last_analysis_at
  ) VALUES (
    p_user_id,
    COALESCE((p_profile_data->>'style_personality')::TEXT[], ARRAY[]::TEXT[]),
    COALESCE(p_profile_data->'color_palette', '{}'::JSONB),
    p_profile_data->>'body_type',
    COALESCE((p_profile_data->>'preferred_fits')::TEXT[], ARRAY[]::TEXT[]),
    COALESCE(p_profile_data->'style_preferences', '{}'::JSONB),
    COALESCE(p_profile_data->'budget_range', '{"min": 0, "max": 1000}'::JSONB),
    COALESCE(p_profile_data->>'sustainability_preference', 'medium'),
    COALESCE((p_profile_data->>'brand_preferences')::TEXT[], ARRAY[]::TEXT[]),
    COALESCE((p_profile_data->>'avoided_brands')::TEXT[], ARRAY[]::TEXT[]),
    now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    style_personality = EXCLUDED.style_personality,
    color_palette = EXCLUDED.color_palette,
    body_type = EXCLUDED.body_type,
    preferred_fits = EXCLUDED.preferred_fits,
    style_preferences = EXCLUDED.style_preferences,
    budget_range = EXCLUDED.budget_range,
    sustainability_preference = EXCLUDED.sustainability_preference,
    brand_preferences = EXCLUDED.brand_preferences,
    avoided_brands = EXCLUDED.avoided_brands,
    last_analysis_at = now(),
    updated_at = now()
  RETURNING id INTO v_profile_id;
  
  RETURN v_profile_id;
END;
$$;

-- Triggers
CREATE TRIGGER update_user_style_profiles_updated_at
  BEFORE UPDATE ON public.user_style_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_style_trends_updated_at
  BEFORE UPDATE ON public.style_trends
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_occasion_templates_updated_at
  BEFORE UPDATE ON public.occasion_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();