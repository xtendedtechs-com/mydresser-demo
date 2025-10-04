import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ShippingZone {
  id: string;
  merchant_id: string;
  name: string;
  countries: string[];
  regions: string[];
  base_rate: number;
  per_item_rate: number;
  currency: string;
  estimated_days_min: number;
  estimated_days_max: number;
  is_active: boolean;
  free_shipping_threshold: number | null;
  created_at: string;
  updated_at: string;
}

export const useShippingZones = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch shipping zones
  const { data: zones, isLoading } = useQuery({
    queryKey: ['shipping-zones'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('shipping_zones')
        .select('*')
        .eq('merchant_id', user.id)
        .order('name');

      if (error) throw error;
      return data as ShippingZone[];
    },
  });

  // Create shipping zone
  const createMutation = useMutation({
    mutationFn: async (zone: Omit<ShippingZone, 'id' | 'created_at' | 'updated_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('shipping_zones')
        .insert({ ...zone, merchant_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping-zones'] });
      toast({
        title: 'Shipping Zone Created',
        description: 'New shipping zone has been added',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Creation Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update shipping zone
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ShippingZone> }) => {
      const { data, error } = await supabase
        .from('shipping_zones')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping-zones'] });
      toast({
        title: 'Zone Updated',
        description: 'Shipping zone has been updated',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Update Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete shipping zone
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('shipping_zones')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping-zones'] });
      toast({
        title: 'Zone Deleted',
        description: 'Shipping zone has been removed',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Deletion Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Calculate shipping cost
  const calculateShippingCost = (
    country: string,
    itemCount: number,
    orderTotal: number
  ): { cost: number; zone: ShippingZone | null; estimatedDays: string } | null => {
    if (!zones) return null;

    // Find applicable zone
    const zone = zones.find(
      z => z.is_active && z.countries.includes(country)
    );

    if (!zone) return null;

    // Check for free shipping
    if (zone.free_shipping_threshold && orderTotal >= zone.free_shipping_threshold) {
      return {
        cost: 0,
        zone,
        estimatedDays: `${zone.estimated_days_min}-${zone.estimated_days_max} days`,
      };
    }

    // Calculate cost
    const cost = zone.base_rate + (zone.per_item_rate * itemCount);

    return {
      cost,
      zone,
      estimatedDays: `${zone.estimated_days_min}-${zone.estimated_days_max} days`,
    };
  };

  return {
    zones,
    isLoading,
    createZone: createMutation.mutate,
    updateZone: updateMutation.mutate,
    deleteZone: deleteMutation.mutate,
    calculateShippingCost,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
