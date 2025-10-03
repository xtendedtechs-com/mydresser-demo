import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface StoreLocation {
  id: string;
  merchant_id: string;
  location_name: string;
  address: any;
  phone: string | null;
  email: string | null;
  manager_name: string | null;
  manager_contact: string | null;
  is_primary: boolean;
  is_active: boolean;
  operating_hours: any;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export const useStoreLocations = () => {
  const [locations, setLocations] = useState<StoreLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchLocations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('store_locations')
        .select('*')
        .eq('merchant_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLocations(data || []);
    } catch (error: any) {
      toast({
        title: 'Error fetching locations',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addLocation = async (locationData: Partial<StoreLocation>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('store_locations')
        .insert({
          merchant_id: user.id,
          ...locationData,
        } as any)
        .select()
        .single();

      if (error) throw error;

      setLocations([data as StoreLocation, ...locations]);
      toast({
        title: 'Location added',
        description: 'Store location has been added successfully',
      });
      return data;
    } catch (error: any) {
      toast({
        title: 'Error adding location',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateLocation = async (id: string, updates: Partial<StoreLocation>) => {
    try {
      const { data, error } = await supabase
        .from('store_locations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setLocations(locations.map(loc => loc.id === id ? data : loc));
      toast({
        title: 'Location updated',
        description: 'Store location has been updated successfully',
      });
      return data;
    } catch (error: any) {
      toast({
        title: 'Error updating location',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteLocation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('store_locations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setLocations(locations.filter(loc => loc.id !== id));
      toast({
        title: 'Location deleted',
        description: 'Store location has been deleted successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error deleting location',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchLocations();

    const channel = supabase
      .channel('store_locations_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'store_locations',
        },
        () => {
          fetchLocations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    locations,
    loading,
    addLocation,
    updateLocation,
    deleteLocation,
    refetch: fetchLocations,
  };
};
