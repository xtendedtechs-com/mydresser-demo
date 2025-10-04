-- Create table for VTO photo history
CREATE TABLE public.vto_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vto_photos ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own VTO photos"
  ON public.vto_photos
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add VTO settings to user_settings table
ALTER TABLE public.user_settings
ADD COLUMN IF NOT EXISTS enable_random_vto_photo BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS current_vto_photo_id UUID REFERENCES public.vto_photos(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX idx_vto_photos_user_id ON public.vto_photos(user_id);
CREATE INDEX idx_vto_photos_active ON public.vto_photos(user_id, is_active) WHERE is_active = true;