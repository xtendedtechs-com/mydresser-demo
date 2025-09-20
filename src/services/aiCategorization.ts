interface ItemAnalysis {
  category: string;
  color: string;
  material: string;
  season: string;
  occasion: string;
  style: string[];
  confidence: number;
  description: string;
  suggestedName?: string;
  tags: string[];
}

interface OutfitCompatibility {
  score: number;
  reasons: string[];
  colorHarmony: number;
  styleCoherence: number;
  occasionFit: number;
  seasonalMatch: number;
}

export class AICategorization {
  private categoryKeywords = {
    tops: ['shirt', 'blouse', 'top', 't-shirt', 'tank', 'sweater', 'cardigan', 'hoodie'],
    bottoms: ['pants', 'jeans', 'trousers', 'shorts', 'leggings', 'skirt'],
    dresses: ['dress', 'gown', 'sundress', 'midi', 'maxi'],
    outerwear: ['jacket', 'coat', 'blazer', 'vest', 'cardigan', 'hoodie'],
    shoes: ['shoes', 'sneakers', 'boots', 'sandals', 'heels', 'flats'],
    accessories: ['bag', 'belt', 'scarf', 'hat', 'jewelry', 'watch'],
    underwear: ['bra', 'underwear', 'lingerie', 'socks', 'tights']
  };

  private colorPatterns = {
    black: ['black', 'noir', 'charcoal'],
    white: ['white', 'cream', 'ivory', 'off-white'],
    blue: ['blue', 'navy', 'denim', 'royal', 'sky'],
    red: ['red', 'crimson', 'burgundy', 'wine', 'cherry'],
    green: ['green', 'olive', 'forest', 'emerald', 'mint'],
    yellow: ['yellow', 'gold', 'mustard', 'lemon'],
    brown: ['brown', 'tan', 'beige', 'camel', 'khaki'],
    gray: ['gray', 'grey', 'silver', 'slate'],
    pink: ['pink', 'rose', 'blush', 'coral'],
    purple: ['purple', 'violet', 'lavender', 'plum']
  };

  private materialKeywords = {
    'Cotton': ['cotton', '100% cotton', 'organic cotton'],
    'Silk': ['silk', 'mulberry silk', 'satin'],
    'Wool': ['wool', 'merino', 'cashmere', 'alpaca'],
    'Leather': ['leather', 'genuine leather', 'suede'],
    'Denim': ['denim', 'jean', '100% cotton denim'],
    'Polyester': ['polyester', 'poly', 'synthetic'],
    'Linen': ['linen', '100% linen', 'flax'],
    'Cashmere': ['cashmere', '100% cashmere'],
    'Acrylic': ['acrylic', 'synthetic blend'],
    'Cotton Blend': ['cotton blend', 'cotton mix']
  };

  private seasonalIndicators = {
    'summer': ['light', 'breathable', 'sleeveless', 'short', 'linen', 'cotton'],
    'winter': ['warm', 'thick', 'wool', 'cashmere', 'fleece', 'heavy'],
    'spring': ['light', 'transitional', 'medium', 'cotton'],
    'fall': ['warm', 'layering', 'transitional', 'wool'],
    'all-season': ['versatile', 'classic', 'basic']
  };

  private occasionKeywords = {
    'formal': ['formal', 'business', 'professional', 'suit', 'blazer', 'dress shirt'],
    'casual': ['casual', 'everyday', 'relaxed', 'comfortable', 't-shirt', 'jeans'],
    'business': ['business', 'work', 'professional', 'office', 'corporate'],
    'party': ['party', 'evening', 'cocktail', 'festive', 'celebration'],
    'sport': ['sport', 'athletic', 'gym', 'workout', 'activewear', 'running']
  };

  /**
   * Analyze an item name and description to extract clothing attributes
   */
  analyzeItem(name: string, description?: string, imageAnalysis?: any): ItemAnalysis {
    const text = `${name} ${description || ''}`.toLowerCase();
    
    const category = this.detectCategory(text);
    const color = this.detectColor(text);
    const material = this.detectMaterial(text);
    const season = this.detectSeason(text);
    const occasion = this.detectOccasion(text);
    const style = this.detectStyle(text, category);
    const tags = this.generateTags(text, category, color, material);
    
    // Calculate confidence based on how many attributes we could detect
    const detectedAttributes = [category, color, material, season, occasion].filter(attr => attr !== 'unknown').length;
    const confidence = Math.min(95, (detectedAttributes / 5) * 100 + Math.random() * 15);

    return {
      category,
      color,
      material,
      season,
      occasion,
      style,
      confidence: Math.round(confidence),
      description: this.generateDescription(category, color, material, style),
      suggestedName: this.generateSuggestedName(category, color, material),
      tags
    };
  }

  private detectCategory(text: string): string {
    for (const [category, keywords] of Object.entries(this.categoryKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return category;
      }
    }
    return 'tops'; // Default fallback
  }

  private detectColor(text: string): string {
    for (const [color, patterns] of Object.entries(this.colorPatterns)) {
      if (patterns.some(pattern => text.includes(pattern))) {
        return color;
      }
    }
    return 'neutral';
  }

  private detectMaterial(text: string): string {
    for (const [material, keywords] of Object.entries(this.materialKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return material;
      }
    }
    return 'Cotton Blend'; // Default
  }

  private detectSeason(text: string): string {
    for (const [season, indicators] of Object.entries(this.seasonalIndicators)) {
      if (indicators.some(indicator => text.includes(indicator))) {
        return season;
      }
    }
    return 'all-season';
  }

  private detectOccasion(text: string): string {
    for (const [occasion, keywords] of Object.entries(this.occasionKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return occasion;
      }
    }
    return 'casual';
  }

  private detectStyle(text: string, category: string): string[] {
    const styles = [];
    
    // Basic style detection
    if (text.includes('classic') || text.includes('basic')) styles.push('classic');
    if (text.includes('modern') || text.includes('contemporary')) styles.push('modern');
    if (text.includes('vintage') || text.includes('retro')) styles.push('vintage');
    if (text.includes('casual') || text.includes('relaxed')) styles.push('casual');
    if (text.includes('formal') || text.includes('elegant')) styles.push('formal');
    if (text.includes('trendy') || text.includes('fashion')) styles.push('trendy');
    if (text.includes('minimalist') || text.includes('simple')) styles.push('minimalist');
    if (text.includes('bohemian') || text.includes('boho')) styles.push('bohemian');
    
    // Category-specific styles
    if (category === 'tops') {
      if (text.includes('fitted')) styles.push('fitted');
      if (text.includes('loose') || text.includes('oversized')) styles.push('relaxed');
    }
    
    return styles.length > 0 ? styles : ['contemporary'];
  }

  private generateTags(text: string, category: string, color: string, material: string): string[] {
    const tags = [];
    
    // Add category-based tags
    tags.push(category.slice(0, -1)); // Remove 's' from category
    
    // Add color tags
    if (color !== 'neutral') tags.push(color);
    
    // Add material tags
    if (material !== 'Cotton Blend') tags.push(material.toLowerCase());
    
    // Add functional tags
    if (text.includes('comfortable') || text.includes('soft')) tags.push('comfortable');
    if (text.includes('breathable')) tags.push('breathable');
    if (text.includes('stretch')) tags.push('stretch');
    if (text.includes('wrinkle') && text.includes('free')) tags.push('wrinkle-free');
    if (text.includes('easy') && text.includes('care')) tags.push('easy-care');
    
    return [...new Set(tags)]; // Remove duplicates
  }

  private generateDescription(category: string, color: string, material: string, style: string[]): string {
    const styleDesc = style.length > 0 ? style.join(' and ') : 'versatile';
    const categoryName = category.slice(0, -1); // Remove 's'
    
    return `A ${styleDesc} ${color} ${categoryName} made from ${material.toLowerCase()}, perfect for various occasions.`;
  }

  private generateSuggestedName(category: string, color: string, material: string): string {
    const categoryName = category.slice(0, -1); // Remove 's'
    return `${color.charAt(0).toUpperCase() + color.slice(1)} ${material} ${categoryName.charAt(0).toUpperCase() + categoryName.slice(1)}`;
  }

  /**
   * Calculate outfit compatibility score between items
   */
  calculateOutfitCompatibility(items: any[]): OutfitCompatibility {
    if (items.length < 2) {
      return {
        score: 0,
        reasons: ['Need at least 2 items for compatibility analysis'],
        colorHarmony: 0,
        styleCoherence: 0,
        occasionFit: 0,
        seasonalMatch: 0
      };
    }

    const colorHarmony = this.calculateColorHarmony(items);
    const styleCoherence = this.calculateStyleCoherence(items);
    const occasionFit = this.calculateOccasionFit(items);
    const seasonalMatch = this.calculateSeasonalMatch(items);
    
    const score = Math.round((colorHarmony + styleCoherence + occasionFit + seasonalMatch) / 4);
    const reasons = this.generateCompatibilityReasons(items, { colorHarmony, styleCoherence, occasionFit, seasonalMatch });

    return {
      score,
      reasons,
      colorHarmony: Math.round(colorHarmony),
      styleCoherence: Math.round(styleCoherence),
      occasionFit: Math.round(occasionFit),
      seasonalMatch: Math.round(seasonalMatch)
    };
  }

  private calculateColorHarmony(items: any[]): number {
    const colors = items.map(item => item.color || 'neutral');
    const uniqueColors = [...new Set(colors)];
    
    // Color harmony rules
    if (uniqueColors.length === 1) return 95; // Monochromatic
    if (uniqueColors.length === 2) {
      if (uniqueColors.includes('neutral') || uniqueColors.includes('white') || uniqueColors.includes('black')) {
        return 90; // Neutral with one color
      }
      return 80; // Two non-neutral colors
    }
    if (uniqueColors.length === 3) return 70; // Three colors
    return 60; // More than three colors
  }

  private calculateStyleCoherence(items: any[]): number {
    const occasions = items.map(item => item.occasion || 'casual');
    const uniqueOccasions = [...new Set(occasions)];
    
    if (uniqueOccasions.length === 1) return 95;
    if (uniqueOccasions.length === 2) return 80;
    return 65;
  }

  private calculateOccasionFit(items: any[]): number {
    // Check if all items fit the same occasion
    const occasions = items.map(item => item.occasion || 'casual');
    const dominantOccasion = this.findMostCommon(occasions);
    const matchingItems = occasions.filter(occ => occ === dominantOccasion).length;
    
    return (matchingItems / occasions.length) * 100;
  }

  private calculateSeasonalMatch(items: any[]): number {
    const seasons = items.map(item => item.season || 'all-season');
    const allSeasonCount = seasons.filter(s => s === 'all-season').length;
    const uniqueSeasons = [...new Set(seasons.filter(s => s !== 'all-season'))];
    
    if (uniqueSeasons.length <= 1) return 95;
    if (allSeasonCount >= seasons.length / 2) return 85;
    return 70;
  }

  private generateCompatibilityReasons(items: any[], scores: any): string[] {
    const reasons = [];
    
    if (scores.colorHarmony >= 85) {
      reasons.push('Excellent color coordination');
    } else if (scores.colorHarmony >= 70) {
      reasons.push('Good color balance');
    }
    
    if (scores.styleCoherence >= 85) {
      reasons.push('Consistent style theme');
    }
    
    if (scores.occasionFit >= 85) {
      reasons.push('Perfect for the occasion');
    }
    
    if (scores.seasonalMatch >= 85) {
      reasons.push('Weather appropriate');
    }
    
    if (reasons.length === 0) {
      reasons.push('Decent overall combination');
    }
    
    return reasons;
  }

  private findMostCommon<T>(arr: T[]): T {
    const counts = arr.reduce((acc, val) => {
      acc[val as string] = (acc[val as string] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b) as T;
  }

  /**
   * Generate smart outfit suggestions based on available items
   */
  generateOutfitSuggestions(wardrobeItems: any[], preferences: any = {}): any[] {
    if (wardrobeItems.length < 3) return [];

    const outfits = [];
    const { occasion = 'casual', weather = 'mild', maxOutfits = 5 } = preferences;

    // Group items by category
    const itemsByCategory = wardrobeItems.reduce((acc, item) => {
      const cat = item.category || 'tops';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    }, {} as Record<string, any[]>);

    // Generate outfit combinations
    const tops = itemsByCategory.tops || [];
    const bottoms = itemsByCategory.bottoms || [];
    const outerwear = itemsByCategory.outerwear || [];
    const shoes = itemsByCategory.shoes || [];

    for (let i = 0; i < Math.min(maxOutfits, tops.length); i++) {
      const top = tops[i];
      const bottom = bottoms[i % bottoms.length];
      const outfit = [top, bottom];

      // Add outerwear if weather is cool/cold
      if ((weather === 'cool' || weather === 'cold') && outerwear.length > 0) {
        outfit.push(outerwear[i % outerwear.length]);
      }

      // Add shoes if available
      if (shoes.length > 0) {
        outfit.push(shoes[i % shoes.length]);
      }

      const compatibility = this.calculateOutfitCompatibility(outfit);
      
      if (compatibility.score >= 65) { // Only suggest good combinations
        outfits.push({
          id: `outfit-${i + 1}`,
          items: outfit,
          compatibility,
          occasion,
          weather,
          style: this.detectOutfitStyle(outfit),
          tags: this.generateOutfitTags(outfit, compatibility)
        });
      }
    }

    return outfits.sort((a, b) => b.compatibility.score - a.compatibility.score);
  }

  private detectOutfitStyle(items: any[]): string {
    const styles = items.flatMap(item => item.tags || []);
    const occasions = items.map(item => item.occasion || 'casual');
    
    if (occasions.includes('formal') || occasions.includes('business')) return 'professional';
    if (styles.includes('trendy') || styles.includes('modern')) return 'contemporary';
    if (styles.includes('classic') || styles.includes('basic')) return 'classic';
    return 'casual';
  }

  private generateOutfitTags(items: any[], compatibility: OutfitCompatibility): string[] {
    const tags = [];
    
    if (compatibility.score >= 90) tags.push('perfect-match');
    if (compatibility.colorHarmony >= 90) tags.push('color-coordinated');
    if (compatibility.styleCoherence >= 90) tags.push('style-consistent');
    
    const materials = [...new Set(items.map(item => item.material).filter(Boolean))];
    if (materials.includes('Cotton')) tags.push('comfortable');
    if (materials.includes('Silk') || materials.includes('Cashmere')) tags.push('luxurious');
    
    return tags;
  }
}

export const aiCategorization = new AICategorization();