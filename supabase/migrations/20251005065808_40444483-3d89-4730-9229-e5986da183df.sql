-- Create outfit_history table for tracking worn outfits
CREATE TABLE IF NOT EXISTS public.outfit_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  outfit_items TEXT[] NOT NULL,
  worn_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  occasion TEXT,
  weather TEXT,
  location TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_outfit_history_user_id ON public.outfit_history(user_id);
CREATE INDEX IF NOT EXISTS idx_outfit_history_worn_date ON public.outfit_history(worn_date DESC);
CREATE INDEX IF NOT EXISTS idx_outfit_history_items ON public.outfit_history USING GIN(outfit_items);

-- Enable Row Level Security
ALTER TABLE public.outfit_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own outfit history"
  ON public.outfit_history
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own outfit history"
  ON public.outfit_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own outfit history"
  ON public.outfit_history
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own outfit history"
  ON public.outfit_history
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_outfit_history_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_outfit_history_updated_at
  BEFORE UPDATE ON public.outfit_history
  FOR EACH ROW
  EXECUTE FUNCTION public.update_outfit_history_updated_at();