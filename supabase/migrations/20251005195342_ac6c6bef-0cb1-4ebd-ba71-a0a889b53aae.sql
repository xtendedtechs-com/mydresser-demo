-- Phase 45: Wardrobe Analytics & Insights Dashboard

-- Wardrobe analytics aggregations
CREATE TABLE IF NOT EXISTS wardrobe_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_items INTEGER DEFAULT 0,
  total_value DECIMAL(10,2) DEFAULT 0,
  items_worn_today INTEGER DEFAULT 0,
  unique_outfits_created INTEGER DEFAULT 0,
  avg_wear_frequency DECIMAL(5,2) DEFAULT 0,
  category_distribution JSONB DEFAULT '{}',
  color_distribution JSONB DEFAULT '{}',
  brand_distribution JSONB DEFAULT '{}',
  sustainability_score INTEGER DEFAULT 0,
  cost_per_wear_avg DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, metric_date)
);

-- Item wear history detail
CREATE TABLE IF NOT EXISTS item_wear_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  wardrobe_item_id UUID NOT NULL REFERENCES wardrobe_items(id) ON DELETE CASCADE,
  worn_date DATE NOT NULL DEFAULT CURRENT_DATE,
  outfit_id UUID REFERENCES outfits(id) ON DELETE SET NULL,
  occasion TEXT,
  weather_data JSONB,
  location TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Item care log
CREATE TABLE IF NOT EXISTS item_care_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  wardrobe_item_id UUID NOT NULL REFERENCES wardrobe_items(id) ON DELETE CASCADE,
  care_type TEXT NOT NULL CHECK (care_type IN ('wash', 'dry_clean', 'repair', 'alteration', 'iron', 'other')),
  care_date DATE NOT NULL DEFAULT CURRENT_DATE,
  cost DECIMAL(10,2),
  service_provider TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_wardrobe_analytics_user_date ON wardrobe_analytics(user_id, metric_date DESC);
CREATE INDEX IF NOT EXISTS idx_item_wear_history_user_item ON item_wear_history(user_id, wardrobe_item_id);
CREATE INDEX IF NOT EXISTS idx_item_wear_history_date ON item_wear_history(worn_date DESC);
CREATE INDEX IF NOT EXISTS idx_item_care_log_user_item ON item_care_log(user_id, wardrobe_item_id);

-- RLS Policies
ALTER TABLE wardrobe_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_wear_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_care_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own analytics" ON wardrobe_analytics;
CREATE POLICY "Users manage own analytics"
  ON wardrobe_analytics FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own wear history" ON item_wear_history;
CREATE POLICY "Users manage own wear history"
  ON item_wear_history FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own care log" ON item_care_log;
CREATE POLICY "Users manage own care log"
  ON item_care_log FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Aggregate daily wardrobe analytics
CREATE OR REPLACE FUNCTION aggregate_wardrobe_analytics(p_user_id UUID, p_date DATE DEFAULT CURRENT_DATE)
RETURNS VOID
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_total_items INTEGER;
  v_total_value DECIMAL(10,2);
  v_avg_wear DECIMAL(5,2);
  v_category_dist JSONB;
  v_color_dist JSONB;
  v_brand_dist JSONB;
BEGIN
  -- Calculate aggregates
  SELECT
    COUNT(*),
    COALESCE(SUM(purchase_price), 0),
    COALESCE(AVG(wear_count), 0)
  INTO v_total_items, v_total_value, v_avg_wear
  FROM wardrobe_items
  WHERE user_id = p_user_id;

  -- Category distribution
  SELECT jsonb_object_agg(category, count)
  INTO v_category_dist
  FROM (
    SELECT category, COUNT(*) as count
    FROM wardrobe_items
    WHERE user_id = p_user_id
    GROUP BY category
  ) cat;

  -- Color distribution
  SELECT jsonb_object_agg(COALESCE(color, 'unknown'), count)
  INTO v_color_dist
  FROM (
    SELECT color, COUNT(*) as count
    FROM wardrobe_items
    WHERE user_id = p_user_id
    GROUP BY color
  ) col;

  -- Brand distribution
  SELECT jsonb_object_agg(COALESCE(brand, 'unknown'), count)
  INTO v_brand_dist
  FROM (
    SELECT brand, COUNT(*) as count
    FROM wardrobe_items
    WHERE user_id = p_user_id
    GROUP BY brand
  ) br;

  -- Insert or update
  INSERT INTO wardrobe_analytics (
    user_id, metric_date, total_items, total_value,
    avg_wear_frequency, category_distribution,
    color_distribution, brand_distribution
  ) VALUES (
    p_user_id, p_date, v_total_items, v_total_value,
    v_avg_wear, v_category_dist, v_color_dist, v_brand_dist
  )
  ON CONFLICT (user_id, metric_date) DO UPDATE SET
    total_items = EXCLUDED.total_items,
    total_value = EXCLUDED.total_value,
    avg_wear_frequency = EXCLUDED.avg_wear_frequency,
    category_distribution = EXCLUDED.category_distribution,
    color_distribution = EXCLUDED.color_distribution,
    brand_distribution = EXCLUDED.brand_distribution;
END;
$$ LANGUAGE plpgsql;

-- Get comprehensive wardrobe insights
CREATE OR REPLACE FUNCTION get_wardrobe_insights(p_user_id UUID, p_days INTEGER DEFAULT 30)
RETURNS JSONB
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_insights JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_items', COUNT(*),
    'total_value', COALESCE(SUM(purchase_price), 0),
    'avg_cost_per_item', COALESCE(AVG(purchase_price), 0),
    'most_worn_category', (
      SELECT category FROM wardrobe_items 
      WHERE user_id = p_user_id AND category IS NOT NULL
      GROUP BY category
      ORDER BY SUM(wear_count) DESC LIMIT 1
    ),
    'least_worn_items', (
      SELECT jsonb_agg(jsonb_build_object('id', id, 'name', name, 'wear_count', wear_count))
      FROM (
        SELECT id, name, wear_count
        FROM wardrobe_items
        WHERE user_id = p_user_id
        ORDER BY wear_count ASC, created_at DESC
        LIMIT 5
      ) lw
    ),
    'items_never_worn', (
      SELECT COUNT(*) FROM wardrobe_items 
      WHERE user_id = p_user_id AND wear_count = 0
    ),
    'avg_cost_per_wear', (
      SELECT COALESCE(AVG(CASE WHEN wear_count > 0 THEN purchase_price / wear_count ELSE NULL END), 0)
      FROM wardrobe_items
      WHERE user_id = p_user_id AND purchase_price IS NOT NULL
    ),
    'recent_wears', (
      SELECT COUNT(*) FROM item_wear_history
      WHERE user_id = p_user_id AND worn_date >= CURRENT_DATE - p_days
    )
  ) INTO v_insights
  FROM wardrobe_items
  WHERE user_id = p_user_id;
  
  RETURN v_insights;
END;
$$ LANGUAGE plpgsql;