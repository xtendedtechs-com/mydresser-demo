import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useWeather } from '@/hooks/useWeather';
import { Calendar, Cloud, CloudRain, CloudSnow, Sun, Droplets } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';

export const WeatherForecast = () => {
  const { t } = useTranslation();
  const { forecast, isLoading } = useWeather();

  const getWeatherIcon = (condition: string) => {
    const cond = condition?.toLowerCase() || '';
    if (cond.includes('rain')) return <CloudRain className="h-6 w-6 text-blue-500" />;
    if (cond.includes('snow')) return <CloudSnow className="h-6 w-6 text-blue-300" />;
    if (cond.includes('cloud')) return <Cloud className="h-6 w-6 text-gray-500" />;
    return <Sun className="h-6 w-6 text-yellow-500" />;
  };

  if (isLoading || forecast.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5" />
            {t('weather.forecast', '5-Day Forecast')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="h-5 w-5" />
          {t('weather.forecast', '5-Day Forecast')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {forecast.map((day, index) => (
            <div
              key={day.date}
              className="flex flex-col items-center p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors"
            >
              <p className="text-xs font-medium mb-2">
                {index === 0
                  ? t('weather.today', 'Today')
                  : format(parseISO(day.date), 'EEE')}
              </p>
              {getWeatherIcon(day.condition)}
              <p className="text-xs text-muted-foreground capitalize mt-1">
                {day.condition}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm font-semibold">{day.high}°</span>
                <span className="text-xs text-muted-foreground">{day.low}°</span>
              </div>
              {day.precipitation > 0 && (
                <div className="flex items-center gap-1 mt-1">
                  <Droplets className="h-3 w-3 text-blue-500" />
                  <span className="text-xs text-muted-foreground">
                    {day.precipitation}%
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
