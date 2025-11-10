import { useState } from 'react';

export interface StylePreference {
  preferred_colors: string[];
  preferred_categories: string[];
  preferred_styles: string[];
  disliked_combinations: string[][];
  favorite_outfits: string[];
  body_shape_preference: string;
  occasion_frequency: Record<string, number>;
}

export interface OutfitRating {
  outfitId: string;
  rating: number;
  feedback: string;
  worn: boolean;
  timestamp: number;
}

export const useStyleLearning = () => {
  const [preferences, setPreferences] = useState<StylePreference>({
    preferred_colors: [],
    preferred_categories: [],
    preferred_styles: [],
    disliked_combinations: [],
    favorite_outfits: [],
    body_shape_preference: '',
    occasion_frequency: {}
  });
  
  const [ratings, setRatings] = useState<OutfitRating[]>(() => {
    const stored = localStorage.getItem('outfit_ratings');
    return stored ? JSON.parse(stored) : [];
  });
  
  const [loading, setLoading] = useState(false);

  const updatePreferences = async (updates: Partial<StylePreference>) => {
    const updated = { ...preferences, ...updates };
    setPreferences(updated);
    localStorage.setItem('style_preferences', JSON.stringify(updated));
  };

  const rateOutfit = async (
    outfitId: string,
    rating: number,
    feedback: string = '',
    worn: boolean = false
  ) => {
    const newRating: OutfitRating = {
      outfitId,
      rating,
      feedback,
      worn,
      timestamp: Date.now()
    };
    
    const updated = [newRating, ...ratings];
    setRatings(updated);
    localStorage.setItem('outfit_ratings', JSON.stringify(updated));
    
    // Learn from rating
    if (rating >= 4) {
      await updatePreferences({
        favorite_outfits: [...preferences.favorite_outfits, outfitId]
      });
    }
    
    return newRating;
  };

  const getPersonalizedRecommendations = () => {
    return {
      preferredColors: preferences.preferred_colors,
      preferredStyles: preferences.preferred_styles,
      avoidCombinations: preferences.disliked_combinations,
      topRatedOutfits: ratings.filter(r => r.rating >= 4).map(r => r.outfitId)
    };
  };

  return {
    preferences,
    ratings,
    loading,
    updatePreferences,
    rateOutfit,
    getPersonalizedRecommendations
  };
};
