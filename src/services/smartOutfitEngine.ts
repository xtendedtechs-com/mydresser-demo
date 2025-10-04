/**
 * Smart Outfit Engine - Advanced outfit composition with clothing layers logic
 * Ensures realistic outfit combinations with proper layering principles
 */

import { WardrobeItem } from '@/hooks/useWardrobe';

export interface ClothingLayer {
  level: number; // 1=base, 2=mid, 3=outer, 4=accessories
  type: 'base' | 'mid' | 'outer' | 'accessory';
  bodyPart: 'torso' | 'legs' | 'feet' | 'head' | 'hands' | 'full-body';
  exclusive?: boolean; // Can only have one item in this slot
}

export interface OutfitSlot {
  name: string;
  layer: ClothingLayer;
  required: boolean;
  item: WardrobeItem | null;
}

// Define clothing categories with their layering properties
const CLOTHING_LAYERS: Record<string, ClothingLayer> = {
  // Base layer (underwear, thermal wear)
  'underwear': { level: 1, type: 'base', bodyPart: 'torso', exclusive: false },
  'thermal': { level: 1, type: 'base', bodyPart: 'torso', exclusive: false },
  'tights': { level: 1, type: 'base', bodyPart: 'legs', exclusive: false },
  
  // Mid layer (main clothing)
  'tops': { level: 2, type: 'mid', bodyPart: 'torso', exclusive: true },
  'bottoms': { level: 2, type: 'mid', bodyPart: 'legs', exclusive: true },
  'dresses': { level: 2, type: 'mid', bodyPart: 'full-body', exclusive: true },
  'skirts': { level: 2, type: 'mid', bodyPart: 'legs', exclusive: true },
  'pants': { level: 2, type: 'mid', bodyPart: 'legs', exclusive: true },
  'jeans': { level: 2, type: 'mid', bodyPart: 'legs', exclusive: true },
  'shorts': { level: 2, type: 'mid', bodyPart: 'legs', exclusive: true },
  
  // Outer layer
  'outerwear': { level: 3, type: 'outer', bodyPart: 'torso', exclusive: false },
  'jackets': { level: 3, type: 'outer', bodyPart: 'torso', exclusive: false },
  'coats': { level: 3, type: 'outer', bodyPart: 'torso', exclusive: false },
  'blazers': { level: 3, type: 'outer', bodyPart: 'torso', exclusive: false },
  'cardigans': { level: 3, type: 'outer', bodyPart: 'torso', exclusive: false },
  
  // Accessories
  'shoes': { level: 4, type: 'accessory', bodyPart: 'feet', exclusive: true },
  'accessories': { level: 4, type: 'accessory', bodyPart: 'head', exclusive: false },
  'bags': { level: 4, type: 'accessory', bodyPart: 'hands', exclusive: false },
  'jewelry': { level: 4, type: 'accessory', bodyPart: 'head', exclusive: false },
  'hats': { level: 4, type: 'accessory', bodyPart: 'head', exclusive: false },
  'scarves': { level: 4, type: 'accessory', bodyPart: 'head', exclusive: false },
};

interface OutfitGenerationOptions {
  weather?: {
    temp: number;
    condition: string;
  };
  occasion?: string;
  season?: string;
  stylePreferences?: string[];
  avoidItems?: string[]; // Item IDs to avoid
}

export class SmartOutfitEngine {
  /**
   * Generate a realistic outfit with proper layering
   */
  static generateOutfit(
    wardrobeItems: WardrobeItem[],
    options: OutfitGenerationOptions = {}
  ): WardrobeItem[] {
    const { weather, occasion, season, stylePreferences = [], avoidItems = [] } = options;
    
    // Filter available items
    const available = wardrobeItems.filter(item => !avoidItems.includes(item.id));
    
    if (available.length === 0) return [];
    
    // Initialize outfit slots
    const outfit = {
      base: null as WardrobeItem | null,
      top: null as WardrobeItem | null,
      bottom: null as WardrobeItem | null,
      outer: null as WardrobeItem | null,
      shoes: null as WardrobeItem | null
    };
    
    // 1. Select bottom (required) - never two pants/jeans
    const bottoms = this.filterByCategory(available, ['bottoms', 'jeans', 'pants', 'skirts', 'shorts']);
    const bottomsFiltered = this.filterBySeason(bottoms, season);
    outfit.bottom = this.selectBestMatch(bottomsFiltered, { occasion, weather });
    
    // 2. Check if wearing a dress (replaces top + bottom)
    const dresses = this.filterByCategory(available, ['dresses']);
    const dressesFiltered = this.filterBySeason(dresses, season);
    const selectedDress = this.selectBestMatch(dressesFiltered, { occasion, weather });
    
    if (selectedDress && this.shouldSelectDress(weather, occasion)) {
      outfit.top = selectedDress;
      outfit.bottom = null; // Dress replaces bottom
    } else {
      // 3. Select top (required if no dress)
      const tops = this.filterByCategory(available, ['tops']);
      const topsFiltered = this.filterBySeason(tops, season);
      outfit.top = this.selectBestMatch(topsFiltered, { occasion, weather });
    }
    
    // 4. Add base layer if cold
    if (weather && weather.temp < 15) {
      const base = this.filterByCategory(available, ['thermal', 'tights']);
      outfit.base = this.selectBestMatch(base, { weather });
    }
    
    // 5. Add outer layer based on weather
    if (this.needsOuterLayer(weather)) {
      const outer = this.filterByCategory(available, ['outerwear', 'jackets', 'coats', 'blazers', 'cardigans']);
      const outerFiltered = this.filterBySeason(outer, season);
      outfit.outer = this.selectBestMatch(outerFiltered, { occasion, weather });
    }
    
    // 6. Select shoes (required)
    const shoes = this.filterByCategory(available, ['shoes']);
    const shoesFiltered = this.filterBySeason(shoes, season);
    outfit.shoes = this.selectBestMatch(shoesFiltered, { occasion, weather });
    
    // 7. Add accessories (optional, max 2)
    const accessories = this.filterByCategory(available, ['accessories', 'bags', 'jewelry', 'hats', 'scarves']);
    const accessoriesFiltered = this.filterBySeason(accessories, season);
    const selectedAccessories = this.selectAccessories(accessoriesFiltered, 2, { occasion, weather });
    
    // Compile final outfit - filter out null/undefined items
    const finalOutfit: WardrobeItem[] = [
      outfit.base,
      outfit.top,
      outfit.bottom,
      outfit.outer,
      outfit.shoes,
      ...selectedAccessories
    ].filter((item): item is WardrobeItem => item !== null && item !== undefined);
    
    return finalOutfit;
  }
  
  private static filterByCategory(items: WardrobeItem[], categories: string[]): WardrobeItem[] {
    return items.filter(item => 
      categories.some(cat => item.category.toLowerCase().includes(cat.toLowerCase()))
    );
  }
  
  private static filterBySeason(items: WardrobeItem[], season?: string): WardrobeItem[] {
    if (!season) return items;
    return items.filter(item => 
      !item.season || 
      item.season === 'all-season' || 
      item.season.toLowerCase() === season.toLowerCase()
    );
  }
  
  private static selectBestMatch(
    items: WardrobeItem[],
    criteria: { occasion?: string; weather?: any }
  ): WardrobeItem | null {
    if (items.length === 0) return null;
    
    // Score each item based on criteria
    const scored = items.map(item => {
      let score = 0;
      
      // Match occasion
      if (criteria.occasion && item.occasion) {
        score += item.occasion.toLowerCase() === criteria.occasion.toLowerCase() ? 10 : 0;
      }
      
      // Match weather appropriateness
      if (criteria.weather) {
        if (criteria.weather.temp < 10 && item.material?.includes('wool')) score += 5;
        if (criteria.weather.temp > 25 && item.material?.includes('cotton')) score += 5;
      }
      
      // Prefer unworn items
      score += (item.wear_count || 0) < 3 ? 5 : 0;
      
      // Prefer favorites
      score += item.is_favorite ? 3 : 0;
      
      return { item, score };
    });
    
    // Sort by score and return best
    scored.sort((a, b) => b.score - a.score);
    return scored[0].item;
  }
  
  private static shouldSelectDress(weather?: any, occasion?: string): boolean {
    // Dresses more likely in warm weather and formal/casual occasions
    if (weather && weather.temp > 20) return Math.random() > 0.5;
    if (occasion === 'formal' || occasion === 'party') return Math.random() > 0.4;
    return Math.random() > 0.7;
  }
  
  private static needsOuterLayer(weather?: any): boolean {
    if (!weather) return false;
    return weather.temp < 18 || weather.condition.includes('rain');
  }
  
  private static selectAccessories(
    items: WardrobeItem[],
    max: number,
    criteria: { occasion?: string; weather?: any }
  ): WardrobeItem[] {
    const scored = items.map(item => {
      let score = Math.random() * 10; // Random factor
      
      if (criteria.occasion === 'formal') score += 5;
      if (criteria.weather?.temp < 10 && item.category === 'scarves') score += 8;
      
      return { item, score };
    });
    
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, max).map(s => s.item);
  }
  
  /**
   * Validate outfit follows layering rules
   */
  static validateOutfit(outfit: WardrobeItem[]): { valid: boolean; issues: string[] } {
    const issues: string[] = [];
    
    // Check for duplicate leg wear (no two pants/jeans)
    const legItems = outfit.filter(item => 
      ['bottoms', 'jeans', 'pants', 'shorts'].includes(item.category)
    );
    if (legItems.length > 1) {
      const hasTights = outfit.some(item => item.category === 'tights');
      if (!hasTights) {
        issues.push('Cannot wear multiple pants/jeans without thermal tights');
      }
    }
    
    // Check for dress + bottom conflict
    const hasDress = outfit.some(item => item.category === 'dresses');
    const hasBottom = outfit.some(item => ['bottoms', 'jeans', 'pants', 'skirts'].includes(item.category));
    if (hasDress && hasBottom) {
      issues.push('Cannot wear a dress with separate bottoms');
    }
    
    // Check for required items
    const hasTop = outfit.some(item => item.category === 'tops' || item.category === 'dresses');
    const hasShoes = outfit.some(item => item.category === 'shoes');
    
    if (!hasTop) issues.push('Outfit missing top garment');
    if (!hasShoes) issues.push('Outfit missing shoes');
    
    return {
      valid: issues.length === 0,
      issues
    };
  }
  
  /**
   * Calculate outfit compatibility score
   */
  static calculateCompatibility(outfit: WardrobeItem[]): number {
    let score = 100;
    
    // Check color harmony
    const colors = outfit.map(item => item.color).filter(Boolean);
    if (colors.length > 0) {
      const uniqueColors = new Set(colors);
      if (uniqueColors.size > 4) score -= 10; // Too many colors
    }
    
    // Check style consistency
    const occasions = outfit.map(item => item.occasion).filter(Boolean);
    const uniqueOccasions = new Set(occasions);
    if (uniqueOccasions.size > 2) score -= 15; // Mixed styles
    
    // Validate layering rules
    const validation = this.validateOutfit(outfit);
    if (!validation.valid) score -= 30;
    
    return Math.max(0, Math.min(100, score));
  }
}

export default SmartOutfitEngine;