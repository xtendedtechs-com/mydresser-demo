import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, Cloud, Clock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DailyOutfitCard } from '@/components/dresser/DailyOutfitCard';
import { outfitSuggestionService } from '@/services/outfitSuggestionService';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const DresserPage = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [timeSlot, setTimeSlot] = useState<string>('morning');
  const [occasion, setOccasion] = useState<string>('casual');
  const [weather, setWeather] = useState<any>(null);

  useEffect(() => {
    loadSuggestions();
    loadWeather();
  }, [timeSlot]);

  const loadSuggestions = async () => {
    setLoading(true);
    try {
      const data = await outfitSuggestionService.getTodaySuggestions(timeSlot);
      setSuggestions(data);
    } catch (error) {
      console.error('Error loading suggestions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load outfit suggestions',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadWeather = async () => {
    try {
      const weatherData = await outfitSuggestionService.getWeatherForLocation();
      setWeather(weatherData);
    } catch (error) {
      console.error('Error loading weather:', error);
    }
  };

  const handleGenerateNew = async () => {
    setGenerating(true);
    try {
      const newSuggestion = await outfitSuggestionService.generateNewSuggestion(
        occasion,
        timeSlot,
        weather
      );
      
      toast({
        title: 'New Outfit Generated',
        description: 'Check out your fresh outfit suggestion!'
      });
      
      await loadSuggestions();
    } catch (error) {
      console.error('Error generating outfit:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate new outfit',
        variant: 'destructive'
      });
    } finally {
      setGenerating(false);
    }
  };

  const timeSlots = [
    { value: 'morning', label: 'Morning', icon: '🌅' },
    { value: 'afternoon', label: 'Afternoon', icon: '☀️' },
    { value: 'evening', label: 'Evening', icon: '🌆' },
    { value: 'night', label: 'Night', icon: '🌙' }
  ];

  const occasions = [
    { value: 'casual', label: 'Casual' },
    { value: 'business', label: 'Business' },
    { value: 'formal', label: 'Formal' },
    { value: 'sport', label: 'Sport' },
    { value: 'party', label: 'Party' }
  ];

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4 pb-24">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Dresser</h1>
        </div>
        <p className="text-muted-foreground">
          AI-powered outfit suggestions tailored to your wardrobe, weather, and occasion
        </p>
      </div>

      {/* Weather Card */}
      {weather && (
        <Card className="mb-6">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <Cloud className="h-10 w-10 text-primary" />
              <div>
                <p className="font-semibold text-lg">{weather.temperature}°C</p>
                <p className="text-sm text-muted-foreground capitalize">
                  {weather.condition}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">{weather.location}</p>
              <p className="text-xs text-muted-foreground">
                Humidity: {weather.humidity}%
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Customize Your Suggestion
          </CardTitle>
          <CardDescription>
            Select the time of day and occasion for your outfit
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Time Slot Tabs */}
          <Tabs value={timeSlot} onValueChange={setTimeSlot}>
            <TabsList className="grid w-full grid-cols-4">
              {timeSlots.map((slot) => (
                <TabsTrigger key={slot.value} value={slot.value}>
                  <span className="mr-1">{slot.icon}</span>
                  <span className="hidden sm:inline">{slot.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Occasion Select */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Occasion</label>
            <Select value={occasion} onValueChange={setOccasion}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {occasions.map((occ) => (
                  <SelectItem key={occ.value} value={occ.value}>
                    {occ.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerateNew}
            disabled={generating}
            className="w-full"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${generating ? 'animate-spin' : ''}`} />
            {generating ? 'Generating...' : 'Generate New Outfit'}
          </Button>
        </CardContent>
      </Card>

      {/* Suggestions */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Your Suggestions</h2>
        
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-[400px] w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : suggestions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Sparkles className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Suggestions Yet</h3>
              <p className="text-sm text-muted-foreground text-center mb-4">
                Generate your first AI-powered outfit suggestion
              </p>
              <Button onClick={handleGenerateNew} disabled={generating}>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Outfit
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {suggestions.map((suggestion) => (
              <DailyOutfitCard
                key={suggestion.id}
                suggestion={suggestion}
                onAccept={loadSuggestions}
                onReject={loadSuggestions}
                onRefresh={handleGenerateNew}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DresserPage;
