/**
 * MyDresser AI Engine - Original IP
 * Advanced AI-powered fashion recommendations and analysis
 */

import { OutfitAI } from '@/ai/OutfitAI';
import { StyleAnalyzer } from '@/ai/StyleAnalyzer';
import { ColorHarmonyEngine } from '@/ai/ColorHarmonyEngine';
import { WeatherMatcher } from '@/ai/WeatherMatcher';

interface FashionTrend {
  id: string;
  name: string;
  popularity: number;
  season: string;
  colors: string[];
  styles: string[];
  occasions: string[];
  confidence: number;
}

interface PersonalStyleProfile {
  primaryStyle: string;
  secondaryStyle: string;
  colorPalette: string[];
  preferredBrands: string[];
  bodyType: string;
  lifestyle: string;
  budget: 'low' | 'medium' | 'high';
  sustainabilityScore: number;
  versatilityPreference: number;
}

interface SmartRecommendation {
  type: 'outfit' | 'item' | 'style_tip' | 'trend_alert';
  title: string;
  description: string;
  confidence: number;
  reasoning: string[];
  actionable: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string;
  tags: string[];
}

class MyDresserAIEngine {
  private outfitAI: OutfitAI;
  private styleAnalyzer: StyleAnalyzer;
  private colorEngine: ColorHarmonyEngine;
  private weatherMatcher: WeatherMatcher;
  private trends: FashionTrend[] = [];
  private initialized = false;

  constructor() {
    this.outfitAI = new OutfitAI();
    this.styleAnalyzer = new StyleAnalyzer();
    this.colorEngine = new ColorHarmonyEngine();
    this.weatherMatcher = new WeatherMatcher();
    this.initializeTrendDatabase();
  }

  private initializeTrendDatabase() {
    // Initialize with current fashion trends (original MyDresser data)
    this.trends = [
      {
        id: 'minimalist-chic',
        name: 'Minimalist Chic',
        popularity: 85,
        season: 'all-season',
        colors: ['black', 'white', 'gray', 'beige', 'navy'],
        styles: ['minimalist', 'classic', 'modern'],
        occasions: ['business', 'casual', 'evening'],
        confidence: 0.92
      },
      {
        id: 'sustainable-fashion',
        name: 'Sustainable Fashion',
        popularity: 78,
        season: 'all-season',
        colors: ['earth-tones', 'natural', 'green', 'brown'],
        styles: ['bohemian', 'casual', 'artisan'],
        occasions: ['casual', 'outdoor', 'creative'],
        confidence: 0.89
      },
      {
        id: 'tech-wear',
        name: 'Tech Wear',
        popularity: 72,
        season: 'fall',
        colors: ['black', 'gray', 'neon', 'metallic'],
        styles: ['futuristic', 'urban', 'sporty'],
        occasions: ['casual', 'outdoor', 'creative'],
        confidence: 0.85
      }
    ];
    this.initialized = true;
  }

  async generatePersonalStyleProfile(wardrobeItems: any[], preferences: any = {}): Promise<PersonalStyleProfile> {
    const styleAnalysis = await this.styleAnalyzer.analyzePersonalStyle(wardrobeItems, preferences);
    const colorAnalysis = this.colorEngine.analyzeOutfitColors(wardrobeItems);

    return {
      primaryStyle: (styleAnalysis as any)?.primaryStyle || 'classic',
      secondaryStyle: (styleAnalysis as any)?.secondaryStyle || 'casual',
      colorPalette: (colorAnalysis as any)?.dominantColors || ['black', 'white', 'gray'],
      preferredBrands: this.extractPreferredBrands(wardrobeItems),
      bodyType: preferences.bodyType || 'average',
      lifestyle: this.inferLifestyle(wardrobeItems),
      budget: this.inferBudgetRange(wardrobeItems),
      sustainabilityScore: this.calculateSustainabilityScore(wardrobeItems),
      versatilityPreference: (styleAnalysis as any)?.versatility || 0.7
    };
  }

  async generateSmartRecommendations(
    wardrobeItems: any[],
    styleProfile: PersonalStyleProfile,
    context: any = {}
  ): Promise<SmartRecommendation[]> {
    const recommendations: SmartRecommendation[] = [];

    // Outfit recommendations
    const outfitRecs = await this.generateOutfitRecommendations(wardrobeItems, context);
    recommendations.push(...outfitRecs);

    // Style improvement tips
    const styleTips = this.generateStyleTips(wardrobeItems, styleProfile);
    recommendations.push(...styleTips);

    // Trend alerts
    const trendAlerts = this.generateTrendAlerts(styleProfile);
    recommendations.push(...trendAlerts);

    // Gap analysis
    const gapAnalysis = this.analyzeWardrobeGaps(wardrobeItems, styleProfile);
    recommendations.push(...gapAnalysis);

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority] || b.confidence - a.confidence;
    });
  }

  private async generateOutfitRecommendations(
    wardrobeItems: any[],
    context: any
  ): Promise<SmartRecommendation[]> {
    const recommendations: SmartRecommendation[] = [];
    
    try {
      const outfitSuggestion = await this.outfitAI.generateOutfitRecommendation(wardrobeItems, context);
      
      recommendations.push({
        type: 'outfit',
        title: `Perfect ${context.occasion || 'Daily'} Outfit`,
        description: (outfitSuggestion as any)?.reasoning || 'AI-curated outfit based on your style and weather',
        confidence: typeof (outfitSuggestion as any)?.confidence === 'number' ? (outfitSuggestion as any).confidence : 0.8,
        reasoning: (outfitSuggestion as any)?.stylingTips || ['Smart AI recommendations based on your wardrobe'],
        actionable: true,
        priority: 'high',
        category: 'daily_suggestion',
        tags: ['outfit', 'ai-generated', context.occasion || 'casual']
      });
    } catch (error) {
      console.error('Error generating outfit recommendations:', error);
    }

    return recommendations;
  }

  private generateStyleTips(wardrobeItems: any[], styleProfile: PersonalStyleProfile): SmartRecommendation[] {
    const tips: SmartRecommendation[] = [];

    // Color harmony tips
    if (styleProfile.colorPalette.length > 5) {
      tips.push({
        type: 'style_tip',
        title: 'Simplify Your Color Palette',
        description: 'You have many colors in your wardrobe. Focus on 3-4 core colors for better coordination.',
        confidence: 0.8,
        reasoning: ['Too many colors can make outfit coordination difficult', 'Fewer colors = more versatile combinations'],
        actionable: true,
        priority: 'medium',
        category: 'color_coordination',
        tags: ['color', 'simplification', 'versatility']
      });
    }

    // Versatility analysis
    const versatileItems = wardrobeItems.filter(item => 
      item.occasion?.includes('versatile') || 
      item.tags?.includes('versatile') ||
      item.category === 'basics'
    );

    if (versatileItems.length < wardrobeItems.length * 0.3) {
      tips.push({
        type: 'style_tip',
        title: 'Invest in Versatile Basics',
        description: 'Add more versatile pieces that work for multiple occasions and styles.',
        confidence: 0.85,
        reasoning: ['Versatile pieces maximize outfit combinations', 'Better cost per wear', 'Easier daily styling'],
        actionable: true,
        priority: 'high',
        category: 'wardrobe_building',
        tags: ['basics', 'versatility', 'investment']
      });
    }

    return tips;
  }

  private generateTrendAlerts(styleProfile: PersonalStyleProfile): SmartRecommendation[] {
    const alerts: SmartRecommendation[] = [];
    
    // Match user style with trending styles
    const matchingTrends = this.trends.filter(trend => 
      trend.styles.includes(styleProfile.primaryStyle) ||
      trend.styles.includes(styleProfile.secondaryStyle)
    );

    matchingTrends.forEach(trend => {
      alerts.push({
        type: 'trend_alert',
        title: `${trend.name} is Trending`,
        description: `This trend matches your ${styleProfile.primaryStyle} style with ${trend.popularity}% popularity.`,
        confidence: trend.confidence,
        reasoning: [`Matches your personal style`, `${trend.popularity}% popularity score`, `Suitable for your lifestyle`],
        actionable: true,
        priority: trend.popularity > 80 ? 'high' : 'medium',
        category: 'trends',
        tags: ['trending', trend.name.toLowerCase().replace(/\s+/g, '_')]
      });
    });

    return alerts;
  }

  private analyzeWardrobeGaps(wardrobeItems: any[], styleProfile: PersonalStyleProfile): SmartRecommendation[] {
    const gaps: SmartRecommendation[] = [];
    
    // Analyze category distribution
    const categories = wardrobeItems.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const essentialCategories = ['tops', 'bottoms', 'shoes', 'outerwear'];
    const missingCategories = essentialCategories.filter(cat => !categories[cat] || categories[cat] < 2);

    missingCategories.forEach(category => {
      gaps.push({
        type: 'item',
        title: `Missing ${category.charAt(0).toUpperCase() + category.slice(1)}`,
        description: `Your wardrobe could benefit from more ${category} to complete your ${styleProfile.primaryStyle} style.`,
        confidence: 0.75,
        reasoning: [`Essential category for complete wardrobe`, `Matches your ${styleProfile.primaryStyle} style`],
        actionable: true,
        priority: 'medium',
        category: 'wardrobe_gaps',
        tags: ['gap_analysis', category, 'essential']
      });
    });

    return gaps;
  }

  private extractPreferredBrands(items: any[]): string[] {
    const brandCounts = items.reduce((acc, item) => {
      if (item.brand && typeof item.brand === 'string') {
        acc[item.brand] = (acc[item.brand] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(brandCounts)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([brand]) => brand);
  }

  private inferLifestyle(items: any[]): string {
    const allOccasions = items.flatMap(item => {
      const occasions = (item.occasion || '').split(',').filter(Boolean);
      return occasions;
    });
    
    const businessCount = allOccasions.filter(occ => occ.includes('business') || occ.includes('formal')).length;
    const casualCount = allOccasions.filter(occ => occ.includes('casual')).length;
    const activeCount = allOccasions.filter(occ => occ.includes('sport') || occ.includes('active')).length;

    if (businessCount > casualCount && businessCount > activeCount) return 'professional';
    if (activeCount > casualCount) return 'active';
    return 'casual';
  }

  private inferBudgetRange(items: any[]): 'low' | 'medium' | 'high' {
    const prices = items
      .filter(item => item.purchase_price && !isNaN(Number(item.purchase_price)))
      .map(item => Number(item.purchase_price));
    if (prices.length === 0) return 'medium';

    const averagePrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    
    if (averagePrice < 50) return 'low';
    if (averagePrice > 150) return 'high';
    return 'medium';
  }

  private calculateSustainabilityScore(items: any[]): number {
    let score = 0;
    let factors = 0;

    items.forEach(item => {
      factors++;
      
      // Quality and durability
      if (item.condition === 'excellent') score += 0.3;
      else if (item.condition === 'good') score += 0.2;
      else score += 0.1;

      // Sustainable materials
      const sustainableMaterials = ['organic cotton', 'bamboo', 'hemp', 'recycled', 'eco'];
      if (sustainableMaterials.some(mat => item.material?.toLowerCase().includes(mat))) {
        score += 0.2;
      }

      // Versatility (reusability)
      const occasions = (item.occasion || '').split(',').filter(Boolean);
      if (item.tags?.includes('versatile') || occasions.includes('versatile')) {
        score += 0.1;
      }
    });

    return factors > 0 ? Math.min(score / factors, 1) : 0.5;
  }

  async predictFashionTrends(wardrobeData: any[], marketData: any[] = []): Promise<FashionTrend[]> {
    // Analyze current wardrobe trends
    const currentTrends = this.analyzeTrendsFromWardrobe(wardrobeData);
    
    // Combine with market data if available
    const marketTrends = this.analyzeTrendsFromMarket(marketData);
    
    // Generate predictions
    return this.generateTrendPredictions([...currentTrends, ...marketTrends]);
  }

  private analyzeTrendsFromWardrobe(wardrobeData: any[]): Partial<FashionTrend>[] {
    const trends: Partial<FashionTrend>[] = [];
    
    // Color trends
    const colorFrequency = wardrobeData.reduce((acc, item) => {
      if (item.color) {
        acc[item.color] = (acc[item.color] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const popularColors = Object.entries(colorFrequency)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 3)
      .map(([color]) => color);

    if (popularColors.length > 0) {
      trends.push({
        name: 'Popular Color Palette',
        colors: popularColors,
        popularity: 70,
        confidence: 0.8
      });
    }

    return trends;
  }

  private analyzeTrendsFromMarket(marketData: any[]): Partial<FashionTrend>[] {
    // Analyze market item trends, categories, etc.
    return [];
  }

  private generateTrendPredictions(trendData: Partial<FashionTrend>[]): FashionTrend[] {
    // Combine and enhance trend data with predictions
    return this.trends; // Return current trends for now
  }
}

export const myDresserAI = new MyDresserAIEngine();
export type { PersonalStyleProfile, SmartRecommendation, FashionTrend };