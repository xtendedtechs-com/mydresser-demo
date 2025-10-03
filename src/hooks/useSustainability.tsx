import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SustainabilityMetrics {
  itemsRescued: number;
  co2Saved: number;
  waterSaved: number;
  wasteReduced: number;
  moneySaved: number;
  sustainabilityScore: number;
}

interface SustainabilityData {
  id?: string;
  user_id: string;
  items_rescued: number;
  co2_saved: number;
  water_saved: number;
  waste_reduced: number;
  money_saved: number;
  sustainability_score: number;
  created_at?: string;
  updated_at?: string;
}

export const useSustainability = () => {
  const [metrics, setMetrics] = useState<SustainabilityMetrics>({
    itemsRescued: 0,
    co2Saved: 0,
    waterSaved: 0,
    wasteReduced: 0,
    moneySaved: 0,
    sustainabilityScore: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { data, error } = await supabase
        .from('sustainability_metrics')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setMetrics({
          itemsRescued: data.items_resold || 0,
          co2Saved: data.co2_saved_kg || 0,
          waterSaved: data.water_saved_liters || 0,
          wasteReduced: data.waste_prevented_kg || 0,
          moneySaved: 0,
          sustainabilityScore: data.circular_economy_score || 0
        });
      }
    } catch (error: any) {
      console.error('Error fetching sustainability metrics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load sustainability metrics',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateMetrics = async (updates: Partial<SustainabilityMetrics>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const updatedData: any = {};
      if (updates.itemsRescued !== undefined) updatedData.items_resold = updates.itemsRescued;
      if (updates.co2Saved !== undefined) updatedData.co2_saved_kg = updates.co2Saved;
      if (updates.waterSaved !== undefined) updatedData.water_saved_liters = updates.waterSaved;
      if (updates.wasteReduced !== undefined) updatedData.waste_prevented_kg = updates.wasteReduced;
      if (updates.sustainabilityScore !== undefined) updatedData.circular_economy_score = updates.sustainabilityScore;

      const { error } = await supabase
        .from('sustainability_metrics')
        .upsert({
          user_id: user.id,
          ...updatedData,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setMetrics(prev => ({ ...prev, ...updates }));

      toast({
        title: 'Updated!',
        description: 'Your sustainability metrics have been updated'
      });
    } catch (error: any) {
      console.error('Error updating sustainability metrics:', error);
      toast({
        title: 'Error',
        description: 'Failed to update sustainability metrics',
        variant: 'destructive'
      });
    }
  };

  const calculateImpact = async (wardrobeItems: any[]) => {
    // Calculate sustainability metrics based on wardrobe usage
    const secondHandItems = wardrobeItems.filter(item => 
      item.tags?.includes('secondhand') || item.tags?.includes('thrifted')
    ).length;

    const totalItems = wardrobeItems.length;
    const averageCO2PerItem = 20; // kg of CO2 per clothing item
    const averageWaterPerItem = 2700; // liters per item
    const averageWastePerItem = 0.5; // kg per item
    const averagePriceSaved = 30; // $ per secondhand item

    const newMetrics = {
      itemsRescued: secondHandItems,
      co2Saved: secondHandItems * averageCO2PerItem,
      waterSaved: secondHandItems * averageWaterPerItem,
      wasteReduced: secondHandItems * averageWastePerItem,
      moneySaved: secondHandItems * averagePriceSaved,
      sustainabilityScore: Math.min(100, Math.round(
        (secondHandItems / Math.max(totalItems, 1)) * 100
      ))
    };

    await updateMetrics(newMetrics);
  };

  return {
    metrics,
    loading,
    updateMetrics,
    calculateImpact,
    refetch: fetchMetrics
  };
};
