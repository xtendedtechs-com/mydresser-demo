import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface LocationInventoryItem {
  id: string;
  location_id: string;
  merchant_item_id: string;
  quantity: number;
  reserved_quantity: number;
  reorder_point: number;
  last_restock_date: string | null;
  last_count_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const useLocationInventory = (locationId?: string) => {
  const [inventory, setInventory] = useState<LocationInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchInventory = async () => {
    try {
      let query = supabase
        .from('location_inventory')
        .select('*');

      if (locationId) {
        query = query.eq('location_id', locationId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setInventory(data || []);
    } catch (error: any) {
      toast({
        title: 'Error fetching inventory',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateInventory = async (
    id: string,
    updates: Partial<LocationInventoryItem>
  ) => {
    try {
      const { data, error } = await supabase
        .from('location_inventory')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setInventory(inventory.map(item => item.id === id ? data : item));
      toast({
        title: 'Inventory updated',
        description: 'Inventory item has been updated successfully',
      });
      return data;
    } catch (error: any) {
      toast({
        title: 'Error updating inventory',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const addInventoryItem = async (itemData: Partial<LocationInventoryItem>) => {
    try {
      const { data, error } = await supabase
        .from('location_inventory')
        .insert(itemData as any)
        .select()
        .single();

      if (error) throw error;

      setInventory([data as LocationInventoryItem, ...inventory]);
      toast({
        title: 'Inventory item added',
        description: 'Item has been added to location inventory',
      });
      return data;
    } catch (error: any) {
      toast({
        title: 'Error adding inventory',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const adjustStock = async (id: string, adjustment: number, notes?: string) => {
    try {
      const item = inventory.find(i => i.id === id);
      if (!item) throw new Error('Item not found');

      const newQuantity = Math.max(0, item.quantity + adjustment);

      await updateInventory(id, {
        quantity: newQuantity,
        last_count_date: new Date().toISOString(),
        notes: notes || item.notes,
      });
    } catch (error: any) {
      toast({
        title: 'Error adjusting stock',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchInventory();

    const channel = supabase
      .channel('location_inventory_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'location_inventory',
        },
        () => {
          fetchInventory();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [locationId]);

  return {
    inventory,
    loading,
    updateInventory,
    addInventoryItem,
    adjustStock,
    refetch: fetchInventory,
  };
};
