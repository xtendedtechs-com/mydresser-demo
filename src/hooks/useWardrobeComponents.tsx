import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type DbWardrobeComponent = Database['public']['Tables']['wardrobe_components']['Row'];

export interface WardrobeComponent extends Omit<DbWardrobeComponent, 'position' | 'dimensions'> {
  position: { x: number; y: number; z: number };
  dimensions: { width: number; height: number; depth: number };
}

export const useWardrobeComponents = (wardrobeId?: string) => {
  const [components, setComponents] = useState<WardrobeComponent[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchComponents = async () => {
    if (!wardrobeId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('wardrobe_components')
        .select('*')
        .eq('wardrobe_id', wardrobeId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComponents((data || []) as WardrobeComponent[]);
    } catch (error: any) {
      toast({
        title: "Error loading components",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComponents();
  }, [wardrobeId]);

  const addComponent = async (componentData: Omit<WardrobeComponent, 'id' | 'created_at' | 'updated_at' | 'current_items'>) => {
    try {
      const { data, error } = await supabase
        .from('wardrobe_components')
        .insert([{
          ...componentData,
          current_items: 0
        }])
        .select()
        .single();

      if (error) throw error;

      setComponents(prev => [...prev, data as WardrobeComponent]);
      toast({
        title: "Component added",
        description: `${componentData.name} has been added to your wardrobe.`,
      });

      return data;
    } catch (error: any) {
      toast({
        title: "Error adding component",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateComponent = async (id: string, updates: Partial<Omit<WardrobeComponent, 'id' | 'user_id' | 'wardrobe_id' | 'created_at'>>) => {
    try {
      const { data, error } = await supabase
        .from('wardrobe_components')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setComponents(prev => prev.map(c => c.id === id ? data as WardrobeComponent : c));
      toast({
        title: "Component updated",
        description: "Your component has been updated.",
      });

      return data;
    } catch (error: any) {
      toast({
        title: "Error updating component",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteComponent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('wardrobe_components')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setComponents(prev => prev.filter(c => c.id !== id));
      toast({
        title: "Component removed",
        description: "The component has been removed.",
      });
    } catch (error: any) {
      toast({
        title: "Error removing component",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    components,
    loading,
    addComponent,
    updateComponent,
    deleteComponent,
    refetch: fetchComponents
  };
};