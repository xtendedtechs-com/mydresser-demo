-- Create settings tables for comprehensive configuration

-- User Settings
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Payment Preferences
  default_payment_method TEXT DEFAULT 'card',
  saved_payment_methods JSONB DEFAULT '[]'::jsonb,
  enable_payment_notifications BOOLEAN DEFAULT true,
  
  -- AI Preferences
  ai_model_preference TEXT DEFAULT 'google/gemini-2.5-flash',
  enable_ai_suggestions BOOLEAN DEFAULT true,
  ai_suggestion_frequency TEXT DEFAULT 'daily',
  enable_ai_chat BOOLEAN DEFAULT true,
  
  -- Notification Preferences
  enable_email_notifications BOOLEAN DEFAULT true,
  enable_push_notifications BOOLEAN DEFAULT true,
  enable_marketing_emails BOOLEAN DEFAULT false,
  
  -- Privacy Settings
  profile_visibility TEXT DEFAULT 'public',
  show_wardrobe_publicly BOOLEAN DEFAULT false,
  show_activity_publicly BOOLEAN DEFAULT true,
  
  -- Display Preferences
  theme TEXT DEFAULT 'system',
  language TEXT DEFAULT 'en',
  currency TEXT DEFAULT 'USD',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Merchant Settings
CREATE TABLE IF NOT EXISTS merchant_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Payment Configuration
  accepted_payment_methods TEXT[] DEFAULT ARRAY['card', 'bank', 'digital_wallet'],
  payment_gateway TEXT DEFAULT 'mydresser',
  commission_rate NUMERIC DEFAULT 0.15,
  enable_installments BOOLEAN DEFAULT false,
  
  -- Order Management
  auto_accept_orders BOOLEAN DEFAULT false,
  order_processing_time INTEGER DEFAULT 24,
  enable_order_tracking BOOLEAN DEFAULT true,
  
  -- Inventory Settings
  low_stock_threshold INTEGER DEFAULT 10,
  enable_stock_alerts BOOLEAN DEFAULT true,
  auto_reorder BOOLEAN DEFAULT false,
  
  -- Customer Management
  enable_customer_reviews BOOLEAN DEFAULT true,
  require_review_moderation BOOLEAN DEFAULT false,
  enable_loyalty_program BOOLEAN DEFAULT false,
  
  -- Marketing & Promotions
  enable_promotions BOOLEAN DEFAULT true,
  enable_email_marketing BOOLEAN DEFAULT false,
  enable_analytics BOOLEAN DEFAULT true,
  
  -- Store Appearance
  store_theme TEXT DEFAULT 'modern',
  brand_colors JSONB DEFAULT '{"primary": "#000000", "secondary": "#666666"}'::jsonb,
  custom_css TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AI Service Settings
CREATE TABLE IF NOT EXISTS ai_service_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Model Preferences
  chat_model TEXT DEFAULT 'google/gemini-2.5-flash',
  recommendation_model TEXT DEFAULT 'google/gemini-2.5-flash',
  image_model TEXT DEFAULT 'google/gemini-2.5-flash-image-preview',
  
  -- Usage Limits
  daily_request_limit INTEGER DEFAULT 100,
  enable_usage_alerts BOOLEAN DEFAULT true,
  
  -- Feature Toggles
  enable_style_chat BOOLEAN DEFAULT true,
  enable_outfit_suggestions BOOLEAN DEFAULT true,
  enable_wardrobe_insights BOOLEAN DEFAULT true,
  enable_virtual_tryon BOOLEAN DEFAULT false,
  
  -- Personalization
  style_preferences JSONB DEFAULT '{}'::jsonb,
  color_preferences TEXT[] DEFAULT ARRAY[]::TEXT[],
  brand_preferences TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Payment Settings
CREATE TABLE IF NOT EXISTS payment_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Saved Payment Methods (encrypted)
  saved_cards JSONB DEFAULT '[]'::jsonb,
  saved_bank_accounts JSONB DEFAULT '[]'::jsonb,
  saved_wallets JSONB DEFAULT '[]'::jsonb,
  
  -- Preferences
  default_method TEXT DEFAULT 'card',
  enable_auto_save BOOLEAN DEFAULT true,
  require_cvv BOOLEAN DEFAULT true,
  
  -- Security
  enable_3d_secure BOOLEAN DEFAULT true,
  enable_transaction_alerts BOOLEAN DEFAULT true,
  spending_limit NUMERIC,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchant_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_service_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_settings
CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for merchant_settings
CREATE POLICY "Merchants can view own settings"
  ON merchant_settings FOR SELECT
  USING (auth.uid() = merchant_id);

CREATE POLICY "Merchants can update own settings"
  ON merchant_settings FOR UPDATE
  USING (auth.uid() = merchant_id);

CREATE POLICY "Merchants can insert own settings"
  ON merchant_settings FOR INSERT
  WITH CHECK (auth.uid() = merchant_id);

-- RLS Policies for ai_service_settings
CREATE POLICY "Users can view own AI settings"
  ON ai_service_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own AI settings"
  ON ai_service_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own AI settings"
  ON ai_service_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for payment_settings
CREATE POLICY "Users can view own payment settings"
  ON payment_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own payment settings"
  ON payment_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payment settings"
  ON payment_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_merchant_settings_updated_at
  BEFORE UPDATE ON merchant_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_service_settings_updated_at
  BEFORE UPDATE ON ai_service_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_settings_updated_at
  BEFORE UPDATE ON payment_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX idx_merchant_settings_merchant_id ON merchant_settings(merchant_id);
CREATE INDEX idx_ai_service_settings_user_id ON ai_service_settings(user_id);
CREATE INDEX idx_payment_settings_user_id ON payment_settings(user_id);
