-- Fix merchant signup failing due to ON CONFLICT without unique constraints
-- Add unique constraints required by various SECURITY DEFINER functions

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_preferences_user_id_unique'
  ) THEN
    ALTER TABLE public.user_preferences
      ADD CONSTRAINT user_preferences_user_id_unique UNIQUE (user_id);
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profile_contact_info_user_id_unique'
  ) THEN
    ALTER TABLE public.profile_contact_info
      ADD CONSTRAINT profile_contact_info_user_id_unique UNIQUE (user_id);
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'rate_limits_identifier_action_unique'
  ) THEN
    ALTER TABLE public.rate_limits
      ADD CONSTRAINT rate_limits_identifier_action_unique UNIQUE (identifier, action);
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'mfa_rate_limits_user_action_unique'
  ) THEN
    ALTER TABLE public.mfa_rate_limits
      ADD CONSTRAINT mfa_rate_limits_user_action_unique UNIQUE (user_id, action);
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_mfa_settings_user_id_unique'
  ) THEN
    ALTER TABLE public.user_mfa_settings
      ADD CONSTRAINT user_mfa_settings_user_id_unique UNIQUE (user_id);
  END IF;
END$$;