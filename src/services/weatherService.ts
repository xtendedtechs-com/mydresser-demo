export interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  description: string;
  icon: string;
  feelsLike: number;
  location: string;
}

class WeatherService {
  private cache = new Map<string, { data: WeatherData; timestamp: number }>();
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  async getCurrentWeather(latitude?: number, longitude?: number): Promise<WeatherData> {
    const cacheKey = `${latitude || 'default'}_${longitude || 'default'}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      let weatherData: WeatherData;

      if (latitude && longitude) {
        weatherData = await this.fetchWeatherByCoordinates(latitude, longitude);
      } else {
        weatherData = await this.fetchWeatherByLocation();
      }

      this.cache.set(cacheKey, { data: weatherData, timestamp: Date.now() });
      return weatherData;
    } catch (error) {
      console.warn('Weather service error:', error);
      return this.getFallbackWeather();
    }
  }

  private async fetchWeatherByCoordinates(lat: number, lon: number): Promise<WeatherData> {
    // Using Open-Meteo API (free, no API key required)
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Weather API request failed');
    
    const data = await response.json();
    return this.parseOpenMeteoData(data);
  }

  private async fetchWeatherByLocation(): Promise<WeatherData> {
    // Try to get user's location first
    const position = await this.getUserLocation();
    if (position) {
      return this.fetchWeatherByCoordinates(position.latitude, position.longitude);
    }
    return this.getFallbackWeather();
  }

  private getUserLocation(): Promise<{ latitude: number; longitude: number } | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        () => resolve(null),
        { timeout: 5000, enableHighAccuracy: false }
      );
    });
  }

  private parseOpenMeteoData(data: any): WeatherData {
    const current = data.current;
    const weatherCode = current.weather_code;
    
    return {
      temperature: Math.round(current.temperature_2m),
      condition: this.getConditionFromCode(weatherCode),
      humidity: current.relative_humidity_2m,
      windSpeed: Math.round(current.wind_speed_10m),
      description: this.getDescriptionFromCode(weatherCode),
      icon: this.getIconFromCode(weatherCode),
      feelsLike: Math.round(current.apparent_temperature),
      location: 'Current Location'
    };
  }

  private getConditionFromCode(code: number): string {
    const conditions: Record<number, string> = {
      0: 'Clear',
      1: 'Mainly Clear',
      2: 'Partly Cloudy',
      3: 'Overcast',
      45: 'Foggy',
      48: 'Depositing Rime Fog',
      51: 'Light Drizzle',
      53: 'Moderate Drizzle',
      55: 'Dense Drizzle',
      56: 'Light Freezing Drizzle',
      57: 'Dense Freezing Drizzle',
      61: 'Slight Rain',
      63: 'Moderate Rain',
      65: 'Heavy Rain',
      66: 'Light Freezing Rain',
      67: 'Heavy Freezing Rain',
      71: 'Slight Snow',
      73: 'Moderate Snow',
      75: 'Heavy Snow',
      77: 'Snow Grains',
      80: 'Slight Rain Showers',
      81: 'Moderate Rain Showers',
      82: 'Violent Rain Showers',
      85: 'Slight Snow Showers',
      86: 'Heavy Snow Showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm with Slight Hail',
      99: 'Thunderstorm with Heavy Hail'
    };

    return conditions[code] || 'Unknown';
  }

  private getDescriptionFromCode(code: number): string {
    if (code === 0) return 'Clear sky, perfect day';
    if (code <= 3) return 'Mostly clear with some clouds';
    if (code <= 48) return 'Foggy conditions';
    if (code <= 57) return 'Light precipitation';
    if (code <= 67) return 'Rainy weather';
    if (code <= 77) return 'Snowy conditions';
    if (code <= 86) return 'Shower activity';
    if (code >= 95) return 'Thunderstorm conditions';
    return 'Variable weather conditions';
  }

  private getIconFromCode(code: number): string {
    if (code === 0) return '☀️';
    if (code <= 2) return '🌤️';
    if (code === 3) return '☁️';
    if (code <= 48) return '🌫️';
    if (code <= 57) return '🌦️';
    if (code <= 67) return '🌧️';
    if (code <= 77) return '❄️';
    if (code <= 86) return '🌦️';
    if (code >= 95) return '⛈️';
    return '🌤️';
  }

  private getFallbackWeather(): WeatherData {
    // Reasonable defaults based on current season and time
    const month = new Date().getMonth();
    let temp = 20; // Default to mild
    
    if (month >= 11 || month <= 2) temp = 8; // Winter
    else if (month >= 3 && month <= 5) temp = 18; // Spring
    else if (month >= 6 && month <= 8) temp = 26; // Summer
    else temp = 15; // Fall

    return {
      temperature: temp,
      condition: 'Partly Cloudy',
      humidity: 60,
      windSpeed: 10,
      description: 'Pleasant weather conditions',
      icon: '⛅',
      feelsLike: temp,
      location: 'Estimated Location'
    };
  }

  getOutfitRecommendation(weather: WeatherData): {
    layers: string[];
    materials: string[];
    colors: string[];
    accessories: string[];
  } {
    const temp = weather.temperature;
    const condition = weather.condition.toLowerCase();
    
    let recommendation = {
      layers: [] as string[],
      materials: [] as string[],
      colors: [] as string[],
      accessories: [] as string[]
    };

    // Temperature-based recommendations
    if (temp < 5) {
      recommendation.layers = ['base layer', 'insulating layer', 'outer shell'];
      recommendation.materials = ['wool', 'down', 'fleece'];
      recommendation.accessories = ['warm hat', 'gloves', 'scarf'];
    } else if (temp < 15) {
      recommendation.layers = ['base layer', 'warm layer'];
      recommendation.materials = ['wool', 'cotton', 'denim'];
      recommendation.accessories = ['light jacket', 'closed shoes'];
    } else if (temp < 25) {
      recommendation.layers = ['comfortable base'];
      recommendation.materials = ['cotton', 'linen', 'light wool'];
      recommendation.accessories = ['light cardigan option'];
    } else {
      recommendation.layers = ['minimal coverage'];
      recommendation.materials = ['linen', 'cotton', 'breathable synthetics'];
      recommendation.accessories = ['sun protection', 'breathable shoes'];
    }

    // Weather condition adjustments
    if (condition.includes('rain') || condition.includes('shower')) {
      recommendation.accessories.push('waterproof jacket', 'umbrella');
      recommendation.materials = recommendation.materials.filter(m => m !== 'linen');
    }

    if (condition.includes('snow')) {
      recommendation.accessories.push('warm boots', 'waterproof outer layer');
    }

    if (condition.includes('sun') || condition.includes('clear')) {
      recommendation.accessories.push('sunglasses');
      recommendation.colors = ['light colors', 'breathable fabrics'];
    }

    // Humidity adjustments
    if (weather.humidity > 70) {
      recommendation.materials = recommendation.materials.filter(m => !['wool', 'synthetic'].includes(m));
      recommendation.materials.push('moisture-wicking', 'breathable');
    }

    return recommendation;
  }
}

export const weatherService = new WeatherService();