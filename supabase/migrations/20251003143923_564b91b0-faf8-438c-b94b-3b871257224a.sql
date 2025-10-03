-- Phase 38: Multi-Location Inventory & Organizational Management

-- Create store_locations table for multi-branch management
CREATE TABLE IF NOT EXISTS public.store_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL,
  location_name TEXT NOT NULL,
  address JSONB,
  phone TEXT,
  email TEXT,
  manager_name TEXT,
  manager_contact TEXT,
  is_primary BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  operating_hours JSONB DEFAULT '{"monday": "9:00-18:00", "tuesday": "9:00-18:00", "wednesday": "9:00-18:00", "thursday": "9:00-18:00", "friday": "9:00-18:00", "saturday": "10:00-17:00", "sunday": "closed"}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create location_inventory table for tracking stock per location
CREATE TABLE IF NOT EXISTS public.location_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID NOT NULL REFERENCES public.store_locations(id) ON DELETE CASCADE,
  merchant_item_id UUID NOT NULL REFERENCES public.merchant_items(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0,
  reserved_quantity INTEGER DEFAULT 0,
  reorder_point INTEGER DEFAULT 5,
  last_restock_date TIMESTAMP WITH TIME ZONE,
  last_count_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(location_id, merchant_item_id)
);

-- Create inventory_transfers table for stock movement between locations
CREATE TABLE IF NOT EXISTS public.inventory_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL,
  from_location_id UUID REFERENCES public.store_locations(id),
  to_location_id UUID REFERENCES public.store_locations(id),
  merchant_item_id UUID NOT NULL REFERENCES public.merchant_items(id),
  quantity INTEGER NOT NULL,
  transfer_status TEXT DEFAULT 'pending' CHECK (transfer_status IN ('pending', 'in_transit', 'completed', 'cancelled')),
  requested_by UUID,
  approved_by UUID,
  completed_by UUID,
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  approved_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  tracking_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create merchant_employees table for staff management
CREATE TABLE IF NOT EXISTS public.merchant_employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL,
  employee_name TEXT NOT NULL,
  employee_email TEXT NOT NULL,
  employee_phone TEXT,
  position TEXT NOT NULL,
  location_id UUID REFERENCES public.store_locations(id),
  permissions JSONB DEFAULT '{"can_process_sales": true, "can_manage_inventory": false, "can_view_reports": false}'::jsonb,
  hourly_rate NUMERIC,
  hire_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.store_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchant_employees ENABLE ROW LEVEL SECURITY;

-- RLS Policies for store_locations
CREATE POLICY "Merchants can manage their own locations"
  ON public.store_locations FOR ALL
  USING (auth.uid() = merchant_id AND is_merchant(auth.uid()))
  WITH CHECK (auth.uid() = merchant_id AND is_merchant(auth.uid()));

-- RLS Policies for location_inventory
CREATE POLICY "Merchants can view location inventory"
  ON public.location_inventory FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.store_locations sl
    WHERE sl.id = location_inventory.location_id
    AND sl.merchant_id = auth.uid()
  ));

CREATE POLICY "Merchants can manage location inventory"
  ON public.location_inventory FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.store_locations sl
    WHERE sl.id = location_inventory.location_id
    AND sl.merchant_id = auth.uid()
    AND is_merchant(auth.uid())
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.store_locations sl
    WHERE sl.id = location_inventory.location_id
    AND sl.merchant_id = auth.uid()
    AND is_merchant(auth.uid())
  ));

-- RLS Policies for inventory_transfers
CREATE POLICY "Merchants can manage their transfers"
  ON public.inventory_transfers FOR ALL
  USING (auth.uid() = merchant_id AND is_merchant(auth.uid()))
  WITH CHECK (auth.uid() = merchant_id AND is_merchant(auth.uid()));

-- RLS Policies for merchant_employees
CREATE POLICY "Merchants can manage their employees"
  ON public.merchant_employees FOR ALL
  USING (auth.uid() = merchant_id AND is_merchant(auth.uid()))
  WITH CHECK (auth.uid() = merchant_id AND is_merchant(auth.uid()));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_store_locations_merchant ON public.store_locations(merchant_id);
CREATE INDEX IF NOT EXISTS idx_location_inventory_location ON public.location_inventory(location_id);
CREATE INDEX IF NOT EXISTS idx_location_inventory_item ON public.location_inventory(merchant_item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transfers_merchant ON public.inventory_transfers(merchant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transfers_status ON public.inventory_transfers(transfer_status);
CREATE INDEX IF NOT EXISTS idx_merchant_employees_merchant ON public.merchant_employees(merchant_id);
CREATE INDEX IF NOT EXISTS idx_merchant_employees_location ON public.merchant_employees(location_id);

-- Triggers for updated_at
CREATE TRIGGER update_store_locations_updated_at
  BEFORE UPDATE ON public.store_locations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_location_inventory_updated_at
  BEFORE UPDATE ON public.location_inventory
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inventory_transfers_updated_at
  BEFORE UPDATE ON public.inventory_transfers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_merchant_employees_updated_at
  BEFORE UPDATE ON public.merchant_employees
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();