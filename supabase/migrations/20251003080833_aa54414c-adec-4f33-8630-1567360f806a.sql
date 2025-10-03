-- Enable RLS on wardrobe_items if not already enabled
ALTER TABLE public.wardrobe_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own wardrobe items" ON public.wardrobe_items;
DROP POLICY IF EXISTS "Users can insert their own wardrobe items" ON public.wardrobe_items;
DROP POLICY IF EXISTS "Users can update their own wardrobe items" ON public.wardrobe_items;
DROP POLICY IF EXISTS "Users can delete their own wardrobe items" ON public.wardrobe_items;

-- Allow users to view their own wardrobe items
CREATE POLICY "Users can view their own wardrobe items"
ON public.wardrobe_items
FOR SELECT
USING (auth.uid() = user_id);

-- Allow users to insert their own wardrobe items
CREATE POLICY "Users can insert their own wardrobe items"
ON public.wardrobe_items
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own wardrobe items
CREATE POLICY "Users can update their own wardrobe items"
ON public.wardrobe_items
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own wardrobe items
CREATE POLICY "Users can delete their own wardrobe items"
ON public.wardrobe_items
FOR DELETE
USING (auth.uid() = user_id);