import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface OutfitHistoryEntry {
  id: string;
  user_id: string;
  outfit_items: string[]; // Array of wardrobe item IDs
  worn_date: string;
  occasion?: string;
  weather?: string;
  location?: string;
  rating?: number; // 1-5 stars
  notes?: string;
  created_at: string;
}

export interface WearFrequency {
  item_id: string;
  wear_count: number;
  last_worn: string;
  days_since_worn: number;
}

export const useOutfitHistory = () => {
  const [history, setHistory] = useState<OutfitHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [wearFrequency, setWearFrequency] = useState<WearFrequency[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('outfit_history')
        .select('*')
        .eq('user_id', user.id)
        .order('worn_date', { ascending: false });

      if (error) throw error;
      setHistory(data || []);
      
      // Calculate wear frequency
      calculateWearFrequency(data || []);
    } catch (error) {
      console.error('Error loading outfit history:', error);
      toast({
        title: "Error",
        description: "Failed to load outfit history",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateWearFrequency = (entries: OutfitHistoryEntry[]) => {
    const itemCounts = new Map<string, { count: number; lastWorn: string }>();
    
    entries.forEach(entry => {
      entry.outfit_items.forEach(itemId => {
        const existing = itemCounts.get(itemId);
        if (!existing || new Date(entry.worn_date) > new Date(existing.lastWorn)) {
          itemCounts.set(itemId, {
            count: (existing?.count || 0) + 1,
            lastWorn: entry.worn_date,
          });
        } else {
          itemCounts.set(itemId, {
            ...existing,
            count: existing.count + 1,
          });
        }
      });
    });

    const now = new Date();
    const frequencies: WearFrequency[] = Array.from(itemCounts.entries()).map(
      ([itemId, { count, lastWorn }]) => {
        const lastWornDate = new Date(lastWorn);
        const daysSince = Math.floor(
          (now.getTime() - lastWornDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        return {
          item_id: itemId,
          wear_count: count,
          last_worn: lastWorn,
          days_since_worn: daysSince,
        };
      }
    );

    setWearFrequency(frequencies.sort((a, b) => b.wear_count - a.wear_count));
  };

  const logOutfit = async (
    itemIds: string[],
    occasion?: string,
    weather?: string,
    rating?: number,
    notes?: string
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('outfit_history')
        .insert({
          user_id: user.id,
          outfit_items: itemIds,
          worn_date: new Date().toISOString(),
          occasion,
          weather,
          rating,
          notes,
        })
        .select()
        .single();

      if (error) throw error;

      setHistory(prev => [data, ...prev]);
      calculateWearFrequency([data, ...history]);

      toast({
        title: "Outfit Logged",
        description: "Your outfit has been added to history",
      });

      return data;
    } catch (error) {
      console.error('Error logging outfit:', error);
      toast({
        title: "Error",
        description: "Failed to log outfit",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateOutfit = async (
    id: string,
    updates: Partial<OutfitHistoryEntry>
  ) => {
    try {
      const { data, error } = await supabase
        .from('outfit_history')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setHistory(prev => 
        prev.map(entry => entry.id === id ? data : entry)
      );

      toast({
        title: "Updated",
        description: "Outfit entry updated",
      });

      return data;
    } catch (error) {
      console.error('Error updating outfit:', error);
      toast({
        title: "Error",
        description: "Failed to update outfit",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteOutfit = async (id: string) => {
    try {
      const { error } = await supabase
        .from('outfit_history')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setHistory(prev => prev.filter(entry => entry.id !== id));
      calculateWearFrequency(history.filter(entry => entry.id !== id));

      toast({
        title: "Deleted",
        description: "Outfit entry removed",
      });
    } catch (error) {
      console.error('Error deleting outfit:', error);
      toast({
        title: "Error",
        description: "Failed to delete outfit",
        variant: "destructive",
      });
      throw error;
    }
  };

  const getItemWearCount = (itemId: string): number => {
    return wearFrequency.find(f => f.item_id === itemId)?.wear_count || 0;
  };

  const getMostWornItems = (limit: number = 10): WearFrequency[] => {
    return wearFrequency.slice(0, limit);
  };

  const getLeastWornItems = (limit: number = 10): WearFrequency[] => {
    return [...wearFrequency].reverse().slice(0, limit);
  };

  const getUnwornItems = (allItemIds: string[]): string[] => {
    const wornItemIds = new Set(wearFrequency.map(f => f.item_id));
    return allItemIds.filter(id => !wornItemIds.has(id));
  };

  return {
    history,
    wearFrequency,
    isLoading,
    logOutfit,
    updateOutfit,
    deleteOutfit,
    getItemWearCount,
    getMostWornItems,
    getLeastWornItems,
    getUnwornItems,
    refreshHistory: loadHistory,
  };
};
