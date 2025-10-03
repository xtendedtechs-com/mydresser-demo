import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MarketplaceTransaction {
  id: string;
  item_id: string;
  seller_id: string;
  buyer_id: string;
  price: number;
  shipping_cost: number;
  total_amount: number;
  status: string;
  payment_method?: string;
  payment_status: string;
  shipping_address?: any;
  tracking_number?: string;
  shipped_at?: string;
  delivered_at?: string;
  completed_at?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const useMarketplaceTransactions = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['marketplace-transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketplace_transactions')
        .select('*, market_items(*)')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const createTransaction = useMutation({
    mutationFn: async (transaction: {
      item_id: string;
      seller_id: string;
      price: number;
      shipping_cost?: number;
      shipping_address?: any;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('marketplace_transactions')
        .insert({
          ...transaction,
          buyer_id: user.id,
          total_amount: transaction.price + (transaction.shipping_cost || 0),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-transactions'] });
      toast({
        title: 'Transaction Created',
        description: 'Your purchase request has been sent to the seller',
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

  const updateTransaction = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MarketplaceTransaction> & { id: string }) => {
      const { data, error } = await supabase
        .from('marketplace_transactions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-transactions'] });
      toast({
        title: 'Transaction Updated',
        description: 'Transaction status has been updated',
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

  return {
    transactions,
    isLoading,
    createTransaction: createTransaction.mutate,
    updateTransaction: updateTransaction.mutate,
    isCreating: createTransaction.isPending,
    isUpdating: updateTransaction.isPending,
  };
};
