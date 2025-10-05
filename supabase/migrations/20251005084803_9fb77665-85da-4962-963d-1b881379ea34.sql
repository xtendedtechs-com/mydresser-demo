-- Phase 28: 2ndDresser Marketplace Security & User-to-User Transactions

-- =====================================================
-- User Credibility System
-- =====================================================
CREATE TABLE IF NOT EXISTS public.seconddresser_user_credibility (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credibility_score INTEGER DEFAULT 50 CHECK (credibility_score BETWEEN 0 AND 100),
  total_sales INTEGER DEFAULT 0,
  total_purchases INTEGER DEFAULT 0,
  successful_sales INTEGER DEFAULT 0,
  successful_purchases INTEGER DEFAULT 0,
  disputes_filed INTEGER DEFAULT 0,
  disputes_lost INTEGER DEFAULT 0,
  average_seller_rating DECIMAL(3,2),
  average_buyer_rating DECIMAL(3,2),
  total_reviews_received INTEGER DEFAULT 0,
  reported_listings_count INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  is_flagged BOOLEAN DEFAULT false,
  flag_reason TEXT,
  last_transaction_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.seconddresser_user_credibility ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all credibility scores"
  ON public.seconddresser_user_credibility FOR SELECT USING (true);

CREATE POLICY "Users can view their own credibility details"
  ON public.seconddresser_user_credibility FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage credibility"
  ON public.seconddresser_user_credibility FOR ALL
  USING (true) WITH CHECK (true);

CREATE INDEX idx_2nd_credibility_user ON public.seconddresser_user_credibility(user_id);
CREATE INDEX idx_2nd_credibility_score ON public.seconddresser_user_credibility(credibility_score DESC);

-- =====================================================
-- Secure Listings
-- =====================================================
CREATE TABLE IF NOT EXISTS public.seconddresser_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wardrobe_item_id UUID REFERENCES public.wardrobe_items(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  original_price DECIMAL(10,2),
  condition TEXT NOT NULL CHECK (condition IN ('new', 'like-new', 'good', 'fair', 'worn')),
  size TEXT,
  brand TEXT,
  category TEXT,
  photos TEXT[],
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'sold', 'removed', 'flagged')),
  views INTEGER DEFAULT 0,
  favorites INTEGER DEFAULT 0,
  is_negotiable BOOLEAN DEFAULT false,
  shipping_included BOOLEAN DEFAULT false,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sold_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.seconddresser_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active listings"
  ON public.seconddresser_listings FOR SELECT
  USING (status = 'active');

CREATE POLICY "Users can manage their own listings"
  ON public.seconddresser_listings FOR ALL
  USING (auth.uid() = seller_id);

CREATE POLICY "System can manage all listings"
  ON public.seconddresser_listings FOR ALL
  USING (true) WITH CHECK (true);

CREATE INDEX idx_2nd_listings_seller ON public.seconddresser_listings(seller_id);
CREATE INDEX idx_2nd_listings_status ON public.seconddresser_listings(status);
CREATE INDEX idx_2nd_listings_price ON public.seconddresser_listings(price);

-- =====================================================
-- Transactions with Escrow
-- =====================================================
CREATE TABLE IF NOT EXISTS public.seconddresser_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL REFERENCES public.seconddresser_listings(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  escrow_status TEXT NOT NULL DEFAULT 'pending' CHECK (escrow_status IN ('pending', 'held', 'released', 'refunded')),
  transaction_status TEXT NOT NULL DEFAULT 'initiated' CHECK (transaction_status IN (
    'initiated', 'paid', 'shipped', 'delivered', 'completed', 'disputed', 'cancelled', 'refunded'
  )),
  payment_method TEXT,
  tracking_number TEXT,
  shipped_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  escrow_release_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.seconddresser_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Transaction participants can view"
  ON public.seconddresser_transactions FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Buyers can create transactions"
  ON public.seconddresser_transactions FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Participants can update transactions"
  ON public.seconddresser_transactions FOR UPDATE
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE INDEX idx_2nd_transactions_buyer ON public.seconddresser_transactions(buyer_id, created_at DESC);
CREATE INDEX idx_2nd_transactions_seller ON public.seconddresser_transactions(seller_id, created_at DESC);
CREATE INDEX idx_2nd_transactions_status ON public.seconddresser_transactions(transaction_status);

-- =====================================================
-- Dispute Resolution
-- =====================================================
CREATE TABLE IF NOT EXISTS public.seconddresser_disputes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID NOT NULL REFERENCES public.seconddresser_transactions(id) ON DELETE CASCADE,
  filed_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dispute_reason TEXT NOT NULL CHECK (dispute_reason IN (
    'item-not-received', 'item-not-as-described', 'damaged', 'counterfeit', 'other'
  )),
  description TEXT NOT NULL,
  evidence_urls TEXT[],
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
  resolution TEXT CHECK (resolution IN ('refund-buyer', 'release-seller', 'partial-refund', 'no-action')),
  resolution_notes TEXT,
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.seconddresser_disputes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Transaction participants can view disputes"
  ON public.seconddresser_disputes FOR SELECT
  USING (
    auth.uid() = filed_by OR
    auth.uid() IN (
      SELECT seller_id FROM public.seconddresser_transactions WHERE id = transaction_id
      UNION
      SELECT buyer_id FROM public.seconddresser_transactions WHERE id = transaction_id
    )
  );

CREATE POLICY "Users can file disputes"
  ON public.seconddresser_disputes FOR INSERT
  WITH CHECK (auth.uid() = filed_by);

CREATE INDEX idx_2nd_disputes_transaction ON public.seconddresser_disputes(transaction_id);
CREATE INDEX idx_2nd_disputes_status ON public.seconddresser_disputes(status);

-- =====================================================
-- Verified Reviews
-- =====================================================
CREATE TABLE IF NOT EXISTS public.seconddresser_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID NOT NULL REFERENCES public.seconddresser_transactions(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT,
  review_type TEXT NOT NULL CHECK (review_type IN ('buyer-to-seller', 'seller-to-buyer')),
  is_verified BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(transaction_id, reviewer_id, review_type)
);

ALTER TABLE public.seconddresser_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews"
  ON public.seconddresser_reviews FOR SELECT USING (true);

CREATE POLICY "Transaction participants can create reviews"
  ON public.seconddresser_reviews FOR INSERT
  WITH CHECK (
    auth.uid() = reviewer_id AND
    EXISTS (
      SELECT 1 FROM public.seconddresser_transactions
      WHERE id = transaction_id
      AND (buyer_id = auth.uid() OR seller_id = auth.uid())
      AND transaction_status = 'completed'
    )
  );

CREATE INDEX idx_2nd_reviews_reviewee ON public.seconddresser_reviews(reviewee_id);
CREATE INDEX idx_2nd_reviews_transaction ON public.seconddresser_reviews(transaction_id);

-- =====================================================
-- Flagged Users
-- =====================================================
CREATE TABLE IF NOT EXISTS public.seconddresser_flagged_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  flagged_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  flagged_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  evidence TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'confirmed', 'dismissed')),
  action_taken TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.seconddresser_flagged_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view flags against them"
  ON public.seconddresser_flagged_users FOR SELECT
  USING (auth.uid() = flagged_user_id);

CREATE POLICY "Users can create flags"
  ON public.seconddresser_flagged_users FOR INSERT
  WITH CHECK (auth.uid() = flagged_by);

CREATE INDEX idx_2nd_flagged_user ON public.seconddresser_flagged_users(flagged_user_id);

-- =====================================================
-- Functions
-- =====================================================

-- Calculate User Credibility
CREATE OR REPLACE FUNCTION public.calculate_user_credibility(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_cred RECORD;
  v_score INTEGER := 50;
  v_account_age INTERVAL;
BEGIN
  SELECT * INTO v_cred
  FROM public.seconddresser_user_credibility
  WHERE user_id = p_user_id;
  
  IF v_cred IS NULL THEN
    INSERT INTO public.seconddresser_user_credibility (user_id) VALUES (p_user_id);
    RETURN 50;
  END IF;
  
  -- Add for successful transactions
  v_score := v_score + (v_cred.successful_sales * 2);
  v_score := v_score + v_cred.successful_purchases;
  
  -- Add for good ratings
  IF v_cred.average_seller_rating >= 4.5 THEN v_score := v_score + 15;
  ELSIF v_cred.average_seller_rating >= 4.0 THEN v_score := v_score + 10;
  ELSIF v_cred.average_seller_rating >= 3.5 THEN v_score := v_score + 5;
  END IF;
  
  -- Subtract for disputes
  v_score := v_score - (v_cred.disputes_lost * 15);
  v_score := v_score - (v_cred.reported_listings_count * 10);
  
  -- Add for verification
  IF v_cred.is_verified THEN v_score := v_score + 20; END IF;
  
  -- Subtract if flagged
  IF v_cred.is_flagged THEN v_score := v_score - 20; END IF;
  
  -- Account age bonus
  SELECT age(now(), created_at) INTO v_account_age
  FROM auth.users WHERE id = p_user_id;
  
  IF v_account_age > interval '3 months' THEN v_score := v_score + 10; END IF;
  
  -- Clamp to 0-100
  v_score := GREATEST(0, LEAST(100, v_score));
  
  -- Update the score
  UPDATE public.seconddresser_user_credibility
  SET credibility_score = v_score, updated_at = now()
  WHERE user_id = p_user_id;
  
  RETURN v_score;
END;
$$;

-- Triggers
CREATE TRIGGER update_seconddresser_user_credibility_updated_at
  BEFORE UPDATE ON public.seconddresser_user_credibility
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_seconddresser_listings_updated_at
  BEFORE UPDATE ON public.seconddresser_listings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_seconddresser_transactions_updated_at
  BEFORE UPDATE ON public.seconddresser_transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Permissions
GRANT EXECUTE ON FUNCTION public.calculate_user_credibility TO authenticated;