import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MerchantEvent {
  id: string;
  merchant_id: string;
  name: string;
  description?: string;
  event_type: 'sale' | 'launch' | 'workshop' | 'fashion_show' | 'popup' | 'other';
  start_date: string;
  end_date: string;
  location?: string;
  is_online: boolean;
  banner_image?: string;
  registration_link?: string;
  max_attendees?: number;
  current_attendees: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useEvents = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: events, isLoading } = useQuery({
    queryKey: ['merchant-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('merchant_events')
        .select('*')
        .order('start_date', { ascending: false });
      
      if (error) throw error;
      return data as MerchantEvent[];
    },
  });

  const createEvent = useMutation({
    mutationFn: async (event: Omit<MerchantEvent, 'id' | 'merchant_id' | 'current_attendees' | 'created_at' | 'updated_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('merchant_events')
        .insert({
          ...event,
          merchant_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant-events'] });
      toast({
        title: 'Event Created',
        description: 'Your event has been created successfully',
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

  const updateEvent = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MerchantEvent> & { id: string }) => {
      const { data, error } = await supabase
        .from('merchant_events')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant-events'] });
      toast({
        title: 'Event Updated',
        description: 'Your event has been updated successfully',
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

  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('merchant_events')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant-events'] });
      toast({
        title: 'Event Deleted',
        description: 'Your event has been deleted successfully',
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
    events,
    isLoading,
    createEvent: createEvent.mutate,
    updateEvent: updateEvent.mutate,
    deleteEvent: deleteEvent.mutate,
    isCreating: createEvent.isPending,
    isUpdating: updateEvent.isPending,
    isDeleting: deleteEvent.isPending,
  };
};