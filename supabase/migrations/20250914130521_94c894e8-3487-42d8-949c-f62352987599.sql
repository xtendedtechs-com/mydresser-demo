-- Ensure the profiles table has the email column
-- This fixes the "column email of relation profiles does not exist" error

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'email' 
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN email text;
  END IF;
END $$;