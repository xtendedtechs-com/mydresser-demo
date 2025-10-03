import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SustainabilityMetrics {
  id: string;
  user_id: string;
  items_resold: number;
  items_purchased_secondhand: number;
  co2_saved_kg: number;
  water_saved_liters: number;
  waste_prevented_kg: number;
  circular_economy_score: number;
  created_at: string;
  updated_at: string;
}

// Average impact per clothing item (based on fashion industry data)
const ITEM_IMPACT = {
  co2_kg: 20, // Average CO2 emissions per garment
  water_liters: 2700, // Average water usage per garment
  waste_kg: 0.4, // Average textile waste per garment
};

export const useSustainability = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: metrics, isLoading } = useQuery({
    queryKey: ['sustainability-metrics'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('sustainability_metrics')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      
      // Create metrics record if it doesn't exist
      if (!data) {
        const { data: newMetrics, error: insertError } = await supabase
          .from('sustainability_metrics')
          .insert({ user_id: user.id })
          .select()
          .single();
        
        if (insertError) throw insertError;
        return newMetrics as SustainabilityMetrics;
      }
      
      return data as SustainabilityMetrics;
    },
  });

  const updateMetrics = useMutation({
    mutationFn: async (action: 'resold' | 'purchased') => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const currentMetrics = metrics || {
        items_resold: 0,
        items_purchased_secondhand: 0,
        co2_saved_kg: 0,
        water_saved_liters: 0,
        waste_prevented_kg: 0,
        circular_economy_score: 0,
      };

      // Calculate circular economy score (0-100)
      const newItemsResold = action === 'resold' ? currentMetrics.items_resold + 1 : currentMetrics.items_resold;
      const newItemsPurchased = action === 'purchased' ? currentMetrics.items_purchased_secondhand + 1 : currentMetrics.items_purchased_secondhand;
      const totalItems = newItemsResold + newItemsPurchased;
      const circularScore = Math.min(100, Math.round(totalItems * 5));

      const updates = {
        items_resold: newItemsResold,
        items_purchased_secondhand: newItemsPurchased,
        co2_saved_kg: currentMetrics.co2_saved_kg + ITEM_IMPACT.co2_kg,
        water_saved_liters: currentMetrics.water_saved_liters + ITEM_IMPACT.water_liters,
        waste_prevented_kg: currentMetrics.waste_prevented_kg + ITEM_IMPACT.waste_kg,
        circular_economy_score: circularScore,
      };

      const { data, error } = await supabase
        .from('sustainability_metrics')
        .upsert({
          user_id: user.id,
          ...updates,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sustainability-metrics'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const getSustainabilityLevel = (score: number) => {
    if (score >= 80) return { label: 'Eco Champion', color: 'text-green-600', icon: '🌟' };
    if (score >= 60) return { label: 'Sustainability Leader', color: 'text-green-500', icon: '🌿' };
    if (score >= 40) return { label: 'Conscious Consumer', color: 'text-blue-500', icon: '♻️' };
    if (score >= 20) return { label: 'Getting Started', color: 'text-yellow-500', icon: '🌱' };
    return { label: 'Beginner', color: 'text-gray-500', icon: '🌾' };
  };

  return {
    metrics,
    isLoading,
    updateMetrics: updateMetrics.mutate,
    isUpdating: updateMetrics.isPending,
    getSustainabilityLevel,
    ITEM_IMPACT,
  };
};
