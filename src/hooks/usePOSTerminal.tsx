import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface POSTerminal {
  id: string;
  merchant_id: string;
  store_location_id: string;
  terminal_name: string;
  terminal_code: string;
  device_id: string;
  is_active: boolean;
  last_sync_at: string;
  created_at: string;
}

export interface POSTransaction {
  id: string;
  terminal_id: string;
  merchant_id: string;
  staff_id?: string;
  transaction_type: string;
  amount: number;
  items: any[];
  payment_method: string;
  receipt_number: string;
  transaction_status: string;
  completed_at: string;
  created_at: string;
}

export const usePOSTerminal = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: terminals, isLoading: terminalsLoading } = useQuery({
    queryKey: ['pos-terminals'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('pos_terminals' as any)
        .select('*')
        .eq('merchant_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as any as POSTerminal[];
    },
  });

  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['pos-transactions'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('pos_transactions' as any)
        .select('*')
        .eq('merchant_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return (data || []) as any as POSTransaction[];
    },
  });

  const createTerminal = useMutation({
    mutationFn: async (terminal: {
      store_location_id: string;
      terminal_name: string;
      device_id: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const terminalCode = `POS-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      const authToken = Math.random().toString(36).substr(2, 32);
      const authTokenHash = btoa(authToken); // In production, use proper hashing

      const { data, error } = await supabase
        .from('pos_terminals' as any)
        .insert({
          merchant_id: user.id,
          ...terminal,
          terminal_code: terminalCode,
          auth_token_hash: authTokenHash,
        })
        .select()
        .single();

      if (error) throw error;
      return { ...(data as any), auth_token: authToken };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos-terminals'] });
      toast({
        title: 'Terminal Created',
        description: 'POS terminal has been successfully created',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const processTransaction = useMutation({
    mutationFn: async (transaction: {
      terminal_id: string;
      transaction_type: string;
      amount: number;
      items: any[];
      payment_method: string;
      staff_id?: string;
    }) => {
      const { data, error } = await supabase.rpc('process_pos_transaction', {
        p_terminal_id: transaction.terminal_id,
        p_transaction_type: transaction.transaction_type,
        p_amount: transaction.amount,
        p_items: transaction.items,
        p_payment_method: transaction.payment_method,
        p_staff_id: transaction.staff_id,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos-transactions'] });
      toast({
        title: 'Transaction Processed',
        description: 'Transaction has been successfully completed',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Transaction Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const syncInventory = useMutation({
    mutationFn: async (terminalId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.rpc('sync_store_inventory', {
        p_merchant_id: user.id,
        p_terminal_id: terminalId,
        p_sync_type: 'full',
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos-terminals'] });
      toast({
        title: 'Inventory Synced',
        description: 'Store inventory has been synchronized',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Sync Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    terminals,
    transactions,
    isLoading: terminalsLoading || transactionsLoading,
    createTerminal: createTerminal.mutate,
    isCreating: createTerminal.isPending,
    processTransaction: processTransaction.mutate,
    isProcessing: processTransaction.isPending,
    syncInventory: syncInventory.mutate,
    isSyncing: syncInventory.isPending,
  };
};
