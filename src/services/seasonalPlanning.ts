import { WardrobeItem } from '@/hooks/useWardrobe';

export interface SeasonalRecommendation {
  season: 'spring' | 'summer' | 'fall' | 'winter';
  itemsToKeep: WardrobeItem[];
  itemsToStore: WardrobeItem[];
  itemsToDonate: WardrobeItem[];
  itemsToBuy: string[];
  reasoning: string;
}

export interface ClimateData {
  avgHighTemp: number;
  avgLowTemp: number;
  precipitation: number;
  season: string;
}

export class SeasonalPlanningEngine {
  getCurrentSeason(): 'spring' | 'summer' | 'fall' | 'winter' {
    const month = new Date().getMonth();
    
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  }

  getSeasonalRecommendations(
    wardrobeItems: WardrobeItem[],
    climateData?: ClimateData
  ): SeasonalRecommendation {
    const currentSeason = this.getCurrentSeason();
    
    // Categorize items
    const itemsToKeep = this.getSeasonalItems(wardrobeItems, currentSeason);
    const itemsToStore = this.getOffSeasonItems(wardrobeItems, currentSeason);
    const itemsToDonate = this.getUnderutilizedItems(wardrobeItems);
    const itemsToBuy = this.suggestPurchases(wardrobeItems, currentSeason);

    return {
      season: currentSeason,
      itemsToKeep,
      itemsToStore,
      itemsToDonate,
      itemsToBuy,
      reasoning: this.generateReasoning(currentSeason, wardrobeItems.length, climateData)
    };
  }

  private getSeasonalItems(items: WardrobeItem[], season: string): WardrobeItem[] {
    return items.filter(item => {
      const itemSeason = item.season?.toLowerCase();
      if (!itemSeason) return true; // Keep items without season specified
      
      return (
        itemSeason.includes(season) ||
        itemSeason.includes('all') ||
        itemSeason.includes('year-round')
      );
    });
  }

  private getOffSeasonItems(items: WardrobeItem[], currentSeason: string): WardrobeItem[] {
    const oppositeSeasons = {
      'spring': ['winter', 'fall'],
      'summer': ['winter', 'spring'],
      'fall': ['summer', 'spring'],
      'winter': ['summer', 'fall']
    };

    const seasonsToStore = oppositeSeasons[currentSeason as keyof typeof oppositeSeasons] || [];
    
    return items.filter(item => {
      const itemSeason = item.season?.toLowerCase();
      if (!itemSeason) return false;
      
      return seasonsToStore.some(s => itemSeason.includes(s)) &&
             !itemSeason.includes('all') &&
             !itemSeason.includes('year-round');
    });
  }

  private getUnderutilizedItems(items: WardrobeItem[]): WardrobeItem[] {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    return items.filter(item => {
      // Items never worn and added more than 6 months ago
      if (item.wear_count === 0 && item.created_at) {
        const createdDate = new Date(item.created_at);
        return createdDate < sixMonthsAgo;
      }
      return false;
    });
  }

  private suggestPurchases(items: WardrobeItem[], season: string): string[] {
    const suggestions: string[] = [];
    
    // Analyze gaps in wardrobe
    const categories = new Set(items.map(i => i.category.toLowerCase()));
    
    const seasonalEssentials = {
      'spring': [
        'Light jacket',
        'Rain boots',
        'Transitional coat',
        'Floral dress',
        'Light cardigan'
      ],
      'summer': [
        'Sunhat',
        'Sandals',
        'Light breathable tops',
        'Shorts',
        'Sundress'
      ],
      'fall': [
        'Boots',
        'Sweater',
        'Scarf',
        'Jacket',
        'Long-sleeve shirts'
      ],
      'winter': [
        'Heavy coat',
        'Thermal layers',
        'Winter boots',
        'Gloves',
        'Warm accessories'
      ]
    };

    const essentials = seasonalEssentials[season as keyof typeof seasonalEssentials] || [];
    
    // Check for missing essentials
    essentials.forEach(essential => {
      const hasItem = items.some(item => 
        item.name.toLowerCase().includes(essential.toLowerCase()) ||
        item.category.toLowerCase().includes(essential.split(' ')[1]?.toLowerCase() || essential.toLowerCase())
      );
      
      if (!hasItem) {
        suggestions.push(essential);
      }
    });

    return suggestions.slice(0, 5); // Return top 5 suggestions
  }

  private generateReasoning(
    season: string,
    totalItems: number,
    climateData?: ClimateData
  ): string {
    let reasoning = `For ${season}, it's important to prepare your wardrobe for the changing weather. `;
    
    if (climateData) {
      reasoning += `With average temperatures ranging from ${climateData.avgLowTemp}°F to ${climateData.avgHighTemp}°F, `;
      
      if (season === 'summer' && climateData.avgHighTemp > 80) {
        reasoning += 'focus on breathable, light fabrics. ';
      } else if (season === 'winter' && climateData.avgLowTemp < 40) {
        reasoning += 'prioritize warm layers and thermal protection. ';
      } else {
        reasoning += 'layering will be key for comfort. ';
      }
    }
    
    reasoning += `With ${totalItems} items in your wardrobe, consider rotating seasonal pieces to maximize usage and maintain organization.`;
    
    return reasoning;
  }

  getStorageTips(season: string): string[] {
    const tips = {
      'spring': [
        'Clean and store winter coats in garment bags',
        'Add cedar blocks to prevent moths',
        'Vacuum-seal bulky sweaters to save space'
      ],
      'summer': [
        'Store spring jackets in breathable containers',
        'Keep boots in boot shapers to maintain form',
        'Use acid-free tissue paper for delicate items'
      ],
      'fall': [
        'Clean summer clothes before storing',
        'Store sandals with shoe trees',
        'Keep swimwear in a cool, dry place'
      ],
      'winter': [
        'Store fall items in climate-controlled space',
        'Use moisture absorbers in storage containers',
        'Keep leather items conditioned before storing'
      ]
    };
    
    return tips[season as keyof typeof tips] || tips['spring'];
  }

  getPurchasePriorities(
    wardrobeItems: WardrobeItem[],
    budget: number
  ): Array<{ item: string; priority: 'high' | 'medium' | 'low'; estimatedCost: number }> {
    const suggestions = this.suggestPurchases(wardrobeItems, this.getCurrentSeason());
    
    return suggestions.map(item => ({
      item,
      priority: this.getPriority(item),
      estimatedCost: this.estimateCost(item)
    })).sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  private getPriority(item: string): 'high' | 'medium' | 'low' {
    const highPriority = ['coat', 'jacket', 'boots', 'rain'];
    const lowPriority = ['accessories', 'hat', 'scarf'];
    
    const lowerItem = item.toLowerCase();
    
    if (highPriority.some(p => lowerItem.includes(p))) return 'high';
    if (lowPriority.some(p => lowerItem.includes(p))) return 'low';
    return 'medium';
  }

  private estimateCost(item: string): number {
    const costs: Record<string, number> = {
      'coat': 150,
      'jacket': 80,
      'boots': 100,
      'shoes': 60,
      'dress': 50,
      'sweater': 40,
      'accessories': 20
    };
    
    const lowerItem = item.toLowerCase();
    for (const [key, cost] of Object.entries(costs)) {
      if (lowerItem.includes(key)) return cost;
    }
    
    return 50; // Default estimate
  }
}

export const seasonalPlanning = new SeasonalPlanningEngine();
