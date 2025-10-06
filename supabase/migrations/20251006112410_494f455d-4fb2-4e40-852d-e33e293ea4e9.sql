-- Add care_instructions field to merchant_items table
ALTER TABLE public.merchant_items 
ADD COLUMN IF NOT EXISTS care_instructions TEXT;

COMMENT ON COLUMN public.merchant_items.care_instructions IS 'Product care and maintenance instructions for customers';