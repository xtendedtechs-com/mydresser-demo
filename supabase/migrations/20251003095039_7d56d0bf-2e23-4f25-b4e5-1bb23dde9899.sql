-- Create user credibility scores table
CREATE TABLE IF NOT EXISTS public.user_credibility (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  credibility_score INTEGER DEFAULT 50 CHECK (credibility_score >= 0 AND credibility_score <= 100),
  total_sales INTEGER DEFAULT 0,
  successful_transactions INTEGER DEFAULT 0,
  cancelled_transactions INTEGER DEFAULT 0,
  disputes_filed INTEGER DEFAULT 0,
  disputes_against INTEGER DEFAULT 0,
  positive_reviews INTEGER DEFAULT 0,
  negative_reviews INTEGER DEFAULT 0,
  average_rating NUMERIC DEFAULT 0 CHECK (average_rating >= 0 AND average_rating <= 5),
  verified_seller BOOLEAN DEFAULT false,
  id_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false,
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create marketplace transactions table
CREATE TABLE IF NOT EXISTS public.marketplace_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES public.market_items(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL,
  buyer_id UUID NOT NULL,
  price NUMERIC NOT NULL,
  shipping_cost NUMERIC DEFAULT 0,
  total_amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'payment_received', 'shipped', 'delivered', 'completed', 'cancelled', 'disputed')),
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
  shipping_address JSONB,
  tracking_number TEXT,
  shipped_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create reviews and ratings table
CREATE TABLE IF NOT EXISTS public.marketplace_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES public.marketplace_transactions(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL,
  reviewee_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  review_type TEXT NOT NULL CHECK (review_type IN ('seller', 'buyer')),
  helpful_count INTEGER DEFAULT 0,
  is_verified_purchase BOOLEAN DEFAULT true,
  seller_response TEXT,
  seller_response_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(transaction_id, reviewer_id)
);

-- Create disputes table
CREATE TABLE IF NOT EXISTS public.marketplace_disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES public.marketplace_transactions(id) ON DELETE CASCADE,
  filed_by UUID NOT NULL,
  filed_against UUID NOT NULL,
  dispute_type TEXT NOT NULL CHECK (dispute_type IN ('item_not_received', 'item_not_as_described', 'damaged_item', 'wrong_item', 'return_issue', 'payment_issue', 'other')),
  description TEXT NOT NULL,
  evidence JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'resolved', 'closed')),
  resolution TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create messages table for buyer-seller communication
CREATE TABLE IF NOT EXISTS public.marketplace_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES public.marketplace_transactions(id) ON DELETE CASCADE,
  item_id UUID REFERENCES public.market_items(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT require_transaction_or_item CHECK (
    (transaction_id IS NOT NULL AND item_id IS NULL) OR 
    (transaction_id IS NULL AND item_id IS NOT NULL)
  )
);

-- Create sustainability tracking table
CREATE TABLE IF NOT EXISTS public.sustainability_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  items_resold INTEGER DEFAULT 0,
  items_purchased_secondhand INTEGER DEFAULT 0,
  co2_saved_kg NUMERIC DEFAULT 0,
  water_saved_liters NUMERIC DEFAULT 0,
  waste_prevented_kg NUMERIC DEFAULT 0,
  circular_economy_score INTEGER DEFAULT 0 CHECK (circular_economy_score >= 0 AND circular_economy_score <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Create item condition verification table
CREATE TABLE IF NOT EXISTS public.item_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES public.market_items(id) ON DELETE CASCADE,
  verified_by UUID,
  verification_type TEXT NOT NULL CHECK (verification_type IN ('seller_photos', 'video_verification', 'professional_inspection', 'buyer_confirmed')),
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verification_notes TEXT,
  verification_photos JSONB DEFAULT '[]'::jsonb,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_credibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sustainability_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_verifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_credibility
CREATE POLICY "Users can view all credibility scores"
  ON public.user_credibility
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own credibility"
  ON public.user_credibility
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can manage credibility scores"
  ON public.user_credibility
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for marketplace_transactions
CREATE POLICY "Users can view their own transactions"
  ON public.marketplace_transactions
  FOR SELECT
  USING (auth.uid() = seller_id OR auth.uid() = buyer_id);

CREATE POLICY "Buyers can create transactions"
  ON public.marketplace_transactions
  FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Transaction parties can update"
  ON public.marketplace_transactions
  FOR UPDATE
  USING (auth.uid() = seller_id OR auth.uid() = buyer_id)
  WITH CHECK (auth.uid() = seller_id OR auth.uid() = buyer_id);

-- RLS Policies for marketplace_reviews
CREATE POLICY "Users can view reviews"
  ON public.marketplace_reviews
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Transaction parties can create reviews"
  ON public.marketplace_reviews
  FOR INSERT
  WITH CHECK (
    auth.uid() = reviewer_id AND
    EXISTS (
      SELECT 1 FROM marketplace_transactions
      WHERE id = marketplace_reviews.transaction_id
      AND (seller_id = auth.uid() OR buyer_id = auth.uid())
      AND status = 'completed'
    )
  );

CREATE POLICY "Reviewees can respond"
  ON public.marketplace_reviews
  FOR UPDATE
  USING (auth.uid() = reviewee_id)
  WITH CHECK (auth.uid() = reviewee_id);

-- RLS Policies for marketplace_disputes
CREATE POLICY "Users can view their own disputes"
  ON public.marketplace_disputes
  FOR SELECT
  USING (auth.uid() = filed_by OR auth.uid() = filed_against);

CREATE POLICY "Users can file disputes"
  ON public.marketplace_disputes
  FOR INSERT
  WITH CHECK (auth.uid() = filed_by);

-- RLS Policies for marketplace_messages
CREATE POLICY "Users can view their own messages"
  ON public.marketplace_messages
  FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages"
  ON public.marketplace_messages
  FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Recipients can mark as read"
  ON public.marketplace_messages
  FOR UPDATE
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);

-- RLS Policies for sustainability_metrics
CREATE POLICY "Users can view all sustainability metrics"
  ON public.sustainability_metrics
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage their own sustainability metrics"
  ON public.sustainability_metrics
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for item_verifications
CREATE POLICY "Users can view verifications for listed items"
  ON public.item_verifications
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND (
      EXISTS (SELECT 1 FROM market_items WHERE id = item_verifications.item_id)
    )
  );

CREATE POLICY "Sellers can create verifications"
  ON public.item_verifications
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM market_items 
      WHERE id = item_verifications.item_id 
      AND seller_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX idx_user_credibility_user ON public.user_credibility(user_id);
CREATE INDEX idx_user_credibility_score ON public.user_credibility(credibility_score DESC);
CREATE INDEX idx_marketplace_transactions_seller ON public.marketplace_transactions(seller_id, created_at DESC);
CREATE INDEX idx_marketplace_transactions_buyer ON public.marketplace_transactions(buyer_id, created_at DESC);
CREATE INDEX idx_marketplace_transactions_status ON public.marketplace_transactions(status);
CREATE INDEX idx_marketplace_reviews_reviewee ON public.marketplace_reviews(reviewee_id, created_at DESC);
CREATE INDEX idx_marketplace_disputes_filed_by ON public.marketplace_disputes(filed_by, status);
CREATE INDEX idx_marketplace_messages_conversation ON public.marketplace_messages(sender_id, receiver_id, created_at DESC);
CREATE INDEX idx_marketplace_messages_unread ON public.marketplace_messages(receiver_id, is_read) WHERE is_read = false;
CREATE INDEX idx_sustainability_metrics_user ON public.sustainability_metrics(user_id);
CREATE INDEX idx_item_verifications_item ON public.item_verifications(item_id);

-- Create triggers for updating timestamps
CREATE TRIGGER update_user_credibility_updated_at
  BEFORE UPDATE ON public.user_credibility
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_marketplace_transactions_updated_at
  BEFORE UPDATE ON public.marketplace_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_marketplace_reviews_updated_at
  BEFORE UPDATE ON public.marketplace_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_marketplace_disputes_updated_at
  BEFORE UPDATE ON public.marketplace_disputes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sustainability_metrics_updated_at
  BEFORE UPDATE ON public.sustainability_metrics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to calculate and update credibility score
CREATE OR REPLACE FUNCTION public.update_credibility_score(user_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_score INTEGER := 50;
  transaction_score INTEGER := 0;
  review_score INTEGER := 0;
  dispute_penalty INTEGER := 0;
  verification_bonus INTEGER := 0;
  final_score INTEGER;
BEGIN
  -- Calculate transaction score (max 30 points)
  SELECT 
    LEAST(30, (successful_transactions * 2) - (cancelled_transactions * 5))
  INTO transaction_score
  FROM user_credibility
  WHERE user_id = user_id_param;
  
  -- Calculate review score (max 20 points)
  SELECT 
    LEAST(20, ((positive_reviews * 2) - (negative_reviews * 5)))
  INTO review_score
  FROM user_credibility
  WHERE user_id = user_id_param;
  
  -- Calculate dispute penalty (max -30 points)
  SELECT 
    GREATEST(-30, (disputes_against * -10))
  INTO dispute_penalty
  FROM user_credibility
  WHERE user_id = user_id_param;
  
  -- Calculate verification bonus (max 10 points)
  SELECT 
    (CASE WHEN id_verified THEN 5 ELSE 0 END) +
    (CASE WHEN phone_verified THEN 3 ELSE 0 END) +
    (CASE WHEN email_verified THEN 2 ELSE 0 END)
  INTO verification_bonus
  FROM user_credibility
  WHERE user_id = user_id_param;
  
  -- Calculate final score (0-100)
  final_score := GREATEST(0, LEAST(100, 
    base_score + transaction_score + review_score + dispute_penalty + verification_bonus
  ));
  
  -- Update the credibility score
  UPDATE user_credibility
  SET 
    credibility_score = final_score,
    verified_seller = (final_score >= 70 AND id_verified),
    updated_at = now()
  WHERE user_id = user_id_param;
END;
$$;