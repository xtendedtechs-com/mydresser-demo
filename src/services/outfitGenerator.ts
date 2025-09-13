import { outfitAI } from '@/ai/OutfitAI';
import type { AIOutfitContext } from '@/ai/types';
import { WardrobeItem } from '@/hooks/useWardrobe';

export interface OutfitContext {
  weather: {
    temperature: number;
    condition: string;
    humidity?: number;
    windSpeed?: number;
  };
  occasion: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  userPreferences?: {
    favoriteColors?: string[];
    preferredBrands?: string[];
    styleProfile?: string;
    avoidMaterials?: string[];
  };
  previousOutfits?: string[]; // IDs of recently worn items to avoid
}

export interface GeneratedOutfit {
  id: string;
  name: string;
  items: WardrobeItem[];
  confidence: number;
  reasoning: string;
  tags: string[];
  suitabilityScore: {
    weather: number;
    occasion: number;
    style: number;
    comfort: number;
  };
}

class OutfitGeneratorService {
  private readonly layerPriority = {
    base: ['underwear', 'bra', 'undershirt'],
    bottom: ['pants', 'jeans', 'skirt', 'shorts', 'leggings'],
    top: ['shirt', 'blouse', 't-shirt', 'tank top', 'crop top'],
    middle: ['sweater', 'cardigan', 'vest', 'hoodie'],
    outer: ['jacket', 'coat', 'blazer', 'puffer', 'trench'],
    feet: ['shoes', 'boots', 'sneakers', 'sandals', 'heels'],
    accessories: ['belt', 'watch', 'jewelry', 'hat', 'scarf', 'bag']
  };

  private readonly weatherRules = {
    cold: { // < 10°C
      required: ['outer'],
      preferred: ['sweater', 'boots', 'long pants'],
      avoid: ['shorts', 'sandals', 'tank top'],
      materials: ['wool', 'fleece', 'down', 'leather']
    },
    cool: { // 10-18°C
      preferred: ['jacket', 'cardigan', 'jeans', 'sneakers'],
      optional: ['light jacket'],
      materials: ['cotton', 'denim', 'light wool']
    },
    mild: { // 18-25°C
      preferred: ['t-shirt', 'blouse', 'jeans', 'sneakers'],
      optional: ['light cardigan'],
      materials: ['cotton', 'linen', 'polyester']
    },
    warm: { // 25-30°C
      preferred: ['t-shirt', 'shorts', 'sandals', 'light fabrics'],
      avoid: ['heavy jackets', 'boots', 'wool'],
      materials: ['cotton', 'linen', 'breathable']
    },
    hot: { // > 30°C
      required: ['breathable'],
      preferred: ['shorts', 'tank top', 'sandals', 'light colors'],
      avoid: ['dark colors', 'heavy materials', 'layers'],
      materials: ['linen', 'cotton', 'moisture-wicking']
    }
  };

  private readonly occasionRules = {
    work: {
      required: ['professional'],
      preferred: ['blazer', 'dress shirt', 'trousers', 'dress shoes'],
      avoid: ['casual', 'athletic', 'revealing'],
      colors: ['navy', 'black', 'gray', 'white', 'brown']
    },
    casual: {
      preferred: ['jeans', 't-shirt', 'sneakers', 'comfortable'],
      flexible: true
    },
    formal: {
      required: ['dress', 'suit', 'dress shoes'],
      preferred: ['elegant', 'classic'],
      colors: ['black', 'navy', 'dark colors']
    },
    date: {
      preferred: ['stylish', 'flattering', 'nice restaurant appropriate'],
      avoid: ['too casual', 'gym wear']
    },
    workout: {
      required: ['athletic', 'moisture-wicking'],
      preferred: ['sneakers', 'leggings', 'sports bra'],
      materials: ['polyester', 'spandex', 'performance']
    },
    travel: {
      preferred: ['comfortable', 'layerable', 'wrinkle-resistant'],
      practical: true
    }
  };

  async generateOutfit(items: WardrobeItem[], context: OutfitContext): Promise<GeneratedOutfit> {
    if (!items || items.length === 0) {
      throw new Error('No items provided for outfit generation');
    }
    
    // Convert to AI context
    const aiContext: AIOutfitContext = {
      weather: {
        temperature: context.weather.temperature,
        humidity: context.weather.humidity || 60,
        windSpeed: context.weather.windSpeed || 5,
        condition: context.weather.condition,
        feelsLike: context.weather.temperature
      },
      occasion: context.occasion,
      timeOfDay: context.timeOfDay,
      season: this.getCurrentSeason() as 'spring' | 'summer' | 'fall' | 'winter',
      userPreferences: {
        favoriteColors: context.userPreferences?.favoriteColors || [],
        preferredBrands: context.userPreferences?.preferredBrands || [],
        stylePersonality: {
          primary: 'minimalist' as const,
          confidence: 70,
          experimentalness: 50,
          formality: 50,
          colorfulness: 50
        },
        lifestyleFactors: {
          workEnvironment: 'mixed',
          socialLife: 'moderate',
          exerciseFrequency: 'regular',
          travelFrequency: 'moderate',
          sustainabilityImportance: 70
        },
        fashionGoals: [],
        avoidedItems: context.previousOutfits || []
      }
    };

    // Use the sophisticated AI engine
    const aiRecommendation = await outfitAI.generateOutfitRecommendation(items, aiContext);
    
      // Convert back to the expected format
      const generatedOutfit = {
      id: aiRecommendation.outfit.id,
      name: aiRecommendation.outfit.name,
      items: aiRecommendation.outfit.items,
      confidence: Math.round(aiRecommendation.confidence.overall),
      reasoning: this.generateReasoning(aiRecommendation),
      tags: this.generateTags(aiRecommendation.outfit.items, context),
      suitabilityScore: {
        weather: aiRecommendation.aiAnalysis.weatherAppropriatenss.score,
        occasion: aiRecommendation.aiAnalysis.occasionFit.score,
        style: aiRecommendation.aiAnalysis.styleConsistency.score,
        comfort: aiRecommendation.aiAnalysis.comfortLevel.score
      }
      };
      
      return generatedOutfit;
  }

  private filterAvailableItems(items: WardrobeItem[], context: OutfitContext): WardrobeItem[] {
    return items.filter(item => {
      // Exclude recently worn items
      if (context.previousOutfits?.includes(item.id)) return false;
      
      // Filter by season if specified
      if (item.season) {
        const currentSeason = this.getCurrentSeason();
        const itemSeasons = Array.isArray(item.season) ? item.season : [item.season];
        if (!itemSeasons.includes(currentSeason) && !itemSeasons.includes('all-season')) {
          return false;
        }
      }

      return true;
    });
  }

  private generateCombinations(items: WardrobeItem[], context: OutfitContext, weatherCondition: string): Array<{items: WardrobeItem[]}> {
    const categorizedItems = this.categorizeItems(items);
    const combinations: Array<{items: WardrobeItem[]}> = [];
    
    // Essential combinations for different outfit types
    const outfitTemplates = this.getOutfitTemplates(context.occasion, weatherCondition);
    
    for (const template of outfitTemplates) {
      const combo = this.buildOutfitFromTemplate(template, categorizedItems);
      if (combo && combo.length >= 3) { // Minimum viable outfit
        combinations.push({ items: combo });
      }
    }

    return combinations.slice(0, 5); // Limit combinations to avoid performance issues
  }

  private categorizeItems(items: WardrobeItem[]): Record<string, WardrobeItem[]> {
    const categorized: Record<string, WardrobeItem[]> = {};
    
    items.forEach(item => {
      const category = item.category.toLowerCase();
      const layer = this.getItemLayer(category);
      
      if (!categorized[layer]) categorized[layer] = [];
      categorized[layer].push(item);
    });

    return categorized;
  }

  private getItemLayer(category: string): string {
    for (const [layer, categories] of Object.entries(this.layerPriority)) {
      if (categories.some(cat => category.includes(cat))) {
        return layer;
      }
    }
    return 'accessories'; // Default fallback
  }

  private getOutfitTemplates(occasion: string, weatherCondition: string): string[][] {
    const baseTemplates = {
      casual: [
        ['top', 'bottom', 'feet'],
        ['top', 'bottom', 'feet', 'accessories'],
        ['top', 'middle', 'bottom', 'feet']
      ],
      work: [
        ['top', 'bottom', 'outer', 'feet'],
        ['top', 'bottom', 'feet', 'accessories'],
        ['top', 'middle', 'bottom', 'outer', 'feet']
      ],
      formal: [
        ['top', 'bottom', 'outer', 'feet', 'accessories'],
        ['top', 'bottom', 'feet', 'accessories']
      ]
    };

    // Modify templates based on weather
    let templates = baseTemplates[occasion as keyof typeof baseTemplates] || baseTemplates.casual;
    
    if (weatherCondition === 'cold') {
      templates = templates.map(template => 
        template.includes('outer') ? template : [...template, 'outer']
      );
    }

    return templates;
  }

  private buildOutfitFromTemplate(template: string[], categorizedItems: Record<string, WardrobeItem[]>): WardrobeItem[] | null {
    const outfit: WardrobeItem[] = [];
    
    for (const layer of template) {
      const availableItems = categorizedItems[layer];
      if (!availableItems || availableItems.length === 0) {
        if (['top', 'bottom', 'feet'].includes(layer)) {
          return null; // Essential item missing
        }
        continue; // Optional item missing
      }
      
      // Pick the best item for this layer (could be random or preference-based)
      const selectedItem = this.selectBestItemForLayer(availableItems, outfit);
      if (selectedItem) {
        outfit.push(selectedItem);
      }
    }

    return outfit;
  }

  private selectBestItemForLayer(items: WardrobeItem[], currentOutfit: WardrobeItem[]): WardrobeItem | null {
    // Simple selection logic - can be enhanced with color matching, style consistency, etc.
    // For now, prefer favorites and recently purchased items
    const sortedItems = items.sort((a, b) => {
      let scoreA = 0, scoreB = 0;
      
      if (a.is_favorite) scoreA += 10;
      if (b.is_favorite) scoreB += 10;
      
      // Prefer less worn items
      scoreA += Math.max(0, 10 - a.wear_count);
      scoreB += Math.max(0, 10 - b.wear_count);
      
      return scoreB - scoreA;
    });

    return sortedItems[0] || null;
  }

  private scoreOutfit(outfit: {items: WardrobeItem[]}, context: OutfitContext, weatherCondition: string) {
    const scores = {
      weather: this.scoreWeatherSuitability(outfit.items, context.weather, weatherCondition),
      occasion: this.scoreOccasionSuitability(outfit.items, context.occasion),
      style: this.scoreStyleConsistency(outfit.items, context.userPreferences),
      comfort: this.scoreComfort(outfit.items, context)
    };

    const totalScore = (scores.weather * 0.3 + scores.occasion * 0.3 + scores.style * 0.25 + scores.comfort * 0.15);
    
    return {
      confidence: Math.round(totalScore),
      suitabilityScore: scores
    };
  }

  private scoreWeatherSuitability(items: WardrobeItem[], weather: OutfitContext['weather'], condition: string): number {
    const rules = this.weatherRules[condition as keyof typeof this.weatherRules];
    if (!rules) return 70; // Default score

    let score = 70;
    const itemCategories = items.map(item => item.category.toLowerCase());
    const itemMaterials = items.map(item => item.material?.toLowerCase()).filter(Boolean);

    // Check required items
    if ('required' in rules && rules.required) {
      const hasRequired = rules.required.some((req: string) => 
        itemCategories.some(cat => cat.includes(req))
      );
      if (hasRequired) score += 15;
      else score -= 20;
    }

    // Check preferred items
    if ('preferred' in rules && rules.preferred) {
      const preferredCount = rules.preferred.filter((pref: string) =>
        itemCategories.some(cat => cat.includes(pref))
      ).length;
      score += (preferredCount / rules.preferred.length) * 10;
    }

    // Check avoided items
    if ('avoid' in rules && rules.avoid) {
      const avoidedCount = rules.avoid.filter((avoid: string) =>
        itemCategories.some(cat => cat.includes(avoid))
      ).length;
      score -= avoidedCount * 15;
    }

    // Check materials
    if ('materials' in rules && rules.materials) {
      const goodMaterialCount = rules.materials.filter((material: string) =>
        itemMaterials.some(mat => mat?.includes(material))
      ).length;
      score += (goodMaterialCount / Math.max(rules.materials.length, 1)) * 10;
    }

    return Math.max(0, Math.min(100, score));
  }

  private scoreOccasionSuitability(items: WardrobeItem[], occasion: string): number {
    const rules = this.occasionRules[occasion as keyof typeof this.occasionRules];
    if (!rules) return 70;

    let score = 70;
    const itemCategories = items.map(item => item.category.toLowerCase());
    const itemOccasions = items.map(item => item.occasion?.toLowerCase()).filter(Boolean);

    // Direct occasion match
    const occasionMatches = itemOccasions.filter(occ => occ === occasion.toLowerCase()).length;
    score += occasionMatches * 8;

    // Check required/preferred items
    if ('required' in rules && rules.required) {
      const hasRequired = rules.required.some((req: string) =>
        itemCategories.some(cat => cat.includes(req)) ||
        itemOccasions.some(occ => occ?.includes(req))
      );
      if (hasRequired) score += 20;
      else score -= 25;
    }

    return Math.max(0, Math.min(100, score));
  }

  private scoreStyleConsistency(items: WardrobeItem[], preferences?: OutfitContext['userPreferences']): number {
    let score = 70;

    // Color coordination
    const colors = items.map(item => item.color?.toLowerCase()).filter(Boolean);
    if (colors.length > 1) {
      const colorHarmony = this.assessColorHarmony(colors);
      score += colorHarmony * 15;
    }

    // Brand consistency (premium brands together)
    const brands = items.map(item => item.brand?.toLowerCase()).filter(Boolean);
    const uniqueBrands = new Set(brands);
    if (uniqueBrands.size <= 2 && brands.length > 2) {
      score += 10; // Bonus for brand consistency
    }

    // User preferences
    if (preferences?.favoriteColors) {
      const favoriteColorMatches = colors.filter(color =>
        preferences.favoriteColors!.some(fav => color?.includes(fav.toLowerCase()))
      ).length;
      score += (favoriteColorMatches / colors.length) * 10;
    }

    return Math.max(0, Math.min(100, score));
  }

  private scoreComfort(items: WardrobeItem[], context: OutfitContext): number {
    let score = 80; // Base comfort score

    // Check for appropriate materials for weather
    const materials = items.map(item => item.material?.toLowerCase()).filter(Boolean);
    
    if (context.weather.temperature > 25) {
      // Hot weather - prefer breathable materials
      const breathableMaterials = ['cotton', 'linen', 'bamboo', 'modal'];
      const breathableCount = materials.filter(mat => 
        breathableMaterials.some(br => mat?.includes(br))
      ).length;
      score += (breathableCount / materials.length) * 10;
    }

    // Comfort based on occasion
    if (context.occasion === 'travel' || context.occasion === 'casual') {
      score += 10; // These occasions prioritize comfort
    }

    return Math.max(0, Math.min(100, score));
  }

  private assessColorHarmony(colors: string[]): number {
    // Simple color harmony assessment
    const neutrals = ['white', 'black', 'gray', 'grey', 'beige', 'brown', 'navy'];
    const neutralCount = colors.filter(color => 
      neutrals.some(neutral => color.includes(neutral))
    ).length;

    // High neutral count = better harmony
    if (neutralCount >= colors.length * 0.6) return 0.8;
    if (neutralCount >= colors.length * 0.4) return 0.6;
    
    // Check for complementary colors (simplified)
    const hasComplementary = this.hasComplementaryColors(colors);
    if (hasComplementary) return 0.7;

    return 0.5; // Average harmony
  }

  private hasComplementaryColors(colors: string[]): boolean {
    // Simplified complementary color detection
    const complementaryPairs = [
      ['blue', 'orange'], ['red', 'green'], ['purple', 'yellow'],
      ['navy', 'gold'], ['pink', 'green']
    ];

    return complementaryPairs.some(([color1, color2]) =>
      colors.some(c => c.includes(color1)) && colors.some(c => c.includes(color2))
    );
  }

  private generateOutfitName(items: WardrobeItem[], context: OutfitContext): string {
    const occasion = context.occasion;
    const timeOfDay = context.timeOfDay;
    const weather = this.getWeatherCondition(context.weather.temperature);

    const nameTemplates = {
      work: ['Professional Edge', 'Business Ready', 'Office Chic', 'Corporate Style'],
      casual: ['Effortless Cool', 'Weekend Vibes', 'Relaxed Style', 'Casual Comfort'],
      formal: ['Evening Elegance', 'Formal Grace', 'Sophisticated Look', 'Classic Charm'],
      date: ['Date Night Ready', 'Romantic Style', 'Dinner Chic', 'Evening Out'],
      workout: ['Fitness Ready', 'Active Style', 'Gym Chic', 'Sport Mode']
    };

    const weatherAdjectives = {
      cold: ['Cozy', 'Warm', 'Winter'],
      cool: ['Layered', 'Transitional', 'Cool'],
      mild: ['Perfect', 'Comfortable', 'Spring'],
      warm: ['Light', 'Breezy', 'Summer'],
      hot: ['Cool', 'Breathable', 'Heat-Smart']
    };

    const templates = nameTemplates[occasion as keyof typeof nameTemplates] || nameTemplates.casual;
    const weatherAdj = weatherAdjectives[weather as keyof typeof weatherAdjectives] || ['Perfect'];
    
    const baseName = templates[Math.floor(Math.random() * templates.length)];
    const weatherDesc = weatherAdj[Math.floor(Math.random() * weatherAdj.length)];
    
    return `${weatherDesc} ${baseName}`;
  }

  private generateReasoning(aiRecommendation: any): string {
    const analysis = aiRecommendation.aiAnalysis;
    const insights = aiRecommendation.personalizedInsights;
    
    let reasoning = `This outfit scores ${Math.round(aiRecommendation.confidence.overall)}% overall. `;
    
    // Add key strengths
    const strengths = [];
    if (analysis.colorHarmony.harmony.score > 75) strengths.push('excellent color harmony');
    if (analysis.styleConsistency.score > 75) strengths.push('strong style consistency');
    if (analysis.weatherAppropriatenss.score > 75) strengths.push('perfect weather match');
    
    if (strengths.length > 0) {
      reasoning += `It excels in ${strengths.join(' and ')}. `;
    }
    
    // Add personalized note
    if (insights.recommendations.immediate.length > 0) {
      reasoning += insights.recommendations.immediate[0].description;
    }
    
    return reasoning;
  }

  private generateTags(items: WardrobeItem[], context: OutfitContext): string[] {
    const tags = new Set<string>();
    
    tags.add(context.occasion);
    tags.add(context.timeOfDay);
    tags.add(this.getWeatherCondition(context.weather.temperature));
    
    // Add item-based tags
    items.forEach(item => {
      if (item.color) tags.add(item.color.toLowerCase());
      if (item.material) tags.add(item.material.toLowerCase());
      if (item.brand) tags.add(item.brand.toLowerCase());
    });

    return Array.from(tags).slice(0, 8); // Limit tags
  }

  private getWeatherCondition(temperature: number): string {
    if (temperature < 10) return 'cold';
    if (temperature < 18) return 'cool';
    if (temperature < 25) return 'mild';
    if (temperature < 30) return 'warm';
    return 'hot';
  }

  private getCurrentSeason(): string {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  }
}

export const outfitGenerator = new OutfitGeneratorService();