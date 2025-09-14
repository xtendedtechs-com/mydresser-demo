-- Fix ON CONFLICT errors and strengthen role separation and security

-- 1) Ensure required unique indexes for ON CONFLICT clauses
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'rate_limits_identifier_action_key'
  ) THEN
    CREATE UNIQUE INDEX rate_limits_identifier_action_key
      ON public.rate_limits (identifier, action);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'profile_contact_info_user_id_key'
  ) THEN
    CREATE UNIQUE INDEX profile_contact_info_user_id_key
      ON public.profile_contact_info (user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'mfa_rate_limits_user_id_action_key'
  ) THEN
    CREATE UNIQUE INDEX mfa_rate_limits_user_id_action_key
      ON public.mfa_rate_limits (user_id, action);
  END IF;
END $$;

-- 2) Helper function to check merchant role (using existing profiles.role enum user_role)
CREATE OR REPLACE FUNCTION public.is_merchant(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = COALESCE(_user_id, auth.uid())
      AND p.role = 'merchant'::user_role
  );
$$;

-- 3) Promote user to merchant automatically when a merchant_profile is created
CREATE OR REPLACE FUNCTION public.promote_user_to_merchant()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET role = 'merchant'::user_role,
      updated_at = now()
  WHERE user_id = NEW.user_id;
  RETURN NEW;
END;
$$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'promote_to_merchant_on_insert'
  ) THEN
    CREATE TRIGGER promote_to_merchant_on_insert
    AFTER INSERT ON public.merchant_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.promote_user_to_merchant();
  END IF;
END $$;

-- 4) Tighten merchant data modification policies to require merchant role
-- Keep public viewing where intended, but ensure only merchants can modify their merchant data

-- merchant_items policies: ensure merchants manage their own items
DROP POLICY IF EXISTS "Merchants can create their own items" ON public.merchant_items;
CREATE POLICY "Merchants can create their own items"
ON public.merchant_items
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = merchant_id AND public.is_merchant(auth.uid()));

DROP POLICY IF EXISTS "Merchants can update their own items" ON public.merchant_items;
CREATE POLICY "Merchants can update their own items"
ON public.merchant_items
FOR UPDATE
TO authenticated
USING (auth.uid() = merchant_id AND public.is_merchant(auth.uid()))
WITH CHECK (auth.uid() = merchant_id AND public.is_merchant(auth.uid()));

DROP POLICY IF EXISTS "Merchants can delete their own items" ON public.merchant_items;
CREATE POLICY "Merchants can delete their own items"
ON public.merchant_items
FOR DELETE
TO authenticated
USING (auth.uid() = merchant_id AND public.is_merchant(auth.uid()));

-- merchant_pages policies: ensure only merchants manage their own pages
DROP POLICY IF EXISTS "Merchants can manage their own pages" ON public.merchant_pages;
CREATE POLICY "Merchants can manage their own pages"
ON public.merchant_pages
FOR ALL
TO authenticated
USING (auth.uid() = merchant_id AND public.is_merchant(auth.uid()))
WITH CHECK (auth.uid() = merchant_id AND public.is_merchant(auth.uid()));

-- orders and order_items: ensure only merchants manage their orders
DROP POLICY IF EXISTS "Merchants can manage their own orders" ON public.orders;
CREATE POLICY "Merchants can manage their own orders"
ON public.orders
FOR ALL
TO authenticated
USING (auth.uid() = merchant_id AND public.is_merchant(auth.uid()))
WITH CHECK (auth.uid() = merchant_id AND public.is_merchant(auth.uid()));

DROP POLICY IF EXISTS "Merchants can view order items for their orders" ON public.order_items;
CREATE POLICY "Merchants can view order items for their orders"
ON public.order_items
FOR ALL
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.orders
  WHERE orders.id = order_items.order_id
    AND orders.merchant_id = auth.uid()
) AND public.is_merchant(auth.uid()))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.orders
  WHERE orders.id = order_items.order_id
    AND orders.merchant_id = auth.uid()
) AND public.is_merchant(auth.uid()));

-- merchant_profiles: keep insert permissive (so users can become merchants), but require role for updates/deletes
-- Do not restrict INSERT here to avoid bootstrap deadlock
DROP POLICY IF EXISTS "Secure merchant profile update" ON public.merchant_profiles;
CREATE POLICY "Secure merchant profile update"
ON public.merchant_profiles
FOR UPDATE
TO authenticated
USING ((auth.uid() = user_id) AND (auth.uid() IS NOT NULL) AND (verification_status = ANY (ARRAY['pending','under_review','verified'])) AND public.is_merchant(auth.uid()))
WITH CHECK ((auth.uid() = user_id) AND (auth.uid() IS NOT NULL) AND public.is_merchant(auth.uid()));

DROP POLICY IF EXISTS "Secure merchant profile delete" ON public.merchant_profiles;
CREATE POLICY "Secure merchant profile delete"
ON public.merchant_profiles
FOR DELETE
TO authenticated
USING ((auth.uid() = user_id) AND (auth.uid() IS NOT NULL) AND (verification_status = ANY (ARRAY['pending','rejected'])) AND public.is_merchant(auth.uid()));

-- 5) Ensure profile_contact_info upsert path works (index created above). No further changes required.

-- 6) Optional: ensure rate limit tables are protected by default deny (already enforced). No changes here.
