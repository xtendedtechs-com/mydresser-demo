-- Phase: Market Visibility + Merchant Save Fixes
-- 1) Ensure market_items is globally visible for browsing
ALTER TABLE IF EXISTS public.market_items ENABLE ROW LEVEL SECURITY;

-- Drop overly restrictive select policy if exists (to avoid duplicates)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'market_items' AND policyname = 'Authenticated can view market items'
  ) THEN
    EXECUTE 'DROP POLICY "Authenticated can view market items" ON public.market_items';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'market_items' AND policyname = 'Users can view own market items'
  ) THEN
    EXECUTE 'DROP POLICY "Users can view own market items" ON public.market_items';
  END IF;
END $$;

-- Public read access for market browsing (no PII in this table)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'market_items' AND policyname = 'Anyone can view market items'
  ) THEN
    EXECUTE 'CREATE POLICY "Anyone can view market items" ON public.market_items FOR SELECT USING (true)';
  END IF;
END $$;

-- Ensure only seller manages their market rows (safe writes)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'market_items' AND policyname = 'Sellers manage own market items'
  ) THEN
    EXECUTE 'CREATE POLICY "Sellers manage own market items" ON public.market_items FOR ALL USING (seller_id = auth.uid()) WITH CHECK (seller_id = auth.uid())';
  END IF;
END $$;

-- 2) Fix merchant_items status constraint causing save failures
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'merchant_items_status_check'
      AND conrelid = 'public.merchant_items'::regclass
  ) THEN
    ALTER TABLE public.merchant_items DROP CONSTRAINT merchant_items_status_check;
  END IF;
END $$;

-- Recreate with comprehensive allowed statuses
ALTER TABLE public.merchant_items
  ADD CONSTRAINT merchant_items_status_check 
  CHECK (status IN (
    'draft','available','unavailable','archived','pending','review','out_of_stock','deleted'
  ));

-- Ensure merchants can manage their own merchant_items (RLS writes)
ALTER TABLE IF EXISTS public.merchant_items ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'merchant_items' AND policyname = 'Merchants manage own items'
  ) THEN
    EXECUTE 'CREATE POLICY "Merchants manage own items" ON public.merchant_items FOR ALL USING (merchant_id = auth.uid()) WITH CHECK (merchant_id = auth.uid())';
  END IF;
END $$;

-- 3) Optional: make only available items visible in market by default via a view or rely on client filter
-- Keeping table wide-open SELECT; client filters by status = available.

-- 4) Small safety: add REPLICA IDENTITY for realtime (if not already)
DO $$ BEGIN
  BEGIN
    EXECUTE 'ALTER TABLE public.market_items REPLICA IDENTITY FULL';
  EXCEPTION WHEN others THEN NULL; END;
  BEGIN
    EXECUTE 'ALTER TABLE public.merchant_items REPLICA IDENTITY FULL';
  EXCEPTION WHEN others THEN NULL; END;
END $$;