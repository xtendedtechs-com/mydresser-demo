-- Create user_preferences table for storing user settings
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  
  -- App Settings
  language TEXT DEFAULT 'en',
  currency TEXT DEFAULT 'USD',
  compact_mode BOOLEAN DEFAULT false,
  animations BOOLEAN DEFAULT true,
  grid_size INTEGER DEFAULT 3,
  push_notifications BOOLEAN DEFAULT true,
  offline_mode BOOLEAN DEFAULT false,
  
  -- Privacy Settings
  public_profile BOOLEAN DEFAULT true,
  wardrobe_visible BOOLEAN DEFAULT true,
  activity_visible BOOLEAN DEFAULT true,
  analytics_sharing BOOLEAN DEFAULT true,
  personalized_recommendations BOOLEAN DEFAULT true,
  
  -- Notification Settings
  daily_outfit BOOLEAN DEFAULT true,
  wardrobe_tips BOOLEAN DEFAULT true,
  market_updates BOOLEAN DEFAULT true,
  outfit_reminders BOOLEAN DEFAULT false,
  social_activity BOOLEAN DEFAULT false,
  
  -- Service Settings
  auto_recommendations BOOLEAN DEFAULT true,
  price_alerts BOOLEAN DEFAULT false,
  merchant_updates BOOLEAN DEFAULT true,
  ai_styling BOOLEAN DEFAULT false,
  weather_integration BOOLEAN DEFAULT true,
  trend_analysis BOOLEAN DEFAULT false,
  public_outfits BOOLEAN DEFAULT true,
  follow_suggestions BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own preferences" 
ON public.user_preferences 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own preferences" 
ON public.user_preferences 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" 
ON public.user_preferences 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to initialize user preferences when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger to automatically create preferences for new users
CREATE TRIGGER on_auth_user_created_preferences
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_preferences();