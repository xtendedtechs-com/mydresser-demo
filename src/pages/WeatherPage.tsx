import { useState, useEffect } from 'react';
import { WeatherWidget } from '@/components/weather/WeatherWidget';
import { WeatherForecast } from '@/components/weather/WeatherForecast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useWeather } from '@/hooks/useWeather';
import { useWardrobe } from '@/hooks/useWardrobe';
import { weatherBasedRecommendations } from '@/services/weatherBasedRecommendations';
import { Cloud, Search, Sparkles, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { OptimizedImage } from '@/components/OptimizedImage';

export default function WeatherPage() {
  const { t } = useTranslation();
  const { weather } = useWeather();
  const { items } = useWardrobe();
  const [citySearch, setCitySearch] = useState('');
  const [recommendedItems, setRecommendedItems] = useState<any[]>([]);
  const [weatherAlert, setWeatherAlert] = useState<string | null>(null);

  useEffect(() => {
    if (weather && items.length > 0) {
      // Filter items suitable for current weather
      const filtered = weatherBasedRecommendations.filterWardrobeByWeather(items, weather);
      
      // Score and sort items
      const scored = filtered
        .map(item => ({
          ...item,
          weatherScore: weatherBasedRecommendations.getWeatherScore(item, weather),
        }))
        .sort((a, b) => b.weatherScore - a.weatherScore)
        .slice(0, 12);

      setRecommendedItems(scored);

      // Generate weather alert
      const alert = weatherBasedRecommendations.generateWeatherAlert(weather);
      setWeatherAlert(alert);
    }
  }, [weather, items]);

  const recommendation = weather 
    ? weatherBasedRecommendations.getRecommendation(weather)
    : null;

  return (
    <div className="container mx-auto p-4 pb-20 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Cloud className="h-8 w-8" />
          {t('weather.title', 'Weather & Smart Suggestions')}
        </h1>
        <p className="text-muted-foreground">
          {t('weather.description', 'Get outfit recommendations based on real-time weather')}
        </p>
      </div>

      {/* Weather Alert */}
      {weatherAlert && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{weatherAlert}</AlertDescription>
        </Alert>
      )}

      {/* Weather Widgets */}
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <WeatherWidget />
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              {t('weather.searchCity', 'Search City')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder={t('weather.enterCity', 'Enter city name...')}
                value={citySearch}
                onChange={(e) => setCitySearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && citySearch.trim()) {
                    // Would call getWeatherByCity here
                  }
                }}
              />
              <Button disabled={!citySearch.trim()}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 5-Day Forecast */}
      <div className="mb-6">
        <WeatherForecast />
      </div>

      {/* Weather Recommendations */}
      {recommendation && (
        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                {t('weather.recommendations', 'Weather Recommendations')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">
                  {t('weather.suggestedMaterials', 'Suggested Materials')}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {recommendation.materials.map((material) => (
                    <span
                      key={material}
                      className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full"
                    >
                      {material}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">
                  {t('weather.suggestedColors', 'Suggested Colors')}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {recommendation.colors.map((color) => (
                    <span
                      key={color}
                      className="px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded-full"
                    >
                      {color}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">
                  {t('weather.accessories', 'Recommended Accessories')}
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {recommendation.accessories.map((accessory) => (
                    <li key={accessory}>• {accessory}</li>
                  ))}
                </ul>
              </div>

              <div className="pt-3 border-t">
                <p className="text-sm text-muted-foreground">
                  {recommendation.reasoning}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {t('weather.layering', 'Layering Guide')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {t('weather.recommendedLayers', 'Recommended Layers')}
                </span>
                <span className="text-2xl font-bold text-primary">
                  {recommendation.layers}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">
                  {t('weather.footwear', 'Footwear')}
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {recommendation.footwear.map((shoe) => (
                    <li key={shoe}>• {shoe}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recommended Items from Wardrobe */}
      {recommendedItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              {t('weather.wardrobeMatches', 'Perfect Matches from Your Wardrobe')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {recommendedItems.map((item) => (
                <div key={item.id} className="group relative">
                  <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                    <OptimizedImage
                      src={item.photos?.main || '/placeholder.svg'}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Sparkles className="h-3 w-3 text-yellow-500" />
                      <span className="text-xs text-muted-foreground">
                        {item.weatherScore}% match
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
