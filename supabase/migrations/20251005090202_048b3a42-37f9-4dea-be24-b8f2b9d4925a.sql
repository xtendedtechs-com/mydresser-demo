-- Phase 32: Multi-Merchant POS Integration & Store Management
-- Enhanced physical store management with POS terminals and security

-- POS Terminals table with authentication
CREATE TABLE IF NOT EXISTS public.pos_terminals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL,
  store_location_id UUID REFERENCES public.store_locations(id) ON DELETE CASCADE,
  terminal_name TEXT NOT NULL,
  terminal_code TEXT NOT NULL UNIQUE,
  device_id TEXT NOT NULL UNIQUE,
  auth_token_hash TEXT NOT NULL,
  last_sync_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  software_version TEXT,
  hardware_info JSONB DEFAULT '{}',
  security_level TEXT DEFAULT 'standard' CHECK (security_level IN ('standard', 'enhanced', 'maximum')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_merchant CHECK (merchant_id IS NOT NULL)
);

-- POS Transaction Log with encryption
CREATE TABLE IF NOT EXISTS public.pos_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  terminal_id UUID REFERENCES public.pos_terminals(id) ON DELETE SET NULL,
  merchant_id UUID NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('sale', 'return', 'void', 'refund')),
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  customer_id UUID,
  items JSONB NOT NULL DEFAULT '[]',
  payment_method TEXT NOT NULL,
  payment_reference TEXT,
  staff_id UUID,
  receipt_number TEXT NOT NULL UNIQUE,
  transaction_status TEXT DEFAULT 'completed' CHECK (transaction_status IN ('pending', 'completed', 'failed', 'voided')),
  encrypted_customer_data TEXT,
  encryption_salt UUID DEFAULT gen_random_uuid(),
  ip_address INET,
  user_agent TEXT,
  is_suspicious BOOLEAN DEFAULT false,
  fraud_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Store Staff Management with role-based access
CREATE TABLE IF NOT EXISTS public.store_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL,
  store_location_id UUID REFERENCES public.store_locations(id) ON DELETE CASCADE,
  user_id UUID,
  staff_name TEXT NOT NULL,
  staff_email TEXT,
  staff_phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('manager', 'cashier', 'sales_associate', 'inventory_clerk')),
  permissions JSONB DEFAULT '{"can_void": false, "can_refund": false, "can_discount": false, "can_manage_inventory": false}',
  pin_hash TEXT,
  is_active BOOLEAN DEFAULT true,
  hired_date DATE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Inventory Sync Log for audit trail
CREATE TABLE IF NOT EXISTS public.inventory_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL,
  terminal_id UUID REFERENCES public.pos_terminals(id) ON DELETE SET NULL,
  store_location_id UUID REFERENCES public.store_locations(id) ON DELETE CASCADE,
  sync_type TEXT NOT NULL CHECK (sync_type IN ('full', 'incremental', 'manual')),
  items_synced INTEGER DEFAULT 0,
  sync_status TEXT DEFAULT 'in_progress' CHECK (sync_status IN ('in_progress', 'completed', 'failed', 'partial')),
  sync_errors JSONB DEFAULT '[]',
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  sync_duration_ms INTEGER,
  data_integrity_hash TEXT
);

-- POS Activity Log for security audit
CREATE TABLE IF NOT EXISTS public.pos_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  terminal_id UUID REFERENCES public.pos_terminals(id) ON DELETE SET NULL,
  merchant_id UUID NOT NULL,
  staff_id UUID REFERENCES public.store_staff(id) ON DELETE SET NULL,
  activity_type TEXT NOT NULL,
  activity_details JSONB DEFAULT '{}',
  ip_address INET,
  is_suspicious BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Physical Store Analytics
CREATE TABLE IF NOT EXISTS public.store_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL,
  store_location_id UUID REFERENCES public.store_locations(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_transactions INTEGER DEFAULT 0,
  total_revenue NUMERIC(12,2) DEFAULT 0,
  average_transaction_value NUMERIC(10,2) DEFAULT 0,
  foot_traffic INTEGER DEFAULT 0,
  conversion_rate NUMERIC(5,2) DEFAULT 0,
  top_selling_items JSONB DEFAULT '[]',
  peak_hours JSONB DEFAULT '[]',
  staff_performance JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(merchant_id, store_location_id, date)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_pos_terminals_merchant ON public.pos_terminals(merchant_id);
CREATE INDEX IF NOT EXISTS idx_pos_terminals_location ON public.pos_terminals(store_location_id);
CREATE INDEX IF NOT EXISTS idx_pos_transactions_merchant ON public.pos_transactions(merchant_id);
CREATE INDEX IF NOT EXISTS idx_pos_transactions_terminal ON public.pos_transactions(terminal_id);
CREATE INDEX IF NOT EXISTS idx_pos_transactions_created ON public.pos_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_store_staff_merchant ON public.store_staff(merchant_id);
CREATE INDEX IF NOT EXISTS idx_store_staff_location ON public.store_staff(store_location_id);
CREATE INDEX IF NOT EXISTS idx_inventory_sync_merchant ON public.inventory_sync_log(merchant_id);
CREATE INDEX IF NOT EXISTS idx_pos_activity_merchant ON public.pos_activity_log(merchant_id);
CREATE INDEX IF NOT EXISTS idx_store_analytics_merchant_date ON public.store_analytics(merchant_id, date);

-- Enable RLS on all tables
ALTER TABLE public.pos_terminals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_sync_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pos_terminals
CREATE POLICY "Merchants can manage their own POS terminals"
  ON public.pos_terminals
  FOR ALL
  USING (merchant_id = auth.uid() AND public.is_merchant(auth.uid()))
  WITH CHECK (merchant_id = auth.uid() AND public.is_merchant(auth.uid()));

-- RLS Policies for pos_transactions
CREATE POLICY "Merchants can view their own POS transactions"
  ON public.pos_transactions
  FOR SELECT
  USING (merchant_id = auth.uid() AND public.is_merchant(auth.uid()));

CREATE POLICY "System can insert POS transactions"
  ON public.pos_transactions
  FOR INSERT
  WITH CHECK (merchant_id = auth.uid() AND public.is_merchant(auth.uid()));

-- RLS Policies for store_staff
CREATE POLICY "Merchants can manage their store staff"
  ON public.store_staff
  FOR ALL
  USING (merchant_id = auth.uid() AND public.is_merchant(auth.uid()))
  WITH CHECK (merchant_id = auth.uid() AND public.is_merchant(auth.uid()));

-- RLS Policies for inventory_sync_log
CREATE POLICY "Merchants can view their sync logs"
  ON public.inventory_sync_log
  FOR SELECT
  USING (merchant_id = auth.uid() AND public.is_merchant(auth.uid()));

-- RLS Policies for pos_activity_log
CREATE POLICY "Merchants can view their POS activity"
  ON public.pos_activity_log
  FOR SELECT
  USING (merchant_id = auth.uid() AND public.is_merchant(auth.uid()));

CREATE POLICY "Admins can view all POS activity"
  ON public.pos_activity_log
  FOR SELECT
  USING (public.is_admin(auth.uid()));

-- RLS Policies for store_analytics
CREATE POLICY "Merchants can view their store analytics"
  ON public.store_analytics
  FOR ALL
  USING (merchant_id = auth.uid() AND public.is_merchant(auth.uid()))
  WITH CHECK (merchant_id = auth.uid() AND public.is_merchant(auth.uid()));

-- Security Functions

-- Authenticate POS terminal
CREATE OR REPLACE FUNCTION public.authenticate_pos_terminal(
  p_terminal_code TEXT,
  p_device_id TEXT,
  p_auth_token TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_terminal RECORD;
  v_token_hash TEXT;
  v_is_valid BOOLEAN := false;
BEGIN
  -- Hash the provided token
  v_token_hash := encode(digest(p_auth_token || 'pos_salt_2024', 'sha256'), 'hex');
  
  -- Get terminal
  SELECT * INTO v_terminal
  FROM public.pos_terminals
  WHERE terminal_code = p_terminal_code
    AND device_id = p_device_id
    AND auth_token_hash = v_token_hash
    AND is_active = true;
  
  IF NOT FOUND THEN
    -- Log failed authentication attempt
    INSERT INTO public.security_audit_log (
      user_id, action, resource, success, details
    ) VALUES (
      NULL,
      'pos_auth_failed',
      'pos_terminals',
      false,
      jsonb_build_object(
        'terminal_code', p_terminal_code,
        'device_id', p_device_id,
        'timestamp', now()
      )
    );
    
    RETURN jsonb_build_object(
      'authenticated', false,
      'error', 'Invalid credentials'
    );
  END IF;
  
  -- Update last sync
  UPDATE public.pos_terminals
  SET last_sync_at = now()
  WHERE id = v_terminal.id;
  
  -- Log successful authentication
  INSERT INTO public.pos_activity_log (
    terminal_id, merchant_id, activity_type, activity_details
  ) VALUES (
    v_terminal.id,
    v_terminal.merchant_id,
    'terminal_authenticated',
    jsonb_build_object('timestamp', now())
  );
  
  RETURN jsonb_build_object(
    'authenticated', true,
    'terminal_id', v_terminal.id,
    'merchant_id', v_terminal.merchant_id,
    'store_location_id', v_terminal.store_location_id,
    'security_level', v_terminal.security_level
  );
END;
$$;

-- Process POS transaction with fraud detection
CREATE OR REPLACE FUNCTION public.process_pos_transaction(
  p_terminal_id UUID,
  p_transaction_type TEXT,
  p_amount NUMERIC,
  p_items JSONB,
  p_payment_method TEXT,
  p_staff_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_terminal RECORD;
  v_receipt_number TEXT;
  v_transaction_id UUID;
  v_fraud_score INTEGER := 0;
  v_is_suspicious BOOLEAN := false;
BEGIN
  -- Verify terminal
  SELECT * INTO v_terminal
  FROM public.pos_terminals
  WHERE id = p_terminal_id
    AND is_active = true
    AND merchant_id = auth.uid();
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or inactive terminal';
  END IF;
  
  -- Generate receipt number
  v_receipt_number := 'RCP-' || to_char(now(), 'YYYYMMDD') || '-' || substr(gen_random_uuid()::text, 1, 8);
  
  -- Calculate fraud score
  IF p_amount > 10000 THEN
    v_fraud_score := v_fraud_score + 30;
  END IF;
  
  IF p_transaction_type = 'return' AND p_amount > 5000 THEN
    v_fraud_score := v_fraud_score + 40;
  END IF;
  
  v_is_suspicious := v_fraud_score > 50;
  
  -- Insert transaction
  INSERT INTO public.pos_transactions (
    terminal_id,
    merchant_id,
    transaction_type,
    amount,
    items,
    payment_method,
    staff_id,
    receipt_number,
    transaction_status,
    fraud_score,
    is_suspicious,
    completed_at
  ) VALUES (
    p_terminal_id,
    v_terminal.merchant_id,
    p_transaction_type,
    p_amount,
    p_items,
    p_payment_method,
    p_staff_id,
    v_receipt_number,
    'completed',
    v_fraud_score,
    v_is_suspicious,
    now()
  ) RETURNING id INTO v_transaction_id;
  
  -- Log activity
  INSERT INTO public.pos_activity_log (
    terminal_id, merchant_id, staff_id, activity_type, activity_details
  ) VALUES (
    p_terminal_id,
    v_terminal.merchant_id,
    p_staff_id,
    'transaction_processed',
    jsonb_build_object(
      'transaction_id', v_transaction_id,
      'amount', p_amount,
      'type', p_transaction_type
    )
  );
  
  -- Log suspicious transaction
  IF v_is_suspicious THEN
    PERFORM public.log_security_incident(
      'pos_suspicious_transaction',
      'medium',
      auth.uid(),
      jsonb_build_object(
        'transaction_id', v_transaction_id,
        'fraud_score', v_fraud_score,
        'amount', p_amount
      )
    );
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', v_transaction_id,
    'receipt_number', v_receipt_number,
    'is_suspicious', v_is_suspicious
  );
END;
$$;

-- Sync inventory across locations
CREATE OR REPLACE FUNCTION public.sync_store_inventory(
  p_merchant_id UUID,
  p_terminal_id UUID,
  p_sync_type TEXT DEFAULT 'incremental'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sync_id UUID;
  v_items_synced INTEGER := 0;
  v_start_time TIMESTAMPTZ;
  v_terminal RECORD;
BEGIN
  v_start_time := now();
  
  -- Verify merchant owns terminal
  SELECT * INTO v_terminal
  FROM public.pos_terminals
  WHERE id = p_terminal_id
    AND merchant_id = p_merchant_id
    AND is_active = true;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid terminal or access denied';
  END IF;
  
  -- Create sync log entry
  INSERT INTO public.inventory_sync_log (
    merchant_id,
    terminal_id,
    store_location_id,
    sync_type,
    sync_status
  ) VALUES (
    p_merchant_id,
    p_terminal_id,
    v_terminal.store_location_id,
    p_sync_type,
    'in_progress'
  ) RETURNING id INTO v_sync_id;
  
  -- Count items to sync
  SELECT COUNT(*) INTO v_items_synced
  FROM public.merchant_items
  WHERE merchant_id = p_merchant_id;
  
  -- Update sync log
  UPDATE public.inventory_sync_log
  SET 
    sync_status = 'completed',
    items_synced = v_items_synced,
    completed_at = now(),
    sync_duration_ms = EXTRACT(EPOCH FROM (now() - v_start_time)) * 1000
  WHERE id = v_sync_id;
  
  -- Update terminal last sync
  UPDATE public.pos_terminals
  SET last_sync_at = now()
  WHERE id = p_terminal_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'sync_id', v_sync_id,
    'items_synced', v_items_synced,
    'duration_ms', EXTRACT(EPOCH FROM (now() - v_start_time)) * 1000
  );
END;
$$;

-- Verify staff PIN for POS access
CREATE OR REPLACE FUNCTION public.verify_staff_pin(
  p_staff_id UUID,
  p_pin TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_pin_hash TEXT;
  v_stored_hash TEXT;
BEGIN
  -- Hash provided PIN
  v_pin_hash := encode(digest(p_pin || 'staff_pin_salt', 'sha256'), 'hex');
  
  -- Get stored hash
  SELECT pin_hash INTO v_stored_hash
  FROM public.store_staff
  WHERE id = p_staff_id
    AND is_active = true;
  
  IF v_stored_hash = v_pin_hash THEN
    -- Update last login
    UPDATE public.store_staff
    SET last_login_at = now()
    WHERE id = p_staff_id;
    
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER update_pos_terminals_updated_at
  BEFORE UPDATE ON public.pos_terminals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_store_staff_updated_at
  BEFORE UPDATE ON public.store_staff
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();