-- Create wardrobe_collections table
CREATE TABLE IF NOT EXISTS public.wardrobe_collections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create wardrobe_collection_items table
CREATE TABLE IF NOT EXISTS public.wardrobe_collection_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_id UUID NOT NULL REFERENCES public.wardrobe_collections(id) ON DELETE CASCADE,
  wardrobe_item_id UUID NOT NULL REFERENCES public.wardrobe_items(id) ON DELETE CASCADE,
  position INTEGER DEFAULT 0,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(collection_id, wardrobe_item_id)
);

-- Create smart_lists table
CREATE TABLE IF NOT EXISTS public.smart_lists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  criteria JSONB NOT NULL DEFAULT '{}',
  auto_update BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.wardrobe_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wardrobe_collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smart_lists ENABLE ROW LEVEL SECURITY;

-- RLS Policies for wardrobe_collections
CREATE POLICY "Users can view their own collections and public collections" 
ON public.wardrobe_collections 
FOR SELECT 
USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create their own collections" 
ON public.wardrobe_collections 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own collections" 
ON public.wardrobe_collections 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own collections" 
ON public.wardrobe_collections 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for wardrobe_collection_items
CREATE POLICY "Users can view items in their collections" 
ON public.wardrobe_collection_items 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.wardrobe_collections 
    WHERE id = collection_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can add items to their collections" 
ON public.wardrobe_collection_items 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.wardrobe_collections 
    WHERE id = collection_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can remove items from their collections" 
ON public.wardrobe_collection_items 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.wardrobe_collections 
    WHERE id = collection_id AND user_id = auth.uid()
  )
);

-- RLS Policies for smart_lists
CREATE POLICY "Users can view their own smart lists" 
ON public.smart_lists 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own smart lists" 
ON public.smart_lists 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own smart lists" 
ON public.smart_lists 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own smart lists" 
ON public.smart_lists 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_wardrobe_collections_user_id ON public.wardrobe_collections(user_id);
CREATE INDEX idx_wardrobe_collection_items_collection_id ON public.wardrobe_collection_items(collection_id);
CREATE INDEX idx_wardrobe_collection_items_wardrobe_item_id ON public.wardrobe_collection_items(wardrobe_item_id);
CREATE INDEX idx_smart_lists_user_id ON public.smart_lists(user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_collections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_wardrobe_collections_updated_at
BEFORE UPDATE ON public.wardrobe_collections
FOR EACH ROW
EXECUTE FUNCTION public.update_collections_updated_at();

CREATE TRIGGER update_smart_lists_updated_at
BEFORE UPDATE ON public.smart_lists
FOR EACH ROW
EXECUTE FUNCTION public.update_collections_updated_at();