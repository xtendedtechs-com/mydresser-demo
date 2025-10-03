import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Promotion {
  id: string;
  merchant_id: string;
  name: string;
  description?: string;
  type: 'percentage' | 'fixed_amount' | 'buy_x_get_y' | 'free_shipping';
  discount_value: number;
  code?: string;
  min_purchase_amount: number;
  max_discount_amount?: number;
  applicable_categories?: string[];
  applicable_items?: string[];
  start_date: string;
  end_date: string;
  usage_limit?: number;
  usage_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const usePromotions = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: promotions, isLoading } = useQuery({
    queryKey: ['promotions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Promotion[];
    },
  });

  const createPromotion = useMutation({
    mutationFn: async (promotion: Omit<Promotion, 'id' | 'merchant_id' | 'usage_count' | 'created_at' | 'updated_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('promotions')
        .insert({
          ...promotion,
          merchant_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      toast({
        title: 'Promotion Created',
        description: 'Your promotion has been created successfully',
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

  const updatePromotion = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Promotion> & { id: string }) => {
      const { data, error } = await supabase
        .from('promotions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      toast({
        title: 'Promotion Updated',
        description: 'Your promotion has been updated successfully',
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

  const deletePromotion = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('promotions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      toast({
        title: 'Promotion Deleted',
        description: 'Your promotion has been deleted successfully',
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
    promotions,
    isLoading,
    createPromotion: createPromotion.mutate,
    updatePromotion: updatePromotion.mutate,
    deletePromotion: deletePromotion.mutate,
    isCreating: createPromotion.isPending,
    isUpdating: updatePromotion.isPending,
    isDeleting: deletePromotion.isPending,
  };
};
