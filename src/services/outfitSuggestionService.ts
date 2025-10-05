import { supabase } from '@/integrations/supabase/client';

export interface OutfitSuggestionRequest {
  userId: string;
  occasion: string;
  weather?: {
    temperature: number;
    condition: string;
    location: string;
  };
  timeSlot: 'morning' | 'afternoon' | 'evening' | 'night';
  preferences?: {
    colors?: string[];
    styles?: string[];
    avoidColors?: string[];
  };
}

export interface OutfitSuggestion {
  id: string;
  items: any[];
  confidenceScore: number;
  reasoning: string;
  weatherData?: any;
  occasion: string;
  date: string;
  timeSlot: string;
}

class OutfitSuggestionService {
  private static instance: OutfitSuggestionService;

  static getInstance(): OutfitSuggestionService {
    if (!OutfitSuggestionService.instance) {
      OutfitSuggestionService.instance = new OutfitSuggestionService();
    }
    return OutfitSuggestionService.instance;
  }

  async generateDailyOutfit(request: OutfitSuggestionRequest): Promise<OutfitSuggestion> {
    try {
      // Call edge function to generate outfit suggestion
      const { data, error } = await supabase.functions.invoke('generate-outfit', {
        body: request
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error generating outfit:', error);
      throw error;
    }
  }

  async getTodaySuggestions(timeSlot: string): Promise<any[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('daily_outfit_suggestions')
        .select(`
          *,
          outfit:outfit_id (
            id,
            name,
            description,
            photos,
            style_tags,
            occasion,
            season
          )
        `)
        .eq('user_id', user.id)
        .eq('suggestion_date', today)
        .eq('time_slot', timeSlot)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching today suggestions:', error);
      throw error;
    }
  }

  async acceptSuggestion(suggestionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('daily_outfit_suggestions')
        .update({
          is_accepted: true,
          is_rejected: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', suggestionId);

      if (error) throw error;

      // Log outfit worn
      const { data: suggestion } = await supabase
        .from('daily_outfit_suggestions')
        .select('outfit_id')
        .eq('id', suggestionId)
        .single();

      if (suggestion?.outfit_id) {
        const { data: outfitItems } = await supabase
          .from('outfit_items')
          .select('wardrobe_item_id')
          .eq('outfit_id', suggestion.outfit_id);

        if (outfitItems && outfitItems.length > 0) {
          await supabase.from('outfit_history').insert({
            user_id: (await supabase.auth.getUser()).data.user?.id || '',
            outfit_items: outfitItems.map(item => item.wardrobe_item_id),
            worn_date: new Date().toISOString().split('T')[0],
            occasion: 'daily'
          });
        }
      }
    } catch (error) {
      console.error('Error accepting suggestion:', error);
      throw error;
    }
  }

  async rejectSuggestion(suggestionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('daily_outfit_suggestions')
        .update({
          is_rejected: true,
          is_accepted: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', suggestionId);

      if (error) throw error;
    } catch (error) {
      console.error('Error rejecting suggestion:', error);
      throw error;
    }
  }

  async generateNewSuggestion(
    occasion: string,
    timeSlot: string,
    weatherData?: any
  ): Promise<OutfitSuggestion> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get user preferences
      const { data: aiSettings } = await supabase
        .from('ai_service_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      const stylePrefs = aiSettings?.style_preferences 
        ? (typeof aiSettings.style_preferences === 'string' 
            ? JSON.parse(aiSettings.style_preferences) 
            : aiSettings.style_preferences)
        : {};

      const request: OutfitSuggestionRequest = {
        userId: user.id,
        occasion,
        timeSlot: timeSlot as any,
        weather: weatherData,
        preferences: {
          colors: aiSettings?.color_preferences || [],
          styles: (stylePrefs as any)?.preferred_styles || []
        }
      };

      return await this.generateDailyOutfit(request);
    } catch (error) {
      console.error('Error generating new suggestion:', error);
      throw error;
    }
  }

  async getWeatherForLocation(location?: string): Promise<any> {
    try {
      // Mock weather data - in production, integrate with weather API
      return {
        temperature: 22,
        condition: 'sunny',
        location: location || 'Current Location',
        humidity: 65,
        windSpeed: 10
      };
    } catch (error) {
      console.error('Error fetching weather:', error);
      return null;
    }
  }
}

export const outfitSuggestionService = OutfitSuggestionService.getInstance();
