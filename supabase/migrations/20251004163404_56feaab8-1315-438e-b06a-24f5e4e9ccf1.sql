-- Add VTO photo URL column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS vto_photo_url TEXT;