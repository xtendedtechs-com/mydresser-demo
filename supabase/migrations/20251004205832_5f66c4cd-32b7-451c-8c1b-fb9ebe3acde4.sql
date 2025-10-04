-- Create support_tickets table for merchant support system
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'pending', 'resolved', 'closed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  category TEXT,
  assigned_to UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- Create support_messages table for ticket communications
CREATE TABLE IF NOT EXISTS public.support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT false,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for support_tickets
CREATE POLICY "Merchants can view own tickets"
  ON public.support_tickets FOR SELECT
  USING (auth.uid() = merchant_id);

CREATE POLICY "Merchants can create tickets"
  ON public.support_tickets FOR INSERT
  WITH CHECK (auth.uid() = merchant_id);

CREATE POLICY "Merchants can update own tickets"
  ON public.support_tickets FOR UPDATE
  USING (auth.uid() = merchant_id);

-- RLS Policies for support_messages
CREATE POLICY "Users can view messages for their tickets"
  ON public.support_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.support_tickets
      WHERE support_tickets.id = support_messages.ticket_id
      AND support_tickets.merchant_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages for their tickets"
  ON public.support_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.support_tickets
      WHERE support_tickets.id = support_messages.ticket_id
      AND support_tickets.merchant_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_support_tickets_merchant ON public.support_tickets(merchant_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_messages_ticket ON public.support_messages(ticket_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_support_ticket_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER support_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_support_ticket_updated_at();