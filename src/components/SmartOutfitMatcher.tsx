import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { 
  Sparkles, 
  Heart, 
  RefreshCw, 
  Thermometer, 
  Calendar, 
  MapPin, 
  Clock, 
  Star,
  Shuffle,
  Settings,
  TrendingUp
} from 'lucide-react';
import { useWardrobe } from '@/hooks/useWardrobe';
import { useToast } from '@/hooks/use-toast';

interface OutfitSuggestion {
  id: string;
  items: any[];
  occasion: string;
  weather: string;
  style: string;
  compatibilityScore: number;
  colorHarmony: number;
  seasonalFit: number;
  occasionMatch: number;
  reasons: string[];
  tags: string[];
}

interface MatchingPreferences {
  occasion: string;
  weather: string;
  style: string;
  colorPreference: string;
  formality: number;
  comfort: number;
  trendiness: number;
}

const SmartOutfitMatcher = () => {
  const [suggestions, setSuggestions] = useState<OutfitSuggestion[]>([]);
  const [preferences, setPreferences] = useState<MatchingPreferences>({
    occasion: 'casual',
    weather: 'mild',
    style: 'any',
    colorPreference: 'any',
    formality: 5,
    comfort: 8,
    trendiness: 6
  });
  const [loading, setLoading] = useState(false);
  const [favoriteOutfits, setFavoriteOutfits] = useState<string[]>([]);
  const { items } = useWardrobe();
  const { toast } = useToast();

  useEffect(() => {
    generateSuggestions();
  }, [preferences, items]);

  const generateSuggestions = async () => {
    if (items.length === 0) return;
    
    setLoading(true);
    try {
      // Simulate AI-powered outfit matching
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockSuggestions: OutfitSuggestion[] = [
        {
          id: '1',
          items: items.slice(0, 3),
          occasion: preferences.occasion,
          weather: preferences.weather,
          style: 'smart-casual',
          compatibilityScore: 92,
          colorHarmony: 95,
          seasonalFit: 88,
          occasionMatch: 94,
          reasons: [
            'Perfect color coordination',
            'Weather appropriate',
            'Matches occasion perfectly',
            'Flattering silhouette'
          ],
          tags: ['trending', 'comfortable', 'versatile']
        },
        {
          id: '2',
          items: items.slice(1, 4),
          occasion: preferences.occasion,
          weather: preferences.weather,
          style: 'minimalist',
          compatibilityScore: 87,
          colorHarmony: 90,
          seasonalFit: 85,
          occasionMatch: 88,
          reasons: [
            'Clean and minimal look',
            'Great for the weather',
            'Professional appearance'
          ],
          tags: ['classic', 'elegant', 'professional']
        },
        {
          id: '3',
          items: items.slice(2, 5),
          occasion: preferences.occasion,
          weather: preferences.weather,
          style: 'bohemian',
          compatibilityScore: 84,
          colorHarmony: 86,
          seasonalFit: 90,
          occasionMatch: 80,
          reasons: [
            'Creative and artistic',
            'Seasonal colors',
            'Comfortable fit'
          ],
          tags: ['creative', 'artistic', 'expressive']
        }
      ];
      
      setSuggestions(mockSuggestions);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate outfit suggestions',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (outfitId: string) => {
    setFavoriteOutfits(prev => 
      prev.includes(outfitId) 
        ? prev.filter(id => id !== outfitId)
        : [...prev, outfitId]
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 90) return 'default';
    if (score >= 80) return 'secondary';
    return 'outline';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6" />
            Smart Outfit Matcher
          </h2>
          <p className="text-muted-foreground">AI-powered outfit suggestions tailored for you</p>
        </div>
        <Button onClick={generateSuggestions} disabled={loading} className="flex items-center gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Generating...' : 'New Suggestions'}
        </Button>
      </div>

      <Tabs defaultValue="suggestions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
        </TabsList>

        <TabsContent value="suggestions" className="space-y-4">
          {loading ? (
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-3">
                      <div className="h-4 bg-muted rounded w-1/4"></div>
                      <div className="h-20 bg-muted rounded"></div>
                      <div className="flex gap-2">
                        <div className="h-6 bg-muted rounded w-16"></div>
                        <div className="h-6 bg-muted rounded w-20"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-4">
              {suggestions.map((outfit) => (
                <Card key={outfit.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Badge variant={getScoreBadgeVariant(outfit.compatibilityScore)}>
                          {outfit.compatibilityScore}% Match
                        </Badge>
                        <span className="capitalize">{outfit.style} Look</span>
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFavorite(outfit.id)}
                        className={favoriteOutfits.includes(outfit.id) ? 'text-red-500' : ''}
                      >
                        <Heart className={`w-4 h-4 ${favoriteOutfits.includes(outfit.id) ? 'fill-current' : ''}`} />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Outfit Items */}
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {outfit.items.map((item, index) => (
                        <div key={index} className="flex-shrink-0">
                          <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">{item.category || 'Item'}</span>
                          </div>
                          <p className="text-xs mt-1 text-center truncate w-20">
                            {item.name || `Item ${index + 1}`}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Score Breakdown */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="text-center">
                        <p className={`font-medium ${getScoreColor(outfit.colorHarmony)}`}>
                          {outfit.colorHarmony}%
                        </p>
                        <p className="text-muted-foreground">Color Harmony</p>
                      </div>
                      <div className="text-center">
                        <p className={`font-medium ${getScoreColor(outfit.seasonalFit)}`}>
                          {outfit.seasonalFit}%
                        </p>
                        <p className="text-muted-foreground">Seasonal Fit</p>
                      </div>
                      <div className="text-center">
                        <p className={`font-medium ${getScoreColor(outfit.occasionMatch)}`}>
                          {outfit.occasionMatch}%
                        </p>
                        <p className="text-muted-foreground">Occasion</p>
                      </div>
                      <div className="text-center">
                        <p className={`font-medium ${getScoreColor(outfit.compatibilityScore)}`}>
                          {outfit.compatibilityScore}%
                        </p>
                        <p className="text-muted-foreground">Overall</p>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {outfit.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Reasons */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Why this works:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {outfit.reasons.map((reason, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <Star className="w-3 h-3 fill-current text-yellow-500" />
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" className="flex-1">
                        Try This Outfit
                      </Button>
                      <Button size="sm" variant="outline">
                        <Shuffle className="w-4 h-4 mr-1" />
                        Similar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Matching Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Occasion</Label>
                  <Select 
                    value={preferences.occasion} 
                    onValueChange={(value) => setPreferences(prev => ({ ...prev, occasion: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="work">Work/Business</SelectItem>
                      <SelectItem value="formal">Formal</SelectItem>
                      <SelectItem value="party">Party/Event</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="sport">Activewear</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Weather</Label>
                  <Select 
                    value={preferences.weather} 
                    onValueChange={(value) => setPreferences(prev => ({ ...prev, weather: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hot">Hot (25°C+)</SelectItem>
                      <SelectItem value="warm">Warm (20-25°C)</SelectItem>
                      <SelectItem value="mild">Mild (15-20°C)</SelectItem>
                      <SelectItem value="cool">Cool (10-15°C)</SelectItem>
                      <SelectItem value="cold">Cold (Below 10°C)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Style Preference</Label>
                  <Select 
                    value={preferences.style} 
                    onValueChange={(value) => setPreferences(prev => ({ ...prev, style: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Style</SelectItem>
                      <SelectItem value="minimalist">Minimalist</SelectItem>
                      <SelectItem value="bohemian">Bohemian</SelectItem>
                      <SelectItem value="classic">Classic</SelectItem>
                      <SelectItem value="trendy">Trendy</SelectItem>
                      <SelectItem value="edgy">Edgy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Color Preference</Label>
                  <Select 
                    value={preferences.colorPreference} 
                    onValueChange={(value) => setPreferences(prev => ({ ...prev, colorPreference: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Color</SelectItem>
                      <SelectItem value="neutral">Neutral Tones</SelectItem>
                      <SelectItem value="bright">Bright Colors</SelectItem>
                      <SelectItem value="dark">Dark Colors</SelectItem>
                      <SelectItem value="pastel">Pastel Colors</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-3">
                  <Label>Formality Level: {preferences.formality}/10</Label>
                  <Slider
                    value={[preferences.formality]}
                    onValueChange={(value) => setPreferences(prev => ({ ...prev, formality: value[0] }))}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-3">
                  <Label>Comfort Priority: {preferences.comfort}/10</Label>
                  <Slider
                    value={[preferences.comfort]}
                    onValueChange={(value) => setPreferences(prev => ({ ...prev, comfort: value[0] }))}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-3">
                  <Label>Trendiness: {preferences.trendiness}/10</Label>
                  <Slider
                    value={[preferences.trendiness]}
                    onValueChange={(value) => setPreferences(prev => ({ ...prev, trendiness: value[0] }))}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>

              <Button onClick={generateSuggestions} className="w-full">
                Apply Preferences & Generate
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="favorites" className="space-y-4">
          {favoriteOutfits.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">No Favorite Outfits</h3>
                <p className="text-sm text-muted-foreground">
                  Heart outfits you love to save them here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {suggestions
                .filter(outfit => favoriteOutfits.includes(outfit.id))
                .map((outfit) => (
                  <Card key={outfit.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center justify-between">
                        <span className="capitalize">{outfit.style} Look</span>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Heart className="w-3 h-3 fill-current text-red-500" />
                          Favorite
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-3 overflow-x-auto pb-2">
                        {outfit.items.map((item, index) => (
                          <div key={index} className="flex-shrink-0">
                            <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                              <span className="text-xs text-muted-foreground">{item.category || 'Item'}</span>
                            </div>
                            <p className="text-xs mt-1 text-center truncate w-20">
                              {item.name || `Item ${index + 1}`}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SmartOutfitMatcher;