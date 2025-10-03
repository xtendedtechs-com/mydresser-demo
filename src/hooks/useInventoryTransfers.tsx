import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface InventoryTransfer {
  id: string;
  merchant_id: string;
  from_location_id: string | null;
  to_location_id: string | null;
  merchant_item_id: string;
  quantity: number;
  transfer_status: 'pending' | 'in_transit' | 'completed' | 'cancelled';
  requested_by: string | null;
  approved_by: string | null;
  completed_by: string | null;
  requested_at: string;
  approved_at: string | null;
  completed_at: string | null;
  notes: string | null;
  tracking_info: any;
  created_at: string;
  updated_at: string;
}

export const useInventoryTransfers = () => {
  const [transfers, setTransfers] = useState<InventoryTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTransfers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('inventory_transfers')
        .select('*')
        .eq('merchant_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransfers((data || []) as InventoryTransfer[]);
    } catch (error: any) {
      toast({
        title: 'Error fetching transfers',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createTransfer = async (transferData: Partial<InventoryTransfer>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('inventory_transfers')
        .insert({
          merchant_id: user.id,
          requested_by: user.id,
          ...transferData,
        } as any)
        .select()
        .single();

      if (error) throw error;

      setTransfers([data as InventoryTransfer, ...transfers]);
      toast({
        title: 'Transfer created',
        description: 'Inventory transfer request has been created',
      });
      return data;
    } catch (error: any) {
      toast({
        title: 'Error creating transfer',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateTransferStatus = async (
    id: string,
    status: InventoryTransfer['transfer_status'],
    notes?: string
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const updates: any = { transfer_status: status, notes };

      if (status === 'in_transit') {
        updates.approved_at = new Date().toISOString();
        updates.approved_by = user.id;
      } else if (status === 'completed') {
        updates.completed_at = new Date().toISOString();
        updates.completed_by = user.id;
      }

      const { data, error } = await supabase
        .from('inventory_transfers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setTransfers(transfers.map(t => t.id === id ? (data as InventoryTransfer) : t));
      toast({
        title: 'Transfer updated',
        description: `Transfer status changed to ${status}`,
      });
      return data;
    } catch (error: any) {
      toast({
        title: 'Error updating transfer',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchTransfers();

    const channel = supabase
      .channel('inventory_transfers_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'inventory_transfers',
        },
        () => {
          fetchTransfers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    transfers,
    loading,
    createTransfer,
    updateTransferStatus,
    refetch: fetchTransfers,
  };
};
