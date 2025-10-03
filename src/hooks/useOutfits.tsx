import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Outfit {
  id: string;
  user_id: string;
  name: string;
  description?: string | null;
  occasion?: string | null;
  season?: string | null;
  style_tags?: string[] | null;
  photo_url?: string | null;
  is_favorite?: boolean;
  is_public?: boolean;
  wear_count?: number;
  last_worn?: string | null;
  created_at: string;
  updated_at: string;
}

export const useOutfits = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: outfits = [], isLoading } = useQuery({
    queryKey: ['outfits'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('outfits')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []) as any as Outfit[];
    },
  });

  const createOutfit = useMutation({
    mutationFn: async (outfit: Partial<Outfit>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('outfits')
        .insert({ ...outfit, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outfits'] });
      toast({
        title: 'Outfit Created',
        description: 'Your outfit has been created successfully.',
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

  const updateOutfit = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Outfit> & { id: string }) => {
      const { data, error } = await supabase
        .from('outfits')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outfits'] });
      toast({
        title: 'Outfit Updated',
        description: 'Your outfit has been updated successfully.',
      });
    },
  });

  const deleteOutfit = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('outfits')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outfits'] });
      toast({
        title: 'Outfit Deleted',
        description: 'Your outfit has been deleted.',
      });
    },
  });

  return {
    outfits,
    isLoading,
    createOutfit: createOutfit.mutate,
    updateOutfit: updateOutfit.mutate,
    deleteOutfit: deleteOutfit.mutate,
  };
};
