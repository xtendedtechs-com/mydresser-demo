import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  MapPin, Thermometer, Calendar, 
  Clock, Ruler, Save
} from 'lucide-react';

interface RegionalSettings {
  region: string;
  language: string;
  currency: string;
  temperatureUnit: 'celsius' | 'fahrenheit';
  dateFormat: string;
  timeFormat: '12h' | '24h';
  measurementSystem: 'metric' | 'imperial';
  showLocalTrends: boolean;
  enableLocalShipping: boolean;
}

const regions = [
  { code: 'na', name: 'North America', flag: '🌎' },
  { code: 'eu', name: 'Europe', flag: '🇪🇺' },
  { code: 'asia', name: 'Asia', flag: '🌏' },
  { code: 'oceania', name: 'Oceania', flag: '🌏' },
  { code: 'sa', name: 'South America', flag: '🌎' },
  { code: 'africa', name: 'Africa', flag: '🌍' },
  { code: 'me', name: 'Middle East', flag: '🌍' },
];

export const RegionalPreferences = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<RegionalSettings>({
    region: 'na',
    language: 'en',
    currency: 'USD',
    temperatureUnit: 'fahrenheit',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    measurementSystem: 'imperial',
    showLocalTrends: true,
    enableLocalShipping: true,
  });

  const handleSave = () => {
    // Save to localStorage or backend
    localStorage.setItem('regional-preferences', JSON.stringify(settings));
    
    toast({
      title: 'Preferences Saved',
      description: 'Your regional preferences have been updated successfully.'
    });
  };

  const updateSetting = <K extends keyof RegionalSettings>(
    key: K,
    value: RegionalSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Regional Preferences
          </CardTitle>
          <CardDescription>
            Customize your experience based on your location and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Region Selection */}
          <div className="space-y-2">
            <Label htmlFor="region">Region</Label>
            <Select value={settings.region} onValueChange={(value) => updateSetting('region', value)}>
              <SelectTrigger id="region">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {regions.map((region) => (
                  <SelectItem key={region.code} value={region.code}>
                    <div className="flex items-center gap-2">
                      <span>{region.flag}</span>
                      <span>{region.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Temperature Unit */}
          <div className="space-y-2">
            <Label htmlFor="temp-unit" className="flex items-center gap-2">
              <Thermometer className="h-4 w-4" />
              Temperature Unit
            </Label>
            <Select 
              value={settings.temperatureUnit} 
              onValueChange={(value: 'celsius' | 'fahrenheit') => updateSetting('temperatureUnit', value)}
            >
              <SelectTrigger id="temp-unit">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="celsius">Celsius (°C)</SelectItem>
                <SelectItem value="fahrenheit">Fahrenheit (°F)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Format */}
          <div className="space-y-2">
            <Label htmlFor="date-format" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Date Format
            </Label>
            <Select 
              value={settings.dateFormat} 
              onValueChange={(value) => updateSetting('dateFormat', value)}
            >
              <SelectTrigger id="date-format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (US)</SelectItem>
                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (EU)</SelectItem>
                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (ISO)</SelectItem>
                <SelectItem value="DD.MM.YYYY">DD.MM.YYYY (DE)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Time Format */}
          <div className="space-y-2">
            <Label htmlFor="time-format" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Time Format
            </Label>
            <Select 
              value={settings.timeFormat} 
              onValueChange={(value: '12h' | '24h') => updateSetting('timeFormat', value)}
            >
              <SelectTrigger id="time-format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                <SelectItem value="24h">24-hour</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Measurement System */}
          <div className="space-y-2">
            <Label htmlFor="measurement" className="flex items-center gap-2">
              <Ruler className="h-4 w-4" />
              Measurement System
            </Label>
            <Select 
              value={settings.measurementSystem} 
              onValueChange={(value: 'metric' | 'imperial') => updateSetting('measurementSystem', value)}
            >
              <SelectTrigger id="measurement">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="metric">Metric (cm, kg)</SelectItem>
                <SelectItem value="imperial">Imperial (in, lb)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Toggles */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Local Trends</Label>
                <p className="text-sm text-muted-foreground">
                  Display fashion trends popular in your region
                </p>
              </div>
              <Switch
                checked={settings.showLocalTrends}
                onCheckedChange={(checked) => updateSetting('showLocalTrends', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Local Shipping</Label>
                <p className="text-sm text-muted-foreground">
                  Prioritize sellers who ship to your region
                </p>
              </div>
              <Switch
                checked={settings.enableLocalShipping}
                onCheckedChange={(checked) => updateSetting('enableLocalShipping', checked)}
              />
            </div>
          </div>

          {/* Active Preferences Summary */}
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <p className="text-sm font-semibold mb-2">Active Preferences:</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">
                {regions.find(r => r.code === settings.region)?.flag} {regions.find(r => r.code === settings.region)?.name}
              </Badge>
              <Badge variant="secondary">
                {settings.temperatureUnit === 'celsius' ? '°C' : '°F'}
              </Badge>
              <Badge variant="secondary">
                {settings.timeFormat === '12h' ? '12h' : '24h'}
              </Badge>
              <Badge variant="secondary">
                {settings.measurementSystem === 'metric' ? 'Metric' : 'Imperial'}
              </Badge>
            </div>
          </div>

          <Button onClick={handleSave} className="w-full">
            <Save className="mr-2 h-4 w-4" />
            Save Preferences
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
