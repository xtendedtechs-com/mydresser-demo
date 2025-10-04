-- Create currency_settings table
CREATE TABLE public.currency_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  base_currency TEXT NOT NULL DEFAULT 'USD',
  display_currency TEXT NOT NULL DEFAULT 'USD',
  auto_convert BOOLEAN NOT NULL DEFAULT true,
  preferred_payment_method TEXT,
  tax_region TEXT,
  tax_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create exchange_rates table
CREATE TABLE public.exchange_rates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_currency TEXT NOT NULL,
  to_currency TEXT NOT NULL,
  rate DECIMAL(10,6) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for fast exchange rate lookups
CREATE INDEX idx_exchange_rates_currencies ON public.exchange_rates(from_currency, to_currency);

-- Create shipping_zones table
CREATE TABLE public.shipping_zones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  merchant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  countries TEXT[] NOT NULL DEFAULT '{}',
  regions TEXT[] NOT NULL DEFAULT '{}',
  base_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
  per_item_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  estimated_days_min INTEGER NOT NULL DEFAULT 3,
  estimated_days_max INTEGER NOT NULL DEFAULT 7,
  is_active BOOLEAN NOT NULL DEFAULT true,
  free_shipping_threshold DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.currency_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_zones ENABLE ROW LEVEL SECURITY;

-- RLS Policies for currency_settings
CREATE POLICY "Users can view their own currency settings"
  ON public.currency_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own currency settings"
  ON public.currency_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own currency settings"
  ON public.currency_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for exchange_rates (read-only for all authenticated users)
CREATE POLICY "Anyone can view exchange rates"
  ON public.exchange_rates FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for shipping_zones
CREATE POLICY "Merchants can view their own shipping zones"
  ON public.shipping_zones FOR SELECT
  USING (auth.uid() = merchant_id);

CREATE POLICY "Merchants can insert their own shipping zones"
  ON public.shipping_zones FOR INSERT
  WITH CHECK (auth.uid() = merchant_id);

CREATE POLICY "Merchants can update their own shipping zones"
  ON public.shipping_zones FOR UPDATE
  USING (auth.uid() = merchant_id);

CREATE POLICY "Merchants can delete their own shipping zones"
  ON public.shipping_zones FOR DELETE
  USING (auth.uid() = merchant_id);

-- Customers can view active shipping zones for orders
CREATE POLICY "Customers can view active shipping zones"
  ON public.shipping_zones FOR SELECT
  USING (is_active = true);

-- Create trigger for currency_settings updated_at
CREATE TRIGGER update_currency_settings_updated_at
  BEFORE UPDATE ON public.currency_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for shipping_zones updated_at
CREATE TRIGGER update_shipping_zones_updated_at
  BEFORE UPDATE ON public.shipping_zones
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some initial exchange rates
INSERT INTO public.exchange_rates (from_currency, to_currency, rate) VALUES
  ('USD', 'EUR', 0.92),
  ('USD', 'GBP', 0.79),
  ('USD', 'JPY', 149.50),
  ('USD', 'CAD', 1.36),
  ('USD', 'AUD', 1.53),
  ('EUR', 'USD', 1.09),
  ('GBP', 'USD', 1.27),
  ('JPY', 'USD', 0.0067),
  ('CAD', 'USD', 0.74),
  ('AUD', 'USD', 0.65);