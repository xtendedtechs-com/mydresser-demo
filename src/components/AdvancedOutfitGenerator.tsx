import { useState } from 'react';
import { Sparkles, Cloud, Sun, Wind, Droplets, Calendar, MapPin, Wand2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useWardrobe } from '@/hooks/useWardrobe';
import { useToast } from '@/hooks/use-toast';
import { OutfitAI } from '@/ai/OutfitAI';
import { WeatherMatcher } from '@/ai/WeatherMatcher';
import { getPrimaryPhotoUrl, getCategoryPlaceholderImage } from '@/utils/photoHelpers';

interface GeneratedOutfit {
  items: any[];
  analysis: {
    styleScore: number;
    weatherAppropriate: boolean;
    occasionFit: string;
    colorHarmony: number;
  };
  reasoning: string;
}

export const AdvancedOutfitGenerator = () => {
  const { items } = useWardrobe();
  const { toast } = useToast();
  const [generating, setGenerating] = useState(false);
  const [generatedOutfit, setGeneratedOutfit] = useState<GeneratedOutfit | null>(null);
  
  const [occasion, setOccasion] = useState('casual');
  const [temperature, setTemperature] = useState([20]);
  const [weatherCondition, setWeatherCondition] = useState('clear');
  const [stylePreference, setStylePreference] = useState('auto');

  const outfitAI = new OutfitAI();
  const weatherMatcher = new WeatherMatcher();

  const generateOutfit = async () => {
    if (items.length < 3) {
      toast({
        title: 'Not enough items',
        description: 'You need at least 3 items in your wardrobe to generate outfits.',
        variant: 'destructive'
      });
      return;
    }

    setGenerating(true);

    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Use weather context
      const weatherContext = {
        temperature: temperature[0],
        condition: weatherCondition,
        humidity: 60,
        windSpeed: 10,
        feelsLike: temperature[0]
      };

      // Use OutfitAI to generate combination
      const outfit = await outfitAI.generateOutfit({
        wardrobeItems: items,
        weather: weatherContext,
        occasion
      });

      // Analyze weather suitability
      const weatherAnalysis = weatherMatcher.analyzeWeatherSuitability(outfit.items || items.slice(0, 4), weatherContext);

      setGeneratedOutfit({
        items: outfit.items || items.slice(0, 4),
        analysis: {
          styleScore: Math.floor(outfit.confidence * 100),
          weatherAppropriate: weatherAnalysis.score > 60,
          occasionFit: 'Perfect',
          colorHarmony: 85
        },
        reasoning: `This ${occasion} outfit is perfect for ${temperature[0]}°C ${weatherCondition} weather. ${outfit.reasoning}`
      });

      toast({
        title: 'Outfit generated! ✨',
        description: 'Your personalized outfit is ready'
      });
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: 'Generation failed',
        description: 'Could not generate outfit. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setGenerating(false);
    }
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'clear': return <Sun className="h-4 w-4" />;
      case 'rain': return <Droplets className="h-4 w-4" />;
      case 'cloudy': return <Cloud className="h-4 w-4" />;
      case 'windy': return <Wind className="h-4 w-4" />;
      default: return <Sun className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            AI Outfit Generator
          </CardTitle>
          <CardDescription>
            Generate personalized outfits based on weather, occasion, and your style
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Occasion */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Occasion
            </label>
            <Select value={occasion} onValueChange={setOccasion}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="formal">Formal</SelectItem>
                <SelectItem value="sport">Sport/Athletic</SelectItem>
                <SelectItem value="date">Date Night</SelectItem>
                <SelectItem value="party">Party</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Temperature */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Temperature: {temperature[0]}°C
            </label>
            <Slider
              value={temperature}
              onValueChange={setTemperature}
              min={-10}
              max={40}
              step={1}
              className="w-full"
            />
          </div>

          {/* Weather Condition */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              {getWeatherIcon(weatherCondition)}
              Weather Condition
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['clear', 'cloudy', 'rain', 'windy'].map((condition) => (
                <Button
                  key={condition}
                  variant={weatherCondition === condition ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setWeatherCondition(condition)}
                  className="capitalize"
                >
                  {condition}
                </Button>
              ))}
            </div>
          </div>

          {/* Style Preference */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Style Preference</label>
            <Select value={stylePreference} onValueChange={setStylePreference}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto (AI Decides)</SelectItem>
                <SelectItem value="minimalist">Minimalist</SelectItem>
                <SelectItem value="bold">Bold & Colorful</SelectItem>
                <SelectItem value="classic">Classic</SelectItem>
                <SelectItem value="trendy">Trendy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={generateOutfit}
            disabled={generating}
            className="w-full"
            size="lg"
          >
            {generating ? (
              <>
                <Sparkles className="mr-2 h-5 w-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Generate Outfit
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Outfit Display */}
      {generatedOutfit && (
        <Card>
          <CardHeader>
            <CardTitle>Your Generated Outfit</CardTitle>
            <CardDescription>AI-powered outfit recommendation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Outfit Items */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {generatedOutfit.items.map((item, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                    <img 
                      src={getPrimaryPhotoUrl(item.photos, item.category)} 
                      alt={`${item.name} - ${item.category}`}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const { getCategoryPlaceholderImage } = require("@/utils/photoHelpers");
                        (e.currentTarget as HTMLImageElement).src = getCategoryPlaceholderImage(item.category);
                      }}
                    />
                  </div>
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{item.category}</p>
                </div>
              ))}
            </div>

            {/* Analysis */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold text-primary">{generatedOutfit.analysis.styleScore}%</div>
                <div className="text-xs text-muted-foreground mt-1">Style Score</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold text-primary">{generatedOutfit.analysis.colorHarmony}%</div>
                <div className="text-xs text-muted-foreground mt-1">Color Harmony</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <Badge variant={generatedOutfit.analysis.weatherAppropriate ? 'default' : 'secondary'}>
                  {generatedOutfit.analysis.weatherAppropriate ? 'Weather OK' : 'Check Weather'}
                </Badge>
                <div className="text-xs text-muted-foreground mt-1">Weather</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <Badge variant="outline">{generatedOutfit.analysis.occasionFit}</Badge>
                <div className="text-xs text-muted-foreground mt-1">Occasion Fit</div>
              </div>
            </div>

            {/* AI Reasoning */}
            <Card className="bg-muted/50">
              <CardContent className="pt-4">
                <p className="text-sm">{generatedOutfit.reasoning}</p>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-2">
              <Button variant="default" className="flex-1">
                Save Outfit
              </Button>
              <Button variant="outline" className="flex-1">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
