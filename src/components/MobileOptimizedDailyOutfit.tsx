import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Sparkles, 
  Cloud, 
  Calendar,
  Heart,
  Share2,
  RefreshCw,
  ChevronRight,
  Sun,
  CloudRain,
  Wind,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { useWardrobe } from '@/hooks/useWardrobe';
import { useDailyOutfitSuggestions } from '@/hooks/useDailyOutfitSuggestions';
import { getPrimaryPhotoUrl } from '@/utils/photoHelpers';
import { OutfitAI } from '@/ai/OutfitAI';
import { weatherService } from '@/services/weatherService';

interface OutfitItem {
  id: string;
  name: string;
  category: string;
  image: string;
}

export const MobileOptimizedDailyOutfit = () => {
  const [activeView, setActiveView] = useState<'outfit' | 'alternatives'>('outfit');
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [todayOutfit, setTodayOutfit] = useState<OutfitItem[]>([]);
  const [weather, setWeather] = useState({
    temp: 72,
    condition: 'Partly Cloudy',
    icon: Cloud
  });
  
  const { items: wardrobeItems } = useWardrobe();
  const { createSuggestion } = useDailyOutfitSuggestions();

  useEffect(() => {
    generateDailyOutfit();
  }, [wardrobeItems]);

  const generateDailyOutfit = async () => {
    if (wardrobeItems.length === 0) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Get weather
      const weatherData = await weatherService.getCurrentWeather();
      setWeather({
        temp: Math.round(weatherData.temperature),
        condition: weatherData.description,
        icon: weatherData.condition === 'clear' ? Sun : weatherData.condition === 'rain' ? CloudRain : Cloud
      });

      // Generate outfit
      const outfitAI = new OutfitAI();
      const suggestion = await outfitAI.generateOutfit({
        wardrobeItems,
        weather: weatherData,
        occasion: 'casual'
      });

      if (suggestion && suggestion.items.length > 0) {
        // Resolve all photo URLs async
        const { getPrimaryPhotoUrlAsync } = await import('@/utils/photoHelpers');
        const outfitItemsPromises = suggestion.items.map(async (item) => ({
          id: item.id,
          name: item.name,
          category: item.category,
          image: await getPrimaryPhotoUrlAsync(item.photos, item.category)
        }));
        const outfitItems = await Promise.all(outfitItemsPromises);
        setTodayOutfit(outfitItems);
        
        // Save suggestion with correct schema
        const today = new Date().toISOString().split('T')[0];
        await createSuggestion({
          outfit_id: suggestion.id,
          suggestion_date: today,
          time_slot: 'morning',
          weather_data: weatherData,
          occasion: 'casual',
          confidence_score: suggestion.confidence || 0.8,
          is_accepted: false,
          is_rejected: false
        });
      }
    } catch (error) {
      console.error('Failed to generate outfit:', error);
      toast.error('Could not generate outfit');
    } finally {
      setLoading(false);
    }
  };

  const occasions = ['Work', 'Casual Outing'];

  const handleRefresh = () => {
    toast.info('Generating new outfit...');
    generateDailyOutfit();
  };

  const handleLike = () => {
    setLiked(!liked);
    toast.success(liked ? 'Removed from favorites' : 'Added to favorites');
  };

  const handleShare = () => {
    toast.success('Outfit shared!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Generating your outfit...</p>
        </div>
      </div>
    );
  }

  if (todayOutfit.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>No Outfit Available</CardTitle>
            <CardDescription>
              Add items to your wardrobe to get daily outfit suggestions
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Today's Outfit</h1>
              <p className="text-sm text-muted-foreground">AI-curated for you</p>
            </div>
            <Button size="sm" variant="ghost" onClick={handleRefresh} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* Weather & Context Card */}
      <div className="container py-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <weather.icon className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-semibold text-lg">{weather.temp}°F</p>
                  <p className="text-sm text-muted-foreground">{weather.condition}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">Today's Events</p>
                <div className="flex gap-1 mt-1">
                  {occasions.map(occ => (
                    <Badge key={occ} variant="secondary" className="text-xs">
                      {occ}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="container">
        <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="outfit">Today's Pick</TabsTrigger>
            <TabsTrigger value="alternatives">Alternatives</TabsTrigger>
          </TabsList>

          <TabsContent value="outfit" className="space-y-4 mt-4">
            {/* Outfit Items */}
            <div className="space-y-3">
              {todayOutfit.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <div className="flex items-center">
                    <div className="w-24 h-24 bg-muted flex-shrink-0">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 p-4">
                      <Badge variant="outline" className="mb-2 text-xs">
                        {item.category}
                      </Badge>
                      <h3 className="font-semibold">{item.name}</h3>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="mt-2 px-0 h-auto"
                      >
                        View Details
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* AI Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI Styling Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>This outfit balances professionalism with comfort for your workday</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>The jacket adds versatility for temperature changes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Colors complement your skin tone perfectly</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alternatives" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Alternative Suggestions</CardTitle>
                <CardDescription>Swap items for a different look</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Alternative suggestions will appear here based on your wardrobe and preferences.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Action Buttons - Fixed Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
        <div className="container flex gap-2">
          <Button 
            variant={liked ? "default" : "outline"} 
            className="flex-1"
            onClick={handleLike}
          >
            <Heart className={`h-4 w-4 mr-2 ${liked ? 'fill-current' : ''}`} />
            {liked ? 'Liked' : 'Like'}
          </Button>
          <Button variant="outline" className="flex-1" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button className="flex-1">
            <Calendar className="h-4 w-4 mr-2" />
            Wear Today
          </Button>
        </div>
      </div>
    </div>
  );
};
