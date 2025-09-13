-- Enable RLS and add security policies for all MyDresser tables

-- Enable RLS on all tables
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wardrobes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wardrobe_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outfits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outfit_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.laundry_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.laundry_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- USER_FOLLOWS policies
CREATE POLICY "Users can view follows they're involved in" 
ON public.user_follows FOR SELECT 
USING (auth.uid() = follower_id OR auth.uid() = following_id);

CREATE POLICY "Users can create their own follows" 
ON public.user_follows FOR INSERT 
WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete their own follows" 
ON public.user_follows FOR DELETE 
USING (auth.uid() = follower_id);

-- EMOTES policies (read-only for users)
CREATE POLICY "Anyone can view emotes" 
ON public.emotes FOR SELECT 
USING (true);

-- WARDROBES policies
CREATE POLICY "Users can manage their own wardrobes" 
ON public.wardrobes FOR ALL 
USING (auth.uid() = user_id);

-- WARDROBE_ITEMS policies  
CREATE POLICY "Users can manage their own wardrobe items" 
ON public.wardrobe_items FOR ALL 
USING (auth.uid() = user_id);

-- OUTFITS policies
CREATE POLICY "Users can manage their own outfits" 
ON public.outfits FOR ALL 
USING (auth.uid() = user_id);

-- OUTFIT_ITEMS policies
CREATE POLICY "Users can manage outfit items for their outfits" 
ON public.outfit_items FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.outfits 
    WHERE outfits.id = outfit_items.outfit_id 
    AND outfits.user_id = auth.uid()
  )
);

-- COLLECTIONS policies
CREATE POLICY "Users can manage their own collections" 
ON public.collections FOR SELECT 
USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create their own collections" 
ON public.collections FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own collections" 
ON public.collections FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own collections" 
ON public.collections FOR DELETE 
USING (auth.uid() = user_id);

-- COLLECTION_ITEMS policies
CREATE POLICY "Users can manage items in their collections" 
ON public.collection_items FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.collections 
    WHERE collections.id = collection_items.collection_id 
    AND collections.user_id = auth.uid()
  )
);

-- REACTIONS policies
CREATE POLICY "Users can view all reactions" 
ON public.reactions FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own reactions" 
ON public.reactions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions" 
ON public.reactions FOR DELETE 
USING (auth.uid() = user_id);

-- USER_SUBSCRIPTIONS policies
CREATE POLICY "Users can view their own subscriptions" 
ON public.user_subscriptions FOR SELECT 
USING (auth.uid() = subscriber_id OR auth.uid() = provider_id);

CREATE POLICY "Users can create subscriptions as subscribers" 
ON public.user_subscriptions FOR INSERT 
WITH CHECK (auth.uid() = subscriber_id);

CREATE POLICY "Users can update their own subscriptions" 
ON public.user_subscriptions FOR UPDATE 
USING (auth.uid() = subscriber_id);

-- LAUNDRY_BATCHES policies
CREATE POLICY "Users can manage their own laundry batches" 
ON public.laundry_batches FOR ALL 
USING (auth.uid() = user_id);

-- LAUNDRY_ITEMS policies
CREATE POLICY "Users can manage laundry items in their batches" 
ON public.laundry_items FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.laundry_batches 
    WHERE laundry_batches.id = laundry_items.batch_id 
    AND laundry_batches.user_id = auth.uid()
  )
);

-- USER_PREFERENCES policies
CREATE POLICY "Users can manage their own preferences" 
ON public.user_preferences FOR ALL 
USING (auth.uid() = user_id);