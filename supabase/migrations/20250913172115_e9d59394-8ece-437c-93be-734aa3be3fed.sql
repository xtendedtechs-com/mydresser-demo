-- Add new settings columns to user_preferences

-- Add accessibility preferences to user_preferences
ALTER TABLE public.user_preferences 
ADD COLUMN IF NOT EXISTS accessibility_settings JSONB DEFAULT '{
  "high_contrast": false,
  "large_text": false,
  "reduce_motion": false,
  "screen_reader_support": false,
  "keyboard_navigation": false,
  "color_blind_friendly": false,
  "font_size_multiplier": 1.0,
  "voice_navigation": false
}'::jsonb;

-- Add laundry preferences 
ALTER TABLE public.user_preferences 
ADD COLUMN IF NOT EXISTS laundry_settings JSONB DEFAULT '{
  "auto_sort_by_color": true,
  "reminder_notifications": true,
  "smart_suggestions": true,
  "care_label_warnings": true
}'::jsonb;

-- Add 2ndDresser marketplace preferences
ALTER TABLE public.user_preferences 
ADD COLUMN IF NOT EXISTS marketplace_settings JSONB DEFAULT '{
  "allow_selling": false,
  "show_price_history": true,
  "auto_suggest_prices": true,
  "shipping_preferences": {},
  "payment_methods": []
}'::jsonb;

-- Add extended theme options
ALTER TABLE public.user_preferences 
ADD COLUMN IF NOT EXISTS extended_theme JSONB DEFAULT '{
  "gradient_backgrounds": true,
  "animated_transitions": true,
  "card_style": "default",
  "border_radius": "medium",
  "shadow_intensity": "medium"
}'::jsonb;

COMMENT ON COLUMN public.user_preferences.accessibility_settings IS 'User accessibility and disability support preferences';
COMMENT ON COLUMN public.user_preferences.laundry_settings IS 'Laundry tracking and automation preferences';
COMMENT ON COLUMN public.user_preferences.marketplace_settings IS '2ndDresser marketplace preferences and settings';
COMMENT ON COLUMN public.user_preferences.extended_theme IS 'Extended theme customization options';