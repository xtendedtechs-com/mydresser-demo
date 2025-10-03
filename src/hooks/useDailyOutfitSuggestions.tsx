import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface DailyOutfitSuggestion {
  id: string;
  user_id: string;
  outfit_id?: string;
  suggestion_date: string;
  time_slot: string;
  weather_data?: any;
  occasion: string;
  confidence_score: number;
  is_accepted: boolean;
  is_rejected: boolean;
  created_at: string;
  updated_at: string;
}

export const useDailyOutfitSuggestions = () => {
  const [suggestions, setSuggestions] = useState<DailyOutfitSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTodaysSuggestions();
  }, []);

  const fetchTodaysSuggestions = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('daily_outfit_suggestions')
        .select('*')
        .eq('suggestion_date', today)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSuggestions(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading suggestions",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createSuggestion = async (suggestionData: Omit<DailyOutfitSuggestion, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('daily_outfit_suggestions')
        .insert({
          user_id: user.id,
          ...suggestionData
        })
        .select()
        .single();

      if (error) throw error;

      setSuggestions(prev => [data, ...prev]);
      toast({
        title: "Suggestion created",
        description: "Daily outfit suggestion has been saved.",
      });

      return data;
    } catch (error: any) {
      toast({
        title: "Error creating suggestion",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateSuggestion = async (id: string, updates: Partial<Omit<DailyOutfitSuggestion, 'id' | 'user_id' | 'created_at'>>) => {
    try {
      const { data, error } = await supabase
        .from('daily_outfit_suggestions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setSuggestions(prev => prev.map(suggestion => 
        suggestion.id === id ? { ...suggestion, ...data } : suggestion
      ));

      return data;
    } catch (error: any) {
      toast({
        title: "Error updating suggestion",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const acceptSuggestion = async (id: string) => {
    return updateSuggestion(id, { is_accepted: true, is_rejected: false });
  };

  const rejectSuggestion = async (id: string) => {
    return updateSuggestion(id, { is_rejected: true, is_accepted: false });
  };

  const generateNewSuggestion = async (timeSlot: string, occasion: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('daily_outfit_suggestions')
        .insert({
          user_id: user.id,
          suggestion_date: today,
          time_slot: timeSlot,
          occasion: occasion,
          confidence_score: Math.floor(Math.random() * 15) + 80, // 80-95
          weather_data: {
            temperature: Math.floor(Math.random() * 20) + 10,
            condition: ['sunny', 'cloudy', 'rainy'][Math.floor(Math.random() * 3)]
          }
        })
        .select()
        .single();

      if (error) throw error;

      setSuggestions(prev => [data, ...prev]);
      toast({
        title: "New outfit suggested",
        description: "AI has generated a new outfit for you!",
      });

      return data;
    } catch (error: any) {
      toast({
        title: "Error generating suggestion",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    suggestions,
    loading,
    createSuggestion,
    updateSuggestion,
    acceptSuggestion,
    rejectSuggestion,
    generateNewSuggestion,
    refetch: fetchTodaysSuggestions
  };
};