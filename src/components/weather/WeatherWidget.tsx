import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useWeather } from '@/hooks/useWeather';
import { 
  Cloud, 
  CloudRain, 
  CloudSnow, 
  Sun, 
  Wind, 
  Droplets, 
  MapPin,
  RefreshCw,
  Thermometer
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const WeatherWidget = () => {
  const { t } = useTranslation();
  const { 
    weather, 
    isLoading, 
    error, 
    getWeatherByLocation, 
    refreshWeather,
    getOutfitSuggestion 
  } = useWeather();

  useEffect(() => {
    if (!weather) {
      getWeatherByLocation();
    }
  }, []);

  const getWeatherIcon = (condition: string) => {
    const cond = condition?.toLowerCase() || '';
    if (cond.includes('rain')) return <CloudRain className="h-12 w-12 text-blue-500" />;
    if (cond.includes('snow')) return <CloudSnow className="h-12 w-12 text-blue-300" />;
    if (cond.includes('cloud')) return <Cloud className="h-12 w-12 text-gray-500" />;
    return <Sun className="h-12 w-12 text-yellow-500" />;
  };

  const getTemperatureColor = (temp: number) => {
    if (temp < 0) return 'text-blue-600';
    if (temp < 10) return 'text-blue-500';
    if (temp < 20) return 'text-green-500';
    if (temp < 30) return 'text-orange-500';
    return 'text-red-500';
  };

  if (isLoading && !weather) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            {t('weather.title', 'Weather')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error && !weather) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            {t('weather.title', 'Weather')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button onClick={getWeatherByLocation} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            {t('weather.retry', 'Try Again')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!weather) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Cloud className="h-5 w-5" />
            {t('weather.title', 'Weather')}
          </CardTitle>
          <Button
            onClick={refreshWeather}
            variant="ghost"
            size="sm"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Weather */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {getWeatherIcon(weather.condition)}
            <div>
              <div className="flex items-baseline gap-1">
                <span className={`text-4xl font-bold ${getTemperatureColor(weather.temperature)}`}>
                  {weather.temperature}
                </span>
                <span className="text-2xl text-muted-foreground">°C</span>
              </div>
              <p className="text-sm text-muted-foreground capitalize">
                {weather.description}
              </p>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{weather.location}</span>
        </div>

        {/* Weather Details */}
        <div className="grid grid-cols-3 gap-3 pt-2 border-t">
          <div className="flex flex-col items-center">
            <Thermometer className="h-4 w-4 text-muted-foreground mb-1" />
            <span className="text-xs text-muted-foreground">
              {t('weather.feelsLike', 'Feels Like')}
            </span>
            <span className="text-sm font-medium">{weather.feelsLike}°C</span>
          </div>
          <div className="flex flex-col items-center">
            <Droplets className="h-4 w-4 text-muted-foreground mb-1" />
            <span className="text-xs text-muted-foreground">
              {t('weather.humidity', 'Humidity')}
            </span>
            <span className="text-sm font-medium">{weather.humidity}%</span>
          </div>
          <div className="flex flex-col items-center">
            <Wind className="h-4 w-4 text-muted-foreground mb-1" />
            <span className="text-xs text-muted-foreground">
              {t('weather.wind', 'Wind')}
            </span>
            <span className="text-sm font-medium">{weather.windSpeed} km/h</span>
          </div>
        </div>

        {/* Outfit Suggestion */}
        <div className="pt-3 border-t">
          <h4 className="text-sm font-medium mb-2">
            {t('weather.suggestion', 'Outfit Suggestion')}
          </h4>
          <Badge variant="secondary" className="text-xs">
            {getOutfitSuggestion(weather)}
          </Badge>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          {t('weather.lastUpdated', 'Last updated')}: {weather.timestamp.toLocaleTimeString()}
        </p>
      </CardContent>
    </Card>
  );
};
