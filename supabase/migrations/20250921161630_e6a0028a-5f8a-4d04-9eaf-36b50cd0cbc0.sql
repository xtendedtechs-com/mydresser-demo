-- Create user theme settings table with RLS and triggers
CREATE TABLE IF NOT EXISTS public.user_theme_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  theme_name TEXT NOT NULL DEFAULT 'system',
  primary_color TEXT NOT NULL DEFAULT '#000000',
  secondary_color TEXT NOT NULL DEFAULT '#ffffff',
  accent_color TEXT NOT NULL DEFAULT '#6366f1',
  background_style TEXT NOT NULL DEFAULT 'default',
  font_family TEXT NOT NULL DEFAULT 'system',
  border_radius TEXT NOT NULL DEFAULT 'medium',
  animations_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

-- Enable RLS
ALTER TABLE public.user_theme_settings ENABLE ROW LEVEL SECURITY;

-- Policies: users manage their own theme settings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'user_theme_settings' AND policyname = 'Users can manage their own theme settings'
  ) THEN
    CREATE POLICY "Users can manage their own theme settings"
    ON public.user_theme_settings
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;
END$$;

-- Trigger to update updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_theme_settings_updated_at'
  ) THEN
    CREATE TRIGGER update_user_theme_settings_updated_at
    BEFORE UPDATE ON public.user_theme_settings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END$$;

-- Ensure handle_new_user_preferences runs with SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.handle_new_user_preferences()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Create missing triggers on auth.users to initialize profiles, preferences, and merchant profiles
DO $$
BEGIN
  -- Create profile on sign up
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created_profile'
  ) THEN
    CREATE TRIGGER on_auth_user_created_profile
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
  END IF;

  -- Create default preferences on sign up
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created_preferences'
  ) THEN
    CREATE TRIGGER on_auth_user_created_preferences
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_preferences();
  END IF;

  -- Create merchant profile on sign up when user_type = 'merchant'
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created_merchant'
  ) THEN
    CREATE TRIGGER on_auth_user_created_merchant
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_merchant_signup();
  END IF;
END$$;