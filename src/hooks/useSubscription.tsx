import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { myDresserPayments, PaymentMethod } from '@/services/myDresserPayments';

export const useSubscription = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: currentSubscription, isLoading: isLoadingSubscription } = useQuery({
    queryKey: ['current-subscription'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      return await myDresserPayments.getCurrentSubscription(user.id);
    },
  });

  const { data: plans, isLoading: isLoadingPlans } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: () => myDresserPayments.getSubscriptionPlans(),
  });

  const subscribeToPlan = useMutation({
    mutationFn: async ({
      planId,
      paymentMethod,
    }: {
      planId: string;
      paymentMethod: PaymentMethod;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      return await myDresserPayments.createSubscription(
        user.id,
        planId,
        paymentMethod
      );
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['current-subscription'] });
        toast({
          title: 'Subscription Activated',
          description: 'Your subscription has been activated successfully',
        });
      } else {
        throw new Error(result.error);
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Subscription Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const cancelSubscription = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_subscriptions' as any)
        .update({
          status: 'cancelled',
        })
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-subscription'] });
      toast({
        title: 'Subscription Cancelled',
        description: 'Your subscription will be cancelled at the end of the billing period',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Cancellation Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const checkFeatureAccess = (featureName: string): boolean => {
    if (!currentSubscription) return false;
    const tier = (currentSubscription as any).tier || 'free';
    return true; // Simplified for now
  };

  return {
    currentSubscription,
    plans,
    isLoading: isLoadingSubscription || isLoadingPlans,
    subscribeToPlan: subscribeToPlan.mutate,
    isSubscribing: subscribeToPlan.isPending,
    cancelSubscription: cancelSubscription.mutate,
    isCancelling: cancelSubscription.isPending,
    checkFeatureAccess,
  };
};
