import { WardrobeItem } from '@/hooks/useWardrobe';
import { 
  AIOutfitContext, 
  AIOutfitRecommendation, 
  EnhancedOutfit,
  AIAnalysis,
  PersonalizedInsights,
  ImprovementSuggestions,
  AIConfidence
} from './types';
import { ColorHarmonyEngine, colorHarmonyEngine } from './ColorHarmonyEngine';
import { StyleAnalyzer, styleAnalyzer } from './StyleAnalyzer';
import { WeatherMatcher, weatherMatcher } from './WeatherMatcher';

export class OutfitAI {
  private colorEngine: ColorHarmonyEngine;
  private styleAnalyzer: StyleAnalyzer;
  private weatherMatcher: WeatherMatcher;
  private outfitHistory: Map<string, AIOutfitRecommendation[]> = new Map();
  private userFeedback: Map<string, any[]> = new Map();

  constructor() {
    this.colorEngine = colorHarmonyEngine;
    this.styleAnalyzer = styleAnalyzer;
    this.weatherMatcher = weatherMatcher;
  }

  public async generateOutfit(params: {
    wardrobeItems: WardrobeItem[];
    weather?: any;
    preferences?: any;
    occasion?: string;
  }): Promise<any> {
    // Simple outfit generation for now
    const items = params.wardrobeItems.slice(0, 4); // Take first 4 items
    
    return {
      items,
      reasoning: `Generated outfit for ${params.occasion || 'casual'} occasion with current weather conditions.`,
      tags: [params.occasion || 'casual', 'comfortable', 'stylish'],
      confidence: 0.85
    };
  }

  public async generateOutfitRecommendation(
    items: WardrobeItem[], 
    context: AIOutfitContext
  ): Promise<AIOutfitRecommendation> {
    // Phase 1: Generate base outfit combinations
    const outfitCombinations = this.generateOutfitCombinations(items, context);
    
    // Phase 2: Analyze and score each combination
    const scoredOutfits = await this.analyzeOutfits(outfitCombinations, context);
    
    // Phase 3: Select best outfit
    const bestOutfit = this.selectBestOutfit(scoredOutfits);
    
    // Phase 4: Generate comprehensive recommendation
    const recommendation = await this.createComprehensiveRecommendation(bestOutfit, context);
    
    return recommendation;
  }

  private generateOutfitCombinations(items: WardrobeItem[], context: AIOutfitContext): EnhancedOutfit[] {
    // Filter suitable items for context
    const suitableItems = this.filterItemsByContext(items, context);
    
    // Group items by category/layer
    const itemGroups = this.categorizeItems(suitableItems);
    
    // Generate combinations using intelligent algorithms
    const combinations = this.createIntelligentCombinations(itemGroups, context);
    
    return combinations.map((combination, index) => this.enhanceOutfit(combination, `outfit-${index}`, context));
  }

  private filterItemsByContext(items: WardrobeItem[], context: AIOutfitContext): WardrobeItem[] {
    return items.filter(item => {
      // Season filtering
      if (item.season && item.season !== 'all-season') {
        if (Array.isArray(item.season)) {
          if (!item.season.includes(context.season)) return false;
        } else if (item.season !== context.season) {
          return false;
        }
      }

      // Occasion filtering
      if (item.occasion && item.occasion !== context.occasion && item.occasion !== 'versatile') {
        return false;
      }

      // User constraint filtering
      if (context.constraints) {
        if (context.constraints.forbiddenCategories?.includes(item.category)) return false;
        if (context.constraints.maxBudget && item.purchase_price && item.purchase_price > context.constraints.maxBudget) return false;
      }

      // Weather appropriateness (basic filter)
      const temp = context.weather.temperature;
      if (temp < 5 && ['shorts', 'tank top', 'sandals'].some(cat => item.category.toLowerCase().includes(cat))) {
        return false;
      }
      if (temp > 25 && ['heavy coat', 'wool sweater', 'boots'].some(cat => item.name.toLowerCase().includes(cat))) {
        return false;
      }

      return true;
    });
  }

  private categorizeItems(items: WardrobeItem[]): Record<string, WardrobeItem[]> {
    // Categorize by body parts and layering logic
    const categories: Record<string, WardrobeItem[]> = {
      // Base layer (closest to skin)
      base: [],
      
      // Body parts
      head: [],          // Hats, caps, headbands
      torso_base: [],    // T-shirts, tank tops, undershirts
      torso_mid: [],     // Shirts, blouses, sweaters
      torso_outer: [],   // Jackets, coats, blazers
      legs: [],          // Pants, jeans, shorts, skirts
      feet: [],          // Shoes, boots, sandals, socks
      
      // Accessories by function
      neck: [],          // Scarves, necklaces
      hands: [],         // Gloves, rings, watches
      waist: [],         // Belts
      carry: [],         // Bags, purses
      other: []          // Misc accessories
    };

    items.forEach(item => {
      const category = item.category.toLowerCase();
      const name = item.name.toLowerCase();
      const material = item.material?.toLowerCase() || '';

      // Base layer - underwear and foundational pieces
      if (['underwear', 'bra', 'undershirt', 'base layer', 'thermal'].some(base => 
          category.includes(base) || name.includes(base))) {
        categories.base.push(item);
      }
      
      // Head - hats, caps, headbands
      else if (['hat', 'cap', 'beanie', 'headband', 'helmet'].some(head => 
          category.includes(head) || name.includes(head))) {
        categories.head.push(item);
      }
      
      // Torso - layered by weight and function
      else if (['top', 'shirt', 'blouse', 't-shirt', 'tee', 'tank', 'camisole', 'polo'].some(top => 
          category.includes(top) || name.includes(top))) {
        // Distinguish between base, mid, and outer layers
        if (['tank', 'cami', 't-shirt', 'tee'].some(light => name.includes(light))) {
          categories.torso_base.push(item);
        } else if (['button', 'dress shirt', 'blouse'].some(formal => name.includes(formal))) {
          categories.torso_mid.push(item);
        } else {
          categories.torso_base.push(item);
        }
      }
      
      // Mid-layer tops
      else if (['sweater', 'pullover', 'cardigan', 'hoodie', 'sweatshirt', 'vest'].some(mid => 
          category.includes(mid) || name.includes(mid))) {
        categories.torso_mid.push(item);
      }
      
      // Outer layer
      else if (['jacket', 'coat', 'blazer', 'parka', 'windbreaker', 'raincoat'].some(outer => 
          category.includes(outer) || name.includes(outer))) {
        categories.torso_outer.push(item);
      }
      
      // Dresses - full torso coverage
      else if (category.includes('dress') || name.includes('dress')) {
        categories.torso_base.push(item);
        categories.legs.push(item); // Dresses cover legs too
      }
      
      // Legs - pants, skirts, shorts
      else if (['bottom', 'pant', 'jean', 'trouser', 'skirt', 'short', 'legging'].some(bottom => 
          category.includes(bottom) || name.includes(bottom))) {
        categories.legs.push(item);
      }
      
      // Feet - shoes and socks
      else if (['shoe', 'boot', 'sneaker', 'sandal', 'heel', 'flat', 'loafer', 'oxford', 'sock'].some(foot => 
          category.includes(foot) || name.includes(foot))) {
        categories.feet.push(item);
      }
      
      // Neck accessories
      else if (['scarf', 'necklace', 'tie', 'bowtie'].some(neck => 
          category.includes(neck) || name.includes(neck))) {
        categories.neck.push(item);
      }
      
      // Hand accessories
      else if (['glove', 'ring', 'watch', 'bracelet', 'mitt'].some(hand => 
          category.includes(hand) || name.includes(hand))) {
        categories.hands.push(item);
      }
      
      // Waist accessories
      else if (category.includes('belt') || name.includes('belt')) {
        categories.waist.push(item);
      }
      
      // Carry items
      else if (['bag', 'purse', 'backpack', 'tote', 'clutch', 'handbag'].some(carry => 
          category.includes(carry) || name.includes(carry))) {
        categories.carry.push(item);
      }
      
      // Other accessories
      else if (category.includes('accessory') || category.includes('jewelry')) {
        categories.other.push(item);
      }
      
      // Fallback
      else {
        categories.other.push(item);
      }
    });

    return categories;
  }

  private createIntelligentCombinations(itemGroups: Record<string, WardrobeItem[]>, context: AIOutfitContext): WardrobeItem[][] {
    const combinations: WardrobeItem[][] = [];
    const maxCombinations = 20; // Limit for performance

    // Define outfit templates based on context
    const templates = this.getOutfitTemplates(context);

    templates.forEach(template => {
      const templateCombinations = this.generateFromTemplate(template, itemGroups, context);
      combinations.push(...templateCombinations.slice(0, Math.floor(maxCombinations / templates.length)));
    });

    // Add some creative combinations
    const creativeCombinations = this.generateCreativeCombinations(itemGroups, context);
    combinations.push(...creativeCombinations.slice(0, 5));

    return combinations.slice(0, maxCombinations);
  }

  private getOutfitTemplates(context: AIOutfitContext): OutfitTemplate[] {
    const templates: OutfitTemplate[] = [];
    const temp = context.weather.temperature;

    // Cold weather templates (< 10°C)
    if (temp < 10) {
      templates.push({
        name: 'Full Winter Layering',
        requiredCategories: ['base', 'torso_base', 'torso_mid', 'torso_outer', 'legs', 'feet'],
        optionalCategories: ['head', 'neck', 'hands'],
        layeringStrategy: 'maximum_warmth'
      });
      
      templates.push({
        name: 'Winter Professional',
        requiredCategories: ['torso_base', 'torso_mid', 'torso_outer', 'legs', 'feet'],
        optionalCategories: ['neck', 'waist', 'carry'],
        layeringStrategy: 'structured_warm'
      });
    }
    
    // Cool weather templates (10-15°C)
    else if (temp < 15) {
      templates.push({
        name: 'Light Layering',
        requiredCategories: ['torso_base', 'torso_mid', 'legs', 'feet'],
        optionalCategories: ['torso_outer', 'neck', 'carry'],
        layeringStrategy: 'transitional'
      });
      
      templates.push({
        name: 'Casual Comfort',
        requiredCategories: ['torso_mid', 'legs', 'feet'],
        optionalCategories: ['torso_outer', 'head', 'carry'],
        layeringStrategy: 'relaxed_cool'
      });
    }
    
    // Mild weather templates (15-25°C)
    else if (temp < 25) {
      templates.push({
        name: 'Spring/Fall Essential',
        requiredCategories: ['torso_base', 'legs', 'feet'],
        optionalCategories: ['torso_mid', 'neck', 'carry'],
        layeringStrategy: 'minimal_versatile'
      });
      
      if (context.occasion === 'work' || context.occasion === 'formal') {
        templates.push({
          name: 'Business Casual',
          requiredCategories: ['torso_base', 'torso_mid', 'legs', 'feet'],
          optionalCategories: ['waist', 'neck', 'carry'],
          layeringStrategy: 'professional'
        });
      }
    }
    
    // Warm weather templates (> 25°C)
    else {
      templates.push({
        name: 'Summer Light',
        requiredCategories: ['torso_base', 'legs', 'feet'],
        optionalCategories: ['head', 'carry'],
        layeringStrategy: 'breathable'
      });
      
      templates.push({
        name: 'Hot Weather Casual',
        requiredCategories: ['torso_base', 'legs', 'feet'],
        optionalCategories: ['head', 'neck', 'carry'],
        layeringStrategy: 'minimal_cool'
      });
    }

    // Occasion-specific additions
    if (context.occasion === 'formal') {
      templates.push({
        name: 'Formal Ensemble',
        requiredCategories: ['torso_base', 'torso_mid', 'legs', 'feet'],
        optionalCategories: ['torso_outer', 'waist', 'neck', 'hands'],
        layeringStrategy: 'elegant'
      });
    }
    
    if (context.occasion === 'athletic') {
      templates.push({
        name: 'Athletic Wear',
        requiredCategories: ['torso_base', 'legs', 'feet'],
        optionalCategories: ['torso_outer', 'head', 'hands'],
        layeringStrategy: 'performance'
      });
    }

    // Always include a basic template as fallback
    templates.push({
      name: 'Basic Outfit',
      requiredCategories: ['torso_base', 'legs', 'feet'],
      optionalCategories: ['torso_mid', 'carry', 'other'],
      layeringStrategy: 'simple'
    });

    return templates;
  }

  private generateFromTemplate(
    template: OutfitTemplate, 
    itemGroups: Record<string, WardrobeItem[]>, 
    context: AIOutfitContext
  ): WardrobeItem[][] {
    const combinations: WardrobeItem[][] = [];
    
    // Ensure required categories have items
    const hasRequiredItems = template.requiredCategories.every(category => 
      itemGroups[category] && itemGroups[category].length > 0
    );

    if (!hasRequiredItems) return combinations;

    // Generate combinations recursively
    this.generateCombinationsRecursive(
      template.requiredCategories,
      itemGroups,
      [],
      combinations,
      5 // Max combinations per template
    );

    return combinations;
  }

  private generateCombinationsRecursive(
    remainingCategories: string[],
    itemGroups: Record<string, WardrobeItem[]>,
    currentCombination: WardrobeItem[],
    results: WardrobeItem[][],
    maxResults: number
  ): void {
    if (results.length >= maxResults) return;

    if (remainingCategories.length === 0) {
      results.push([...currentCombination]);
      return;
    }

    const [currentCategory, ...restCategories] = remainingCategories;
    const availableItems = itemGroups[currentCategory] || [];

    // Try different items from current category
    const itemsToTry = Math.min(availableItems.length, 3); // Limit for performance
    
    for (let i = 0; i < itemsToTry; i++) {
      const item = availableItems[i];
      
      // Check compatibility with current combination
      if (this.isCompatibleWithCombination(item, currentCombination)) {
        this.generateCombinationsRecursive(
          restCategories,
          itemGroups,
          [...currentCombination, item],
          results,
          maxResults
        );
      }
    }
  }

  private isCompatibleWithCombination(item: WardrobeItem, combination: WardrobeItem[]): boolean {
    // Check for obvious incompatibilities
    for (const existingItem of combination) {
      // Same category check (avoid duplicate categories unless layering)
      if (existingItem.category === item.category && 
          !['accessories', 'layering'].some(cat => item.category.toLowerCase().includes(cat))) {
        return false;
      }

      // Style consistency check (basic)
      if (existingItem.occasion && item.occasion && 
          existingItem.occasion !== item.occasion && 
          existingItem.occasion !== 'versatile' && 
          item.occasion !== 'versatile') {
        return false;
      }
    }

    return true;
  }

  private generateCreativeCombinations(itemGroups: Record<string, WardrobeItem[]>, context: AIOutfitContext): WardrobeItem[][] {
    const creativeCombinations: WardrobeItem[][] = [];
    
    // Try unexpected but harmonious combinations
    const allItems = Object.values(itemGroups).flat();
    
    if (allItems.length < 3) return creativeCombinations;

    // Create a few random but sensible combinations
    for (let i = 0; i < 3; i++) {
      const combination: WardrobeItem[] = [];
      const usedCategories = new Set<string>();

      // Start with a core item
      const coreItem = this.selectBestCoreItem(allItems, context);
      if (coreItem) {
        combination.push(coreItem);
        usedCategories.add(coreItem.category);
      }

      // Add complementary items
      let attempts = 0;
      while (combination.length < 4 && attempts < 10) {
        const candidateItem = allItems[Math.floor(Math.random() * allItems.length)];
        
        if (!usedCategories.has(candidateItem.category) && 
            this.isCompatibleWithCombination(candidateItem, combination)) {
          combination.push(candidateItem);
          usedCategories.add(candidateItem.category);
        }
        attempts++;
      }

      if (combination.length >= 3) {
        creativeCombinations.push(combination);
      }
    }

    return creativeCombinations;
  }

  private selectBestCoreItem(items: WardrobeItem[], context: AIOutfitContext): WardrobeItem | null {
    // Score items based on context and return best one
    const scoredItems = items.map(item => ({
      item,
      score: this.scoreItemForContext(item, context)
    }));

    scoredItems.sort((a, b) => b.score - a.score);
    return scoredItems.length > 0 ? scoredItems[0].item : null;
  }

  private scoreItemForContext(item: WardrobeItem, context: AIOutfitContext): number {
    let score = 50;

    // Favorite bonus
    if (item.is_favorite) score += 15;

    // Occasion match
    if (item.occasion === context.occasion) score += 20;
    else if (item.occasion === 'versatile') score += 10;

    // Season match
    if (item.season === context.season || item.season === 'all-season') score += 15;

    // Weather appropriateness (basic)
    const temp = context.weather.temperature;
    if (temp < 10 && ['coat', 'jacket', 'sweater', 'boot'].some(warm => item.name.toLowerCase().includes(warm))) {
      score += 10;
    } else if (temp > 25 && ['light', 'cotton', 'linen', 'short'].some(cool => 
      item.name.toLowerCase().includes(cool) || item.material?.toLowerCase().includes(cool))) {
      score += 10;
    }

    // User preference alignment
    if (context.userPreferences.favoriteColors.includes(item.color?.toLowerCase() || '')) score += 10;
    if (context.userPreferences.preferredBrands.includes(item.brand?.toLowerCase() || '')) score += 10;

    return score;
  }

  private enhanceOutfit(items: WardrobeItem[], id: string, context: AIOutfitContext): EnhancedOutfit {
    return {
      id,
      name: this.generateOutfitName(items, context),
      items,
      layering: this.analyzeLayering(items),
      accessories: this.suggestAccessories(items, context),
      styling: this.generateStylingTips(items, context),
      occasions: this.determineOccasions(items),
      seasons: this.determineSeasons(items),
      weatherRange: this.calculateWeatherRange(items)
    };
  }

  private generateOutfitName(items: WardrobeItem[], context: AIOutfitContext): string {
    const adjectives = {
      work: ['Professional', 'Polished', 'Executive', 'Sharp'],
      casual: ['Effortless', 'Relaxed', 'Comfortable', 'Easy'],
      formal: ['Elegant', 'Sophisticated', 'Refined', 'Classic'],
      date: ['Romantic', 'Charming', 'Alluring', 'Stylish'],
      party: ['Glamorous', 'Bold', 'Eye-catching', 'Festive']
    };

    const nouns = {
      morning: ['Look', 'Ensemble', 'Style', 'Outfit'],
      afternoon: ['Combination', 'Ensemble', 'Look', 'Outfit'],
      evening: ['Ensemble', 'Look', 'Style', 'Outfit'],
      night: ['Look', 'Style', 'Ensemble', 'Outfit']
    };

    const occasionAdjs = adjectives[context.occasion as keyof typeof adjectives] || adjectives.casual;
    const timeNouns = nouns[context.timeOfDay] || nouns.morning;

    const adj = occasionAdjs[Math.floor(Math.random() * occasionAdjs.length)];
    const noun = timeNouns[Math.floor(Math.random() * timeNouns.length)];

    return `${adj} ${noun}`;
  }

  private analyzeLayering(items: WardrobeItem[]) {
    const name = (item: WardrobeItem) => item.name.toLowerCase();
    const cat = (item: WardrobeItem) => item.category.toLowerCase();
    const mat = (item: WardrobeItem) => item.material?.toLowerCase() || '';
    
    const layers = {
      // Layering by body part and function
      base: items.filter(item => 
        ['base', 'underwear', 'bra', 'thermal'].some(base => cat(item).includes(base) || name(item).includes(base))
      ),
      
      head: items.filter(item => 
        ['hat', 'cap', 'beanie', 'headband'].some(head => cat(item).includes(head) || name(item).includes(head))
      ),
      
      torso_base: items.filter(item => 
        ['t-shirt', 'tee', 'tank', 'cami'].some(base => name(item).includes(base)) ||
        (cat(item).includes('top') && !name(item).includes('sweater') && !name(item).includes('jacket'))
      ),
      
      torso_mid: items.filter(item => 
        ['sweater', 'pullover', 'cardigan', 'hoodie', 'shirt', 'blouse'].some(mid => name(item).includes(mid))
      ),
      
      torso_outer: items.filter(item => 
        ['jacket', 'coat', 'blazer', 'parka'].some(outer => cat(item).includes(outer) || name(item).includes(outer))
      ),
      
      legs: items.filter(item => 
        ['pant', 'jean', 'skirt', 'short', 'trouser', 'legging', 'dress'].some(leg => 
          cat(item).includes(leg) || name(item).includes(leg))
      ),
      
      feet: items.filter(item => 
        ['shoe', 'boot', 'sneaker', 'sandal', 'sock'].some(foot => cat(item).includes(foot) || name(item).includes(foot))
      ),
      
      accessories: {
        neck: items.filter(item => ['scarf', 'necklace', 'tie'].some(n => name(item).includes(n))),
        hands: items.filter(item => ['glove', 'ring', 'watch', 'bracelet'].some(h => name(item).includes(h))),
        waist: items.filter(item => name(item).includes('belt')),
        carry: items.filter(item => ['bag', 'purse', 'backpack'].some(c => name(item).includes(c))),
        other: items.filter(item => 
          (cat(item).includes('accessory') || cat(item).includes('jewelry')) &&
          !['scarf', 'necklace', 'tie', 'glove', 'ring', 'watch', 'bracelet', 'belt', 'bag', 'purse'].some(a => name(item).includes(a))
        )
      }
    };

    const layeringLogic = this.generateLayeringLogic(layers);
    const fabricAnalysis = this.analyzeFabrics(items);

    return {
      ...layers,
      layeringLogic,
      fabricAnalysis,
      totalLayers: Object.values(layers).filter(Array.isArray).reduce((sum, arr) => sum + arr.length, 0)
    };
  }

  private analyzeFabrics(items: WardrobeItem[]) {
    const fabrics = {
      breathable: items.filter(item => 
        ['cotton', 'linen', 'bamboo', 'silk'].some(f => item.material?.toLowerCase().includes(f))
      ),
      insulating: items.filter(item => 
        ['wool', 'fleece', 'down', 'cashmere'].some(f => item.material?.toLowerCase().includes(f))
      ),
      waterproof: items.filter(item => 
        ['polyester', 'nylon', 'gore-tex', 'vinyl'].some(f => item.material?.toLowerCase().includes(f))
      ),
      stretch: items.filter(item => 
        ['spandex', 'elastane', 'lycra', 'stretch'].some(f => item.material?.toLowerCase().includes(f))
      )
    };

    return {
      fabrics,
      breathability: fabrics.breathable.length > 0 ? 'high' : 'moderate',
      insulation: fabrics.insulating.length > 0 ? 'high' : 'low',
      weatherResistance: fabrics.waterproof.length > 0 ? 'high' : 'low',
      comfort: fabrics.stretch.length > 0 ? 'flexible' : 'standard'
    };
  }

  private generateLayeringLogic(layers: any): string {
    const totalLayers = Object.values(layers).reduce((sum: number, layer: any) => {
      return sum + (Array.isArray(layer) ? layer.length : 0);
    }, 0) as number;
    
    if (totalLayers <= 2) return 'Minimal layering for simplicity and comfort';
    if (totalLayers <= 4) return 'Light layering for versatility and style';
    return 'Strategic layering for weather protection and visual interest';
  }

  private suggestAccessories(items: WardrobeItem[], context: AIOutfitContext) {
    // This would suggest accessories based on the outfit and context
    const currentAccessories = items.filter(item => 
      ['accessory', 'jewelry', 'bag', 'belt', 'hat', 'scarf'].some(acc => 
        item.category.toLowerCase().includes(acc)
      )
    );

    return {
      recommended: currentAccessories,
      optional: [],
      alternatives: [],
      reasoning: 'Current accessories complement the outfit well'
    };
  }

  private generateStylingTips(items: WardrobeItem[], context: AIOutfitContext) {
    const tips = {
      proportions: ['Balance fitted and loose pieces for visual interest'],
      colorBalance: ['Use the 60-30-10 rule: dominant, secondary, and accent colors'],
      texturePlay: ['Mix different textures to add depth and sophistication'],
      fitAdjustments: ['Ensure proper fit - it makes the biggest difference'],
      confidenceBoosts: ['Wear what makes you feel comfortable and authentic']
    };

    return tips;
  }

  private determineOccasions(items: WardrobeItem[]): string[] {
    const occasions = [...new Set(items.map(item => item.occasion).filter(Boolean))];
    return occasions.length > 0 ? occasions : ['casual'];
  }

  private determineSeasons(items: WardrobeItem[]): string[] {
    const seasons = [...new Set(items.flatMap(item => 
      Array.isArray(item.season) ? item.season : [item.season]
    ).filter(Boolean))];
    return seasons.length > 0 ? seasons : ['all-season'];
  }

  private calculateWeatherRange(items: WardrobeItem[]) {
    // Calculate appropriate temperature range for outfit
    let minTemp = 10;
    let maxTemp = 30;

    const hasWarmItems = items.some(item => 
      ['coat', 'jacket', 'sweater', 'boot', 'wool'].some(warm => 
        item.name.toLowerCase().includes(warm) || item.material?.toLowerCase().includes(warm)
      )
    );

    const hasCoolItems = items.some(item => 
      ['short', 'tank', 'sandal', 'linen', 'cotton'].some(cool => 
        item.name.toLowerCase().includes(cool) || item.material?.toLowerCase().includes(cool)
      )
    );

    if (hasWarmItems) maxTemp = 20;
    if (hasCoolItems) minTemp = 20;

    return {
      minTemp,
      maxTemp,
      conditions: ['clear', 'cloudy'],
      adaptations: ['Add or remove layers as needed']
    };
  }

  private async analyzeOutfits(outfits: EnhancedOutfit[], context: AIOutfitContext): Promise<Array<EnhancedOutfit & { analysis: AIAnalysis }>> {
    const analyzed = await Promise.all(outfits.map(async outfit => ({
      ...outfit,
      analysis: await this.performAIAnalysis(outfit, context)
    })));

    return analyzed;
  }

  private async performAIAnalysis(outfit: EnhancedOutfit, context: AIOutfitContext): Promise<AIAnalysis> {
    // Comprehensive AI analysis of the outfit
    const styleConsistency = this.styleAnalyzer.analyzeStyleConsistency(outfit.items);
    const colorHarmony = this.colorEngine.analyzeOutfitColors(outfit.items);
    const weatherAppropriatenss = this.weatherMatcher.analyzeWeatherSuitability(outfit.items, context.weather);
    
    // Additional analyses
    const occasionFit = this.analyzeOccasionFit(outfit, context);
    const comfortLevel = this.analyzeComfortLevel(outfit, context);
    const trendiness = this.analyzeTrendiness(outfit);
    const sustainability = this.analyzeSustainability(outfit);
    const versatility = this.analyzeVersatility(outfit);

    return {
      styleConsistency,
      colorHarmony,
      weatherAppropriatenss,
      occasionFit,
      comfortLevel,
      trendiness,
      sustainability,
      versatility
    };
  }

  private analyzeOccasionFit(outfit: EnhancedOutfit, context: AIOutfitContext) {
    let score = 50;
    const factors: Array<{ name: string; impact: number; description: string }> = [];

    const occasionMatches = outfit.items.filter(item => item.occasion === context.occasion).length;
    const occasionScore = (occasionMatches / outfit.items.length) * 50;
    score += occasionScore;

    factors.push({
      name: 'Occasion Alignment',
      impact: occasionScore,
      description: `${Math.round((occasionMatches / outfit.items.length) * 100)}% of items match the occasion`
    });

    return {
      score: Math.min(100, score),
      reasoning: `Outfit is ${score > 70 ? 'well' : score > 40 ? 'adequately' : 'poorly'} suited for ${context.occasion}`,
      factors
    };
  }

  private analyzeComfortLevel(outfit: EnhancedOutfit, context: AIOutfitContext) {
    let score = 70; // Base comfort score
    const factors: Array<{ name: string; impact: number; description: string }> = [];

    // Material comfort
    const comfortableMaterials = ['cotton', 'modal', 'bamboo', 'soft'];
    const materialComfort = outfit.items.filter(item => 
      comfortableMaterials.some(material => 
        item.material?.toLowerCase().includes(material)
      )
    ).length;

    const materialScore = (materialComfort / outfit.items.length) * 20;
    score += materialScore;
    factors.push({
      name: 'Material Comfort',
      impact: materialScore,
      description: 'Comfortable, breathable materials'
    });

    return {
      score: Math.min(100, score),
      reasoning: 'Outfit prioritizes comfort and wearability',
      factors
    };
  }

  private analyzeTrendiness(outfit: EnhancedOutfit) {
    // Simplified trendiness analysis
    const score = Math.floor(Math.random() * 30) + 60; // 60-90

    return {
      currentRelevance: score,
      timelessness: 100 - score + 20,
      viralPotential: Math.floor(Math.random() * 40) + 30,
      seasonalTrend: 'current',
      influencerAlignment: score - 10
    };
  }

  private analyzeSustainability(outfit: EnhancedOutfit) {
    let overallScore = 70;
    
    const factors = {
      longevity: 75,
      versatility: 80,
      qualityScore: 70,
      brandEthics: 65,
      materialSustainability: 75
    };

    return {
      overallScore,
      factors,
      improvements: ['Consider natural fiber alternatives', 'Invest in timeless pieces']
    };
  }

  private analyzeVersatility(outfit: EnhancedOutfit) {
    const score = 75;
    const occasionRange = outfit.occasions;
    const seasonRange = outfit.seasons;
    const mixMatchPotential = 80;
    const investmentValue = 70;

    return {
      score,
      occasionRange,
      seasonRange,
      mixMatchPotential,
      investmentValue
    };
  }

  private selectBestOutfit(scoredOutfits: Array<EnhancedOutfit & { analysis: AIAnalysis }>): EnhancedOutfit & { analysis: AIAnalysis } {
    // Calculate overall scores and select the best one
    const withOverallScores = scoredOutfits.map(outfit => ({
      ...outfit,
      overallScore: this.calculateOverallScore(outfit.analysis)
    }));

    withOverallScores.sort((a, b) => b.overallScore - a.overallScore);
    return withOverallScores[0];
  }

  private calculateOverallScore(analysis: AIAnalysis): number {
    const weights = {
      styleConsistency: 0.25,
      colorHarmony: 0.2,
      weatherAppropriatenss: 0.2,
      occasionFit: 0.15,
      comfortLevel: 0.1,
      sustainability: 0.1
    };

    let score = 0;
    score += analysis.styleConsistency.score * weights.styleConsistency;
    score += analysis.colorHarmony.harmony.score * weights.colorHarmony;
    score += analysis.weatherAppropriatenss.score * weights.weatherAppropriatenss;
    score += analysis.occasionFit.score * weights.occasionFit;
    score += analysis.comfortLevel.score * weights.comfortLevel;
    score += analysis.sustainability.overallScore * weights.sustainability;

    return score;
  }

  private async createComprehensiveRecommendation(
    bestOutfit: EnhancedOutfit & { analysis: AIAnalysis },
    context: AIOutfitContext
  ): Promise<AIOutfitRecommendation> {
    const personalizedInsights = this.generatePersonalizedInsights(bestOutfit, context);
    const improvements = this.generateImprovementSuggestions(bestOutfit, context);
    const confidence = this.calculateAIConfidence(bestOutfit, context);

    return {
      outfit: bestOutfit,
      aiAnalysis: bestOutfit.analysis,
      personalizedInsights,
      improvements,
      confidence
    };
  }

  private generatePersonalizedInsights(
    outfit: EnhancedOutfit & { analysis: AIAnalysis },
    context: AIOutfitContext
  ): PersonalizedInsights {
    return {
      styleGrowth: {
        experimentation: ['Try mixing textures for visual interest'],
        comfort: ['This outfit aligns well with your comfort preferences'],
        newDirections: ['Consider exploring similar color combinations'],
        skillBuilding: ['Practice layering techniques for versatility']
      },
      wardrobe: {
        gaps: [],
        overuse: [],
        underuse: [],
        costPerWear: []
      },
      preferences: {
        discovered: [],
        evolving: [],
        stable: ['Classic color preferences', 'Comfort-focused choices']
      },
      recommendations: {
        immediate: [{
          action: 'Wear this outfit',
          description: 'Perfect for today\'s weather and occasion',
          expectedBenefit: 'Confidence and comfort',
          difficulty: 'easy',
          timeline: 'now'
        }],
        shortTerm: [],
        longTerm: []
      }
    };
  }

  private generateImprovementSuggestions(
    outfit: EnhancedOutfit & { analysis: AIAnalysis },
    context: AIOutfitContext
  ): ImprovementSuggestions {
    return {
      quickFixes: [{
        change: 'Add a statement accessory',
        impact: 'Elevate the overall look',
        effort: 'minimal'
      }],
      upgrades: [],
      alternatives: [],
      longTermGoals: [{
        goal: 'Build a capsule wardrobe',
        steps: ['Identify core pieces', 'Focus on versatile items', 'Invest in quality'],
        timeline: '6-12 months',
        expectedOutcome: 'More efficient and stylish wardrobe'
      }]
    };
  }

  private calculateAIConfidence(
    outfit: EnhancedOutfit & { analysis: AIAnalysis },
    context: AIOutfitContext
  ): AIConfidence {
    const overall = this.calculateOverallScore(outfit.analysis);
    
    return {
      overall,
      factors: {
        dataQuality: 85,
        matchAccuracy: overall,
        personalization: 75,
        seasonalRelevance: 80
      },
      uncertainty: {
        limitedData: [],
        assumptions: ['Style preferences inferred from wardrobe'],
        variability: ['Weather conditions may change']
      }
    };
  }
}

interface OutfitTemplate {
  name: string;
  requiredCategories: string[];
  optionalCategories: string[];
  layeringStrategy: string;
}

export const outfitAI = new OutfitAI();