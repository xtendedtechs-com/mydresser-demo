import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MerchantSettings {
  id?: string;
  merchant_id: string;
  accepted_payment_methods: string[];
  payment_gateway: string;
  commission_rate: number;
  enable_installments: boolean;
  auto_accept_orders: boolean;
  order_processing_time: number;
  enable_order_tracking: boolean;
  low_stock_threshold: number;
  enable_stock_alerts: boolean;
  auto_reorder: boolean;
  enable_customer_reviews: boolean;
  require_review_moderation: boolean;
  enable_loyalty_program: boolean;
  enable_promotions: boolean;
  enable_email_marketing: boolean;
  enable_analytics: boolean;
  store_theme: string;
  brand_colors: { primary: string; secondary: string };
  custom_css?: string;
}

export const useMerchantSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['merchant-settings'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('merchant_settings')
        .select('*')
        .eq('merchant_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      // Create default settings if none exist
      if (!data) {
        const { data: newSettings, error: insertError } = await supabase
          .from('merchant_settings')
          .insert({ merchant_id: user.id })
          .select()
          .single();
        
        if (insertError) throw insertError;
        return {
          ...newSettings,
          brand_colors: newSettings.brand_colors as { primary: string; secondary: string }
        } as MerchantSettings;
      }

      return {
        ...data,
        brand_colors: data.brand_colors as { primary: string; secondary: string }
      } as MerchantSettings;
    },
  });

  const updateSettings = useMutation({
    mutationFn: async (updates: Partial<MerchantSettings>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('merchant_settings')
        .update(updates)
        .eq('merchant_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant-settings'] });
      toast({
        title: 'Merchant Settings Updated',
        description: 'Your store preferences have been saved',
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
    settings,
    isLoading,
    updateSettings: updateSettings.mutate,
    isUpdating: updateSettings.isPending,
  };
};
