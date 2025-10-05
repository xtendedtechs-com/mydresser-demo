-- Phase 27: MyDresser Market Security & Fraud Prevention

-- =====================================================
-- Merchant Verification
-- =====================================================
CREATE TABLE IF NOT EXISTS public.market_merchant_verification (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  verification_tier TEXT NOT NULL CHECK (verification_tier IN ('basic', 'intermediate', 'advanced', 'enterprise')),
  business_name TEXT,
  business_registration TEXT,
  tax_id TEXT,
  phone_verified BOOLEAN DEFAULT false,
  email_verified BOOLEAN DEFAULT false,
  identity_verified BOOLEAN DEFAULT false,
  documents_verified BOOLEAN DEFAULT false,
  trust_score INTEGER DEFAULT 50 CHECK (trust_score BETWEEN 0 AND 100),
  total_sales INTEGER DEFAULT 0,
  successful_transactions INTEGER DEFAULT 0,
  dispute_count INTEGER DEFAULT 0,
  report_count INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2),
  is_suspended BOOLEAN DEFAULT false,
  suspension_reason TEXT,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.market_merchant_verification ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Merchants can view their own verification"
  ON public.market_merchant_verification FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view merchant trust scores"
  ON public.market_merchant_verification FOR SELECT
  USING (true);

CREATE POLICY "System can manage verifications"
  ON public.market_merchant_verification FOR ALL
  USING (true) WITH CHECK (true);

CREATE INDEX idx_merchant_verification_user ON public.market_merchant_verification(user_id);
CREATE INDEX idx_merchant_trust_score ON public.market_merchant_verification(trust_score DESC);

-- =====================================================
-- Transaction Log
-- =====================================================
CREATE TABLE IF NOT EXISTS public.market_transaction_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  merchant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'refund', 'dispute')),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  payment_method TEXT,
  payment_gateway_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'disputed')),
  fraud_score INTEGER CHECK (fraud_score BETWEEN 0 AND 100),
  is_suspicious BOOLEAN DEFAULT false,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.market_transaction_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions"
  ON public.market_transaction_log FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() = merchant_id);

CREATE POLICY "System can manage transactions"
  ON public.market_transaction_log FOR ALL
  USING (true) WITH CHECK (true);

CREATE INDEX idx_transaction_buyer ON public.market_transaction_log(buyer_id, created_at DESC);
CREATE INDEX idx_transaction_merchant ON public.market_transaction_log(merchant_id, created_at DESC);
CREATE INDEX idx_transaction_status ON public.market_transaction_log(status);
CREATE INDEX idx_transaction_suspicious ON public.market_transaction_log(is_suspicious) WHERE is_suspicious = true;

-- =====================================================
-- Fraud Detection
-- =====================================================
CREATE TABLE IF NOT EXISTS public.market_fraud_detection (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES public.market_transaction_log(id) ON DELETE CASCADE,
  fraud_type TEXT NOT NULL CHECK (fraud_type IN ('velocity', 'amount', 'pattern', 'location', 'device')),
  risk_score INTEGER NOT NULL CHECK (risk_score BETWEEN 0 AND 100),
  details JSONB,
  action_taken TEXT CHECK (action_taken IN ('none', 'flag', 'block', 'review')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.market_fraud_detection ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own fraud alerts"
  ON public.market_fraud_detection FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage fraud detection"
  ON public.market_fraud_detection FOR ALL
  USING (true) WITH CHECK (true);

CREATE INDEX idx_fraud_user ON public.market_fraud_detection(user_id, created_at DESC);
CREATE INDEX idx_fraud_risk ON public.market_fraud_detection(risk_score DESC);

-- =====================================================
-- Purchase Rate Limits
-- =====================================================
CREATE TABLE IF NOT EXISTS public.market_rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hourly_purchases INTEGER DEFAULT 0,
  daily_purchases INTEGER DEFAULT 0,
  hourly_amount DECIMAL(10,2) DEFAULT 0,
  daily_amount DECIMAL(10,2) DEFAULT 0,
  last_purchase_at TIMESTAMP WITH TIME ZONE,
  hourly_reset_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '1 hour'),
  daily_reset_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (date_trunc('day', now() + interval '1 day')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.market_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own rate limits"
  ON public.market_rate_limits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage rate limits"
  ON public.market_rate_limits FOR ALL
  USING (true) WITH CHECK (true);

CREATE INDEX idx_market_rate_limits_user ON public.market_rate_limits(user_id);

-- =====================================================
-- Item Reports
-- =====================================================
CREATE TABLE IF NOT EXISTS public.market_item_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL,
  merchant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_category TEXT NOT NULL CHECK (report_category IN ('counterfeit', 'misleading', 'inappropriate', 'scam', 'other')),
  description TEXT NOT NULL,
  evidence_urls TEXT[],
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
  resolution TEXT,
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.market_item_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reports"
  ON public.market_item_reports FOR SELECT
  USING (auth.uid() = reporter_id OR auth.uid() = merchant_id);

CREATE POLICY "Users can create reports"
  ON public.market_item_reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "System can manage reports"
  ON public.market_item_reports FOR ALL
  USING (true) WITH CHECK (true);

CREATE INDEX idx_item_reports_reporter ON public.market_item_reports(reporter_id, created_at DESC);
CREATE INDEX idx_item_reports_merchant ON public.market_item_reports(merchant_id, status);
CREATE INDEX idx_item_reports_status ON public.market_item_reports(status);

-- =====================================================
-- Functions
-- =====================================================

-- Check Purchase Rate Limit
CREATE OR REPLACE FUNCTION public.check_market_purchase_limit(p_user_id UUID, p_amount DECIMAL)
RETURNS TABLE(
  allowed BOOLEAN,
  hourly_remaining INTEGER,
  daily_remaining INTEGER,
  reason TEXT
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_hourly_limit INTEGER := 10;
  v_daily_limit INTEGER := 50;
  v_hourly_count INTEGER;
  v_daily_count INTEGER;
BEGIN
  INSERT INTO public.market_rate_limits (user_id)
  VALUES (p_user_id) ON CONFLICT (user_id) DO NOTHING;
  
  SELECT 
    CASE WHEN hourly_reset_at < now() THEN 0 ELSE hourly_purchases END,
    CASE WHEN daily_reset_at < now() THEN 0 ELSE daily_purchases END
  INTO v_hourly_count, v_daily_count
  FROM public.market_rate_limits WHERE user_id = p_user_id;
  
  RETURN QUERY SELECT 
    (v_hourly_count < v_hourly_limit AND v_daily_count < v_daily_limit)::BOOLEAN,
    (v_hourly_limit - v_hourly_count)::INTEGER,
    (v_daily_limit - v_daily_count)::INTEGER,
    CASE 
      WHEN v_hourly_count >= v_hourly_limit THEN 'Hourly limit reached'
      WHEN v_daily_count >= v_daily_limit THEN 'Daily limit reached'
      ELSE 'OK'
    END;
END;
$$;

-- Calculate Merchant Trust Score
CREATE OR REPLACE FUNCTION public.calculate_merchant_trust_score(p_merchant_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_score INTEGER := 50;
  v_verification RECORD;
BEGIN
  SELECT * INTO v_verification
  FROM public.market_merchant_verification
  WHERE user_id = p_merchant_id;
  
  IF v_verification IS NULL THEN RETURN 0; END IF;
  
  -- Add points for successful transactions
  v_score := v_score + LEAST(v_verification.successful_transactions, 30);
  
  -- Add/subtract based on ratings
  IF v_verification.average_rating IS NOT NULL THEN
    v_score := v_score + ((v_verification.average_rating - 3) * 5)::INTEGER;
  END IF;
  
  -- Subtract for disputes and reports
  v_score := v_score - (v_verification.dispute_count * 15);
  v_score := v_score - (v_verification.report_count * 10);
  
  -- Add for verification level
  v_score := v_score + CASE v_verification.verification_tier
    WHEN 'basic' THEN 5
    WHEN 'intermediate' THEN 10
    WHEN 'advanced' THEN 20
    WHEN 'enterprise' THEN 30
    ELSE 0
  END;
  
  -- Clamp to 0-100
  RETURN GREATEST(0, LEAST(100, v_score));
END;
$$;

-- Log Transaction
CREATE OR REPLACE FUNCTION public.log_market_transaction(
  p_buyer_id UUID,
  p_merchant_id UUID,
  p_item_id UUID,
  p_amount DECIMAL,
  p_status TEXT,
  p_fraud_score INTEGER DEFAULT 0
)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_transaction_id UUID;
BEGIN
  INSERT INTO public.market_transaction_log (
    buyer_id, merchant_id, item_id, transaction_type, amount, status, fraud_score, is_suspicious
  ) VALUES (
    p_buyer_id, p_merchant_id, p_item_id, 'purchase', p_amount, p_status, p_fraud_score, p_fraud_score > 70
  ) RETURNING id INTO v_transaction_id;
  
  IF p_status = 'completed' THEN
    INSERT INTO public.market_rate_limits (user_id, hourly_purchases, daily_purchases)
    VALUES (p_buyer_id, 1, 1)
    ON CONFLICT (user_id) DO UPDATE SET
      hourly_purchases = CASE WHEN market_rate_limits.hourly_reset_at < now() THEN 1
        ELSE market_rate_limits.hourly_purchases + 1 END,
      daily_purchases = CASE WHEN market_rate_limits.daily_reset_at < now() THEN 1
        ELSE market_rate_limits.daily_purchases + 1 END,
      hourly_reset_at = CASE WHEN market_rate_limits.hourly_reset_at < now() 
        THEN now() + interval '1 hour' ELSE market_rate_limits.hourly_reset_at END,
      daily_reset_at = CASE WHEN market_rate_limits.daily_reset_at < now()
        THEN date_trunc('day', now() + interval '1 day') ELSE market_rate_limits.daily_reset_at END,
      last_purchase_at = now(), updated_at = now();
      
    UPDATE public.market_merchant_verification
    SET successful_transactions = successful_transactions + 1, total_sales = total_sales + 1, updated_at = now()
    WHERE user_id = p_merchant_id;
  END IF;
  
  RETURN v_transaction_id;
END;
$$;

-- Triggers
CREATE TRIGGER update_market_merchant_verification_updated_at
  BEFORE UPDATE ON public.market_merchant_verification
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_market_rate_limits_updated_at
  BEFORE UPDATE ON public.market_rate_limits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Permissions
GRANT EXECUTE ON FUNCTION public.check_market_purchase_limit TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_merchant_trust_score TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_market_transaction TO authenticated;