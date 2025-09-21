-- Remove duplicate auth.users triggers causing repeated inserts and signup failures
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
    DROP TRIGGER on_auth_user_created ON auth.users;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created_profile') THEN
    DROP TRIGGER on_auth_user_created_profile ON auth.users;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created_preferences') THEN
    DROP TRIGGER on_auth_user_created_preferences ON auth.users;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created_merchant') THEN
    DROP TRIGGER on_auth_user_created_merchant ON auth.users;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_merchant_user_created') THEN
    DROP TRIGGER on_merchant_user_created ON auth.users;
  END IF;
END$$;

-- Ensure the canonical ordered triggers exist and are enabled
DO $$
BEGIN
  -- handle_new_user first
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'a_on_auth_user_created_handle_new_user'
  ) THEN
    CREATE TRIGGER a_on_auth_user_created_handle_new_user
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
  END IF;

  -- merchant signup next
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'b_on_auth_user_created_handle_merchant_signup'
  ) THEN
    CREATE TRIGGER b_on_auth_user_created_handle_merchant_signup
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_merchant_signup();
  END IF;

  -- preferences last
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'c_on_auth_user_created_handle_new_user_preferences'
  ) THEN
    CREATE TRIGGER c_on_auth_user_created_handle_new_user_preferences
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_preferences();
  END IF;
END$$;