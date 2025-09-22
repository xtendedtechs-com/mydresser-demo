-- Ensure upsert in sync_merchant_to_market works by creating a unique index
CREATE UNIQUE INDEX IF NOT EXISTS uq_market_items_seller_title
ON public.market_items (seller_id, title);
