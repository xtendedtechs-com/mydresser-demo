import { WardrobeItem } from '@/hooks/useWardrobe';
import { StylePersonality, DetailedScore, UserStyleProfile } from './types';

export class StyleAnalyzer {
  private styleProfiles: Map<string, StyleProfile> = new Map();
  private brandTiers: Map<string, BrandTier> = new Map();
  private categoryWeights: Map<string, number> = new Map();

  constructor() {
    this.initializeStyleSystem();
  }

  private initializeStyleSystem(): void {
    this.setupStyleProfiles();
    this.setupBrandTiers();
    this.setupCategoryWeights();
  }

  private setupStyleProfiles(): void {
    const profiles: Record<string, StyleProfile> = {
      minimalist: {
        characteristics: ['clean lines', 'neutral colors', 'quality over quantity', 'timeless pieces'],
        preferredCategories: ['basics', 'blazers', 'trousers', 'simple dresses'],
        avoidedElements: ['excessive patterns', 'bright colors', 'ornate details'],
        colorPalette: ['white', 'black', 'gray', 'beige', 'navy', 'camel'],
        occasions: ['work', 'casual', 'formal'],
        formality: 70,
        boldness: 20,
        creativity: 30
      },
      
      bohemian: {
        characteristics: ['flowing fabrics', 'ethnic patterns', 'layered textures', 'artistic flair'],
        preferredCategories: ['maxi dresses', 'kimonos', 'wide-leg pants', 'peasant tops'],
        avoidedElements: ['structured pieces', 'corporate wear', 'synthetic materials'],
        colorPalette: ['earth tones', 'jewel tones', 'rust', 'turquoise', 'burgundy'],
        occasions: ['casual', 'festival', 'creative work'],
        formality: 30,
        boldness: 70,
        creativity: 90
      },
      
      classic: {
        characteristics: ['traditional cuts', 'quality fabrics', 'polished appearance', 'timeless elegance'],
        preferredCategories: ['blazers', 'pencil skirts', 'button-down shirts', 'pearls'],
        avoidedElements: ['trendy pieces', 'casual wear', 'edgy styles'],
        colorPalette: ['navy', 'white', 'cream', 'camel', 'black', 'pastels'],
        occasions: ['work', 'formal', 'social events'],
        formality: 85,
        boldness: 40,
        creativity: 35
      },
      
      edgy: {
        characteristics: ['asymmetrical cuts', 'dark colors', 'leather/metal details', 'avant-garde'],
        preferredCategories: ['leather jackets', 'ripped jeans', 'platform shoes', 'statement accessories'],
        avoidedElements: ['pastels', 'floral patterns', 'conservative cuts'],
        colorPalette: ['black', 'dark gray', 'burgundy', 'metallic', 'white'],
        occasions: ['nightlife', 'creative work', 'concerts'],
        formality: 25,
        boldness: 95,
        creativity: 85
      },
      
      romantic: {
        characteristics: ['soft fabrics', 'feminine details', 'floral patterns', 'delicate textures'],
        preferredCategories: ['flowy dresses', 'lace tops', 'cardigans', 'ballet flats'],
        avoidedElements: ['harsh lines', 'dark colors', 'masculine cuts'],
        colorPalette: ['pink', 'lavender', 'cream', 'rose', 'soft blue', 'peach'],
        occasions: ['dates', 'brunches', 'social events'],
        formality: 60,
        boldness: 35,
        creativity: 50
      },
      
      sporty: {
        characteristics: ['functional design', 'comfortable fit', 'athletic materials', 'casual ease'],
        preferredCategories: ['sneakers', 'joggers', 'hoodies', 'athletic wear'],
        avoidedElements: ['formal wear', 'heels', 'restrictive clothing'],
        colorPalette: ['navy', 'white', 'gray', 'black', 'bright accents'],
        occasions: ['casual', 'exercise', 'weekend'],
        formality: 20,
        boldness: 45,
        creativity: 40
      },
      
      trendy: {
        characteristics: ['current fashion', 'statement pieces', 'social media worthy', 'experimental'],
        preferredCategories: ['latest styles', 'statement accessories', 'unique pieces'],
        avoidedElements: ['basic items', 'timeless pieces', 'conservative styles'],
        colorPalette: ['seasonal colors', 'bold combinations', 'trending hues'],
        occasions: ['social media', 'parties', 'fashion events'],
        formality: 50,
        boldness: 80,
        creativity: 95
      }
    };

    Object.entries(profiles).forEach(([name, profile]) => {
      this.styleProfiles.set(name, profile);
    });
  }

  private setupBrandTiers(): void {
    const brands: Record<string, BrandTier> = {
      // Luxury
      'chanel': { tier: 'luxury', priceRange: 'high', styleProfile: 'classic', quality: 95 },
      'gucci': { tier: 'luxury', priceRange: 'high', styleProfile: 'trendy', quality: 90 },
      'prada': { tier: 'luxury', priceRange: 'high', styleProfile: 'minimalist', quality: 93 },
      'hermès': { tier: 'luxury', priceRange: 'high', styleProfile: 'classic', quality: 98 },
      
      // Premium
      'cos': { tier: 'premium', priceRange: 'medium-high', styleProfile: 'minimalist', quality: 85 },
      'arket': { tier: 'premium', priceRange: 'medium-high', styleProfile: 'minimalist', quality: 82 },
      'everlane': { tier: 'premium', priceRange: 'medium', styleProfile: 'minimalist', quality: 80 },
      'reformation': { tier: 'premium', priceRange: 'medium-high', styleProfile: 'trendy', quality: 78 },
      
      // Mid-range
      'zara': { tier: 'mid-range', priceRange: 'medium', styleProfile: 'trendy', quality: 65 },
      'mango': { tier: 'mid-range', priceRange: 'medium', styleProfile: 'classic', quality: 68 },
      'massimo dutti': { tier: 'mid-range', priceRange: 'medium', styleProfile: 'classic', quality: 72 },
      
      // Accessible
      'uniqlo': { tier: 'accessible', priceRange: 'low-medium', styleProfile: 'minimalist', quality: 75 },
      'h&m': { tier: 'accessible', priceRange: 'low', styleProfile: 'trendy', quality: 50 },
      'gap': { tier: 'accessible', priceRange: 'low-medium', styleProfile: 'classic', quality: 60 }
    };

    Object.entries(brands).forEach(([name, brand]) => {
      this.brandTiers.set(name.toLowerCase(), brand);
    });
  }

  private setupCategoryWeights(): void {
    // Weight importance of categories for style analysis
    const weights: Record<string, number> = {
      'outerwear': 0.25,
      'blazers': 0.2,
      'dresses': 0.2,
      'tops': 0.15,
      'bottoms': 0.15,
      'shoes': 0.1,
      'accessories': 0.05
    };

    Object.entries(weights).forEach(([category, weight]) => {
      this.categoryWeights.set(category, weight);
    });
  }

  public analyzePersonalStyle(items: WardrobeItem[], userPreferences?: UserStyleProfile): StylePersonality {
    const styleScores = new Map<string, number>();
    
    // Analyze each style profile
    this.styleProfiles.forEach((profile, styleName) => {
      const score = this.calculateStyleAlignment(items, profile);
      styleScores.set(styleName, score);
    });

    // Find primary style
    const sortedStyles = Array.from(styleScores.entries()).sort((a, b) => b[1] - a[1]);
    const primary = sortedStyles[0][0] as StylePersonality['primary'];
    
    // Determine secondary style if significantly different
    let secondary: string | undefined;
    if (sortedStyles.length > 1 && sortedStyles[1][1] > sortedStyles[0][1] * 0.7) {
      secondary = sortedStyles[1][0];
    }

    // Calculate style characteristics
    const confidence = this.calculateStyleConfidence(items, styleScores);
    const experimentalness = this.calculateExperimentalness(items);
    const formality = this.calculateFormality(items);
    const colorfulness = this.calculateColorfulness(items);

    return {
      primary,
      secondary,
      confidence,
      experimentalness,
      formality,
      colorfulness
    };
  }

  private calculateStyleAlignment(items: WardrobeItem[], profile: StyleProfile): number {
    let score = 0;
    let totalWeight = 0;

    items.forEach(item => {
      const categoryWeight = this.categoryWeights.get(item.category.toLowerCase()) || 0.1;
      totalWeight += categoryWeight;

      // Category alignment
      const categoryScore = this.calculateCategoryAlignment(item, profile);
      
      // Color alignment
      const colorScore = this.calculateColorAlignment(item, profile);
      
      // Brand alignment
      const brandScore = this.calculateBrandAlignment(item, profile);

      // Combine scores
      const itemScore = (categoryScore * 0.5) + (colorScore * 0.3) + (brandScore * 0.2);
      score += itemScore * categoryWeight;
    });

    return totalWeight > 0 ? (score / totalWeight) * 100 : 0;
  }

  private calculateCategoryAlignment(item: WardrobeItem, profile: StyleProfile): number {
    const category = item.category.toLowerCase();
    const name = item.name.toLowerCase();
    
    // Check preferred categories
    const preferredMatch = profile.preferredCategories.some(preferred => 
      category.includes(preferred.toLowerCase()) || name.includes(preferred.toLowerCase())
    );
    
    if (preferredMatch) return 80;

    // Check avoided elements
    const avoidedMatch = profile.avoidedElements.some(avoided => 
      name.includes(avoided.toLowerCase()) || 
      (item.material && item.material.toLowerCase().includes(avoided.toLowerCase()))
    );
    
    if (avoidedMatch) return 20;

    return 50; // Neutral
  }

  private calculateColorAlignment(item: WardrobeItem, profile: StyleProfile): number {
    if (!item.color) return 50;
    
    const color = item.color.toLowerCase();
    const paletteMatch = profile.colorPalette.some(paletteColor => 
      color.includes(paletteColor.toLowerCase())
    );
    
    return paletteMatch ? 85 : 40;
  }

  private calculateBrandAlignment(item: WardrobeItem, profile: StyleProfile): number {
    if (!item.brand) return 50;
    
    const brandInfo = this.brandTiers.get(item.brand.toLowerCase());
    if (!brandInfo) return 50;

    // Different style profiles prefer different brand characteristics
    const alignmentMap: Record<string, number> = {
      minimalist: brandInfo.tier === 'premium' || brandInfo.tier === 'luxury' ? 80 : 60,
      bohemian: brandInfo.tier === 'accessible' ? 70 : 50,
      classic: brandInfo.tier === 'luxury' || brandInfo.tier === 'premium' ? 85 : 65,
      edgy: brandInfo.styleProfile === 'edgy' ? 90 : 45,
      romantic: brandInfo.styleProfile === 'romantic' ? 85 : 55,
      sporty: brandInfo.styleProfile === 'sporty' ? 80 : 40,
      trendy: brandInfo.tier === 'mid-range' ? 75 : 60
    };

    return alignmentMap[profile.characteristics[0]] || 50;
  }

  private calculateStyleConfidence(items: WardrobeItem[], styleScores: Map<string, number>): number {
    const scores = Array.from(styleScores.values());
    const maxScore = Math.max(...scores);
    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    // Confidence is higher when there's a clear dominant style
    const dominance = maxScore - avgScore;
    return Math.min(100, 50 + dominance);
  }

  private calculateExperimentalness(items: WardrobeItem[]): number {
    let experimentalIndicators = 0;
    let totalItems = items.length;

    items.forEach(item => {
      const name = item.name.toLowerCase();
      const experimental = [
        'statement', 'bold', 'unique', 'unusual', 'avant-garde', 
        'experimental', 'artistic', 'unconventional'
      ];
      
      if (experimental.some(keyword => name.includes(keyword))) {
        experimentalIndicators++;
      }
      
      // Unusual color combinations
      if (item.color && ['neon', 'electric', 'metallic', 'holographic'].some(special => 
        item.color!.toLowerCase().includes(special))) {
        experimentalIndicators += 0.5;
      }
    });

    return Math.min(100, (experimentalIndicators / Math.max(totalItems, 1)) * 100);
  }

  private calculateFormality(items: WardrobeItem[]): number {
    let formalityScore = 0;
    let totalWeight = 0;

    const formalityMap: Record<string, number> = {
      'suit': 95,
      'blazer': 85,
      'dress shirt': 80,
      'pencil skirt': 75,
      'dress pants': 70,
      'blouse': 65,
      'dress': 60,
      'cardigan': 55,
      'jeans': 30,
      't-shirt': 20,
      'hoodie': 15,
      'sneakers': 25,
      'athletic wear': 10
    };

    items.forEach(item => {
      const weight = this.categoryWeights.get(item.category.toLowerCase()) || 0.1;
      totalWeight += weight;
      
      let itemFormality = 40; // Default
      const name = item.name.toLowerCase();
      
      Object.entries(formalityMap).forEach(([keyword, score]) => {
        if (name.includes(keyword)) {
          itemFormality = Math.max(itemFormality, score);
        }
      });

      formalityScore += itemFormality * weight;
    });

    return totalWeight > 0 ? formalityScore / totalWeight : 40;
  }

  private calculateColorfulness(items: WardrobeItem[]): number {
    const colors = items.map(item => item.color?.toLowerCase()).filter(Boolean);
    const neutrals = ['white', 'black', 'gray', 'grey', 'beige', 'brown', 'navy', 'tan'];
    
    const colorfulColors = colors.filter(color => 
      !neutrals.some(neutral => color!.includes(neutral))
    );

    const colorfulnessRatio = colorfulColors.length / Math.max(colors.length, 1);
    return Math.min(100, colorfulnessRatio * 100);
  }

  public analyzeStyleConsistency(items: WardrobeItem[]): DetailedScore {
    const personalStyle = this.analyzePersonalStyle(items);
    const primaryProfile = this.styleProfiles.get(personalStyle.primary);
    
    if (!primaryProfile) {
      return {
        score: 50,
        reasoning: 'Unable to determine clear style profile',
        factors: []
      };
    }

    let consistencyScore = personalStyle.confidence;
    const factors: Array<{ name: string; impact: number; description: string }> = [];

    // Brand consistency
    const brandConsistency = this.analyzeBrandConsistency(items);
    consistencyScore += brandConsistency * 0.2;
    factors.push({
      name: 'Brand Consistency',
      impact: brandConsistency * 0.2,
      description: 'How well brands align with style profile'
    });

    // Color consistency
    const colorConsistency = this.analyzeColorConsistency(items, primaryProfile);
    consistencyScore += colorConsistency * 0.3;
    factors.push({
      name: 'Color Consistency',
      impact: colorConsistency * 0.3,
      description: 'Color choices match style personality'
    });

    // Category mix appropriateness
    const categoryMix = this.analyzeCategoryMix(items, primaryProfile);
    consistencyScore += categoryMix * 0.2;
    factors.push({
      name: 'Category Balance',
      impact: categoryMix * 0.2,
      description: 'Good mix of clothing categories for style'
    });

    return {
      score: Math.min(100, Math.max(0, consistencyScore)),
      reasoning: this.generateConsistencyReasoning(personalStyle, factors),
      factors
    };
  }

  private analyzeBrandConsistency(items: WardrobeItem[]): number {
    const brands = items.map(item => item.brand?.toLowerCase()).filter(Boolean);
    const brandTiers = [...new Set(brands.map(brand => this.brandTiers.get(brand!)?.tier))].filter(Boolean);
    
    // Consistent tier = higher score
    if (brandTiers.length <= 2) return 80;
    if (brandTiers.length === 3) return 60;
    return 40;
  }

  private analyzeColorConsistency(items: WardrobeItem[], profile: StyleProfile): number {
    const colors = items.map(item => item.color?.toLowerCase()).filter(Boolean);
    const paletteMatches = colors.filter(color => 
      profile.colorPalette.some(paletteColor => color!.includes(paletteColor.toLowerCase()))
    );
    
    return (paletteMatches.length / Math.max(colors.length, 1)) * 100;
  }

  private analyzeCategoryMix(items: WardrobeItem[], profile: StyleProfile): number {
    const categories = [...new Set(items.map(item => item.category.toLowerCase()))];
    const expectedCategories = profile.preferredCategories.map(cat => cat.toLowerCase());
    
    const overlap = categories.filter(cat => 
      expectedCategories.some(expected => cat.includes(expected) || expected.includes(cat))
    );
    
    return (overlap.length / Math.max(expectedCategories.length, 1)) * 100;
  }

  private generateConsistencyReasoning(personalStyle: StylePersonality, factors: any[]): string {
    const styleName = personalStyle.primary;
    const confidence = personalStyle.confidence;
    
    let reasoning = `Your wardrobe shows a ${confidence > 70 ? 'strong' : confidence > 40 ? 'moderate' : 'developing'} ${styleName} style identity`;
    
    const strongFactors = factors.filter(f => f.impact > 15);
    const weakFactors = factors.filter(f => f.impact < 5);
    
    if (strongFactors.length > 0) {
      reasoning += ` with particular strength in ${strongFactors.map(f => f.name.toLowerCase()).join(' and ')}`;
    }
    
    if (weakFactors.length > 0) {
      reasoning += `. Consider strengthening ${weakFactors.map(f => f.name.toLowerCase()).join(' and ')} for better consistency`;
    }
    
    return reasoning + '.';
  }

  public generateStyleRecommendations(items: WardrobeItem[], personalStyle: StylePersonality): string[] {
    const profile = this.styleProfiles.get(personalStyle.primary);
    if (!profile) return [];

    const recommendations: string[] = [];
    
    // Analyze gaps in preferred categories
    const currentCategories = [...new Set(items.map(item => item.category.toLowerCase()))];
    const missingCategories = profile.preferredCategories.filter(preferred => 
      !currentCategories.some(current => current.includes(preferred.toLowerCase()))
    );
    
    missingCategories.slice(0, 3).forEach(category => {
      recommendations.push(`Consider adding ${category} to strengthen your ${personalStyle.primary} style`);
    });

    // Color palette suggestions
    const currentColors = [...new Set(items.map(item => item.color?.toLowerCase()).filter(Boolean))];
    const missingColors = profile.colorPalette.filter(color => 
      !currentColors.some(current => current?.includes(color.toLowerCase()))
    );
    
    if (missingColors.length > 0) {
      recommendations.push(`Incorporate ${missingColors.slice(0, 2).join(' or ')} to complete your color palette`);
    }

    // Style development based on confidence
    if (personalStyle.confidence < 70) {
      recommendations.push(`Focus on ${profile.characteristics[0]} to develop a more cohesive ${personalStyle.primary} aesthetic`);
    }

    return recommendations.slice(0, 5);
  }
}

interface StyleProfile {
  characteristics: string[];
  preferredCategories: string[];
  avoidedElements: string[];
  colorPalette: string[];
  occasions: string[];
  formality: number;
  boldness: number;
  creativity: number;
}

interface BrandTier {
  tier: 'luxury' | 'premium' | 'mid-range' | 'accessible';
  priceRange: 'low' | 'low-medium' | 'medium' | 'medium-high' | 'high';
  styleProfile: string;
  quality: number;
}

export const styleAnalyzer = new StyleAnalyzer();