-- Fix function search_path security warnings
-- Update functions to have explicit search_path set to 'public'

-- These functions need search_path set for security
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
ALTER FUNCTION public.update_merchant_items_updated_at() SET search_path = public;

-- Add any missing search_path settings to ensure security
COMMENT ON FUNCTION public.update_updated_at_column() IS 'Trigger function to update updated_at timestamp - search_path secured';
COMMENT ON FUNCTION public.update_merchant_items_updated_at() IS 'Trigger function for merchant items updated_at - search_path secured';