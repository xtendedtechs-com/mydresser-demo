import { WardrobeItem } from '@/hooks/useWardrobe';
import { BodyShape } from './bodyShapeAnalysis';

export interface OutfitRecommendation {
  id: string;
  items: WardrobeItem[];
  score: number;
  reasoning: string;
  occasion: string;
  season: string;
  styleMatch: number;
  bodyShapeMatch: number;
}

export class OutfitRecommendationEngine {
  generateRecommendations(
    wardrobeItems: WardrobeItem[],
    bodyShape: BodyShape,
    preferences?: {
      occasion?: string;
      season?: string;
      colors?: string[];
      style?: string;
    }
  ): OutfitRecommendation[] {
    const recommendations: OutfitRecommendation[] = [];
    
    // Group items by category
    const tops = wardrobeItems.filter(item => 
      item.category.toLowerCase().includes('top') || 
      item.category.toLowerCase().includes('shirt')
    );
    const bottoms = wardrobeItems.filter(item => 
      item.category.toLowerCase().includes('bottom') || 
      item.category.toLowerCase().includes('pant') ||
      item.category.toLowerCase().includes('skirt')
    );
    const shoes = wardrobeItems.filter(item => 
      item.category.toLowerCase().includes('shoe')
    );

    // Generate outfit combinations
    for (const top of tops) {
      for (const bottom of bottoms) {
        const outfit = [top, bottom];
        
        // Add shoes if available
        if (shoes.length > 0) {
          const matchingShoes = this.findMatchingShoes(top, bottom, shoes);
          if (matchingShoes) outfit.push(matchingShoes);
        }

        const score = this.calculateOutfitScore(outfit, bodyShape, preferences);
        
        if (score > 0.5) { // Only include good matches
          recommendations.push({
            id: `outfit-${top.id}-${bottom.id}`,
            items: outfit,
            score: Math.round(score * 100),
            reasoning: this.generateReasoning(outfit, bodyShape, preferences),
            occasion: this.determineOccasion(outfit),
            season: this.determineSeason(outfit),
            styleMatch: Math.round(this.calculateStyleMatch(outfit) * 100),
            bodyShapeMatch: Math.round(this.calculateBodyShapeMatch(outfit, bodyShape) * 100)
          });
        }
      }
    }

    // Sort by score
    return recommendations.sort((a, b) => b.score - a.score).slice(0, 10);
  }

  private calculateOutfitScore(
    items: WardrobeItem[],
    bodyShape: BodyShape,
    preferences?: any
  ): number {
    let score = 0.5; // Base score

    // Color harmony
    score += this.calculateColorHarmony(items) * 0.3;

    // Body shape compatibility
    score += this.calculateBodyShapeMatch(items, bodyShape) * 0.3;

    // Style consistency
    score += this.calculateStyleMatch(items) * 0.2;

    // Preference match
    if (preferences) {
      score += this.calculatePreferenceMatch(items, preferences) * 0.2;
    }

    return Math.min(score, 1);
  }

  private calculateColorHarmony(items: WardrobeItem[]): number {
    // Simplified color harmony calculation
    const colors = items.map(item => item.color?.toLowerCase() || '');
    
    // Neutral colors work with everything
    const neutrals = ['black', 'white', 'gray', 'grey', 'beige', 'navy'];
    const hasNeutral = colors.some(c => neutrals.some(n => c.includes(n)));
    
    if (hasNeutral) return 0.8;
    
    // Check if colors are similar (monochromatic)
    if (new Set(colors).size === 1) return 0.9;
    
    return 0.6;
  }

  private calculateBodyShapeMatch(items: WardrobeItem[], bodyShape: BodyShape): number {
    // Body shape recommendations
    const shapeRecommendations: Record<BodyShape['type'], string[]> = {
      'hourglass': ['fitted', 'wrap', 'high-waisted'],
      'pear': ['a-line', 'wide-leg', 'structured'],
      'apple': ['v-neck', 'empire', 'straight'],
      'rectangle': ['peplum', 'belted', 'layered'],
      'inverted-triangle': ['a-line', 'wide-leg', 'flared']
    };

    const recommendations = shapeRecommendations[bodyShape.type] || [];
    const itemDescriptions = items.map(item => 
      item.name.toLowerCase()
    );

    const matches = recommendations.filter(rec => 
      itemDescriptions.some(desc => desc.includes(rec))
    ).length;

    return matches / recommendations.length;
  }

  private calculateStyleMatch(items: WardrobeItem[]): number {
    const categories = items.map(item => 
      item.category?.toLowerCase() || ''
    ).filter(s => s);

    if (categories.length < 2) return 0.7;

    // Same category = good match
    if (new Set(categories).size === 1) return 0.9;

    // Compatible categories
    const compatible = [
      ['tops', 'shirt', 'blouse'],
      ['bottoms', 'pants', 'skirt'],
      ['outerwear', 'jacket', 'coat']
    ];

    for (const group of compatible) {
      if (categories.every(c => group.some(g => c.includes(g)))) {
        return 0.9;
      }
    }

    return 0.7;
  }

  private calculatePreferenceMatch(items: WardrobeItem[], preferences: any): number {
    let matches = 0;
    let total = 0;

    if (preferences.colors) {
      total++;
      if (items.some(item => 
        preferences.colors.some((c: string) => 
          item.color?.toLowerCase().includes(c.toLowerCase())
        )
      )) matches++;
    }

    if (preferences.style) {
      total++;
      if (items.some(item => 
        item.category?.toLowerCase().includes(preferences.style.toLowerCase())
      )) matches++;
    }

    return total > 0 ? matches / total : 0.5;
  }

  private findMatchingShoes(
    top: WardrobeItem,
    bottom: WardrobeItem,
    shoes: WardrobeItem[]
  ): WardrobeItem | null {
    // Simple color matching
    const outfitColors = [top.color, bottom.color].filter(Boolean);
    
    for (const shoe of shoes) {
      if (outfitColors.some(c => 
        shoe.color?.toLowerCase() === c?.toLowerCase()
      )) {
        return shoe;
      }
    }

    // Return neutral shoes as fallback
    const neutralShoe = shoes.find(s => 
      ['black', 'white', 'brown', 'beige'].some(c => 
        s.color?.toLowerCase().includes(c)
      )
    );

    return neutralShoe || shoes[0];
  }

  private generateReasoning(
    items: WardrobeItem[],
    bodyShape: BodyShape,
    preferences?: any
  ): string {
    const reasons: string[] = [];

    reasons.push(`Perfect for ${bodyShape.type} body shape`);

    const colors = [...new Set(items.map(i => i.color).filter(Boolean))];
    if (colors.length === 1) {
      reasons.push(`Monochromatic ${colors[0]} creates a sleek look`);
    } else if (colors.length === 2) {
      reasons.push(`${colors.join(' and ')} complement each other beautifully`);
    }

    const categories = [...new Set(items.map(i => i.category).filter(Boolean))];
    if (categories.length > 0) {
      reasons.push(`Balanced ${categories.join(' and ')} combination`);
    }

    return reasons.join('. ') + '.';
  }

  private determineOccasion(items: WardrobeItem[]): string {
    const descriptions = items.map(i => i.name.toLowerCase()).join(' ');

    if (descriptions.includes('formal') || descriptions.includes('suit')) {
      return 'Formal';
    }
    if (descriptions.includes('casual') || descriptions.includes('jeans')) {
      return 'Casual';
    }
    if (descriptions.includes('sport') || descriptions.includes('athletic')) {
      return 'Athletic';
    }
    
    return 'Versatile';
  }

  private determineSeason(items: WardrobeItem[]): string {
    const descriptions = items.map(i => i.name.toLowerCase()).join(' ');

    if (descriptions.includes('summer') || descriptions.includes('short')) {
      return 'Summer';
    }
    if (descriptions.includes('winter') || descriptions.includes('coat')) {
      return 'Winter';
    }
    
    return 'All Season';
  }
}

export const outfitRecommendations = new OutfitRecommendationEngine();
