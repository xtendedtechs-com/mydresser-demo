-- Create merchant events table
CREATE TABLE IF NOT EXISTS public.merchant_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('sale', 'launch', 'workshop', 'fashion_show', 'popup', 'other')),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  is_online BOOLEAN DEFAULT false,
  banner_image TEXT,
  registration_link TEXT,
  max_attendees INTEGER,
  current_attendees INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.merchant_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for merchant_events
CREATE POLICY "Merchants can manage their own events"
  ON public.merchant_events
  FOR ALL
  USING (auth.uid() = merchant_id AND is_merchant(auth.uid()))
  WITH CHECK (auth.uid() = merchant_id AND is_merchant(auth.uid()));

CREATE POLICY "Anyone can view active events"
  ON public.merchant_events
  FOR SELECT
  USING (is_active = true);

-- Create index for performance
CREATE INDEX idx_merchant_events_merchant_id ON public.merchant_events(merchant_id);
CREATE INDEX idx_merchant_events_dates ON public.merchant_events(start_date, end_date);

-- Trigger for updated_at
CREATE TRIGGER update_merchant_events_updated_at
  BEFORE UPDATE ON public.merchant_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();