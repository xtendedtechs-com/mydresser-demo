-- MyDresser AI Application: Row Level Security Policies
-- Phase 1C: Comprehensive RLS Implementation

-- RLS Policies for Profiles
DROP POLICY IF EXISTS "Users can manage their own profile" ON public.profiles;
CREATE POLICY "Users can manage their own profile" ON public.profiles
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for User Preferences
DROP POLICY IF EXISTS "Users can manage their own preferences" ON public.user_preferences;
CREATE POLICY "Users can manage their own preferences" ON public.user_preferences
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for Wardrobes
DROP POLICY IF EXISTS "Users can manage their own wardrobes" ON public.wardrobes;
CREATE POLICY "Users can manage their own wardrobes" ON public.wardrobes
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for Wardrobe Items
DROP POLICY IF EXISTS "Users can manage their own wardrobe items" ON public.wardrobe_items;
CREATE POLICY "Users can manage their own wardrobe items" ON public.wardrobe_items
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for Outfits
DROP POLICY IF EXISTS "Users can manage their own outfits" ON public.outfits;
CREATE POLICY "Users can manage their own outfits" ON public.outfits
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for Outfit Items
DROP POLICY IF EXISTS "Users can manage outfit items for their outfits" ON public.outfit_items;
CREATE POLICY "Users can manage outfit items for their outfits" ON public.outfit_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM outfits 
      WHERE outfits.id = outfit_items.outfit_id 
      AND outfits.user_id = auth.uid()
    )
  );

-- RLS Policies for Collections
DROP POLICY IF EXISTS "Users can manage their own collections" ON public.collections;
CREATE POLICY "Users can manage their own collections" ON public.collections
  FOR ALL USING (auth.uid() = user_id OR is_public = true)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for Collection Items
DROP POLICY IF EXISTS "Users can manage items in their collections" ON public.collection_items;
CREATE POLICY "Users can manage items in their collections" ON public.collection_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM collections 
      WHERE collections.id = collection_items.collection_id 
      AND (collections.user_id = auth.uid() OR collections.is_public = true)
    )
  );

-- RLS Policies for Merchant Profiles
DROP POLICY IF EXISTS "Users can manage their own merchant profile" ON public.merchant_profiles;
CREATE POLICY "Users can manage their own merchant profile" ON public.merchant_profiles
  FOR ALL USING (auth.uid() = user_id AND validate_user_session_robust())
  WITH CHECK (auth.uid() = user_id AND validate_user_session_robust());

-- RLS Policies for Security Audit Log (Admin only view)
DROP POLICY IF EXISTS "Only system can manage audit logs" ON public.security_audit_log;
CREATE POLICY "Only system can manage audit logs" ON public.security_audit_log
  FOR ALL USING (false);

-- RLS Policies for Rate Limits (System managed)
DROP POLICY IF EXISTS "Rate limits are system managed only" ON public.rate_limits;
CREATE POLICY "Rate limits are system managed only" ON public.rate_limits
  FOR ALL USING (false);

-- RLS Policies for MFA Settings (Function managed only)
DROP POLICY IF EXISTS "Users can view their MFA status only" ON public.user_mfa_settings;
CREATE POLICY "Users can view their MFA status only" ON public.user_mfa_settings
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "MFA settings managed by functions only" ON public.user_mfa_settings;
CREATE POLICY "MFA settings managed by functions only" ON public.user_mfa_settings
  FOR INSERT WITH CHECK (false);

CREATE POLICY "MFA settings update managed by functions only" ON public.user_mfa_settings
  FOR UPDATE USING (false);

CREATE POLICY "MFA settings delete restricted" ON public.user_mfa_settings
  FOR DELETE USING (false);