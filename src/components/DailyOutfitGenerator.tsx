import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sparkles, RefreshCw, Heart, Share2, Calendar, Thermometer, Cloud } from 'lucide-react';
import { useWardrobe } from '@/hooks/useWardrobe';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { weatherService } from '@/services/weatherService';
import { OutfitAI } from '@/ai/OutfitAI';
import { toast } from 'sonner';

interface DailyOutfitProps {
  date?: Date;
}

export const DailyOutfitGenerator = ({ date = new Date() }: DailyOutfitProps) => {
  const { items: wardrobeItems } = useWardrobe();
  const { preferences } = useUserPreferences();
  
  const [outfit, setOutfit] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState<any>(null);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    generateDailyOutfit();
  }, [date, wardrobeItems]);

  const generateDailyOutfit = async () => {
    if (!wardrobeItems.length) return;
    
    try {
      setLoading(true);
      
      // Get weather data if user has location
      let weatherData = null;
      if (preferences.privacy?.location_sharing) {
        try {
          weatherData = await weatherService.getCurrentWeather();
          setWeather(weatherData);
        } catch (error) {
          console.warn('Weather data unavailable');
        }
      }

      // Generate outfit using AI
      const outfitAI = new OutfitAI();
      const generatedOutfit = await outfitAI.generateOutfit({
        wardrobeItems,
        weather: weatherData,
        preferences: preferences.suggestion_settings,
        occasion: 'daily'
      });

      setOutfit(generatedOutfit);
    } catch (error) {
      console.error('Error generating outfit:', error);
      toast.error('Failed to generate outfit');
    } finally {
      setLoading(false);
    }
  };

  const regenerateOutfit = async () => {
    setRegenerating(true);
    await generateDailyOutfit();
    setRegenerating(false);
    toast.success('New outfit generated!');
  };

  const saveOutfit = async () => {
    if (!outfit) return;
    // Implementation for saving outfit
    toast.success('Outfit saved to your collection!');
  };

  const shareOutfit = async () => {
    if (!outfit) return;
    // Implementation for sharing outfit
    toast.success('Outfit shared!');
  };

  if (loading && !outfit) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex flex-col items-center space-y-4">
            <Sparkles className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Generating your perfect outfit...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!outfit) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="text-center py-8">
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">
            Add some items to your wardrobe to get AI-powered outfit suggestions!
          </p>
          <Button onClick={() => window.location.href = '/add'}>
            Add Items to Wardrobe
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span>Today's AI Pick</span>
            </CardTitle>
            <CardDescription className="flex items-center space-x-4 mt-2">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{date.toLocaleDateString()}</span>
              </div>
              {weather && (
                <div className="flex items-center space-x-1">
                  <Thermometer className="w-4 h-4" />
                  <span>{Math.round(weather.temperature)}°C</span>
                </div>
              )}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={regenerateOutfit}
            disabled={regenerating}
          >
            <RefreshCw className={`w-4 h-4 ${regenerating ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Weather Info */}
        {weather && (
          <div className="flex items-center justify-center space-x-4 p-3 bg-muted rounded-lg">
            <Cloud className="w-5 h-5 text-muted-foreground" />
            <div className="text-sm">
              <span className="font-medium">{weather.condition}</span>
              <span className="text-muted-foreground ml-2">
                {Math.round(weather.temperature)}°C, feels like {Math.round(weather.feelsLike)}°C
              </span>
            </div>
          </div>
        )}

        {/* Outfit Items */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {outfit.items?.map((item: any, index: number) => (
            <div key={index} className="text-center">
              <div className="relative mb-2">
                <Avatar className="w-20 h-20 mx-auto">
                  <AvatarImage src={item.photos?.main || '/placeholder.svg'} />
                  <AvatarFallback>{item.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <Badge 
                  variant="secondary" 
                  className="absolute -top-1 -right-1 text-xs"
                >
                  {item.category}
                </Badge>
              </div>
              <p className="text-sm font-medium">{item.name}</p>
              <p className="text-xs text-muted-foreground">{item.brand}</p>
            </div>
          ))}
        </div>

        {/* Outfit Reasoning */}
        {outfit.reasoning && (
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <h4 className="font-medium text-sm mb-2">Why this outfit works:</h4>
            <p className="text-sm text-muted-foreground">{outfit.reasoning}</p>
          </div>
        )}

        {/* Style Tags */}
        {outfit.tags && (
          <div className="flex flex-wrap gap-2">
            {outfit.tags.map((tag: string) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-3">
          <Button onClick={saveOutfit} variant="outline" className="flex-1">
            <Heart className="w-4 h-4 mr-2" />
            Save Outfit
          </Button>
          <Button onClick={shareOutfit} variant="outline" className="flex-1">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button onClick={regenerateOutfit} className="flex-1">
            <RefreshCw className="w-4 h-4 mr-2" />
            New Suggestion
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};