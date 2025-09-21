-- Add new columns to merchant_pages table for enhanced customization
ALTER TABLE public.merchant_pages 
ADD COLUMN IF NOT EXISTS secondary_color text DEFAULT '#666666',
ADD COLUMN IF NOT EXISTS accent_color text DEFAULT '#ff6b35',
ADD COLUMN IF NOT EXISTS gallery_images text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS layout_style text DEFAULT 'modern',
ADD COLUMN IF NOT EXISTS font_family text DEFAULT 'Inter',
ADD COLUMN IF NOT EXISTS show_reviews boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS show_social_proof boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS enable_chat boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS enable_wishlist boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS show_stock_count boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS enable_quick_view boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS custom_css text DEFAULT '',
ADD COLUMN IF NOT EXISTS meta_description text DEFAULT '',
ADD COLUMN IF NOT EXISTS keywords text DEFAULT '',
ADD COLUMN IF NOT EXISTS google_analytics text DEFAULT '';

-- Update merchant_pages RLS policies
DROP POLICY IF EXISTS "Merchants can manage their own pages" ON public.merchant_pages;
DROP POLICY IF EXISTS "Public can view published merchant pages" ON public.merchant_pages;

CREATE POLICY "Merchants can manage their own pages"
ON public.merchant_pages
FOR ALL
USING ((auth.uid() = merchant_id) AND is_merchant(auth.uid()))
WITH CHECK ((auth.uid() = merchant_id) AND is_merchant(auth.uid()));

CREATE POLICY "Public can view published merchant pages"
ON public.merchant_pages
FOR SELECT
USING (is_published = true);

CREATE POLICY "Anyone can view merchant pages"
ON public.merchant_pages
FOR SELECT
USING (true);