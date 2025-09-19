import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Sparkles, 
  Cloud, 
  Calendar, 
  TrendingUp, 
  Palette,
  Thermometer,
  MapPin,
  Clock,
  Star,
  RefreshCw,
  Lightbulb
} from 'lucide-react';
import { useWardrobe } from '@/hooks/useWardrobe';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { OutfitAI } from '@/ai/OutfitAI';
import { WeatherMatcher } from '@/ai/WeatherMatcher';
import { ColorHarmonyEngine } from '@/ai/ColorHarmonyEngine';
import { toast } from 'sonner';

interface AIRecommendation {
  id: string;
  type: 'weather' | 'occasion' | 'trend' | 'color' | 'style';
  title: string;
  description: string;
  items: string[];
  confidence: number;
  reasoning: string[];
  image?: string;
}

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  location: string;
}

export const AdvancedAIRecommendations = () => {
  const { items: wardrobeItems } = useWardrobe();
  const { preferences } = useUserPreferences();
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('today');

  useEffect(() => {
    generateRecommendations();
    fetchWeatherData();
  }, [wardrobeItems, preferences]);

  const fetchWeatherData = async () => {
    // Mock weather data - in real app this would be from weather API
    const mockWeather: WeatherData = {
      temperature: 18,
      condition: 'partly-cloudy',
      humidity: 65,
      windSpeed: 12,
      location: 'Current Location'
    };
    setWeatherData(mockWeather);
  };

  const generateRecommendations = async () => {
    setLoading(true);
    
    try {
      const outfitAI = new OutfitAI();
      const weatherMatcher = new WeatherMatcher();
      const colorEngine = new ColorHarmonyEngine();

      // Generate different types of recommendations
      const recommendations: AIRecommendation[] = [
        // Weather-based recommendation
        {
          id: '1',
          type: 'weather',
          title: 'Perfect for Today\'s Weather',
          description: 'Light layers for mild temperatures with potential rain',
          items: ['Light Knit Sweater', 'Dark Jeans', 'Waterproof Jacket', 'Comfortable Sneakers'],
          confidence: 92,
          reasoning: [
            'Temperature: 18°C - ideal for light layering',
            'Partly cloudy - breathable fabrics recommended',
            'Light wind - avoid loose-fitting items'
          ]
        },
        // Occasion-based recommendation
        {
          id: '2',
          type: 'occasion',
          title: 'Lunch Date Ready',
          description: 'Casual chic outfit perfect for afternoon meetups',
          items: ['Floral Midi Dress', 'Denim Jacket', 'White Sneakers', 'Cross-body Bag'],
          confidence: 88,
          reasoning: [
            'Versatile dress works for multiple occasions',
            'Denim jacket adds casual sophistication',
            'Comfortable footwear for walking'
          ]
        },
        // Trend-based recommendation
        {
          id: '3',
          type: 'trend',
          title: 'Fall 2024 Trending',
          description: 'Embrace this season\'s earthy tones and textures',
          items: ['Oversized Blazer', 'Ribbed Tank Top', 'Wide-leg Trousers', 'Loafers'],
          confidence: 85,
          reasoning: [
            'Oversized blazers are trending this season',
            'Earth tones align with fall color palette',
            'Wide-leg silhouettes are fashion-forward'
          ]
        },
        // Color harmony recommendation
        {
          id: '4',
          type: 'color',
          title: 'Color Harmony Match',
          description: 'Complementary colors that enhance your complexion',
          items: ['Navy Blouse', 'Camel Coat', 'Dark Wash Jeans', 'Tan Ankle Boots'],
          confidence: 90,
          reasoning: [
            'Navy and camel create sophisticated contrast',
            'Colors complement your skin tone',
            'Monochromatic denim grounds the look'
          ]
        }
      ];

      setRecommendations(recommendations);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      toast.error('Failed to generate AI recommendations');
    } finally {
      setLoading(false);
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'weather': return Cloud;
      case 'occasion': return Calendar;
      case 'trend': return TrendingUp;
      case 'color': return Palette;
      default: return Sparkles;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 80) return 'text-yellow-600';
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="space-y-6 p-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-6 h-6 bg-muted rounded"></div>
                <div className="h-6 bg-muted rounded w-48"></div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </div>
              <div className="flex space-x-2">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="h-6 bg-muted rounded w-20"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Weather Widget */}
      {weatherData && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-background rounded-lg">
                  <Thermometer className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-lg">{weatherData.temperature}°C</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {weatherData.condition.replace('-', ' ')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3 mr-1" />
                  {weatherData.location}
                </div>
                <div className="flex items-center text-sm text-muted-foreground mt-1">
                  <Clock className="h-3 w-3 mr-1" />
                  Updated now
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Recommendations */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="occasions">Occasions</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>
          <Button 
            variant="outline" 
            size="sm"
            onClick={generateRecommendations}
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <TabsContent value="today" className="space-y-4">
          {recommendations.filter(r => ['weather', 'color'].includes(r.type)).map((rec) => {
            const Icon = getRecommendationIcon(rec.type);
            
            return (
              <Card key={rec.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{rec.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{rec.description}</p>
                      </div>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={`${getConfidenceColor(rec.confidence)}`}
                    >
                      <Star className="h-3 w-3 mr-1" />
                      {rec.confidence}%
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {rec.items.map((item, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {item}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="flex items-center mb-2">
                      <Lightbulb className="h-4 w-4 text-primary mr-2" />
                      <span className="text-sm font-medium">AI Reasoning</span>
                    </div>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {rec.reasoning.map((reason, index) => (
                        <li key={index}>• {reason}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="occasions" className="space-y-4">
          {recommendations.filter(r => r.type === 'occasion').map((rec) => {
            const Icon = getRecommendationIcon(rec.type);
            
            return (
              <Card key={rec.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{rec.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{rec.description}</p>
                      </div>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={`${getConfidenceColor(rec.confidence)}`}
                    >
                      <Star className="h-3 w-3 mr-1" />
                      {rec.confidence}%
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {rec.items.map((item, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {item}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="flex items-center mb-2">
                      <Lightbulb className="h-4 w-4 text-primary mr-2" />
                      <span className="text-sm font-medium">Style Notes</span>
                    </div>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {rec.reasoning.map((reason, index) => (
                        <li key={index}>• {reason}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          {recommendations.filter(r => r.type === 'trend').map((rec) => {
            const Icon = getRecommendationIcon(rec.type);
            
            return (
              <Card key={rec.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{rec.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{rec.description}</p>
                      </div>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={`${getConfidenceColor(rec.confidence)}`}
                    >
                      <Star className="h-3 w-3 mr-1" />
                      {rec.confidence}%
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {rec.items.map((item, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {item}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="flex items-center mb-2">
                      <TrendingUp className="h-4 w-4 text-primary mr-2" />
                      <span className="text-sm font-medium">Trend Analysis</span>
                    </div>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {rec.reasoning.map((reason, index) => (
                        <li key={index}>• {reason}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
};