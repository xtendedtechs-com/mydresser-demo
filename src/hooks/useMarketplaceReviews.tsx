import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MarketplaceReview {
  id: string;
  transaction_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  review_text?: string;
  review_type: 'seller' | 'buyer';
  helpful_count: number;
  is_verified_purchase: boolean;
  seller_response?: string;
  seller_response_date?: string;
  created_at: string;
  updated_at: string;
}

export const useMarketplaceReviews = (revieweeId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['marketplace-reviews', revieweeId],
    queryFn: async () => {
      let query = supabase
        .from('marketplace_reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (revieweeId) {
        query = query.eq('reviewee_id', revieweeId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as MarketplaceReview[];
    },
  });

  const createReview = useMutation({
    mutationFn: async (review: {
      transaction_id: string;
      reviewee_id: string;
      rating: number;
      review_text?: string;
      review_type: 'seller' | 'buyer';
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('marketplace_reviews')
        .insert({
          ...review,
          reviewer_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Update credibility scores
      await supabase.rpc('update_credibility_score', {
        user_id_param: review.reviewee_id
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['user-credibility'] });
      toast({
        title: 'Review Submitted',
        description: 'Thank you for your feedback',
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

  const respondToReview = useMutation({
    mutationFn: async ({ reviewId, response }: { reviewId: string; response: string }) => {
      const { data, error } = await supabase
        .from('marketplace_reviews')
        .update({
          seller_response: response,
          seller_response_date: new Date().toISOString(),
        })
        .eq('id', reviewId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-reviews'] });
      toast({
        title: 'Response Added',
        description: 'Your response has been posted',
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
    reviews,
    isLoading,
    createReview: createReview.mutate,
    respondToReview: respondToReview.mutate,
    isCreating: createReview.isPending,
    isResponding: respondToReview.isPending,
  };
};
