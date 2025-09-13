-- Create merchant_items table for marketplace products
CREATE TABLE public.merchant_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  merchant_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  brand TEXT,
  color TEXT,
  size TEXT[],
  material TEXT,
  season TEXT,
  occasion TEXT,
  price NUMERIC NOT NULL,
  original_price NUMERIC,
  photos JSONB,
  tags TEXT[],
  condition TEXT DEFAULT 'new',
  stock_quantity INTEGER DEFAULT 1,
  is_featured BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false,
  style_tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.merchant_items ENABLE ROW LEVEL SECURITY;

-- Create policies for merchant items
CREATE POLICY "Anyone can view merchant items" 
ON public.merchant_items 
FOR SELECT 
USING (true);

CREATE POLICY "Merchants can create their own items" 
ON public.merchant_items 
FOR INSERT 
WITH CHECK (auth.uid() = merchant_id);

CREATE POLICY "Merchants can update their own items" 
ON public.merchant_items 
FOR UPDATE 
USING (auth.uid() = merchant_id);

CREATE POLICY "Merchants can delete their own items" 
ON public.merchant_items 
FOR DELETE 
USING (auth.uid() = merchant_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_merchant_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_merchant_items_updated_at
BEFORE UPDATE ON public.merchant_items
FOR EACH ROW
EXECUTE FUNCTION public.update_merchant_items_updated_at();

-- Create item_matches table for connecting user items with merchant items
CREATE TABLE public.item_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_item_id UUID NOT NULL,
  merchant_item_id UUID NOT NULL,
  match_score NUMERIC DEFAULT 0.8,
  match_reasons TEXT[],
  status TEXT DEFAULT 'suggested', -- suggested, accepted, rejected
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for item matches
ALTER TABLE public.item_matches ENABLE ROW LEVEL SECURITY;

-- Create policies for item matches
CREATE POLICY "Users can manage their own item matches" 
ON public.item_matches 
FOR ALL 
USING (auth.uid() = user_id);

-- Add indexes for better performance
CREATE INDEX idx_merchant_items_category ON public.merchant_items(category);
CREATE INDEX idx_merchant_items_brand ON public.merchant_items(brand);
CREATE INDEX idx_merchant_items_merchant ON public.merchant_items(merchant_id);
CREATE INDEX idx_item_matches_user ON public.item_matches(user_id);
CREATE INDEX idx_item_matches_status ON public.item_matches(status);