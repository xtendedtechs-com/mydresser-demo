-- Create wardrobe_components table for detailed wardrobe organization
CREATE TABLE IF NOT EXISTS public.wardrobe_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wardrobe_id UUID NOT NULL REFERENCES public.wardrobes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  component_type TEXT NOT NULL, -- 'shelf', 'drawer', 'hanging_rod', 'shoe_rack', 'accessory_drawer', etc.
  name TEXT NOT NULL,
  position JSONB NOT NULL DEFAULT '{"x": 0, "y": 0, "z": 0}'::jsonb, -- Position in wardrobe
  dimensions JSONB NOT NULL, -- width, height, depth in cm
  capacity INTEGER DEFAULT 10, -- Number of items it can hold
  current_items INTEGER DEFAULT 0,
  color TEXT DEFAULT '#e5e7eb',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_wardrobe_components_wardrobe_id ON public.wardrobe_components(wardrobe_id);
CREATE INDEX idx_wardrobe_components_user_id ON public.wardrobe_components(user_id);

-- Enable RLS
ALTER TABLE public.wardrobe_components ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own wardrobe components"
  ON public.wardrobe_components
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_wardrobe_components_updated_at
  BEFORE UPDATE ON public.wardrobe_components
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add component_layout to wardrobes table
ALTER TABLE public.wardrobes 
ADD COLUMN IF NOT EXISTS component_layout JSONB DEFAULT '{}'::jsonb;