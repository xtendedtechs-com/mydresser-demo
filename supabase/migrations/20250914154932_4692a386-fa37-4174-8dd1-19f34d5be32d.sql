-- Create merchant_pages table to store customization data
CREATE TABLE public.merchant_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  merchant_id UUID NOT NULL REFERENCES public.merchant_profiles(user_id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  brand_story TEXT,
  specialties TEXT[] DEFAULT ARRAY[]::TEXT[],
  featured_collections TEXT[] DEFAULT ARRAY[]::TEXT[],
  social_links JSONB DEFAULT '{}'::JSONB,
  hero_image TEXT,
  logo TEXT,
  theme_color TEXT DEFAULT '#000000',
  business_hours JSONB DEFAULT '{}'::JSONB,
  contact_info JSONB DEFAULT '{}'::JSONB,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.merchant_pages ENABLE ROW LEVEL SECURITY;

-- Create policies for merchant_pages
CREATE POLICY "Merchants can manage their own pages" 
ON public.merchant_pages 
FOR ALL 
USING (auth.uid() = merchant_id);

-- Allow public read access for published pages
CREATE POLICY "Public can view published merchant pages" 
ON public.merchant_pages 
FOR SELECT 
USING (is_published = true);

-- Create updated_at trigger
CREATE TRIGGER update_merchant_pages_updated_at
BEFORE UPDATE ON public.merchant_pages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create unique constraint to ensure one page per merchant
CREATE UNIQUE INDEX merchant_pages_merchant_id_unique ON public.merchant_pages(merchant_id);