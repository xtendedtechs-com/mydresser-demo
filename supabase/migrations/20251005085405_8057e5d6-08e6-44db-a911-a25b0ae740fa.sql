-- Phase 30: Payment Gateway Integration & Financial Security

-- =====================================================
-- Payment Transactions
-- =====================================================
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'disputed', 'cancelled')),
  payment_method TEXT,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'refund', 'payout', 'fee')),
  related_transaction_id UUID REFERENCES public.payment_transactions(id),
  fraud_score INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions"
  ON public.payment_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage transactions"
  ON public.payment_transactions FOR ALL
  USING (true) WITH CHECK (true);

CREATE INDEX idx_payment_transactions_user ON public.payment_transactions(user_id, created_at DESC);
CREATE INDEX idx_payment_transactions_status ON public.payment_transactions(status);

-- =====================================================
-- Payment Fraud Detection
-- =====================================================
CREATE TABLE IF NOT EXISTS public.payment_fraud_detection (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID NOT NULL REFERENCES public.payment_transactions(id) ON DELETE CASCADE,
  risk_score INTEGER NOT NULL CHECK (risk_score BETWEEN 0 AND 100),
  risk_factors JSONB DEFAULT '{}',
  decision TEXT NOT NULL CHECK (decision IN ('approve', 'review', 'decline')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_fraud_detection ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage fraud detection"
  ON public.payment_fraud_detection FOR ALL
  USING (is_admin(auth.uid()));

CREATE INDEX idx_payment_fraud_transaction ON public.payment_fraud_detection(transaction_id);

-- =====================================================
-- Financial Audit Log
-- =====================================================
CREATE TABLE IF NOT EXISTS public.financial_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  amount DECIMAL(10,2),
  currency TEXT,
  event_details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.financial_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view financial audit logs"
  ON public.financial_audit_log FOR SELECT
  USING (is_admin(auth.uid()));

CREATE INDEX idx_financial_audit_created ON public.financial_audit_log(created_at DESC);

-- Permissions
GRANT SELECT ON public.payment_transactions TO authenticated;
GRANT SELECT ON public.financial_audit_log TO authenticated;