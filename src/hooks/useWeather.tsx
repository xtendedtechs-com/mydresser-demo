import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface WeatherData {
  temperature: number;
  feelsLike: number;
  condition: string;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
  location: string;
  timestamp: Date;
}

export interface WeatherForecast {
  date: string;
  high: number;
  low: number;
  condition: string;
  icon: string;
  precipitation: number;
}

const WEATHER_CACHE_KEY = 'mydresser_weather_cache';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export const useWeather = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<WeatherForecast[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const getCachedWeather = (): WeatherData | null => {
    try {
      const cached = localStorage.getItem(WEATHER_CACHE_KEY);
      if (!cached) return null;

      const data = JSON.parse(cached);
      const cacheAge = Date.now() - new Date(data.timestamp).getTime();

      if (cacheAge < CACHE_DURATION) {
        return {
          ...data,
          timestamp: new Date(data.timestamp),
        };
      }

      localStorage.removeItem(WEATHER_CACHE_KEY);
      return null;
    } catch {
      return null;
    }
  };

  const cacheWeather = (data: WeatherData) => {
    try {
      localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to cache weather:', error);
    }
  };

  const fetchWeather = async (latitude: number, longitude: number) => {
    try {
      setIsLoading(true);
      setError(null);

      // Using OpenWeatherMap API (free tier)
      const API_KEY = ''; // Will use a proxy endpoint instead
      
      // Call our edge function that proxies the weather API
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=demo`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }

      const data = await response.json();

      const weatherData: WeatherData = {
        temperature: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        condition: data.weather[0].main,
        description: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
        icon: data.weather[0].icon,
        location: data.name,
        timestamp: new Date(),
      };

      setWeather(weatherData);
      cacheWeather(weatherData);

      // Fetch forecast
      await fetchForecast(latitude, longitude);

      return weatherData;
    } catch (err) {
      const message = 'Unable to fetch weather data';
      setError(message);
      console.error('Weather fetch error:', err);
      
      // Use cached data as fallback
      const cached = getCachedWeather();
      if (cached) {
        setWeather(cached);
        toast({
          title: "Using Cached Weather",
          description: "Showing previously fetched weather data",
        });
      }
      
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchForecast = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=demo`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch forecast');
      }

      const data = await response.json();

      // Group by date and get daily forecast
      const dailyForecasts = new Map<string, any>();
      
      data.list.forEach((item: any) => {
        const date = item.dt_txt.split(' ')[0];
        if (!dailyForecasts.has(date)) {
          dailyForecasts.set(date, {
            date,
            temps: [item.main.temp],
            condition: item.weather[0].main,
            icon: item.weather[0].icon,
            precipitation: item.pop * 100,
          });
        } else {
          const existing = dailyForecasts.get(date);
          existing.temps.push(item.main.temp);
        }
      });

      const forecastData: WeatherForecast[] = Array.from(dailyForecasts.values())
        .slice(0, 5)
        .map(day => ({
          date: day.date,
          high: Math.round(Math.max(...day.temps)),
          low: Math.round(Math.min(...day.temps)),
          condition: day.condition,
          icon: day.icon,
          precipitation: Math.round(day.precipitation),
        }));

      setForecast(forecastData);
    } catch (err) {
      console.error('Forecast fetch error:', err);
    }
  };

  const getWeatherByLocation = async () => {
    // Check cache first
    const cached = getCachedWeather();
    if (cached) {
      setWeather(cached);
      return cached;
    }

    if (!navigator.geolocation) {
      const message = 'Geolocation not supported';
      setError(message);
      toast({
        title: "Location Error",
        description: message,
        variant: "destructive",
      });
      return null;
    }

    return new Promise<WeatherData | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const data = await fetchWeather(
              position.coords.latitude,
              position.coords.longitude
            );
            resolve(data);
          } catch {
            resolve(null);
          }
        },
        (error) => {
          let message = 'Unable to get your location';
          if (error.code === error.PERMISSION_DENIED) {
            message = 'Location permission denied';
          }
          setError(message);
          toast({
            title: "Location Error",
            description: message,
            variant: "destructive",
          });
          resolve(null);
        },
        { timeout: 10000 }
      );
    });
  };

  const getWeatherByCity = async (city: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=demo`
      );

      if (!response.ok) {
        throw new Error('City not found');
      }

      const data = await response.json();

      const weatherData: WeatherData = {
        temperature: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        condition: data.weather[0].main,
        description: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed * 3.6),
        icon: data.weather[0].icon,
        location: data.name,
        timestamp: new Date(),
      };

      setWeather(weatherData);
      cacheWeather(weatherData);

      // Fetch forecast using coordinates
      await fetchForecast(data.coord.lat, data.coord.lon);

      return weatherData;
    } catch (err) {
      const message = 'City not found or unable to fetch weather';
      setError(message);
      toast({
        title: "Weather Error",
        description: message,
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getOutfitSuggestion = (weatherData: WeatherData): string => {
    const temp = weatherData.temperature;
    const condition = weatherData.condition.toLowerCase();

    if (temp < 0) {
      return 'Heavy winter coat, thermal layers, warm accessories';
    } else if (temp < 10) {
      return 'Coat or jacket, long pants, closed shoes';
    } else if (temp < 15) {
      return 'Light jacket, jeans, comfortable footwear';
    } else if (temp < 20) {
      return 'Light sweater or cardigan, comfortable outfit';
    } else if (temp < 25) {
      return 'T-shirt, light pants or jeans, sneakers';
    } else if (temp < 30) {
      return 'Light, breathable clothing, sandals or light shoes';
    } else {
      return 'Very light, breathable fabrics, stay cool!';
    }
  };

  useEffect(() => {
    // Load cached weather on mount
    const cached = getCachedWeather();
    if (cached) {
      setWeather(cached);
    }
  }, []);

  return {
    weather,
    forecast,
    isLoading,
    error,
    getWeatherByLocation,
    getWeatherByCity,
    getOutfitSuggestion,
    refreshWeather: getWeatherByLocation,
  };
};
