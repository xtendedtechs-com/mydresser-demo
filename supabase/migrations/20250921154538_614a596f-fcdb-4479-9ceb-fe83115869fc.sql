-- Fix merchant signup issues and add missing indexes
-- Add function to validate user session robustly (referenced in RLS policies)
CREATE OR REPLACE FUNCTION public.validate_user_session_robust()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is authenticated and session is valid
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if user exists in profiles
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid()
  ) THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

-- Add styles table for My Style functionality
CREATE TABLE IF NOT EXISTS public.user_styles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  style_name text NOT NULL,
  style_description text,
  color_palette jsonb,
  preferred_categories jsonb,
  style_keywords text[],
  inspiration_images text[],
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  is_active boolean DEFAULT true
);

-- Enable RLS for user_styles
ALTER TABLE public.user_styles ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_styles
CREATE POLICY "Users can manage their own styles"
ON public.user_styles
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add outfit suggestions table for AI recommendations
CREATE TABLE IF NOT EXISTS public.outfit_suggestions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  outfit_id uuid REFERENCES public.outfits(id) ON DELETE CASCADE,
  suggestion_type text NOT NULL, -- 'daily', 'occasion', 'weather', 'style'
  confidence_score decimal(3,2),
  reasoning text,
  weather_data jsonb,
  occasion text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  is_accepted boolean DEFAULT null -- null = pending, true = accepted, false = rejected
);

-- Enable RLS for outfit_suggestions
ALTER TABLE public.outfit_suggestions ENABLE ROW LEVEL SECURITY;

-- RLS policies for outfit_suggestions
CREATE POLICY "Users can manage their own outfit suggestions"
ON public.outfit_suggestions
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_styles_user_id ON public.user_styles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_styles_active ON public.user_styles(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_outfit_suggestions_user_id ON public.outfit_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_outfit_suggestions_type ON public.outfit_suggestions(user_id, suggestion_type);
CREATE INDEX IF NOT EXISTS idx_market_items_status ON public.market_items(status);
CREATE INDEX IF NOT EXISTS idx_social_posts_user_id ON public.social_posts(user_id);

-- Add trigger for updated_at on user_styles
CREATE TRIGGER update_user_styles_updated_at
  BEFORE UPDATE ON public.user_styles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();