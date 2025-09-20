import { aiCategorization } from './aiCategorization';
import { weatherService } from './weatherService';

interface OutfitRequest {
  wardrobeItems: any[];
  weather?: any;
  occasion?: string;
  preferences?: any;
  constraints?: OutfitConstraints;
}

interface OutfitConstraints {
  favoriteItems?: string[]; // Item IDs that should be prioritized
  excludeItems?: string[]; // Item IDs to exclude
  colorPreference?: string;
  stylePreference?: string;
  comfortLevel?: number; // 1-10
  formalityLevel?: number; // 1-10
}

interface EnhancedOutfit {
  id: string;
  items: any[];
  mainColor: string;
  style: string;
  confidence: number;
  reasoning: string;
  weatherAppropriate: boolean;
  comfortScore: number;
  styleScore: number;
  versatilityScore: number;
  tags: string[];
  alternatives?: {
    item: any;
    alternatives: any[];
  }[];
}

export class EnhancedOutfitEngine {
  private weatherScoring = {
    hot: { // 25°C+
      preferred: ['light', 'breathable', 'cotton', 'linen'],
      avoid: ['wool', 'heavy', 'thick'],
      categories: ['tops', 'bottoms', 'shoes']
    },
    warm: { // 20-25°C
      preferred: ['cotton', 'light'],
      neutral: ['medium'],
      categories: ['tops', 'bottoms', 'shoes']
    },
    mild: { // 15-20°C
      preferred: ['cotton', 'light', 'medium'],
      neutral: ['wool'],
      categories: ['tops', 'bottoms', 'shoes', 'outerwear']
    },
    cool: { // 10-15°C
      preferred: ['wool', 'medium', 'warm'],
      neutral: ['cotton'],
      categories: ['tops', 'bottoms', 'outerwear', 'shoes']
    },
    cold: { // Below 10°C
      preferred: ['wool', 'warm', 'thick', 'heavy'],
      avoid: ['light', 'breathable'],
      categories: ['tops', 'bottoms', 'outerwear', 'shoes', 'accessories']
    }
  };

  /**
   * Generate intelligent outfit suggestions with enhanced AI analysis
   */
  async generateOutfit(request: OutfitRequest): Promise<EnhancedOutfit> {
    const { wardrobeItems, weather, occasion = 'casual', preferences = {}, constraints = {} } = request;

    // Pre-filter items based on constraints
    const availableItems = this.filterItemsByConstraints(wardrobeItems, constraints);
    
    if (availableItems.length < 2) {
      throw new Error('Not enough wardrobe items available for outfit generation');
    }

    // Analyze items and group by category
    const categorizedItems = this.categorizeItems(availableItems);
    
    // Score items based on multiple factors
    const scoredItems = this.scoreItems(categorizedItems, weather, occasion, preferences, constraints);
    
    // Generate outfit combinations
    const outfitCombinations = this.generateCombinations(scoredItems, weather, occasion);
    
    // Select best combination
    const bestOutfit = this.selectBestOutfit(outfitCombinations, preferences, constraints);
    
    // Enhance outfit with detailed analysis
    return this.enhanceOutfit(bestOutfit, weather, occasion, preferences);
  }

  private filterItemsByConstraints(items: any[], constraints: OutfitConstraints): any[] {
    return items.filter(item => {
      if (constraints.excludeItems?.includes(item.id)) return false;
      if (constraints.colorPreference && constraints.colorPreference !== 'any') {
        if (item.color !== constraints.colorPreference) return false;
      }
      return true;
    });
  }

  private categorizeItems(items: any[]): Record<string, any[]> {
    return items.reduce((acc, item) => {
      const category = item.category || 'tops';
      if (!acc[category]) acc[category] = [];
      acc[category].push(item);
      return acc;
    }, {} as Record<string, any[]>);
  }

  private scoreItems(
    categorizedItems: Record<string, any[]>, 
    weather: any, 
    occasion: string, 
    preferences: any,
    constraints: OutfitConstraints
  ): Record<string, any[]> {
    const scoredCategories: Record<string, any[]> = {};

    for (const [category, items] of Object.entries(categorizedItems)) {
      scoredCategories[category] = items.map(item => ({
        ...item,
        scores: {
          weather: this.calculateWeatherScore(item, weather),
          occasion: this.calculateOccasionScore(item, occasion),
          favorite: constraints.favoriteItems?.includes(item.id) ? 20 : 0,
          condition: this.calculateConditionScore(item),
          versatility: this.calculateVersatilityScore(item),
          comfort: this.calculateComfortScore(item, constraints.comfortLevel),
          formality: this.calculateFormalityScore(item, constraints.formalityLevel),
          freshness: this.calculateFreshnessScore(item),
          overall: 0
        }
      }));

      // Calculate overall scores
      scoredCategories[category].forEach(item => {
        const scores = item.scores;
        scores.overall = Math.round(
          (scores.weather * 0.25) +
          (scores.occasion * 0.2) +
          (scores.favorite * 0.15) +
          (scores.condition * 0.1) +
          (scores.versatility * 0.1) +
          (scores.comfort * 0.1) +
          (scores.formality * 0.05) +
          (scores.freshness * 0.05)
        );
      });

      // Sort by overall score
      scoredCategories[category].sort((a, b) => b.scores.overall - a.scores.overall);
    }

    return scoredCategories;
  }

  private calculateWeatherScore(item: any, weather: any): number {
    if (!weather) return 80; // Neutral score if no weather data

    const temp = weather.temperature || 20;
    const condition = this.getWeatherCondition(temp);
    const weatherRules = this.weatherScoring[condition];

    let score = 60; // Base score

    // Check material preferences
    const material = (item.material || '').toLowerCase();
    const tags = (item.tags || []).map((tag: string) => tag.toLowerCase());
    const allAttributes = [material, ...tags];

    if (weatherRules.preferred?.some(pref => allAttributes.includes(pref))) {
      score += 30;
    }
    if (weatherRules.avoid?.some(avoid => allAttributes.includes(avoid))) {
      score -= 20;
    }

    // Season matching
    if (item.season === 'all-season') score += 10;
    else if (this.matchesSeason(item.season, temp)) score += 20;
    else score -= 10;

    return Math.max(0, Math.min(100, score));
  }

  private calculateOccasionScore(item: any, occasion: string): number {
    const itemOccasion = item.occasion || 'casual';
    
    if (itemOccasion === occasion) return 100;
    
    // Occasion compatibility matrix
    const compatibility: Record<string, Record<string, number>> = {
      casual: { work: 60, formal: 20, party: 70, sport: 40 },
      work: { casual: 70, formal: 90, party: 50, sport: 20 },
      formal: { casual: 30, work: 80, party: 85, sport: 10 },
      party: { casual: 60, work: 40, formal: 70, sport: 20 },
      sport: { casual: 80, work: 30, formal: 10, party: 40 }
    };

    return compatibility[itemOccasion]?.[occasion] || 50;
  }

  private calculateConditionScore(item: any): number {
    const condition = item.condition || 'good';
    const scores = {
      excellent: 100,
      good: 85,
      fair: 60,
      poor: 30
    };
    return scores[condition as keyof typeof scores] || 70;
  }

  private calculateVersatilityScore(item: any): number {
    let score = 50;
    
    const color = item.color || 'neutral';
    if (['black', 'white', 'gray', 'navy', 'neutral'].includes(color)) score += 20;
    
    const tags = item.tags || [];
    if (tags.includes('versatile') || tags.includes('basic') || tags.includes('classic')) score += 20;
    
    if (item.season === 'all-season') score += 10;
    
    return Math.min(100, score);
  }

  private calculateComfortScore(item: any, comfortLevel?: number): number {
    if (!comfortLevel) return 70;
    
    let score = 50;
    const tags = item.tags || [];
    const material = item.material || '';
    
    if (tags.includes('comfortable') || tags.includes('soft')) score += 20;
    if (['Cotton', 'Cotton Blend', 'Bamboo'].includes(material)) score += 15;
    if (tags.includes('stretch') || tags.includes('flexible')) score += 10;
    
    // Adjust based on user's comfort preference
    const adjustment = (comfortLevel - 5) * 2; // -10 to +10 adjustment
    score += adjustment;
    
    return Math.max(0, Math.min(100, score));
  }

  private calculateFormalityScore(item: any, formalityLevel?: number): number {
    if (!formalityLevel) return 70;
    
    const occasion = item.occasion || 'casual';
    const baseScores = {
      formal: 90,
      business: 80,
      'smart-casual': 60,
      casual: 40,
      sport: 20
    };
    
    let score = baseScores[occasion as keyof typeof baseScores] || 50;
    
    // Adjust based on user's formality preference
    const targetFormality = formalityLevel * 10; // Convert to 0-100 scale
    const difference = Math.abs(score - targetFormality);
    
    return Math.max(0, 100 - difference);
  }

  private calculateFreshnessScore(item: any): number {
    const lastWorn = item.last_worn;
    if (!lastWorn) return 100; // Never worn = freshest
    
    const daysSince = Math.floor((Date.now() - new Date(lastWorn).getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSince >= 7) return 100;
    if (daysSince >= 3) return 80;
    if (daysSince >= 1) return 60;
    return 30; // Worn today or yesterday
  }

  private getWeatherCondition(temperature: number): keyof typeof this.weatherScoring {
    if (temperature >= 25) return 'hot';
    if (temperature >= 20) return 'warm';
    if (temperature >= 15) return 'mild';
    if (temperature >= 10) return 'cool';
    return 'cold';
  }

  private matchesSeason(itemSeason: string, temperature: number): boolean {
    const season = this.getSeasonFromTemperature(temperature);
    return itemSeason === season || itemSeason === 'all-season';
  }

  private getSeasonFromTemperature(temp: number): string {
    if (temp >= 25) return 'summer';
    if (temp >= 15) return 'spring';
    if (temp >= 5) return 'fall';
    return 'winter';
  }

  private generateCombinations(
    scoredItems: Record<string, any[]>,
    weather: any,
    occasion: string
  ): any[] {
    const combinations = [];
    const requiredCategories = this.getRequiredCategories(weather, occasion);
    
    // Generate core combinations (top + bottom)
    const tops = scoredItems.tops || [];
    const bottoms = scoredItems.bottoms || [];
    
    for (let i = 0; i < Math.min(3, tops.length); i++) {
      for (let j = 0; j < Math.min(3, bottoms.length); j++) {
        const combo = [tops[i], bottoms[j]];
        
        // Add outerwear if needed
        if (requiredCategories.includes('outerwear') && scoredItems.outerwear?.length > 0) {
          combo.push(scoredItems.outerwear[0]);
        }
        
        // Add shoes if available
        if (scoredItems.shoes?.length > 0) {
          combo.push(scoredItems.shoes[0]);
        }
        
        combinations.push(combo);
      }
    }
    
    return combinations;
  }

  private getRequiredCategories(weather: any, occasion: string): string[] {
    const temp = weather?.temperature || 20;
    const condition = this.getWeatherCondition(temp);
    
    const baseCategories = ['tops', 'bottoms'];
    
    if (['cool', 'cold'].includes(condition)) {
      baseCategories.push('outerwear');
    }
    
    if (occasion === 'formal' || occasion === 'business' || occasion === 'party') {
      baseCategories.push('shoes');
    }
    
    return baseCategories;
  }

  private selectBestOutfit(combinations: any[], preferences: any, constraints: OutfitConstraints): any[] {
    if (combinations.length === 0) {
      throw new Error('No valid outfit combinations found');
    }

    // Score each combination
    const scoredCombinations = combinations.map(combo => {
      const compatibility = aiCategorization.calculateOutfitCompatibility(combo);
      const averageItemScore = combo.reduce((sum: number, item: any) => sum + item.scores.overall, 0) / combo.length;
      
      const totalScore = (compatibility.score * 0.6) + (averageItemScore * 0.4);
      
      return {
        items: combo,
        score: totalScore,
        compatibility
      };
    });

    // Sort by score and return the best
    scoredCombinations.sort((a, b) => b.score - a.score);
    return scoredCombinations[0].items;
  }

  private enhanceOutfit(
    items: any[], 
    weather: any, 
    occasion: string, 
    preferences: any
  ): EnhancedOutfit {
    const compatibility = aiCategorization.calculateOutfitCompatibility(items);
    const mainColor = this.determineMainColor(items);
    const style = this.determineOutfitStyle(items, occasion);
    
    const comfortScore = this.calculateOutfitComfortScore(items);
    const styleScore = compatibility.styleCoherence;
    const versatilityScore = this.calculateOutfitVersatilityScore(items);
    
    const confidence = Math.round(
      (compatibility.score * 0.4) +
      (comfortScore * 0.2) +
      (styleScore * 0.2) +
      (versatilityScore * 0.2)
    );

    return {
      id: `outfit-${Date.now()}`,
      items,
      mainColor,
      style,
      confidence,
      reasoning: this.generateReasoning(items, compatibility, weather, occasion),
      weatherAppropriate: this.isWeatherAppropriate(items, weather),
      comfortScore: Math.round(comfortScore),
      styleScore: Math.round(styleScore),
      versatilityScore: Math.round(versatilityScore),
      tags: this.generateOutfitTags(items, compatibility, style),
      alternatives: this.generateAlternatives(items)
    };
  }

  private determineMainColor(items: any[]): string {
    const colors = items.map(item => item.color || 'neutral');
    const colorCounts = colors.reduce((acc, color) => {
      acc[color] = (acc[color] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.keys(colorCounts).reduce((a, b) => 
      colorCounts[a] > colorCounts[b] ? a : b
    );
  }

  private determineOutfitStyle(items: any[], occasion: string): string {
    const styles = items.flatMap(item => item.tags || []);
    const occasions = items.map(item => item.occasion || 'casual');
    
    if (occasions.includes('formal') || occasion === 'formal') return 'formal';
    if (occasions.includes('business') || occasion === 'business') return 'professional';
    if (styles.includes('trendy') || styles.includes('modern')) return 'contemporary';
    if (styles.includes('classic') || styles.includes('timeless')) return 'classic';
    if (styles.includes('bohemian') || styles.includes('artistic')) return 'bohemian';
    
    return 'casual';
  }

  private calculateOutfitComfortScore(items: any[]): number {
    const comfortScores = items.map(item => {
      const tags = item.tags || [];
      const material = item.material || '';
      
      let score = 50;
      if (tags.includes('comfortable')) score += 20;
      if (['Cotton', 'Cotton Blend', 'Bamboo'].includes(material)) score += 15;
      if (tags.includes('stretch')) score += 10;
      if (item.condition === 'excellent') score += 5;
      
      return score;
    });
    
    return comfortScores.reduce((sum, score) => sum + score, 0) / comfortScores.length;
  }

  private calculateOutfitVersatilityScore(items: any[]): number {
    const versatilityScores = items.map(item => {
      let score = 50;
      
      if (['black', 'white', 'gray', 'navy'].includes(item.color)) score += 20;
      if (item.season === 'all-season') score += 15;
      if ((item.tags || []).includes('versatile')) score += 10;
      if (item.occasion === 'casual') score += 5;
      
      return score;
    });
    
    return versatilityScores.reduce((sum, score) => sum + score, 0) / versatilityScores.length;
  }

  private generateReasoning(
    items: any[], 
    compatibility: any, 
    weather: any, 
    occasion: string
  ): string {
    const reasons = [];
    
    if (compatibility.colorHarmony >= 85) {
      reasons.push('excellent color coordination');
    }
    
    if (weather && this.isWeatherAppropriate(items, weather)) {
      const temp = weather.temperature;
      reasons.push(`perfect for ${temp}°C weather`);
    }
    
    if (compatibility.occasionFit >= 85) {
      reasons.push(`ideal for ${occasion} occasions`);
    }
    
    const materials = [...new Set(items.map(item => item.material).filter(Boolean))];
    if (materials.includes('Cotton') || materials.includes('Cotton Blend')) {
      reasons.push('comfortable and breathable');
    }
    
    const comfortableItems = items.filter(item => 
      (item.tags || []).includes('comfortable')
    ).length;
    
    if (comfortableItems >= items.length / 2) {
      reasons.push('prioritizes comfort');
    }
    
    if (reasons.length === 0) {
      reasons.push('well-balanced combination');
    }
    
    return `This outfit works well because of its ${reasons.join(', ')}.`;
  }

  private isWeatherAppropriate(items: any[], weather: any): boolean {
    if (!weather) return true;
    
    const temp = weather.temperature;
    const condition = this.getWeatherCondition(temp);
    const rules = this.weatherScoring[condition];
    
    return items.every(item => {
      const itemAttributes = [
        (item.material || '').toLowerCase(),
        ...(item.tags || []).map((tag: string) => tag.toLowerCase())
      ];
      
      if ('avoid' in rules && rules.avoid?.some(avoid => itemAttributes.includes(avoid))) {
        return false;
      }
      
      return true;
    });
  }

  private generateOutfitTags(items: any[], compatibility: any, style: string): string[] {
    const tags = [];
    
    tags.push(style);
    
    if (compatibility.score >= 90) tags.push('perfect-match');
    if (compatibility.colorHarmony >= 90) tags.push('color-coordinated');
    
    const materials = [...new Set(items.map(item => item.material).filter(Boolean))];
    if (materials.includes('Cotton')) tags.push('comfortable');
    if (materials.includes('Silk') || materials.includes('Cashmere')) tags.push('luxurious');
    
    const occasions = [...new Set(items.map(item => item.occasion).filter(Boolean))];
    if (occasions.includes('formal')) tags.push('elegant');
    if (occasions.includes('casual')) tags.push('relaxed');
    
    return [...new Set(tags)];
  }

  private generateAlternatives(items: any[]): any[] {
    // This would generate alternative items for each piece in the outfit
    // For now, return empty array as this would require additional wardrobe analysis
    return [];
  }
}

export const enhancedOutfitEngine = new EnhancedOutfitEngine();