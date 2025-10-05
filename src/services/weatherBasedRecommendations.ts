import { WeatherData } from '@/hooks/useWeather';

export interface WeatherOutfitRecommendation {
  categories: string[];
  materials: string[];
  colors: string[];
  layers: number;
  accessories: string[];
  footwear: string[];
  reasoning: string;
}

export class WeatherBasedRecommendations {
  static getRecommendation(weather: WeatherData): WeatherOutfitRecommendation {
    const temp = weather.temperature;
    const condition = weather.condition.toLowerCase();
    const windSpeed = weather.windSpeed;
    const humidity = weather.humidity;

    // Temperature-based recommendations
    if (temp < 0) {
      return {
        categories: ['outerwear', 'tops', 'bottoms'],
        materials: ['wool', 'fleece', 'down', 'thermal'],
        colors: ['dark', 'neutral'],
        layers: 3,
        accessories: ['scarf', 'gloves', 'hat', 'thermal socks'],
        footwear: ['boots', 'insulated shoes'],
        reasoning: 'Freezing temperatures require heavy insulation and multiple layers.',
      };
    }

    if (temp < 10) {
      return {
        categories: ['outerwear', 'tops', 'bottoms'],
        materials: ['wool', 'cotton', 'denim', 'fleece'],
        colors: ['neutral', 'dark', 'earth tones'],
        layers: 2,
        accessories: condition.includes('rain') 
          ? ['umbrella', 'waterproof bag'] 
          : ['scarf', 'light gloves'],
        footwear: condition.includes('rain')
          ? ['waterproof boots', 'rain boots']
          : ['closed shoes', 'boots'],
        reasoning: 'Cold weather requires warm layers and protection from elements.',
      };
    }

    if (temp < 20) {
      const isRainy = condition.includes('rain');
      return {
        categories: ['tops', 'bottoms', isRainy ? 'outerwear' : 'light jacket'],
        materials: ['cotton', 'denim', 'light wool', isRainy ? 'waterproof' : 'breathable'],
        colors: ['versatile', 'pastels', 'neutrals'],
        layers: isRainy ? 2 : 1,
        accessories: isRainy 
          ? ['umbrella', 'waterproof bag', 'rain jacket']
          : ['light scarf', 'sunglasses'],
        footwear: isRainy
          ? ['waterproof shoes', 'boots']
          : ['sneakers', 'casual shoes'],
        reasoning: isRainy
          ? 'Mild temperature with rain - stay dry with waterproof layers.'
          : 'Comfortable temperature ideal for light layers.',
      };
    }

    if (temp < 28) {
      const isHumid = humidity > 70;
      return {
        categories: ['tops', 'bottoms'],
        materials: ['cotton', 'linen', 'breathable fabrics'],
        colors: ['light', 'bright', 'summer tones'],
        layers: 1,
        accessories: ['sunglasses', 'hat', isHumid ? 'fan' : 'light bag'],
        footwear: ['sandals', 'light sneakers', 'open shoes'],
        reasoning: isHumid
          ? 'Warm and humid - choose breathable, moisture-wicking fabrics.'
          : 'Warm weather perfect for light, comfortable clothing.',
      };
    }

    // Hot weather (28°C+)
    const isVeryHot = temp > 35;
    return {
      categories: ['tops', 'bottoms'],
      materials: ['linen', 'light cotton', 'moisture-wicking'],
      colors: ['white', 'light', 'reflective'],
      layers: 1,
      accessories: ['hat', 'sunglasses', 'sunscreen', 'water bottle'],
      footwear: ['sandals', 'flip-flops', 'breathable shoes'],
      reasoning: isVeryHot
        ? 'Extremely hot - prioritize sun protection and stay hydrated!'
        : 'Hot weather requires minimal, breathable clothing.',
    };
  }

  static filterWardrobeByWeather(
    items: any[],
    weather: WeatherData
  ): any[] {
    const recommendation = this.getRecommendation(weather);
    const temp = weather.temperature;

    return items.filter(item => {
      // Filter by category
      if (!recommendation.categories.some(cat => 
        item.category?.toLowerCase().includes(cat.toLowerCase())
      )) {
        return false;
      }

      // Filter by material
      if (item.material && !recommendation.materials.some(mat =>
        item.material.toLowerCase().includes(mat.toLowerCase())
      )) {
        return false;
      }

      // Filter by season appropriateness
      if (item.season) {
        const season = item.season.toLowerCase();
        if (temp < 10 && !['fall', 'winter', 'all-season'].includes(season)) {
          return false;
        }
        if (temp > 25 && !['summer', 'spring', 'all-season'].includes(season)) {
          return false;
        }
      }

      return true;
    });
  }

  static getWeatherScore(item: any, weather: WeatherData): number {
    let score = 50; // Base score
    const recommendation = this.getRecommendation(weather);
    const temp = weather.temperature;

    // Category match (0-20 points)
    if (recommendation.categories.some(cat =>
      item.category?.toLowerCase().includes(cat.toLowerCase())
    )) {
      score += 20;
    }

    // Material match (0-20 points)
    if (item.material && recommendation.materials.some(mat =>
      item.material.toLowerCase().includes(mat.toLowerCase())
    )) {
      score += 20;
    }

    // Season match (0-15 points)
    if (item.season) {
      const season = item.season.toLowerCase();
      if (temp < 10 && ['fall', 'winter', 'all-season'].includes(season)) {
        score += 15;
      } else if (temp >= 10 && temp < 20 && ['spring', 'fall', 'all-season'].includes(season)) {
        score += 15;
      } else if (temp >= 20 && ['summer', 'spring', 'all-season'].includes(season)) {
        score += 15;
      }
    }

    // Color appropriateness (0-10 points)
    if (item.color) {
      const color = item.color.toLowerCase();
      if (temp > 25 && ['white', 'light', 'yellow', 'pink'].some(c => color.includes(c))) {
        score += 10;
      } else if (temp < 10 && ['black', 'dark', 'navy', 'grey'].some(c => color.includes(c))) {
        score += 10;
      }
    }

    // Waterproof bonus for rain
    if (weather.condition.toLowerCase().includes('rain')) {
      if (item.material?.toLowerCase().includes('waterproof') ||
          item.tags?.some((tag: string) => tag.toLowerCase().includes('waterproof'))) {
        score += 15;
      }
    }

    return Math.min(score, 100);
  }

  static generateWeatherAlert(weather: WeatherData): string | null {
    const temp = weather.temperature;
    const condition = weather.condition.toLowerCase();

    if (temp < 0) {
      return '❄️ Freezing temperatures! Bundle up with heavy winter clothing.';
    }

    if (temp > 35) {
      return '🌡️ Extreme heat! Stay cool, hydrated, and avoid direct sun.';
    }

    if (condition.includes('rain') && weather.windSpeed > 30) {
      return '🌧️ Storm warning! Bring waterproof gear and stay safe.';
    }

    if (condition.includes('snow')) {
      return '🌨️ Snow expected! Wear insulated, waterproof clothing.';
    }

    if (weather.humidity > 80 && temp > 25) {
      return '💧 High humidity! Choose breathable, moisture-wicking fabrics.';
    }

    return null;
  }
}

export const weatherBasedRecommendations = WeatherBasedRecommendations;
