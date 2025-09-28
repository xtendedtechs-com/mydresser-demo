/**
 * MyDresser Weather-Outfit Matching System - Original IP
 * Advanced weather analysis and outfit recommendations
 */

interface WeatherCondition {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'stormy' | 'foggy';
  uvIndex: number;
  precipitation: number;
  visibility: number;
}

interface ClimateProfile {
  region: 'tropical' | 'temperate' | 'arctic' | 'desert' | 'mediterranean';
  season: 'spring' | 'summer' | 'fall' | 'winter';
  avgTemp: number;
  avgHumidity: number;
  rainyDays: number;
}

interface FabricProperties {
  breathability: number; // 0-1
  insulation: number; // 0-1
  waterResistance: number; // 0-1
  windResistance: number; // 0-1
  uvProtection: number; // 0-1
  moisture_wicking: number; // 0-1
}

interface OutfitWeatherScore {
  overall: number;
  temperature: number;
  comfort: number;
  protection: number;
  appropriateness: number;
  reasoning: string[];
}

class MyDresserWeatherSystem {
  private fabricDatabase: Record<string, FabricProperties> = {};
  private climateProfiles: Record<string, ClimateProfile> = {};

  constructor() {
    this.initializeFabricDatabase();
    this.initializeClimateProfiles();
  }

  private initializeFabricDatabase() {
    this.fabricDatabase = {
      'cotton': {
        breathability: 0.8,
        insulation: 0.3,
        waterResistance: 0.1,
        windResistance: 0.2,
        uvProtection: 0.3,
        moisture_wicking: 0.4
      },
      'wool': {
        breathability: 0.6,
        insulation: 0.9,
        waterResistance: 0.7,
        windResistance: 0.8,
        uvProtection: 0.5,
        moisture_wicking: 0.3
      },
      'polyester': {
        breathability: 0.4,
        insulation: 0.4,
        waterResistance: 0.6,
        windResistance: 0.5,
        uvProtection: 0.4,
        moisture_wicking: 0.7
      },
      'silk': {
        breathability: 0.9,
        insulation: 0.4,
        waterResistance: 0.2,
        windResistance: 0.1,
        uvProtection: 0.2,
        moisture_wicking: 0.3
      },
      'linen': {
        breathability: 1.0,
        insulation: 0.1,
        waterResistance: 0.1,
        windResistance: 0.1,
        uvProtection: 0.4,
        moisture_wicking: 0.6
      },
      'denim': {
        breathability: 0.5,
        insulation: 0.6,
        waterResistance: 0.3,
        windResistance: 0.7,
        uvProtection: 0.6,
        moisture_wicking: 0.2
      },
      'leather': {
        breathability: 0.2,
        insulation: 0.7,
        waterResistance: 0.9,
        windResistance: 0.9,
        uvProtection: 0.8,
        moisture_wicking: 0.1
      },
      'synthetic': {
        breathability: 0.6,
        insulation: 0.5,
        waterResistance: 0.8,
        windResistance: 0.6,
        uvProtection: 0.5,
        moisture_wicking: 0.8
      }
    };
  }

  private initializeClimateProfiles() {
    this.climateProfiles = {
      'new_york': {
        region: 'temperate',
        season: this.getCurrentSeason(),
        avgTemp: 15,
        avgHumidity: 65,
        rainyDays: 120
      },
      'los_angeles': {
        region: 'mediterranean',
        season: this.getCurrentSeason(),
        avgTemp: 22,
        avgHumidity: 50,
        rainyDays: 35
      },
      'miami': {
        region: 'tropical',
        season: this.getCurrentSeason(),
        avgTemp: 28,
        avgHumidity: 80,
        rainyDays: 150
      }
    };
  }

  generateWeatherData(location: string = 'new_york'): WeatherCondition {
    const climate = this.climateProfiles[location] || this.climateProfiles['new_york'];
    const seasonal = this.getSeasonalAdjustments(climate.season);
    
    return {
      temperature: climate.avgTemp + seasonal.tempAdjustment + (Math.random() - 0.5) * 10,
      feelsLike: climate.avgTemp + seasonal.tempAdjustment + (Math.random() - 0.5) * 15,
      humidity: Math.max(0, Math.min(100, climate.avgHumidity + (Math.random() - 0.5) * 30)),
      windSpeed: Math.max(0, Math.random() * 25),
      condition: this.generateWeatherCondition(climate),
      uvIndex: Math.max(0, Math.min(11, 5 + seasonal.uvAdjustment + (Math.random() - 0.5) * 4)),
      precipitation: Math.random() * (climate.rainyDays / 365) * 100,
      visibility: Math.max(0.1, Math.min(10, 8 + (Math.random() - 0.5) * 4))
    };
  }

  analyzeOutfitForWeather(items: any[], weather: WeatherCondition): OutfitWeatherScore {
    let totalScore = 0;
    let temperatureScore = 0;
    let comfortScore = 0;
    let protectionScore = 0;
    let appropriatenessScore = 0;
    const reasoning: string[] = [];

    items.forEach(item => {
      const fabric = this.getFabricProperties(item.material);
      const itemScore = this.calculateItemWeatherScore(item, fabric, weather);
      
      totalScore += itemScore.overall;
      temperatureScore += itemScore.temperature;
      comfortScore += itemScore.comfort;
      protectionScore += itemScore.protection;
      
      reasoning.push(...itemScore.reasoning);
    });

    const itemCount = items.length || 1;
    appropriatenessScore = this.calculateAppropriatenessScore(items, weather);

    return {
      overall: (totalScore + appropriatenessScore) / (itemCount + 1),
      temperature: temperatureScore / itemCount,
      comfort: comfortScore / itemCount,
      protection: protectionScore / itemCount,
      appropriateness: appropriatenessScore,
      reasoning: reasoning.slice(0, 5) // Limit to top 5 reasons
    };
  }

  generateWeatherRecommendations(items: any[], weather: WeatherCondition): string[] {
    const recommendations: string[] = [];
    const score = this.analyzeOutfitForWeather(items, weather);

    // Temperature recommendations
    if (weather.temperature < 5 && score.temperature < 0.6) {
      recommendations.push('Add a warm coat or heavy jacket for cold weather');
    } else if (weather.temperature > 30 && score.temperature < 0.6) {
      recommendations.push('Choose lighter, more breathable fabrics for hot weather');
    }

    // Precipitation recommendations
    if (weather.precipitation > 50 && score.protection < 0.7) {
      recommendations.push('Consider waterproof outerwear or an umbrella');
    }

    // UV recommendations
    if (weather.uvIndex > 7 && score.protection < 0.6) {
      recommendations.push('Add sun protection: hat, sunglasses, or UV-protective clothing');
    }

    // Wind recommendations
    if (weather.windSpeed > 15 && score.protection < 0.6) {
      recommendations.push('Choose wind-resistant layers or a windbreaker');
    }

    // Humidity recommendations
    if (weather.humidity > 80 && score.comfort < 0.6) {
      recommendations.push('Select moisture-wicking fabrics for high humidity');
    }

    return recommendations.slice(0, 3); // Return top 3 recommendations
  }

  private getCurrentSeason(): 'spring' | 'summer' | 'fall' | 'winter' {
    const month = new Date().getMonth() + 1;
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'fall';
    return 'winter';
  }

  private getSeasonalAdjustments(season: string) {
    const adjustments = {
      spring: { tempAdjustment: 0, uvAdjustment: 0 },
      summer: { tempAdjustment: 8, uvAdjustment: 3 },
      fall: { tempAdjustment: -5, uvAdjustment: -2 },
      winter: { tempAdjustment: -12, uvAdjustment: -4 }
    };
    return adjustments[season as keyof typeof adjustments] || adjustments.spring;
  }

  private generateWeatherCondition(climate: ClimateProfile): WeatherCondition['condition'] {
    const conditions: WeatherCondition['condition'][] = ['sunny', 'cloudy', 'rainy', 'stormy', 'foggy'];
    const weights = climate.region === 'tropical' ? [0.4, 0.3, 0.2, 0.05, 0.05] :
                   climate.region === 'desert' ? [0.7, 0.2, 0.05, 0.03, 0.02] :
                   [0.3, 0.4, 0.15, 0.05, 0.1]; // temperate default

    const random = Math.random();
    let cumulative = 0;
    
    for (let i = 0; i < conditions.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative) {
        return conditions[i];
      }
    }
    
    return 'sunny';
  }

  private getFabricProperties(material: string): FabricProperties {
    const normalizedMaterial = material?.toLowerCase() || 'cotton';
    
    // Try to match known fabrics
    for (const [fabric, properties] of Object.entries(this.fabricDatabase)) {
      if (normalizedMaterial.includes(fabric)) {
        return properties;
      }
    }
    
    // Default to cotton properties
    return this.fabricDatabase['cotton'];
  }

  private calculateItemWeatherScore(item: any, fabric: FabricProperties, weather: WeatherCondition) {
    let temperatureScore = 0;
    let comfortScore = 0;
    let protectionScore = 0;
    const reasoning: string[] = [];

    // Temperature scoring
    if (weather.temperature < 10) {
      temperatureScore = fabric.insulation;
      if (fabric.insulation > 0.7) reasoning.push(`${item.name} provides good insulation for cold weather`);
    } else if (weather.temperature > 25) {
      temperatureScore = fabric.breathability;
      if (fabric.breathability > 0.7) reasoning.push(`${item.name} is breathable for warm weather`);
    } else {
      temperatureScore = (fabric.insulation + fabric.breathability) / 2;
    }

    // Comfort scoring
    if (weather.humidity > 70) {
      comfortScore = fabric.moisture_wicking;
      if (fabric.moisture_wicking > 0.6) reasoning.push(`${item.name} wicks moisture well in humid conditions`);
    } else {
      comfortScore = fabric.breathability;
    }

    // Protection scoring
    if (weather.precipitation > 30) {
      protectionScore = fabric.waterResistance;
      if (fabric.waterResistance > 0.7) reasoning.push(`${item.name} offers water protection`);
    } else if (weather.uvIndex > 6) {
      protectionScore = fabric.uvProtection;
      if (fabric.uvProtection > 0.5) reasoning.push(`${item.name} provides UV protection`);
    } else if (weather.windSpeed > 15) {
      protectionScore = fabric.windResistance;
      if (fabric.windResistance > 0.6) reasoning.push(`${item.name} resists wind`);
    } else {
      protectionScore = 0.7; // Neutral score when no specific protection needed
    }

    return {
      overall: (temperatureScore + comfortScore + protectionScore) / 3,
      temperature: temperatureScore,
      comfort: comfortScore,
      protection: protectionScore,
      reasoning
    };
  }

  private calculateAppropriatenessScore(items: any[], weather: WeatherCondition): number {
    let score = 0.7; // Base appropriateness score

    // Check for weather-appropriate layers
    const hasOuterwear = items.some(item => item.category === 'outerwear');
    const hasFootwear = items.some(item => item.category === 'shoes');

    if (weather.temperature < 15 && hasOuterwear) score += 0.15;
    if (weather.precipitation > 50 && hasOuterwear) score += 0.1;
    if (hasFootwear) score += 0.05;

    return Math.min(score, 1.0);
  }
}

export const myDresserWeather = new MyDresserWeatherSystem();
export type { WeatherCondition, OutfitWeatherScore, FabricProperties };