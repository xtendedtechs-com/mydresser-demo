-- Create wardrobe backups table
CREATE TABLE IF NOT EXISTS public.wardrobe_backups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  backup_name TEXT NOT NULL,
  backup_type TEXT NOT NULL DEFAULT 'manual',
  backup_data JSONB NOT NULL,
  item_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  notes TEXT,
  CONSTRAINT wardrobe_backups_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.wardrobe_backups ENABLE ROW LEVEL SECURITY;

-- Users can view their own backups
CREATE POLICY "Users can view their own backups"
  ON public.wardrobe_backups
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own backups
CREATE POLICY "Users can create their own backups"
  ON public.wardrobe_backups
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own backups
CREATE POLICY "Users can delete their own backups"
  ON public.wardrobe_backups
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_wardrobe_backups_user_id ON public.wardrobe_backups(user_id);
CREATE INDEX idx_wardrobe_backups_created_at ON public.wardrobe_backups(created_at DESC);