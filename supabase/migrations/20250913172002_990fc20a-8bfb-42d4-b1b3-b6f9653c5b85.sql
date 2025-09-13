-- Add laundry tracking functionality and accessibility settings

-- Create laundry tracking system 
CREATE TABLE IF NOT EXISTS public.laundry_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  schedule_name TEXT NOT NULL DEFAULT 'Weekly Laundry',
  frequency_days INTEGER NOT NULL DEFAULT 7,
  next_due_date DATE NOT NULL DEFAULT CURRENT_DATE + INTERVAL '7 days',
  auto_schedule BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on laundry_schedules
ALTER TABLE public.laundry_schedules ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for laundry_schedules
CREATE POLICY "Users can manage their own laundry schedules" 
ON public.laundry_schedules 
FOR ALL 
USING (auth.uid() = user_id);

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

-- Add update trigger for laundry_schedules
CREATE OR REPLACE FUNCTION public.update_laundry_schedules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_laundry_schedules_updated_at
  BEFORE UPDATE ON public.laundry_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_laundry_schedules_updated_at();

-- Add starred items tracking via tags (already implemented in wardrobe_items.tags)
-- Just ensure the tags array can handle starred items

COMMENT ON TABLE public.laundry_schedules IS 'Tracks user laundry schedules and automation';
COMMENT ON COLUMN public.user_preferences.accessibility_settings IS 'User accessibility and disability support preferences';
COMMENT ON COLUMN public.user_preferences.laundry_settings IS 'Laundry tracking and automation preferences';
COMMENT ON COLUMN public.user_preferences.marketplace_settings IS '2ndDresser marketplace preferences and settings';