import { supabase } from '@/integrations/supabase/client';

export interface OutfitRecommendation {
  id: string;
  items: any[];
  score: number;
  reasoning: string;
  tags: string[];
  occasion?: string;
  weather?: string;
  season?: string;
}

export interface RecommendationContext {
  weather?: {
    temperature: number;
    condition: string;
    humidity?: number;
  };
  occasion?: string;
  season?: string;
  userPreferences?: {
    styles: string[];
    colors: string[];
    brands: string[];
  };
  recentOutfits?: string[];
}

class OutfitRecommendationEngine {
  private static instance: OutfitRecommendationEngine;

  static getInstance(): OutfitRecommendationEngine {
    if (!OutfitRecommendationEngine.instance) {
      OutfitRecommendationEngine.instance = new OutfitRecommendationEngine();
    }
    return OutfitRecommendationEngine.instance;
  }

  /**
   * Generate outfit recommendations based on context
   */
  async generateRecommendations(
    wardrobeItems: any[],
    context: RecommendationContext,
    limit: number = 5
  ): Promise<OutfitRecommendation[]> {
    // Filter items based on context
    const filteredItems = this.filterItemsByContext(wardrobeItems, context);
    
    // Generate potential outfit combinations
    const combinations = this.generateCombinations(filteredItems);
    
    // Score each combination
    const scoredOutfits = combinations.map(combo => ({
      id: this.generateOutfitId(combo),
      items: combo,
      score: this.scoreOutfit(combo, context),
      reasoning: this.generateReasoning(combo, context),
      tags: this.extractTags(combo),
      occasion: context.occasion,
      weather: context.weather?.condition,
      season: context.season,
    }));

    // Sort by score and return top recommendations
    return scoredOutfits
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Score an outfit based on multiple factors
   */
  private scoreOutfit(items: any[], context: RecommendationContext): number {
    let score = 0;
    const weights = {
      styleMatch: 0.25,
      colorHarmony: 0.20,
      weatherAppropriate: 0.20,
      occasionFit: 0.15,
      varietyBonus: 0.10,
      preferenceMatch: 0.10,
    };

    // Style matching score
    score += this.calculateStyleMatchScore(items) * weights.styleMatch;

    // Color harmony score
    score += this.calculateColorHarmonyScore(items) * weights.colorHarmony;

    // Weather appropriateness
    if (context.weather) {
      score += this.calculateWeatherScore(items, context.weather) * weights.weatherAppropriate;
    }

    // Occasion fit
    if (context.occasion) {
      score += this.calculateOccasionScore(items, context.occasion) * weights.occasionFit;
    }

    // Variety bonus (avoid recent outfits)
    if (context.recentOutfits) {
      score += this.calculateVarietyScore(items, context.recentOutfits) * weights.varietyBonus;
    }

    // User preference matching
    if (context.userPreferences) {
      score += this.calculatePreferenceScore(items, context.userPreferences) * weights.preferenceMatch;
    }

    return Math.min(100, Math.max(0, score * 100));
  }

  /**
   * Calculate style matching score
   */
  private calculateStyleMatchScore(items: any[]): number {
    const styles = items.map(item => item.style || item.category).filter(Boolean);
    if (styles.length === 0) return 0.5;

    // Check if items have compatible styles
    const styleGroups = this.getStyleCompatibilityGroups();
    const itemStyleGroup = styleGroups.find(group => 
      styles.some(style => group.includes(style.toLowerCase()))
    );

    // All items in same style group = high score
    const allInGroup = itemStyleGroup && styles.every(style => 
      itemStyleGroup.includes(style.toLowerCase())
    );

    return allInGroup ? 1.0 : 0.6;
  }

  /**
   * Calculate color harmony score
   */
  private calculateColorHarmonyScore(items: any[]): number {
    const colors = items.map(item => item.color || item.primary_color).filter(Boolean);
    if (colors.length === 0) return 0.5;

    const harmoniousGroups = [
      ['black', 'white', 'gray', 'grey'],
      ['blue', 'white', 'beige'],
      ['black', 'red', 'white'],
      ['navy', 'brown', 'cream'],
      ['green', 'brown', 'beige'],
    ];

    // Check if colors are harmonious
    const isHarmonious = harmoniousGroups.some(group =>
      colors.every(color => group.some(c => color.toLowerCase().includes(c)))
    );

    // Neutral colors always work well
    const neutrals = ['black', 'white', 'gray', 'grey', 'beige', 'cream', 'navy'];
    const neutralCount = colors.filter(color =>
      neutrals.some(n => color.toLowerCase().includes(n))
    ).length;

    if (isHarmonious) return 1.0;
    if (neutralCount >= colors.length * 0.7) return 0.9;
    return 0.5;
  }

  /**
   * Calculate weather appropriateness score
   */
  private calculateWeatherScore(items: any[], weather: RecommendationContext['weather']): number {
    if (!weather) return 0.5;

    const { temperature, condition } = weather;
    let score = 0.5;

    items.forEach(item => {
      const category = item.category?.toLowerCase() || '';
      
      // Temperature appropriateness
      if (temperature < 10) {
        if (['jacket', 'coat', 'sweater', 'hoodie'].some(w => category.includes(w))) {
          score += 0.2;
        }
      } else if (temperature > 25) {
        if (['t-shirt', 'shorts', 'dress', 'tank'].some(w => category.includes(w))) {
          score += 0.2;
        }
      }

      // Weather condition appropriateness
      if (condition === 'rainy' && category.includes('jacket')) score += 0.15;
      if (condition === 'sunny' && ['sunglasses', 'hat'].some(w => category.includes(w))) score += 0.1;
    });

    return Math.min(1.0, score);
  }

  /**
   * Calculate occasion fit score
   */
  private calculateOccasionScore(items: any[], occasion: string): number {
    const occasionKeywords: Record<string, string[]> = {
      formal: ['suit', 'dress', 'blazer', 'tie', 'heels'],
      casual: ['jeans', 't-shirt', 'sneakers', 'shorts'],
      business: ['blazer', 'trousers', 'shirt', 'dress shoes'],
      athletic: ['sportswear', 'sneakers', 'shorts', 'activewear'],
      party: ['dress', 'heels', 'accessories'],
    };

    const keywords = occasionKeywords[occasion.toLowerCase()] || [];
    if (keywords.length === 0) return 0.5;

    const matchCount = items.filter(item =>
      keywords.some(keyword => 
        item.category?.toLowerCase().includes(keyword) ||
        item.name?.toLowerCase().includes(keyword)
      )
    ).length;

    return matchCount / items.length;
  }

  /**
   * Calculate variety score (avoid repetition)
   */
  private calculateVarietyScore(items: any[], recentOutfits: string[]): number {
    // Simple implementation: reward outfits with items not used recently
    // In production, this would check against actual recent outfit history
    return 0.7;
  }

  /**
   * Calculate user preference matching score
   */
  private calculatePreferenceScore(items: any[], preferences: RecommendationContext['userPreferences']): number {
    if (!preferences) return 0.5;

    let score = 0;
    let checks = 0;

    // Style preferences
    if (preferences.styles && preferences.styles.length > 0) {
      checks++;
      const styleMatch = items.some(item =>
        preferences.styles.some(style =>
          item.style?.toLowerCase().includes(style.toLowerCase())
        )
      );
      if (styleMatch) score += 0.33;
    }

    // Color preferences
    if (preferences.colors && preferences.colors.length > 0) {
      checks++;
      const colorMatch = items.some(item =>
        preferences.colors.some(color =>
          item.color?.toLowerCase().includes(color.toLowerCase())
        )
      );
      if (colorMatch) score += 0.33;
    }

    // Brand preferences
    if (preferences.brands && preferences.brands.length > 0) {
      checks++;
      const brandMatch = items.some(item =>
        preferences.brands.some(brand =>
          item.brand?.toLowerCase().includes(brand.toLowerCase())
        )
      );
      if (brandMatch) score += 0.34;
    }

    return checks > 0 ? score : 0.5;
  }

  /**
   * Filter wardrobe items by context
   */
  private filterItemsByContext(items: any[], context: RecommendationContext): any[] {
    let filtered = [...items];

    // Filter by season
    if (context.season) {
      filtered = filtered.filter(item => {
        const itemSeason = item.season?.toLowerCase();
        return !itemSeason || itemSeason === 'all' || itemSeason === context.season?.toLowerCase();
      });
    }

    // Filter by weather (basic)
    if (context.weather) {
      const { temperature } = context.weather;
      filtered = filtered.filter(item => {
        const category = item.category?.toLowerCase() || '';
        // In extreme weather, filter inappropriate items
        if (temperature < 5 && ['shorts', 'sandals', 'tank'].some(w => category.includes(w))) {
          return false;
        }
        if (temperature > 30 && ['coat', 'heavy jacket'].some(w => category.includes(w))) {
          return false;
        }
        return true;
      });
    }

    return filtered;
  }

  /**
   * Generate outfit combinations
   */
  private generateCombinations(items: any[]): any[][] {
    // Group items by category
    const byCategory: Record<string, any[]> = {};
    items.forEach(item => {
      const category = item.category || 'other';
      if (!byCategory[category]) byCategory[category] = [];
      byCategory[category].push(item);
    });

    // Define basic outfit templates
    const templates = [
      ['tops', 'bottoms', 'shoes'],
      ['dresses', 'shoes', 'accessories'],
      ['tops', 'bottoms', 'outerwear', 'shoes'],
      ['tops', 'jeans', 'shoes'],
    ];

    const combinations: any[][] = [];

    // Generate combinations based on templates
    templates.forEach(template => {
      const combo = this.buildCombination(template, byCategory);
      if (combo.length >= 2) {
        combinations.push(combo);
      }
    });

    // Limit to prevent performance issues
    return combinations.slice(0, 50);
  }

  /**
   * Build a combination from a template
   */
  private buildCombination(template: string[], byCategory: Record<string, any[]>): any[] {
    const combination: any[] = [];

    template.forEach(category => {
      const items = byCategory[category];
      if (items && items.length > 0) {
        // Pick a random item from category
        const randomItem = items[Math.floor(Math.random() * items.length)];
        combination.push(randomItem);
      }
    });

    return combination;
  }

  /**
   * Generate reasoning for recommendation
   */
  private generateReasoning(items: any[], context: RecommendationContext): string {
    const reasons: string[] = [];

    if (context.weather) {
      reasons.push(`Perfect for ${context.weather.temperature}°C ${context.weather.condition} weather`);
    }

    if (context.occasion) {
      reasons.push(`Ideal for ${context.occasion} occasions`);
    }

    const styles = [...new Set(items.map(i => i.style).filter(Boolean))];
    if (styles.length > 0) {
      reasons.push(`${styles.join(' and ')} style`);
    }

    return reasons.join('. ') || 'Well-balanced outfit combination';
  }

  /**
   * Extract tags from outfit
   */
  private extractTags(items: any[]): string[] {
    const tags = new Set<string>();
    
    items.forEach(item => {
      if (item.style) tags.add(item.style.toLowerCase());
      if (item.color) tags.add(item.color.toLowerCase());
      if (item.category) tags.add(item.category.toLowerCase());
    });

    return Array.from(tags).slice(0, 5);
  }

  /**
   * Generate unique outfit ID
   */
  private generateOutfitId(items: any[]): string {
    const ids = items.map(i => i.id).sort().join('-');
    return `outfit-${ids}`;
  }

  /**
   * Get style compatibility groups
   */
  private getStyleCompatibilityGroups(): string[][] {
    return [
      ['casual', 'streetwear', 'sporty'],
      ['formal', 'business', 'professional'],
      ['elegant', 'chic', 'sophisticated'],
      ['bohemian', 'vintage', 'retro'],
      ['minimalist', 'modern', 'contemporary'],
    ];
  }
}

export const outfitRecommendationEngine = OutfitRecommendationEngine.getInstance();
