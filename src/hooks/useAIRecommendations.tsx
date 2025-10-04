import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { outfitRecommendationEngine, type RecommendationContext, type OutfitRecommendation } from '@/services/aiModels/outfitRecommendationEngine';

export const useAIRecommendations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch wardrobe items
  const { data: wardrobeItems = [], isLoading: isLoadingWardrobe } = useQuery({
    queryKey: ['wardrobe-items'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('wardrobe_items')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      return data || [];
    },
  });

  // Generate recommendations
  const generateRecommendations = useMutation({
    mutationFn: async (context: RecommendationContext) => {
      if (wardrobeItems.length === 0) {
        throw new Error('No wardrobe items available');
      }

      const recommendations = await outfitRecommendationEngine.generateRecommendations(
        wardrobeItems,
        context,
        5
      );

      return recommendations;
    },
    onError: (error: Error) => {
      toast({
        title: 'Recommendation Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Get recommendations for today
  const { data: dailyRecommendations, isLoading: isLoadingDaily } = useQuery({
    queryKey: ['daily-recommendations', new Date().toDateString()],
    queryFn: async () => {
      if (wardrobeItems.length === 0) return [];

      const context: RecommendationContext = {
        occasion: 'casual',
        season: getCurrentSeason(),
      };

      return outfitRecommendationEngine.generateRecommendations(
        wardrobeItems,
        context,
        3
      );
    },
    enabled: wardrobeItems.length > 0,
  });

  // Save outfit recommendation
  const saveOutfit = useMutation({
    mutationFn: async (recommendation: OutfitRecommendation) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('outfits')
        .insert({
          user_id: user.id,
          name: `${recommendation.occasion || 'Custom'} Outfit`,
          description: recommendation.reasoning,
          occasion: recommendation.occasion,
          season: recommendation.season,
        })
        .select()
        .single();

      if (error) throw error;

      // Link items to outfit
      const outfitItems = recommendation.items.map((item, index) => ({
        outfit_id: data.id,
        wardrobe_item_id: item.id,
        position: index,
      }));

      const { error: linkError } = await supabase
        .from('outfit_items')
        .insert(outfitItems);

      if (linkError) throw linkError;

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outfits'] });
      toast({
        title: 'Outfit Saved',
        description: 'Your outfit has been saved to your collection',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Save Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    wardrobeItems,
    isLoadingWardrobe,
    dailyRecommendations,
    isLoadingDaily,
    generateRecommendations: generateRecommendations.mutateAsync,
    isGenerating: generateRecommendations.isPending,
    saveOutfit: saveOutfit.mutateAsync,
    isSaving: saveOutfit.isPending,
  };
};

function getCurrentSeason(): string {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'fall';
  return 'winter';
}
