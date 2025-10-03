import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UserCredibility {
  id: string;
  user_id: string;
  credibility_score: number;
  total_sales: number;
  successful_transactions: number;
  cancelled_transactions: number;
  disputes_filed: number;
  disputes_against: number;
  positive_reviews: number;
  negative_reviews: number;
  average_rating: number;
  verified_seller: boolean;
  id_verified: boolean;
  phone_verified: boolean;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export const useCredibility = (userId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: credibility, isLoading } = useQuery({
    queryKey: ['user-credibility', userId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const targetUserId = userId || user?.id;
      
      if (!targetUserId) return null;

      const { data, error } = await supabase
        .from('user_credibility')
        .select('*')
        .eq('user_id', targetUserId)
        .maybeSingle();
      
      if (error) throw error;
      
      // Create credibility record if it doesn't exist
      if (!data && !userId) {
        const { data: newCredibility, error: insertError } = await supabase
          .from('user_credibility')
          .insert({ user_id: targetUserId })
          .select()
          .single();
        
        if (insertError) throw insertError;
        return newCredibility as UserCredibility;
      }
      
      return data as UserCredibility | null;
    },
    enabled: !!userId || true,
  });

  const updateCredibilityScore = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.rpc('update_credibility_score', {
        user_id_param: userId
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-credibility'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const getCredibilityBadge = (score: number) => {
    if (score >= 90) return { label: 'Excellent', color: 'bg-green-500' };
    if (score >= 70) return { label: 'Good', color: 'bg-blue-500' };
    if (score >= 50) return { label: 'Average', color: 'bg-yellow-500' };
    if (score >= 30) return { label: 'Fair', color: 'bg-orange-500' };
    return { label: 'Poor', color: 'bg-red-500' };
  };

  return {
    credibility,
    isLoading,
    updateCredibilityScore: updateCredibilityScore.mutate,
    isUpdating: updateCredibilityScore.isPending,
    getCredibilityBadge,
  };
};
