import { WardrobeItem } from '@/hooks/useWardrobe';
import { WeatherContext, DetailedScore } from './types';

export class WeatherMatcher {
  private weatherRules: Map<string, WeatherRule> = new Map();
  private materialProperties: Map<string, MaterialProperties> = new Map();
  private layeringStrategies: LayeringStrategy[] = [];

  constructor() {
    this.initializeWeatherSystem();
  }

  private initializeWeatherSystem(): void {
    this.setupWeatherRules();
    this.setupMaterialProperties();
    this.setupLayeringStrategies();
  }

  private setupWeatherRules(): void {
    const rules: Record<string, WeatherRule> = {
      'freezing': { // < 0°C
        temperature: { min: -30, max: 0 },
        requiredLayers: ['base', 'insulation', 'outer', 'extremities'],
        preferredMaterials: ['wool', 'down', 'fleece', 'synthetic insulation'],
        avoidedMaterials: ['cotton', 'linen', 'silk'],
        coverage: { body: 95, extremities: 100 },
        breathability: 'low',
        waterResistance: 'high',
        windResistance: 'high'
      },

      'cold': { // 0-10°C
        temperature: { min: 0, max: 10 },
        requiredLayers: ['base', 'mid', 'outer'],
        preferredMaterials: ['wool', 'fleece', 'cotton blend', 'synthetic'],
        avoidedMaterials: ['linen', 'mesh'],
        coverage: { body: 85, extremities: 80 },
        breathability: 'medium-low',
        waterResistance: 'medium-high',
        windResistance: 'high'
      },

      'cool': { // 10-18°C
        temperature: { min: 10, max: 18 },
        requiredLayers: ['base', 'mid'],
        preferredMaterials: ['cotton', 'light wool', 'denim', 'polyester'],
        avoidedMaterials: ['heavy wool', 'down'],
        coverage: { body: 70, extremities: 60 },
        breathability: 'medium',
        waterResistance: 'medium',
        windResistance: 'medium'
      },

      'mild': { // 18-25°C
        temperature: { min: 18, max: 25 },
        requiredLayers: ['base'],
        preferredMaterials: ['cotton', 'linen blend', 'modal', 'viscose'],
        avoidedMaterials: ['wool', 'fleece', 'heavy denim'],
        coverage: { body: 60, extremities: 40 },
        breathability: 'medium-high',
        waterResistance: 'low-medium',
        windResistance: 'low-medium'
      },

      'warm': { // 25-32°C
        temperature: { min: 25, max: 32 },
        requiredLayers: ['base'],
        preferredMaterials: ['cotton', 'linen', 'modal', 'bamboo', 'tencel'],
        avoidedMaterials: ['wool', 'polyester', 'acrylic'],
        coverage: { body: 50, extremities: 30 },
        breathability: 'high',
        waterResistance: 'low',
        windResistance: 'low'
      },

      'hot': { // > 32°C
        temperature: { min: 32, max: 50 },
        requiredLayers: ['minimal'],
        preferredMaterials: ['linen', 'cotton', 'bamboo', 'moisture-wicking'],
        avoidedMaterials: ['synthetic', 'wool', 'heavy fabrics'],
        coverage: { body: 40, extremities: 20 },
        breathability: 'maximum',
        waterResistance: 'minimal',
        windResistance: 'minimal'
      }
    };

    Object.entries(rules).forEach(([condition, rule]) => {
      this.weatherRules.set(condition, rule);
    });
  }

  private setupMaterialProperties(): void {
    const materials: Record<string, MaterialProperties> = {
      // Natural Fibers
      'cotton': {
        breathability: 80,
        moistureWicking: 30,
        insulation: 40,
        durability: 70,
        comfort: 85,
        weatherResistance: 30,
        temperatureRange: { min: 15, max: 35 }
      },
      'linen': {
        breathability: 95,
        moistureWicking: 70,
        insulation: 20,
        durability: 60,
        comfort: 90,
        weatherResistance: 20,
        temperatureRange: { min: 20, max: 40 }
      },
      'wool': {
        breathability: 60,
        moistureWicking: 80,
        insulation: 90,
        durability: 85,
        comfort: 75,
        weatherResistance: 70,
        temperatureRange: { min: -10, max: 20 }
      },
      'silk': {
        breathability: 70,
        moistureWicking: 60,
        insulation: 50,
        durability: 50,
        comfort: 95,
        weatherResistance: 25,
        temperatureRange: { min: 10, max: 30 }
      },

      // Synthetic Fibers
      'polyester': {
        breathability: 40,
        moistureWicking: 85,
        insulation: 60,
        durability: 90,
        comfort: 65,
        weatherResistance: 80,
        temperatureRange: { min: 5, max: 30 }
      },
      'nylon': {
        breathability: 45,
        moistureWicking: 75,
        insulation: 50,
        durability: 95,
        comfort: 60,
        weatherResistance: 90,
        temperatureRange: { min: 0, max: 35 }
      },
      'spandex': {
        breathability: 70,
        moistureWicking: 60,
        insulation: 30,
        durability: 70,
        comfort: 80,
        weatherResistance: 40,
        temperatureRange: { min: 10, max: 35 }
      },

      // Blends and Special Materials
      'cotton blend': {
        breathability: 70,
        moistureWicking: 60,
        insulation: 50,
        durability: 80,
        comfort: 80,
        weatherResistance: 50,
        temperatureRange: { min: 10, max: 30 }
      },
      'wool blend': {
        breathability: 65,
        moistureWicking: 75,
        insulation: 75,
        durability: 80,
        comfort: 80,
        weatherResistance: 65,
        temperatureRange: { min: 0, max: 25 }
      },
      'fleece': {
        breathability: 50,
        moistureWicking: 70,
        insulation: 85,
        durability: 75,
        comfort: 85,
        weatherResistance: 60,
        temperatureRange: { min: -5, max: 15 }
      },
      'down': {
        breathability: 30,
        moistureWicking: 20,
        insulation: 95,
        durability: 60,
        comfort: 70,
        weatherResistance: 40,
        temperatureRange: { min: -20, max: 10 }
      }
    };

    Object.entries(materials).forEach(([name, properties]) => {
      this.materialProperties.set(name.toLowerCase(), properties);
    });
  }

  private setupLayeringStrategies(): void {
    this.layeringStrategies = [
      {
        name: 'Base Layer System',
        temperatureRange: { min: -20, max: 10 },
        layers: [
          { type: 'base', purpose: 'moisture management', materials: ['merino wool', 'synthetic'] },
          { type: 'insulation', purpose: 'warmth retention', materials: ['fleece', 'down', 'wool'] },
          { type: 'shell', purpose: 'weather protection', materials: ['gore-tex', 'nylon', 'polyester'] }
        ],
        advantages: ['Temperature regulation', 'Moisture control', 'Adaptability']
      },
      {
        name: 'Light Layering',
        temperatureRange: { min: 10, max: 25 },
        layers: [
          { type: 'base', purpose: 'comfort and style', materials: ['cotton', 'modal', 'linen blend'] },
          { type: 'mid', purpose: 'style and light warmth', materials: ['cardigan', 'light sweater', 'blazer'] }
        ],
        advantages: ['Style flexibility', 'Easy adjustment', 'Professional appearance']
      },
      {
        name: 'Minimal Approach',
        temperatureRange: { min: 25, max: 45 },
        layers: [
          { type: 'single', purpose: 'comfort and breathability', materials: ['linen', 'cotton', 'bamboo'] }
        ],
        advantages: ['Maximum comfort', 'Optimal breathability', 'Minimal restriction']
      }
    ];
  }

  public analyzeWeatherSuitability(items: WardrobeItem[], weather: WeatherContext): DetailedScore {
    const weatherCondition = this.determineWeatherCondition(weather);
    const rule = this.weatherRules.get(weatherCondition);
    
    if (!rule) {
      return {
        score: 50,
        reasoning: 'Unable to determine weather appropriateness',
        factors: []
      };
    }

    let score = 50;
    const factors: Array<{ name: string; impact: number; description: string }> = [];

    // Temperature appropriateness
    const tempScore = this.analyzeTemperatureAppropriatenss(items, weather, rule);
    score += tempScore.impact;
    factors.push(tempScore);

    // Material suitability
    const materialScore = this.analyzeMaterialSuitability(items, rule);
    score += materialScore.impact;
    factors.push(materialScore);

    // Layering appropriateness
    const layeringScore = this.analyzeLayering(items, rule);
    score += layeringScore.impact;
    factors.push(layeringScore);

    // Coverage adequacy
    const coverageScore = this.analyzeCoverage(items, rule);
    score += coverageScore.impact;
    factors.push(coverageScore);

    // Special weather conditions
    const specialScore = this.analyzeSpecialConditions(items, weather, rule);
    score += specialScore.impact;
    factors.push(specialScore);

    return {
      score: Math.max(0, Math.min(100, score)),
      reasoning: this.generateWeatherReasoning(weatherCondition, weather, factors),
      factors
    };
  }

  private determineWeatherCondition(weather: WeatherContext): string {
    const temp = weather.temperature;
    
    if (temp < 0) return 'freezing';
    if (temp < 10) return 'cold';
    if (temp < 18) return 'cool';
    if (temp < 25) return 'mild';
    if (temp < 32) return 'warm';
    return 'hot';
  }

  private analyzeTemperatureAppropriatenss(
    items: WardrobeItem[], 
    weather: WeatherContext, 
    rule: WeatherRule
  ): { name: string; impact: number; description: string } {
    const materials = items.map(item => item.material?.toLowerCase()).filter(Boolean);
    let suitableCount = 0;

    materials.forEach(material => {
      const properties = this.materialProperties.get(material!);
      if (properties) {
        const { min, max } = properties.temperatureRange;
        if (weather.temperature >= min && weather.temperature <= max) {
          suitableCount++;
        }
      }
    });

    const suitabilityRatio = suitableCount / Math.max(materials.length, 1);
    const impact = (suitabilityRatio - 0.5) * 40; // -20 to +20

    return {
      name: 'Temperature Appropriateness',
      impact,
      description: `${Math.round(suitabilityRatio * 100)}% of materials are suitable for ${weather.temperature}°C`
    };
  }

  private analyzeMaterialSuitability(
    items: WardrobeItem[], 
    rule: WeatherRule
  ): { name: string; impact: number; description: string } {
    const materials = items.map(item => item.material?.toLowerCase()).filter(Boolean);
    let score = 0;

    const preferredCount = materials.filter(material => 
      rule.preferredMaterials.some(preferred => material?.includes(preferred.toLowerCase()))
    ).length;

    const avoidedCount = materials.filter(material =>
      rule.avoidedMaterials.some(avoided => material?.includes(avoided.toLowerCase()))
    ).length;

    score += (preferredCount / Math.max(materials.length, 1)) * 20;
    score -= (avoidedCount / Math.max(materials.length, 1)) * 15;

    return {
      name: 'Material Suitability',
      impact: score,
      description: `Materials ${score > 0 ? 'well' : 'poorly'} matched to weather conditions`
    };
  }

  private analyzeLayering(
    items: WardrobeItem[], 
    rule: WeatherRule
  ): { name: string; impact: number; description: string } {
    const categories = items.map(item => item.category.toLowerCase());
    const layers = this.categorizeByLayers(categories);

    let score = 0;
    let hasRequiredLayers = true;

    rule.requiredLayers.forEach(requiredLayer => {
      if (!layers[requiredLayer] || layers[requiredLayer].length === 0) {
        hasRequiredLayers = false;
        score -= 8;
      }
    });

    if (hasRequiredLayers) {
      score += 15;
    }

    // Bonus for appropriate layer count
    const totalLayers = Object.values(layers).reduce((sum, layer) => sum + layer.length, 0);
    const optimalLayers = rule.requiredLayers.length;
    
    if (totalLayers === optimalLayers) {
      score += 10;
    } else if (Math.abs(totalLayers - optimalLayers) <= 1) {
      score += 5;
    } else {
      score -= Math.abs(totalLayers - optimalLayers) * 3;
    }

    return {
      name: 'Layering Strategy',
      impact: score,
      description: `Layering ${score > 0 ? 'appropriate' : 'inappropriate'} for conditions`
    };
  }

  private categorizeByLayers(categories: string[]): Record<string, string[]> {
    const layers: Record<string, string[]> = {
      base: [],
      mid: [],
      outer: [],
      extremities: []
    };

    categories.forEach(category => {
      if (['underwear', 'base layer', 't-shirt', 'tank top'].some(base => category.includes(base))) {
        layers.base.push(category);
      } else if (['sweater', 'cardigan', 'hoodie', 'vest'].some(mid => category.includes(mid))) {
        layers.mid.push(category);
      } else if (['jacket', 'coat', 'blazer', 'puffer'].some(outer => category.includes(outer))) {
        layers.outer.push(category);
      } else if (['hat', 'gloves', 'scarf', 'boots'].some(ext => category.includes(ext))) {
        layers.extremities.push(category);
      }
    });

    return layers;
  }

  private analyzeCoverage(
    items: WardrobeItem[], 
    rule: WeatherRule
  ): { name: string; impact: number; description: string } {
    const categories = items.map(item => item.category.toLowerCase());
    
    // Calculate body coverage
    let bodyCoverage = 0;
    let extremitiesCoverage = 0;

    // Body coverage items
    const bodyItems = ['long sleeves', 'sweater', 'jacket', 'coat', 'pants', 'jeans', 'leggings'];
    const extremityItems = ['boots', 'closed shoes', 'hat', 'gloves', 'scarf'];

    categories.forEach(category => {
      if (bodyItems.some(item => category.includes(item))) {
        bodyCoverage += 25;
      }
      if (extremityItems.some(item => category.includes(item))) {
        extremitiesCoverage += 20;
      }
    });

    bodyCoverage = Math.min(100, bodyCoverage);
    extremitiesCoverage = Math.min(100, extremitiesCoverage);

    const bodyScore = (bodyCoverage / rule.coverage.body) * 10;
    const extremityScore = (extremitiesCoverage / rule.coverage.extremities) * 10;
    const totalScore = Math.min(20, bodyScore + extremityScore) - 10;

    return {
      name: 'Coverage Adequacy',
      impact: totalScore,
      description: `${Math.round(bodyCoverage)}% body coverage, ${Math.round(extremitiesCoverage)}% extremity coverage`
    };
  }

  private analyzeSpecialConditions(
    items: WardrobeItem[], 
    weather: WeatherContext, 
    rule: WeatherRule
  ): { name: string; impact: number; description: string } {
    let score = 0;
    const conditions: string[] = [];

    // Rain/precipitation
    if (weather.precipitation && weather.precipitation > 50) {
      const hasWaterResistant = items.some(item => 
        item.material?.toLowerCase().includes('waterproof') ||
        item.material?.toLowerCase().includes('water-resistant') ||
        item.name.toLowerCase().includes('rain')
      );
      
      if (hasWaterResistant) {
        score += 10;
        conditions.push('rain protection');
      } else {
        score -= 8;
        conditions.push('lacking rain protection');
      }
    }

    // High wind
    if (weather.windSpeed > 20) {
      const hasWindResistant = items.some(item =>
        item.name.toLowerCase().includes('windbreaker') ||
        item.category.toLowerCase().includes('jacket') ||
        item.category.toLowerCase().includes('coat')
      );
      
      if (hasWindResistant) {
        score += 8;
        conditions.push('wind protection');
      } else {
        score -= 6;
        conditions.push('lacking wind protection');
      }
    }

    // High UV/sun exposure
    if (weather.uvIndex && weather.uvIndex > 7) {
      const hasSunProtection = items.some(item =>
        item.name.toLowerCase().includes('hat') ||
        item.name.toLowerCase().includes('long sleeve') ||
        item.name.toLowerCase().includes('sun')
      );
      
      if (hasSunProtection) {
        score += 6;
        conditions.push('UV protection');
      } else {
        score -= 5;
        conditions.push('lacking UV protection');
      }
    }

    return {
      name: 'Special Conditions',
      impact: score,
      description: conditions.length > 0 ? conditions.join(', ') : 'No special conditions needed'
    };
  }

  private generateWeatherReasoning(
    condition: string, 
    weather: WeatherContext, 
    factors: any[]
  ): string {
    const positiveFactors = factors.filter(f => f.impact > 5);
    const negativeFactors = factors.filter(f => f.impact < -5);
    
    let reasoning = `For ${condition} weather (${weather.temperature}°C), this outfit `;
    
    if (positiveFactors.length > negativeFactors.length) {
      reasoning += 'is well-suited with good ';
      reasoning += positiveFactors.map(f => f.name.toLowerCase()).join(' and ');
    } else if (negativeFactors.length > 0) {
      reasoning += 'needs improvement in ';
      reasoning += negativeFactors.map(f => f.name.toLowerCase()).join(' and ');
    } else {
      reasoning += 'provides adequate weather protection';
    }

    // Add specific weather advice
    if (weather.humidity > 70) {
      reasoning += '. High humidity suggests breathable fabrics are important';
    }
    
    if (weather.windSpeed > 15) {
      reasoning += '. Wind protection is recommended';
    }

    return reasoning + '.';
  }

  public generateWeatherRecommendations(
    items: WardrobeItem[], 
    weather: WeatherContext
  ): WeatherRecommendation[] {
    const condition = this.determineWeatherCondition(weather);
    const rule = this.weatherRules.get(condition);
    
    if (!rule) return [];

    const recommendations: WeatherRecommendation[] = [];
    
    // Layer recommendations
    const strategy = this.findBestLayeringStrategy(weather);
    if (strategy) {
      recommendations.push({
        type: 'layering',
        priority: 'high',
        suggestion: `Use ${strategy.name.toLowerCase()} for optimal comfort`,
        explanation: strategy.advantages.join(', ')
      });
    }

    // Material recommendations
    const currentMaterials = [...new Set(items.map(item => item.material?.toLowerCase()).filter(Boolean))];
    const missingMaterials = rule.preferredMaterials.filter(material => 
      !currentMaterials.some(current => current?.includes(material.toLowerCase()))
    );

    if (missingMaterials.length > 0) {
      recommendations.push({
        type: 'material',
        priority: 'medium',
        suggestion: `Consider materials like ${missingMaterials.slice(0, 2).join(' or ')}`,
        explanation: 'Better suited for current weather conditions'
      });
    }

    // Special weather recommendations
    if (weather.precipitation && weather.precipitation > 30) {
      recommendations.push({
        type: 'protection',
        priority: 'high',
        suggestion: 'Add waterproof outer layer',
        explanation: 'Rain protection is essential'
      });
    }

    return recommendations.slice(0, 5);
  }

  private findBestLayeringStrategy(weather: WeatherContext): LayeringStrategy | null {
    const temp = weather.temperature;
    
    return this.layeringStrategies.find(strategy => 
      temp >= strategy.temperatureRange.min && temp <= strategy.temperatureRange.max
    ) || null;
  }
}

interface WeatherRule {
  temperature: { min: number; max: number };
  requiredLayers: string[];
  preferredMaterials: string[];
  avoidedMaterials: string[];
  coverage: { body: number; extremities: number };
  breathability: string;
  waterResistance: string;
  windResistance: string;
}

interface MaterialProperties {
  breathability: number;
  moistureWicking: number;
  insulation: number;
  durability: number;
  comfort: number;
  weatherResistance: number;
  temperatureRange: { min: number; max: number };
}

interface LayeringStrategy {
  name: string;
  temperatureRange: { min: number; max: number };
  layers: Array<{
    type: string;
    purpose: string;
    materials: string[];
  }>;
  advantages: string[];
}

interface WeatherRecommendation {
  type: 'layering' | 'material' | 'protection' | 'coverage';
  priority: 'high' | 'medium' | 'low';
  suggestion: string;
  explanation: string;
}

export const weatherMatcher = new WeatherMatcher();