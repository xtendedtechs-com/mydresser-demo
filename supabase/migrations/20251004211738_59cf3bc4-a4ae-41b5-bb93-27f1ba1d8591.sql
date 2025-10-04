-- Add more customization fields to merchant_pages
ALTER TABLE merchant_pages 
ADD COLUMN IF NOT EXISTS background_color text DEFAULT '#ffffff',
ADD COLUMN IF NOT EXISTS text_color text DEFAULT '#000000',
ADD COLUMN IF NOT EXISTS profile_photo text,
ADD COLUMN IF NOT EXISTS cover_video text,
ADD COLUMN IF NOT EXISTS active_sections jsonb DEFAULT '{"hero": true, "about": true, "featured": true, "collections": true, "gallery": true, "contact": true}'::jsonb,
ADD COLUMN IF NOT EXISTS section_order jsonb DEFAULT '["hero", "about", "featured", "collections", "gallery", "contact"]'::jsonb;