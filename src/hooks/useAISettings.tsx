import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AISettings {
  id?: string;
  user_id: string;
  chat_model: string;
  recommendation_model: string;
  image_model: string;
  daily_request_limit: number;
  enable_usage_alerts: boolean;
  enable_style_chat: boolean;
  enable_outfit_suggestions: boolean;
  enable_wardrobe_insights: boolean;
  enable_virtual_tryon: boolean;
  style_preferences: Record<string, any>;
  color_preferences: string[];
  brand_preferences: string[];
  // Phase 16 additions (optional until DB migration)
  enable_daily_recommendations?: boolean;
  enable_context_aware_suggestions?: boolean;
  recommendation_frequency?: 'daily' | 'weekly' | 'on-demand';
  preferred_occasions?: string[];
  style_evolution_tracking?: boolean;
}

export const useAISettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['ai-service-settings'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('ai_service_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      // Create default settings if none exist
      if (!data) {
        const { data: newSettings, error: insertError } = await supabase
          .from('ai_service_settings')
          .insert({ user_id: user.id })
          .select()
          .single();
        
        if (insertError) throw insertError;
        return newSettings;
      }

      return data as AISettings;
    },
  });

  const updateSettings = useMutation({
    mutationFn: async (updates: Partial<AISettings>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('ai_service_settings')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-service-settings'] });
      toast({
        title: 'AI Settings Updated',
        description: 'Your AI preferences have been saved',
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
