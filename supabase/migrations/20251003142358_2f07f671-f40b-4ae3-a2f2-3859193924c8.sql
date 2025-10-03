-- Fix function search_path security warnings by setting search_path to empty string
-- This forces all references to be fully qualified with schema names

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql 
SET search_path = '';

-- Fix update_merchant_items_updated_at function  
CREATE OR REPLACE FUNCTION public.update_merchant_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = '';