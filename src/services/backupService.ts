import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface BackupData {
  wardrobeItems: any[];
  wardrobes: any[];
  outfits: any[];
  collections: any[];
  timestamp: string;
}

export interface WardrobeBackup {
  id: string;
  user_id: string;
  backup_name: string;
  backup_type: 'manual' | 'automatic';
  backup_data: BackupData;
  item_count: number;
  created_at: string;
  notes?: string;
}

class BackupService {
  async createBackup(name: string, type: 'manual' | 'automatic' = 'manual', notes?: string): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Fetch all wardrobe data
      const [
        { data: wardrobeItems },
        { data: wardrobes },
        { data: outfits },
        { data: collections }
      ] = await Promise.all([
        supabase.from('wardrobe_items').select('*').eq('user_id', user.id),
        supabase.from('wardrobes').select('*').eq('user_id', user.id),
        supabase.from('outfits').select('*, outfit_items(*)').eq('user_id', user.id),
        supabase.from('collections').select('*, collection_items(*)').eq('user_id', user.id)
      ]);

      const backupData: BackupData = {
        wardrobeItems: wardrobeItems || [],
        wardrobes: wardrobes || [],
        outfits: outfits || [],
        collections: collections || [],
        timestamp: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('wardrobe_backups')
        .insert({
          user_id: user.id,
          backup_name: name,
          backup_type: type,
          backup_data: backupData as any,
          item_count: (wardrobeItems?.length || 0),
          notes
        } as any)
        .select()
        .single();

      if (error) throw error;

      toast.success('Backup created successfully');
      return data.id;
    } catch (error) {
      console.error('Error creating backup:', error);
      toast.error('Failed to create backup');
      return null;
    }
  }

  async getBackups(): Promise<WardrobeBackup[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('wardrobe_backups')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as any as WardrobeBackup[];
    } catch (error) {
      console.error('Error fetching backups:', error);
      toast.error('Failed to fetch backups');
      return [];
    }
  }

  async restoreBackup(backupId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Fetch backup
      const { data: backup, error: fetchError } = await supabase
        .from('wardrobe_backups')
        .select('*')
        .eq('id', backupId)
        .eq('user_id', user.id)
        .single();

      if (fetchError) throw fetchError;

      const backupData = backup.backup_data as any as BackupData;

      // Delete current data
      await Promise.all([
        supabase.from('wardrobe_items').delete().eq('user_id', user.id),
        supabase.from('wardrobes').delete().eq('user_id', user.id),
        supabase.from('outfits').delete().eq('user_id', user.id),
        supabase.from('collections').delete().eq('user_id', user.id)
      ]);

      // Restore wardrobes first (dependencies)
      if (backupData.wardrobes?.length > 0) {
        await supabase.from('wardrobes').insert(backupData.wardrobes);
      }

      // Restore wardrobe items
      if (backupData.wardrobeItems?.length > 0) {
        await supabase.from('wardrobe_items').insert(backupData.wardrobeItems);
      }

      // Restore outfits
      if (backupData.outfits?.length > 0) {
        for (const outfit of backupData.outfits) {
          const { outfit_items, ...outfitData } = outfit;
          const { data: newOutfit } = await supabase
            .from('outfits')
            .insert(outfitData)
            .select()
            .single();

          if (newOutfit && outfit_items?.length > 0) {
            await supabase.from('outfit_items').insert(
              outfit_items.map((item: any) => ({
                ...item,
                outfit_id: newOutfit.id
              }))
            );
          }
        }
      }

      // Restore collections
      if (backupData.collections?.length > 0) {
        for (const collection of backupData.collections) {
          const { collection_items, ...collectionData } = collection;
          const { data: newCollection } = await supabase
            .from('collections')
            .insert(collectionData)
            .select()
            .single();

          if (newCollection && collection_items?.length > 0) {
            await supabase.from('collection_items').insert(
              collection_items.map((item: any) => ({
                ...item,
                collection_id: newCollection.id
              }))
            );
          }
        }
      }

      toast.success('Backup restored successfully');
      return true;
    } catch (error) {
      console.error('Error restoring backup:', error);
      toast.error('Failed to restore backup');
      return false;
    }
  }

  async deleteBackup(backupId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('wardrobe_backups')
        .delete()
        .eq('id', backupId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Backup deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting backup:', error);
      toast.error('Failed to delete backup');
      return false;
    }
  }

  async downloadBackup(backupId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: backup, error } = await supabase
        .from('wardrobe_backups')
        .select('*')
        .eq('id', backupId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      const jsonString = JSON.stringify(backup, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `wardrobe-backup-${backup.backup_name}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Backup downloaded');
    } catch (error) {
      console.error('Error downloading backup:', error);
      toast.error('Failed to download backup');
    }
  }
}

export const backupService = new BackupService();
