-- Create merchant analytics table for tracking key metrics
CREATE TABLE IF NOT EXISTS public.merchant_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES public.merchant_profiles(user_id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_sales NUMERIC DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  total_items_sold INTEGER DEFAULT 0,
  average_order_value NUMERIC DEFAULT 0,
  new_customers INTEGER DEFAULT 0,
  returning_customers INTEGER DEFAULT 0,
  revenue_by_category JSONB DEFAULT '{}'::jsonb,
  top_selling_items JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(merchant_id, date)
);

-- Create promotions table
CREATE TABLE IF NOT EXISTS public.promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES public.merchant_profiles(user_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed_amount', 'buy_x_get_y', 'free_shipping')),
  discount_value NUMERIC NOT NULL,
  code TEXT UNIQUE,
  min_purchase_amount NUMERIC DEFAULT 0,
  max_discount_amount NUMERIC,
  applicable_categories TEXT[],
  applicable_items UUID[],
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create customer profiles table (from merchant perspective)
CREATE TABLE IF NOT EXISTS public.merchant_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES public.merchant_profiles(user_id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  total_orders INTEGER DEFAULT 0,
  total_spent NUMERIC DEFAULT 0,
  last_order_date TIMESTAMP WITH TIME ZONE,
  preferred_categories TEXT[],
  notes TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(merchant_id, customer_email)
);

-- Create payment tracking table
CREATE TABLE IF NOT EXISTS public.payment_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  merchant_id UUID NOT NULL REFERENCES public.merchant_profiles(user_id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  transaction_id TEXT,
  payment_gateway TEXT,
  payment_data JSONB DEFAULT '{}'::jsonb,
  refund_amount NUMERIC DEFAULT 0,
  refund_reason TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create inventory alerts table
CREATE TABLE IF NOT EXISTS public.inventory_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES public.merchant_profiles(user_id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.merchant_items(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('low_stock', 'out_of_stock', 'expiring_soon', 'high_demand')),
  threshold_value INTEGER,
  current_value INTEGER,
  message TEXT NOT NULL,
  is_resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.merchant_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchant_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for merchant_analytics
CREATE POLICY "Merchants can manage their own analytics"
  ON public.merchant_analytics
  FOR ALL
  USING (auth.uid() = merchant_id AND is_merchant(auth.uid()))
  WITH CHECK (auth.uid() = merchant_id AND is_merchant(auth.uid()));

-- RLS Policies for promotions
CREATE POLICY "Merchants can manage their own promotions"
  ON public.promotions
  FOR ALL
  USING (auth.uid() = merchant_id AND is_merchant(auth.uid()))
  WITH CHECK (auth.uid() = merchant_id AND is_merchant(auth.uid()));

CREATE POLICY "Public can view active promotions"
  ON public.promotions
  FOR SELECT
  USING (is_active = true AND now() BETWEEN start_date AND end_date);

-- RLS Policies for merchant_customers
CREATE POLICY "Merchants can manage their own customers"
  ON public.merchant_customers
  FOR ALL
  USING (auth.uid() = merchant_id AND is_merchant(auth.uid()))
  WITH CHECK (auth.uid() = merchant_id AND is_merchant(auth.uid()));

-- RLS Policies for payment_records
CREATE POLICY "Merchants can view their own payment records"
  ON public.payment_records
  FOR ALL
  USING (auth.uid() = merchant_id AND is_merchant(auth.uid()))
  WITH CHECK (auth.uid() = merchant_id AND is_merchant(auth.uid()));

-- RLS Policies for inventory_alerts
CREATE POLICY "Merchants can manage their own inventory alerts"
  ON public.inventory_alerts
  FOR ALL
  USING (auth.uid() = merchant_id AND is_merchant(auth.uid()))
  WITH CHECK (auth.uid() = merchant_id AND is_merchant(auth.uid()));

-- Create indexes for performance
CREATE INDEX idx_merchant_analytics_merchant_date ON public.merchant_analytics(merchant_id, date DESC);
CREATE INDEX idx_promotions_merchant_active ON public.promotions(merchant_id, is_active) WHERE is_active = true;
CREATE INDEX idx_promotions_code ON public.promotions(code) WHERE code IS NOT NULL;
CREATE INDEX idx_merchant_customers_merchant ON public.merchant_customers(merchant_id);
CREATE INDEX idx_merchant_customers_email ON public.merchant_customers(merchant_id, customer_email);
CREATE INDEX idx_payment_records_order ON public.payment_records(order_id);
CREATE INDEX idx_payment_records_merchant ON public.payment_records(merchant_id, created_at DESC);
CREATE INDEX idx_inventory_alerts_merchant_unresolved ON public.inventory_alerts(merchant_id, is_resolved) WHERE is_resolved = false;

-- Create trigger for updating timestamps
CREATE TRIGGER update_merchant_analytics_updated_at
  BEFORE UPDATE ON public.merchant_analytics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_promotions_updated_at
  BEFORE UPDATE ON public.promotions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_merchant_customers_updated_at
  BEFORE UPDATE ON public.merchant_customers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();