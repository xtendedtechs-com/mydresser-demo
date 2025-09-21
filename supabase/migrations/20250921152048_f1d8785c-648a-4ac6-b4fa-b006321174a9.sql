-- Create market_items table for 2ndDresser marketplace
CREATE TABLE public.market_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wardrobe_item_id UUID REFERENCES public.wardrobe_items(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  original_price NUMERIC,
  condition TEXT NOT NULL DEFAULT 'good',
  size TEXT,
  brand TEXT,
  category TEXT NOT NULL,
  color TEXT,
  material TEXT,
  photos JSONB DEFAULT '[]'::jsonb,
  location TEXT,
  shipping_options JSONB DEFAULT '{"local_pickup": false, "shipping_available": true, "shipping_cost": 0}'::jsonb,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'sold', 'reserved')),
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  sustainability_score INTEGER,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.market_items ENABLE ROW LEVEL SECURITY;

-- Create policies for market_items
CREATE POLICY "Anyone can view available market items"
ON public.market_items
FOR SELECT
USING (status = 'available' OR auth.uid() = seller_id);

CREATE POLICY "Users can create their own market items"
ON public.market_items
FOR INSERT
WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users can update their own market items"
ON public.market_items
FOR UPDATE
USING (auth.uid() = seller_id);

CREATE POLICY "Users can delete their own market items"
ON public.market_items
FOR DELETE
USING (auth.uid() = seller_id);

-- Create social_posts table for social features
CREATE TABLE public.social_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  outfit_items TEXT[] DEFAULT '{}',
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;

-- Create policies for social_posts
CREATE POLICY "Users can view all social posts"
ON public.social_posts
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create their own social posts"
ON public.social_posts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own social posts"
ON public.social_posts
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own social posts"
ON public.social_posts
FOR DELETE
USING (auth.uid() = user_id);

-- Create social_comments table
CREATE TABLE public.social_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.social_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.social_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for social_comments
CREATE POLICY "Users can view all comments"
ON public.social_comments
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create comments"
ON public.social_comments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Update triggers for updated_at
CREATE TRIGGER update_market_items_updated_at
  BEFORE UPDATE ON public.market_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_social_posts_updated_at
  BEFORE UPDATE ON public.social_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();