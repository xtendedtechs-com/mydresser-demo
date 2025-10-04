-- Virtual Try-On (VTO) Tables for MyDresser Fashion OS

-- VTO Sessions: Track user try-on sessions
CREATE TABLE IF NOT EXISTS public.vto_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  item_id UUID NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('wardrobe', 'merchant', 'market')),
  session_data JSONB NOT NULL DEFAULT '{}',
  user_measurements JSONB,
  fit_score NUMERIC CHECK (fit_score >= 0 AND fit_score <= 100),
  confidence_score NUMERIC CHECK (confidence_score >= 0 AND confidence_score <= 100),
  photo_data JSONB,
  result_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- VTO Analytics: Track VTO usage and conversion metrics
CREATE TABLE IF NOT EXISTS public.vto_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID,
  user_id UUID,
  item_id UUID,
  session_id UUID REFERENCES public.vto_sessions(id),
  event_type TEXT NOT NULL CHECK (event_type IN ('session_start', 'session_complete', 'conversion', 'return_avoided', 'size_recommendation')),
  event_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- VTO Item Requirements: Track which items meet VTO requirements
CREATE TABLE IF NOT EXISTS public.vto_item_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('wardrobe', 'merchant', 'market')),
  is_vto_ready BOOLEAN DEFAULT false,
  quality_score NUMERIC CHECK (quality_score >= 0 AND quality_score <= 100),
  missing_requirements JSONB DEFAULT '[]',
  image_quality_checks JSONB DEFAULT '{}',
  size_data_complete BOOLEAN DEFAULT false,
  material_data_complete BOOLEAN DEFAULT false,
  last_checked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(item_id, item_type)
);

-- VTO Merchant Settings: Per-merchant VTO configuration
CREATE TABLE IF NOT EXISTS public.vto_merchant_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL UNIQUE,
  vto_enabled BOOLEAN DEFAULT true,
  auto_generate_vto BOOLEAN DEFAULT true,
  require_vto_for_listing BOOLEAN DEFAULT false,
  size_recommendation_enabled BOOLEAN DEFAULT true,
  fit_confidence_threshold NUMERIC DEFAULT 70 CHECK (fit_confidence_threshold >= 0 AND fit_confidence_threshold <= 100),
  conversion_tracking_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- VTO User Preferences: User-specific VTO settings
CREATE TABLE IF NOT EXISTS public.vto_user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  enable_vto BOOLEAN DEFAULT true,
  save_try_on_photos BOOLEAN DEFAULT false,
  auto_delete_after_days INTEGER DEFAULT 7,
  body_measurements JSONB,
  preferred_fit_style TEXT DEFAULT 'regular' CHECK (preferred_fit_style IN ('slim', 'regular', 'relaxed', 'oversized')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vto_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vto_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vto_item_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vto_merchant_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vto_user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vto_sessions
CREATE POLICY "Users can manage their own VTO sessions"
  ON public.vto_sessions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for vto_analytics
CREATE POLICY "Users can view their own VTO analytics"
  ON public.vto_analytics
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Merchants can view their VTO analytics"
  ON public.vto_analytics
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = merchant_id 
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() 
      AND role = 'merchant'
    )
  );

CREATE POLICY "System can insert VTO analytics"
  ON public.vto_analytics
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for vto_item_status
CREATE POLICY "Users can view VTO status for their items"
  ON public.vto_item_status
  FOR SELECT
  TO authenticated
  USING (
    (item_type = 'wardrobe' AND EXISTS (
      SELECT 1 FROM wardrobe_items 
      WHERE id = item_id AND user_id = auth.uid()
    ))
    OR
    (item_type = 'merchant' AND EXISTS (
      SELECT 1 FROM merchant_items 
      WHERE id = item_id AND merchant_id = auth.uid()
    ))
    OR
    (item_type = 'market' AND EXISTS (
      SELECT 1 FROM market_items 
      WHERE id = item_id
    ))
  );

CREATE POLICY "Merchants can manage VTO status for their items"
  ON public.vto_item_status
  FOR ALL
  TO authenticated
  USING (
    item_type = 'merchant' 
    AND EXISTS (
      SELECT 1 FROM merchant_items 
      WHERE id = item_id AND merchant_id = auth.uid()
    )
  )
  WITH CHECK (
    item_type = 'merchant' 
    AND EXISTS (
      SELECT 1 FROM merchant_items 
      WHERE id = item_id AND merchant_id = auth.uid()
    )
  );

-- RLS Policies for vto_merchant_settings
CREATE POLICY "Merchants can manage their VTO settings"
  ON public.vto_merchant_settings
  FOR ALL
  TO authenticated
  USING (
    auth.uid() = merchant_id 
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() 
      AND role = 'merchant'
    )
  )
  WITH CHECK (
    auth.uid() = merchant_id 
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() 
      AND role = 'merchant'
    )
  );

-- RLS Policies for vto_user_preferences
CREATE POLICY "Users can manage their own VTO preferences"
  ON public.vto_user_preferences
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_vto_sessions_user_id ON public.vto_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_vto_sessions_item_id ON public.vto_sessions(item_id);
CREATE INDEX IF NOT EXISTS idx_vto_sessions_created_at ON public.vto_sessions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_vto_analytics_merchant_id ON public.vto_analytics(merchant_id);
CREATE INDEX IF NOT EXISTS idx_vto_analytics_user_id ON public.vto_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_vto_analytics_event_type ON public.vto_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_vto_analytics_created_at ON public.vto_analytics(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_vto_item_status_item ON public.vto_item_status(item_id, item_type);
CREATE INDEX IF NOT EXISTS idx_vto_item_status_ready ON public.vto_item_status(is_vto_ready);

-- Triggers for updated_at
CREATE TRIGGER update_vto_sessions_updated_at
  BEFORE UPDATE ON public.vto_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vto_item_status_updated_at
  BEFORE UPDATE ON public.vto_item_status
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vto_merchant_settings_updated_at
  BEFORE UPDATE ON public.vto_merchant_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vto_user_preferences_updated_at
  BEFORE UPDATE ON public.vto_user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to calculate VTO ROI metrics
CREATE OR REPLACE FUNCTION public.calculate_vto_roi(
  merchant_id_param UUID,
  start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  end_date DATE DEFAULT CURRENT_DATE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;