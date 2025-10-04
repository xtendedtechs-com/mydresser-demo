import { WardrobeItem } from "@/hooks/useWardrobe";
import { supabase } from "@/integrations/supabase/client";

/**
 * Advanced Recommendation Engine with ML-based personalization
 * Implements collaborative filtering and preference learning
 */

export interface UserPreferences {
  favoriteColors: string[];
  favoriteBrands: string[];
  preferredStyles: string[];
  occasionHistory: { [occasion: string]: number };
  categoryPreferences: { [category: string]: number };
  wearFrequency: { [itemId: string]: number };
  lastWorn: { [itemId: string]: Date };
}

export interface RecommendationScore {
  itemId: string;
  score: number;
  reasons: string[];
  confidence: number;
}

export interface CollaborativeFiltering {
  similarUsers: string[];
  sharedPreferences: string[];
  recommendedItems: string[];
}

export class RecommendationEngine {
  /**
   * Learns user preferences from wardrobe and interaction history
   */
  static async learnUserPreferences(userId: string): Promise<UserPreferences> {
    try {
      // Fetch user's wardrobe items
      const { data: wardrobeItems } = await supabase
        .from('wardrobe_items')
        .select('*')
        .eq('user_id', userId);

      // Fetch user's collections (instead of saved_outfits)
      const { data: collections } = await supabase
        .from('collections')
        .select('*')
        .eq('user_id', userId)
        .eq('type', 'outfit')
        .order('created_at', { ascending: false })
        .limit(100);

      // Fetch user's AI service settings for style preferences
      const { data: aiSettings } = await supabase
        .from('ai_service_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      const preferences: UserPreferences = {
        favoriteColors: [],
        favoriteBrands: [],
        preferredStyles: [],
        occasionHistory: {},
        categoryPreferences: {},
        wearFrequency: {},
        lastWorn: {}
      };

      // Learn from wardrobe
      if (wardrobeItems) {
        const colorFreq: { [key: string]: number } = {};
        const brandFreq: { [key: string]: number } = {};
        const categoryFreq: { [key: string]: number } = {};

        wardrobeItems.forEach(item => {
          // Color preferences
          if (item.color) {
            colorFreq[item.color] = (colorFreq[item.color] || 0) + 1;
            if (item.is_favorite) colorFreq[item.color] += 3;
          }

          // Brand preferences
          if (item.brand) {
            brandFreq[item.brand] = (brandFreq[item.brand] || 0) + 1;
            if (item.is_favorite) brandFreq[item.brand] += 3;
          }

          // Category preferences
          if (item.category) {
            categoryFreq[item.category] = (categoryFreq[item.category] || 0) + 1;
          }

          // Wear frequency
          preferences.wearFrequency[item.id] = item.wear_count || 0;
          
          // Last worn
          if (item.last_worn) {
            preferences.lastWorn[item.id] = new Date(item.last_worn);
          }
        });

        // Extract top preferences
        preferences.favoriteColors = Object.entries(colorFreq)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([color]) => color);

        preferences.favoriteBrands = Object.entries(brandFreq)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([brand]) => brand);

        preferences.categoryPreferences = categoryFreq;
      }

      // Learn from collections
      if (collections) {
        const occasionFreq: { [key: string]: number } = {};

        collections.forEach(collection => {
          // Collections don't have occasion field, so we skip this for now
        });

        preferences.occasionHistory = occasionFreq;
      }

      // Incorporate AI settings style preferences
      if (aiSettings?.style_preferences) {
        const stylePrefsObj = aiSettings.style_preferences as any;
        if (stylePrefsObj.preferred_styles) {
          preferences.preferredStyles = stylePrefsObj.preferred_styles;
        }
        if (stylePrefsObj.favorite_colors) {
          preferences.favoriteColors = [...preferences.favoriteColors, ...stylePrefsObj.favorite_colors].slice(0, 5);
        }
      }

      return preferences;
    } catch (error) {
      console.error('Error learning user preferences:', error);
      return {
        favoriteColors: [],
        favoriteBrands: [],
        preferredStyles: [],
        occasionHistory: {},
        categoryPreferences: {},
        wearFrequency: {},
        lastWorn: {}
      };
    }
  }

  /**
   * Collaborative filtering: Find similar users and their preferences
   */
  static async findSimilarUsers(userId: string): Promise<CollaborativeFiltering> {
    try {
      const userPrefs = await this.learnUserPreferences(userId);
      
      // Fetch all users' basic AI settings for comparison
      const { data: allUsers } = await supabase
        .from('ai_service_settings')
        .select('user_id, style_preferences, color_preferences, brand_preferences')
        .neq('user_id', userId)
        .limit(100);

      if (!allUsers) {
        return { similarUsers: [], sharedPreferences: [], recommendedItems: [] };
      }

      // Calculate similarity scores
      const similarityScores = allUsers.map(otherUser => {
        let score = 0;
        const sharedPrefs: string[] = [];

        // Compare styles from style_preferences jsonb
        const otherStylePrefs = (otherUser.style_preferences as any)?.preferred_styles || [];
        const sharedStyles = userPrefs.preferredStyles.filter(s => 
          otherStylePrefs.includes(s)
        );
        score += sharedStyles.length * 3;
        sharedPrefs.push(...sharedStyles);

        // Compare colors from color_preferences array
        const otherColors = otherUser.color_preferences || [];
        const sharedColors = userPrefs.favoriteColors.filter(c => 
          otherColors.includes(c)
        );
        score += sharedColors.length * 2;
        sharedPrefs.push(...sharedColors);

        return {
          userId: otherUser.user_id,
          score,
          sharedPreferences: sharedPrefs
        };
      });

      // Get top similar users
      const topSimilar = similarityScores
        .filter(s => s.score > 3)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

      // Fetch items these similar users love
      const similarUserIds = topSimilar.map(u => u.userId);
      const { data: popularItems } = await supabase
        .from('wardrobe_items')
        .select('id, category, brand, color')
        .in('user_id', similarUserIds)
        .eq('is_favorite', true)
        .limit(50);

      return {
        similarUsers: similarUserIds,
        sharedPreferences: topSimilar[0]?.sharedPreferences || [],
        recommendedItems: popularItems?.map(i => i.id) || []
      };
    } catch (error) {
      console.error('Error finding similar users:', error);
      return { similarUsers: [], sharedPreferences: [], recommendedItems: [] };
    }
  }

  /**
   * Generate personalized recommendations for items to add to wardrobe
   */
  static async generateItemRecommendations(
    userId: string,
    wardrobeItems: WardrobeItem[]
  ): Promise<RecommendationScore[]> {
    const preferences = await this.learnUserPreferences(userId);
    const collaborative = await this.findSimilarUsers(userId);

    // Fetch merchant items
    const { data: merchantItems } = await supabase
      .from('merchant_items')
      .select('*')
      .eq('status', 'active')
      .limit(100);

    if (!merchantItems) return [];

    // Score each item
    const scores: RecommendationScore[] = merchantItems.map(item => {
      let score = 0;
      const reasons: string[] = [];

      // Match favorite colors
      if (item.color && preferences.favoriteColors.includes(item.color)) {
        score += 15;
        reasons.push(`Matches your favorite color: ${item.color}`);
      }

      // Match favorite brands
      if (item.brand && preferences.favoriteBrands.includes(item.brand)) {
        score += 20;
        reasons.push(`From your favorite brand: ${item.brand}`);
      }

      // Match style preferences
      const itemStyles = item.style_tags || [];
      const matchingStyles = preferences.preferredStyles.filter(s => 
        itemStyles.includes(s)
      );
      if (matchingStyles.length > 0) {
        score += matchingStyles.length * 10;
        reasons.push(`Matches your style: ${matchingStyles.join(', ')}`);
      }

      // Category gap analysis
      const categoryCount = preferences.categoryPreferences[item.category] || 0;
      if (categoryCount < 5) {
        score += 10;
        reasons.push(`Expands your ${item.category} collection`);
      }

      // Collaborative filtering boost
      if (collaborative.recommendedItems.includes(item.id)) {
        score += 15;
        reasons.push('Popular with users with similar taste');
      }

      // Seasonal relevance
      const currentMonth = new Date().getMonth();
      const season = item.season?.toLowerCase();
      if (
        (season === 'winter' && [11, 0, 1].includes(currentMonth)) ||
        (season === 'spring' && [2, 3, 4].includes(currentMonth)) ||
        (season === 'summer' && [5, 6, 7].includes(currentMonth)) ||
        (season === 'fall' && [8, 9, 10].includes(currentMonth))
      ) {
        score += 10;
        reasons.push('Perfect for the current season');
      }

      // Calculate confidence based on number of matching factors
      const confidence = Math.min((reasons.length / 4) * 100, 100);

      return {
        itemId: item.id,
        score,
        reasons,
        confidence
      };
    });

    // Return top recommendations
    return scores
      .filter(s => s.score > 15)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);
  }

  /**
   * Generate smart outfit combinations based on learned preferences
   */
  static async generatePersonalizedOutfits(
    userId: string,
    wardrobeItems: WardrobeItem[],
    occasion?: string
  ): Promise<any[]> {
    const preferences = await this.learnUserPreferences(userId);

    // Filter items based on preferences - only include available items
    let availableItems = wardrobeItems.filter(item => 
      !(item as any).in_laundry
    );

    // Prioritize favorite items
    const favoriteItems = availableItems.filter(i => i.is_favorite);
    const regularItems = availableItems.filter(i => !i.is_favorite);

    // Consider wear frequency - suggest underutilized items
    const underutilized = regularItems
      .filter(i => (preferences.wearFrequency[i.id] || 0) < 3)
      .sort((a, b) => (preferences.wearFrequency[a.id] || 0) - (preferences.wearFrequency[b.id] || 0));

    // Generate outfit combinations
    const outfits: any[] = [];

    // Strategy 1: Favorite-based outfits (high confidence)
    if (favoriteItems.length >= 3) {
      const tops = favoriteItems.filter(i => ['top', 'shirt', 'blouse'].includes(i.category));
      const bottoms = favoriteItems.filter(i => ['bottom', 'pants', 'skirt'].includes(i.category));
      const shoes = favoriteItems.filter(i => i.category === 'shoes');

      if (tops.length && bottoms.length && shoes.length) {
        outfits.push({
          name: 'Your Favorites',
          items: [tops[0], bottoms[0], shoes[0]],
          confidence: 95,
          reasoning: 'A combination of your favorite items',
          strategy: 'favorites'
        });
      }
    }

    // Strategy 2: Rediscover underutilized items
    if (underutilized.length >= 3) {
      const tops = underutilized.filter(i => ['top', 'shirt', 'blouse'].includes(i.category));
      const bottoms = underutilized.filter(i => ['bottom', 'pants', 'skirt'].includes(i.category));
      const shoes = regularItems.filter(i => i.category === 'shoes');

      if (tops.length && bottoms.length && shoes.length) {
        outfits.push({
          name: 'Rediscover Your Wardrobe',
          items: [tops[0], bottoms[0], shoes[0]],
          confidence: 75,
          reasoning: 'Great pieces you haven\'t worn recently',
          strategy: 'rediscover'
        });
      }
    }

    // Strategy 3: Color-coordinated based on preferences
    if (preferences.favoriteColors.length > 0) {
      const favoriteColor = preferences.favoriteColors[0];
      const colorMatched = availableItems.filter(i => 
        i.color?.toLowerCase().includes(favoriteColor.toLowerCase())
      );

      if (colorMatched.length >= 3) {
        const tops = colorMatched.filter(i => ['top', 'shirt', 'blouse'].includes(i.category));
        const bottoms = colorMatched.filter(i => ['bottom', 'pants', 'skirt'].includes(i.category));
        const shoes = availableItems.filter(i => i.category === 'shoes');

        if (tops.length && bottoms.length && shoes.length) {
          outfits.push({
            name: `Your ${favoriteColor} Collection`,
            items: [tops[0], bottoms[0], shoes[0]],
            confidence: 85,
            reasoning: `Built around your favorite color: ${favoriteColor}`,
            strategy: 'color-match'
          });
        }
      }
    }

    return outfits.slice(0, 5);
  }
}
