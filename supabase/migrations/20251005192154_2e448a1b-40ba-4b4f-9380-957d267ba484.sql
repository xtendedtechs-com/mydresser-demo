-- Phase 42: Fix Critical Market & Photo Issues

-- Fix 1: Update merchant_items status check constraint to allow 'draft'
ALTER TABLE public.merchant_items DROP CONSTRAINT IF EXISTS merchant_items_status_check;
ALTER TABLE public.merchant_items ADD CONSTRAINT merchant_items_status_check 
  CHECK (status IN ('draft', 'available', 'sold', 'reserved'));

-- Fix 2: Ensure market_items allows all statuses
ALTER TABLE public.market_items DROP CONSTRAINT IF EXISTS market_items_status_check;
ALTER TABLE public.market_items ADD CONSTRAINT market_items_status_check 
  CHECK (status IN ('available', 'sold', 'reserved'));

-- Fix 3: Add index to improve market query performance
CREATE INDEX IF NOT EXISTS idx_market_items_status_seller 
  ON public.market_items(status, seller_id);

CREATE INDEX IF NOT EXISTS idx_merchant_items_status_merchant 
  ON public.merchant_items(status, merchant_id);