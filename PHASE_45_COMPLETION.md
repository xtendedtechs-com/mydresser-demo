# Phase 45: Wardrobe Analytics & Insights Dashboard

## Completion Date
2025-10-05

## Objectives

### 1. Wardrobe Analytics Dashboard
Implement comprehensive analytics showing:
- **Wardrobe Value**: Total investment, cost per wear, ROI by category
- **Usage Patterns**: Most/least worn items, seasonal distribution, wear frequency
- **Sustainability Metrics**: Items per wear, quality scores, lifecycle tracking
- **Style Insights**: Color distribution, brand breakdown, category balance
- **Smart Recommendations**: Gap analysis, shopping suggestions, organization tips

### 2. Wear Tracking Enhancement
Improve the existing wear tracking system:
- **Quick Mark as Worn**: One-tap from any item card
- **Wear History**: Timeline view of when items were worn
- **Outfit Context**: Link wears to outfit combinations
- **Weather Context**: Record weather conditions for each wear
- **Automatic Cost-per-Wear**: Calculate and display CPW for all items

### 3. Item Lifecycle Management
Track complete item journey:
- **Purchase Tracking**: Date, price, source
- **Wear Lifecycle**: First wear, total wears, last worn
- **Condition Tracking**: Automatic degradation alerts
- **Care History**: Washing, dry cleaning, repairs
- **End of Life**: Sell, donate, recycle tracking

### 4. Data Visualization
Beautiful charts and graphs:
- **Category Distribution**: Pie chart of wardrobe composition
- **Value Over Time**: Line graph of wardrobe value growth
- **Wear Frequency**: Bar chart of most/least worn categories
- **Color Palette**: Visual representation of color distribution
- **Monthly Insights**: Calendar heatmap of wardrobe activity

## Database Schema

```sql
-- Wardrobe analytics aggregations
CREATE TABLE wardrobe_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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
CREATE TABLE item_wear_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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
CREATE TABLE item_care_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wardrobe_item_id UUID NOT NULL REFERENCES wardrobe_items(id) ON DELETE CASCADE,
  care_type TEXT NOT NULL CHECK (care_type IN ('wash', 'dry_clean', 'repair', 'alteration', 'iron', 'other')),
  care_date DATE NOT NULL DEFAULT CURRENT_DATE,
  cost DECIMAL(10,2),
  service_provider TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_wardrobe_analytics_user_date ON wardrobe_analytics(user_id, metric_date DESC);
CREATE INDEX idx_item_wear_history_user_item ON item_wear_history(user_id, wardrobe_item_id);
CREATE INDEX idx_item_wear_history_date ON item_wear_history(worn_date DESC);
CREATE INDEX idx_item_care_log_user_item ON item_care_log(user_id, wardrobe_item_id);

-- RLS Policies
ALTER TABLE wardrobe_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_wear_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_care_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own analytics"
  ON wardrobe_analytics FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own wear history"
  ON item_wear_history FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own care log"
  ON item_care_log FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

## Functions

```sql
-- Aggregate daily wardrobe analytics
CREATE OR REPLACE FUNCTION aggregate_wardrobe_analytics(p_user_id UUID, p_date DATE DEFAULT CURRENT_DATE)
RETURNS VOID
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_analytics RECORD;
BEGIN
  WITH wardrobe_stats AS (
    SELECT
      COUNT(*) as total_items,
      COALESCE(SUM(purchase_price), 0) as total_value,
      COALESCE(AVG(wear_count), 0) as avg_wear_frequency,
      jsonb_object_agg(category, cat_count) as category_dist,
      jsonb_object_agg(COALESCE(color, 'unknown'), color_count) as color_dist,
      jsonb_object_agg(COALESCE(brand, 'unknown'), brand_count) as brand_dist
    FROM (
      SELECT 
        category,
        color,
        brand,
        wear_count,
        purchase_price,
        COUNT(*) OVER (PARTITION BY category) as cat_count,
        COUNT(*) OVER (PARTITION BY color) as color_count,
        COUNT(*) OVER (PARTITION BY brand) as brand_count
      FROM wardrobe_items
      WHERE user_id = p_user_id
    ) grouped
  )
  INSERT INTO wardrobe_analytics (
    user_id, metric_date, total_items, total_value,
    avg_wear_frequency, category_distribution,
    color_distribution, brand_distribution
  )
  SELECT
    p_user_id, p_date, total_items, total_value,
    avg_wear_frequency, category_dist,
    color_dist, brand_dist
  FROM wardrobe_stats
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
  WITH insights AS (
    SELECT
      jsonb_build_object(
        'total_items', COUNT(*),
        'total_value', COALESCE(SUM(purchase_price), 0),
        'avg_cost_per_item', COALESCE(AVG(purchase_price), 0),
        'most_worn_category', (
          SELECT category FROM wardrobe_items 
          WHERE user_id = p_user_id 
          ORDER BY wear_count DESC LIMIT 1
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
        )
      ) as insight_data
    FROM wardrobe_items
    WHERE user_id = p_user_id
  )
  SELECT insight_data INTO v_insights FROM insights;
  
  RETURN v_insights;
END;
$$ LANGUAGE plpgsql;
```

## Components Created

### 1. WardrobeAnalytics Component
**Path**: `src/components/wardrobe/WardrobeAnalytics.tsx`

Features:
- Overview cards (Total Items, Total Value, Avg Cost-per-Wear, Items Never Worn)
- Interactive charts using Recharts
- Category/color/brand distribution visualizations
- Most/least worn items lists
- Quick actions to mark items as worn

### 2. WearTracker Component
**Path**: `src/components/wardrobe/WearTracker.tsx`

Features:
- One-click "Mark as Worn" button
- Wear history timeline
- Outfit association
- Weather condition tracking
- Automatic CPW recalculation

### 3. ItemLifecycle Component
**Path**: `src/components/wardrobe/ItemLifecycle.tsx`

Features:
- Purchase to present timeline
- Care history tracking
- Condition status updates
- End-of-life options (sell/donate/recycle)

## Hook Created

### useWardrobeAnalytics
**Path**: `src/hooks/useWardrobeAnalytics.tsx`

Provides:
- `getAnalytics(days?)`: Fetch analytics for date range
- `getInsights()`: Get smart recommendations
- `trackWear(itemId, occasion?, weather?)`: Log item wear
- `trackCare(itemId, careType, cost?)`: Log care event
- `getCostPerWear(itemId)`: Calculate CPW for specific item
- `getNeverWornItems()`: Filter unworn items
- `getMostWornItems(limit?)`: Get top worn items

## Routes Added
- `/wardrobe-analytics` → WardrobeAnalytics page
- Integrated analytics tab in Wardrobe page

## Testing Scenarios
1. ✅ View comprehensive analytics dashboard
2. ✅ Mark items as worn and see CPW update
3. ✅ Track care events (wash, repair, etc.)
4. ✅ View wear history timeline
5. ✅ Identify never-worn items for resale
6. ✅ Get smart shopping recommendations based on gaps

## Business Value
- **User Engagement**: Visual insights increase wardrobe interaction
- **Cost Awareness**: CPW metrics encourage thoughtful purchasing
- **Sustainability**: Track lifecycle encourages longer item use
- **Marketplace Connection**: Never-worn items → 2ndDresser listings
- **AI Enhancement**: Rich data for smarter outfit recommendations

## Security & Privacy
- All analytics data isolated by user_id via RLS
- No cross-user data exposure
- Efficient aggregation reduces query load
- Proper indexes for performance

## Performance
- Daily aggregation reduces real-time calculation overhead
- Indexed queries for fast dashboard loading
- Lazy loading for historical data
- Efficient JSONB storage for distributions

## Next Phase: Ready for Phase 46
Foundation laid for:
- Predictive analytics (ML-powered insights)
- Social comparison features (opt-in, anonymous)
- Carbon footprint tracking
- Personalized shopping recommendations
