import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface StylePreferences {
  id?: string;
  user_id: string;
  favorite_colors: string[];
  favorite_brands: string[];
  style_keywords: string[];
  preferred_occasions: string[];
  body_type?: string;
  size_preferences?: any;
  budget_range?: any;
  sustainability_priority: number;
  created_at?: string;
  updated_at?: string;
}

export const useStylePreferences = () => {
  const [preferences, setPreferences] = useState<StylePreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('style_preferences')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setPreferences(data);
    } catch (error: any) {
      console.error('Error fetching style preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (updates: Partial<StylePreferences>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('style_preferences')
        .upsert({
          user_id: user.id,
          ...updates,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      setPreferences(data);
      toast({
        title: "Preferences updated",
        description: "Your style preferences have been saved.",
      });

      return data;
    } catch (error: any) {
      toast({
        title: "Error updating preferences",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    preferences,
    loading,
    updatePreferences,
    refetch: fetchPreferences
  };
};
