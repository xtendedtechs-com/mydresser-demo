-- Enforce strict RLS on profiles by removing conflicting/duplicate policies
-- and ensuring only the restrictive policy remains active

-- 1) Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2) Drop any potentially conflicting/duplicate SELECT policy
DROP POLICY IF EXISTS "Secure profile access" ON public.profiles;

-- 3) Ensure the intended restrictive SELECT policy exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'profiles' 
      AND polname = 'Users can view their own profile'
  ) THEN
    CREATE POLICY "Users can view their own profile"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- Documentation for auditing
COMMENT ON POLICY "Users can view their own profile" ON public.profiles IS 
  'Restrictive SELECT policy: Only the owner (auth.uid() = user_id) can view their profile.';