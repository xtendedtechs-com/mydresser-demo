-- Fix RLS policies for wardrobe_backups table
DROP POLICY IF EXISTS "Users can view own backups" ON wardrobe_backups;
DROP POLICY IF EXISTS "Users can create own backups" ON wardrobe_backups;
DROP POLICY IF EXISTS "Users can delete own backups" ON wardrobe_backups;

-- Recreate policies with proper checks
CREATE POLICY "Users can view own backups"
  ON wardrobe_backups
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own backups"
  ON wardrobe_backups
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own backups"
  ON wardrobe_backups
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);