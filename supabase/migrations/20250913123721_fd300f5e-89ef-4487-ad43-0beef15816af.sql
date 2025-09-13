-- Tighten RLS to prevent email harvesting via public profiles

-- 1) Remove any policy that allows selecting public profiles directly from the base table
DROP POLICY IF EXISTS "Authenticated users can view public profiles safely" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view limited public profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view public profiles" ON public.profiles;

-- Keep ONLY owner's select access on base table
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='profiles' AND policyname='Users can view their own profile' AND cmd='SELECT'
  ) THEN
    CREATE POLICY "Users can view their own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- 2) Provide a safe RPC to get public profiles WITHOUT sensitive fields
--    This avoids exposing email, privacy JSON, auth_level, etc.
CREATE OR REPLACE FUNCTION public.get_public_profiles()
RETURNS TABLE (
  id UUID,
  user_id UUID,
  full_name TEXT,
  avatar_url TEXT,
  role user_role,
  bio TEXT,
  location TEXT,
  social_instagram TEXT,
  social_facebook TEXT,
  social_tiktok TEXT,
  style_score INTEGER,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    p.full_name,
    p.avatar_url,
    p.role,
    p.bio,
    p.location,
    p.social_instagram,
    p.social_facebook,
    p.social_tiktok,
    p.style_score,
    p.created_at
  FROM public.profiles p
  WHERE p.is_profile_public = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

GRANT EXECUTE ON FUNCTION public.get_public_profiles() TO anon, authenticated;