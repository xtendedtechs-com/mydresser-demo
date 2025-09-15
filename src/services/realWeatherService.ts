export interface WeatherData {
  temperature: number;
  feelsLike: number;
  condition: string;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
  location: string;
}

class RealWeatherService {
  private readonly API_KEY = 'demo_key'; // In production, use actual API key
  private readonly BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

  async getCurrentWeather(latitude?: number, longitude?: number): Promise<WeatherData> {
    try {
      // For demo purposes, return realistic weather data
      // In production, make actual API calls
      const mockWeatherConditions = [
        { condition: 'Clear', description: 'Clear sky', icon: '☀️', temp: 22 },
        { condition: 'Cloudy', description: 'Partly cloudy', icon: '⛅', temp: 18 },
        { condition: 'Rainy', description: 'Light rain', icon: '🌧️', temp: 15 },
        { condition: 'Sunny', description: 'Sunny weather', icon: '🌞', temp: 25 }
      ];

      const randomWeather = mockWeatherConditions[
        Math.floor(Math.random() * mockWeatherConditions.length)
      ];

      return {
        temperature: randomWeather.temp,
        feelsLike: randomWeather.temp + Math.floor(Math.random() * 4) - 2,
        condition: randomWeather.condition,
        description: randomWeather.description,
        humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
        windSpeed: Math.floor(Math.random() * 20) + 5, // 5-25 km/h
        icon: randomWeather.icon,
        location: latitude && longitude ? 'Current Location' : 'Default Location'
      };
    } catch (error) {
      console.error('Weather service error:', error);
      // Fallback weather data
      return {
        temperature: 20,
        feelsLike: 22,
        condition: 'Mild',
        description: 'Pleasant weather',
        humidity: 60,
        windSpeed: 10,
        icon: '🌤️',
        location: 'Unknown'
      };
    }
  }

  async getWeatherForecast(latitude?: number, longitude?: number, days: number = 5): Promise<WeatherData[]> {
    const forecast: WeatherData[] = [];
    
    for (let i = 0; i < days; i++) {
      const baseWeather = await this.getCurrentWeather(latitude, longitude);
      // Vary the temperature slightly for each day
      forecast.push({
        ...baseWeather,
        temperature: baseWeather.temperature + Math.floor(Math.random() * 6) - 3
      });
    }
    
    return forecast;
  }

  getWeatherRecommendations(weather: WeatherData): string[] {
    const recommendations: string[] = [];
    
    if (weather.temperature < 10) {
      recommendations.push('Wear warm layers', 'Consider a coat or jacket', 'Don\'t forget gloves and a hat');
    } else if (weather.temperature < 20) {
      recommendations.push('Light jacket recommended', 'Layer for comfort', 'Long pants suggested');
    } else if (weather.temperature > 25) {
      recommendations.push('Light, breathable fabrics', 'Shorts and t-shirts', 'Don\'t forget sunscreen');
    }

    if (weather.condition.toLowerCase().includes('rain')) {
      recommendations.push('Bring an umbrella', 'Waterproof shoes', 'Quick-dry materials');
    }

    if (weather.windSpeed > 20) {
      recommendations.push('Secure loose items', 'Wind-resistant outerwear');
    }

    return recommendations;
  }
}

export const realWeatherService = new RealWeatherService();