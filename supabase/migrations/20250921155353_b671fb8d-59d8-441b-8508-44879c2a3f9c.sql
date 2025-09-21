-- Fix merchant signup and authentication issues

-- Update merchant signup trigger to handle role assignment
CREATE OR REPLACE FUNCTION public.handle_merchant_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if user_type is merchant from metadata
  IF NEW.raw_user_meta_data->>'user_type' = 'merchant' THEN
    -- Create profile first if it doesn't exist
    INSERT INTO public.profiles (
      user_id, 
      email, 
      full_name,
      role
    ) VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
      'merchant'::user_role
    ) ON CONFLICT (user_id) DO UPDATE SET
      role = 'merchant'::user_role;
    
    -- Create merchant profile
    INSERT INTO public.merchant_profiles (
      user_id,
      business_name,
      business_type,
      verification_status
    ) VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'business_name', 'Business Name'),
      COALESCE(NEW.raw_user_meta_data->>'business_type', 'Fashion Retailer'),
      'pending'
    ) ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Add function to validate user session for additional security
CREATE OR REPLACE FUNCTION public.validate_user_session_robust()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if user is authenticated and has valid session
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  
  -- Additional checks could be added here
  RETURN true;
END;
$function$;

-- Create or update outfit suggestions table for daily AI picks
CREATE TABLE IF NOT EXISTS public.daily_outfit_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  outfit_id uuid REFERENCES outfits(id) ON DELETE CASCADE,
  suggestion_date date NOT NULL DEFAULT CURRENT_DATE,
  time_slot text NOT NULL DEFAULT 'morning', -- morning, afternoon, evening
  weather_data jsonb,
  occasion text DEFAULT 'casual',
  confidence_score integer DEFAULT 0,
  is_accepted boolean DEFAULT false,
  is_rejected boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, suggestion_date, time_slot)
);

-- Enable RLS on daily outfit suggestions
ALTER TABLE public.daily_outfit_suggestions ENABLE ROW LEVEL SECURITY;

-- RLS policies for daily outfit suggestions
CREATE POLICY "Users can manage their own daily outfit suggestions"
ON public.daily_outfit_suggestions
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create theme settings table for user themes
CREATE TABLE IF NOT EXISTS public.user_theme_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  theme_name text NOT NULL DEFAULT 'system',
  primary_color text NOT NULL DEFAULT '#000000',
  secondary_color text NOT NULL DEFAULT '#ffffff', 
  accent_color text NOT NULL DEFAULT '#6366f1',
  background_style text NOT NULL DEFAULT 'default',
  font_family text NOT NULL DEFAULT 'system',
  border_radius text NOT NULL DEFAULT 'medium',
  animations_enabled boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on user theme settings
ALTER TABLE public.user_theme_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for user theme settings
CREATE POLICY "Users can manage their own theme settings"
ON public.user_theme_settings
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add triggers for updated_at columns
CREATE TRIGGER update_daily_outfit_suggestions_updated_at
  BEFORE UPDATE ON public.daily_outfit_suggestions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_theme_settings_updated_at
  BEFORE UPDATE ON public.user_theme_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();