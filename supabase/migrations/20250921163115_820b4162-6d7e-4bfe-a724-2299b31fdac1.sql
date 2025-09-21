-- Add unique constraints required by ON CONFLICT clauses used in signup handlers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_user_id_unique'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_user_id_unique UNIQUE (user_id);
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'merchant_profiles_user_id_unique'
  ) THEN
    ALTER TABLE public.merchant_profiles
      ADD CONSTRAINT merchant_profiles_user_id_unique UNIQUE (user_id);
  END IF;
END$$;

-- Ensure AFTER INSERT triggers on auth.users execute in correct order so RLS checks pass
-- 1) Create base profile
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'a_on_auth_user_created_handle_new_user'
  ) THEN
    CREATE TRIGGER a_on_auth_user_created_handle_new_user
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
  END IF;
END$$;

-- 2) Create merchant resources when user_type=merchant (depends on profile existing)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'b_on_auth_user_created_handle_merchant_signup'
  ) THEN
    CREATE TRIGGER b_on_auth_user_created_handle_merchant_signup
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_merchant_signup();
  END IF;
END$$;

-- 3) Create default user preferences (independent but ordered last)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'c_on_auth_user_created_handle_new_user_preferences'
  ) THEN
    CREATE TRIGGER c_on_auth_user_created_handle_new_user_preferences
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_preferences();
  END IF;
END$$;