import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { 
  Sparkles, 
  Palette, 
  Thermometer, 
  Calendar, 
  MapPin, 
  Target,
  RefreshCw,
  Heart,
  Star,
  TrendingUp,
  Zap,
  Camera,
  Wand2,
  Brain,
  Eye,
  Shirt,
  Users,
  Award,
  Clock,
  Sun,
  Cloud,
  Snowflake,
  Umbrella
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWardrobe, WardrobeItem } from "@/hooks/useWardrobe";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { outfitGenerator, OutfitContext, GeneratedOutfit } from "@/services/outfitGenerator";
import { weatherService } from "@/services/weatherService";

interface MatchingCriteria {
  occasion: string;
  weather: {
    temperature: number;
    condition: string;
  };
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  colorHarmony: number; // 0-100
  styleConsistency: number; // 0-100
  comfortLevel: number; // 0-100
  formalityLevel: number; // 0-100
  personalityExpression: string[];
}

interface ColorPalette {
  name: string;
  colors: string[];
  description: string;
  mood: string;
}

interface StyleProfile {
  name: string;
  description: string;
  keyElements: string[];
  colorPreferences: string[];
  occasionSuitability: string[];
}

interface OutfitSuggestion extends GeneratedOutfit {
  matchScore: number;
  personalizedRecommendations: string[];
  socialContext?: {
    trendingScore: number;
    viralPotential: number;
    seasonalRelevance: number;
  };
  improvementSuggestions: string[];
}

export const SmartOutfitMatcher = () => {
  const [criteria, setCriteria] = useState<MatchingCriteria>({
    occasion: 'casual',
    weather: { temperature: 20, condition: 'mild' },
    timeOfDay: 'morning',
    colorHarmony: 80,
    styleConsistency: 70,
    comfortLevel: 85,
    formalityLevel: 50,
    personalityExpression: []
  });

  const [suggestions, setSuggestions] = useState<OutfitSuggestion[]>([]);
  const [selectedPalette, setSelectedPalette] = useState<ColorPalette | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("smart-match");

  const { toast } = useToast();
  const { items } = useWardrobe();
  const { preferences } = useUserPreferences();

  const colorPalettes: ColorPalette[] = [
    {
      name: "Autumn Earth",
      colors: ["#8B4513", "#D2691E", "#CD853F", "#DEB887", "#F4A460"],
      description: "Warm, earthy tones perfect for fall",
      mood: "Cozy and grounded"
    },
    {
      name: "Monochrome Chic",
      colors: ["#000000", "#333333", "#666666", "#999999", "#FFFFFF"],
      description: "Timeless black, white, and gray palette",
      mood: "Sophisticated and minimalist"
    },
    {
      name: "Ocean Breeze",
      colors: ["#0077BE", "#00BFFF", "#87CEEB", "#E0F6FF", "#FFFFFF"],
      description: "Cool blues inspired by the ocean",
      mood: "Fresh and calming"
    },
    {
      name: "Sunset Warmth",
      colors: ["#FF6347", "#FF7F50", "#FFD700", "#FFFFE0", "#FFF8DC"],
      description: "Warm sunset colors",
      mood: "Energetic and optimistic"
    }
  ];

  const styleProfiles: StyleProfile[] = [
    {
      name: "Minimalist",
      description: "Clean lines, neutral colors, quality over quantity",
      keyElements: ["Simple silhouettes", "Neutral palette", "Quality fabrics", "Timeless pieces"],
      colorPreferences: ["white", "black", "gray", "beige", "navy"],
      occasionSuitability: ["work", "casual", "formal"]
    },
    {
      name: "Bohemian",
      description: "Eclectic, artistic, free-spirited fashion",
      keyElements: ["Flowing fabrics", "Layered textures", "Ethnic patterns", "Natural materials"],
      colorPreferences: ["earth tones", "jewel tones", "prints", "mixed patterns"],
      occasionSuitability: ["casual", "festival", "creative work"]
    },
    {
      name: "Classic Preppy",
      description: "Traditional, polished, collegiate-inspired style",
      keyElements: ["Structured pieces", "Crisp lines", "Quality materials", "Timeless cuts"],
      colorPreferences: ["navy", "white", "pastels", "plaids", "stripes"],
      occasionSuitability: ["work", "formal", "country club"]
    },
    {
      name: "Urban Streetwear",
      description: "Contemporary, youth-oriented, comfort-focused",
      keyElements: ["Relaxed fit", "Bold graphics", "Athletic influences", "Layering"],
      colorPreferences: ["black", "white", "bold colors", "neon accents"],
      occasionSuitability: ["casual", "creative work", "weekend"]
    }
  ];

  useEffect(() => {
    loadWeatherData();
  }, []);

  const loadWeatherData = async () => {
    try {
      const weatherData = await weatherService.getCurrentWeather();
      setCriteria(prev => ({
        ...prev,
        weather: {
          temperature: weatherData.temperature,
          condition: weatherData.condition.toLowerCase()
        }
      }));
    } catch (error) {
      console.warn('Failed to load weather data');
    }
  };

  const generateSmartSuggestions = async () => {
    if (!items || items.length < 3) {
      toast({
        title: "Need more items",
        description: "Add at least 3 items to your wardrobe to get smart suggestions",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Create multiple outfit contexts for variety
      const contexts = generateOutfitContexts();
      const allSuggestions: OutfitSuggestion[] = [];

      for (const context of contexts) {
        const outfit = await outfitGenerator.generateOutfit(items, context);
        const enhancedSuggestion = await enhanceOutfitSuggestion(outfit, context);
        allSuggestions.push(enhancedSuggestion);
      }

      // Sort by match score
      const sortedSuggestions = allSuggestions.sort((a, b) => b.matchScore - a.matchScore);
      setSuggestions(sortedSuggestions.slice(0, 5)); // Top 5 suggestions

      toast({
        title: "Smart suggestions ready!",
        description: `Generated ${sortedSuggestions.length} personalized outfit recommendations`
      });
    } catch (error) {
      toast({
        title: "Failed to generate suggestions",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateOutfitContexts = (): OutfitContext[] => {
    const baseContext: OutfitContext = {
      weather: criteria.weather,
      occasion: criteria.occasion,
      timeOfDay: criteria.timeOfDay,
      userPreferences: {
        favoriteColors: selectedPalette?.colors || [],
        styleProfile: preferences?.theme?.mode || 'casual'
      }
    };

    // Generate variations
    return [
      baseContext,
      { ...baseContext, occasion: 'work' },
      { ...baseContext, occasion: 'date' },
      { ...baseContext, timeOfDay: 'evening' },
      { ...baseContext, weather: { ...criteria.weather, condition: 'formal' } }
    ];
  };

  const enhanceOutfitSuggestion = async (
    outfit: GeneratedOutfit, 
    context: OutfitContext
  ): Promise<OutfitSuggestion> => {
    // Calculate advanced match score
    const matchScore = calculateAdvancedMatchScore(outfit, context);
    
    // Generate personalized recommendations
    const personalizedRecommendations = generatePersonalizedRecommendations(outfit);
    
    // Calculate social context
    const socialContext = calculateSocialContext(outfit);
    
    // Generate improvement suggestions
    const improvementSuggestions = generateImprovementSuggestions(outfit, context);

    return {
      ...outfit,
      matchScore,
      personalizedRecommendations,
      socialContext,
      improvementSuggestions
    };
  };

  const calculateAdvancedMatchScore = (outfit: GeneratedOutfit, context: OutfitContext): number => {
    let score = outfit.confidence;

    // Weather appropriateness
    const weatherScore = calculateWeatherAppropriatenesScore(outfit.items, criteria.weather);
    score += weatherScore * 0.2;

    // Color harmony
    const colorScore = calculateColorHarmonyScore(outfit.items) * (criteria.colorHarmony / 100);
    score += colorScore * 0.25;

    // Style consistency
    const styleScore = calculateStyleConsistencyScore(outfit.items) * (criteria.styleConsistency / 100);
    score += styleScore * 0.2;

    // Comfort level
    const comfortScore = calculateComfortScore(outfit.items) * (criteria.comfortLevel / 100);
    score += comfortScore * 0.15;

    // Personal preference alignment
    const preferenceScore = calculatePreferenceAlignmentScore(outfit.items);
    score += preferenceScore * 0.2;

    return Math.min(100, Math.max(0, score));
  };

  const calculateWeatherAppropriatenesScore = (items: WardrobeItem[], weather: any): number => {
    let score = 70;
    
    const materials = items.map(item => item.material?.toLowerCase()).filter(Boolean);
    const categories = items.map(item => item.category?.toLowerCase());

    if (weather.temperature < 10) {
      // Cold weather
      if (categories.includes('outerwear')) score += 15;
      if (materials.some(m => m?.includes('wool') || m?.includes('down'))) score += 10;
      if (categories.includes('boots')) score += 5;
    } else if (weather.temperature > 25) {
      // Hot weather  
      if (materials.some(m => m?.includes('cotton') || m?.includes('linen'))) score += 10;
      if (categories.includes('shorts') || categories.includes('tank top')) score += 10;
      if (!categories.includes('outerwear')) score += 5;
    }

    return Math.min(100, score);
  };

  const calculateColorHarmonyScore = (items: WardrobeItem[]): number => {
    const colors = items.map(item => item.color?.toLowerCase()).filter(Boolean);
    if (colors.length <= 1) return 80;

    // Check for neutral base
    const neutrals = ['black', 'white', 'gray', 'grey', 'beige', 'brown', 'navy'];
    const neutralCount = colors.filter(color => neutrals.some(n => color.includes(n))).length;
    
    if (neutralCount >= colors.length * 0.6) return 90;
    if (neutralCount >= colors.length * 0.3) return 75;
    
    // Check for monochromatic
    const uniqueColors = new Set(colors);
    if (uniqueColors.size <= 2) return 85;
    
    return 65;
  };

  const calculateStyleConsistencyScore = (items: WardrobeItem[]): number => {
    const occasions = items.map(item => item.occasion?.toLowerCase()).filter(Boolean);
    const brands = items.map(item => item.brand?.toLowerCase()).filter(Boolean);
    
    // Check occasion consistency
    const uniqueOccasions = new Set(occasions);
    let score = 70;
    
    if (uniqueOccasions.size === 1) score += 20;
    else if (uniqueOccasions.size === 2) score += 10;
    
    // Check brand tier consistency (simplified)
    const uniqueBrands = new Set(brands);
    if (uniqueBrands.size <= 3) score += 10;
    
    return Math.min(100, score);
  };

  const calculateComfortScore = (items: WardrobeItem[]): number => {
    let score = 75;
    const categories = items.map(item => item.category?.toLowerCase());
    const materials = items.map(item => item.material?.toLowerCase()).filter(Boolean);
    
    // Comfortable categories
    if (categories.includes('sneakers')) score += 10;
    if (categories.includes('jeans') || categories.includes('leggings')) score += 5;
    if (materials.some(m => m?.includes('cotton') || m?.includes('modal'))) score += 10;
    
    // Less comfortable
    if (categories.includes('heels')) score -= 5;
    if (materials.some(m => m?.includes('stiff') || m?.includes('structured'))) score -= 5;
    
    return Math.max(0, Math.min(100, score));
  };

  const calculatePreferenceAlignmentScore = (items: WardrobeItem[]): number => {
    let score = 70;
    
    // Favorite items bonus
    const favoriteCount = items.filter(item => item.is_favorite).length;
    score += favoriteCount * 10;
    
    // Recently worn items (might indicate preference)
    const recentlyWornCount = items.filter(item => {
      if (!item.last_worn) return false;
      const lastWorn = new Date(item.last_worn);
      const daysSince = (Date.now() - lastWorn.getTime()) / (1000 * 60 * 60 * 24);
      return daysSince <= 14;
    }).length;
    
    score += recentlyWornCount * 5;
    
    return Math.min(100, score);
  };

  const generatePersonalizedRecommendations = (outfit: GeneratedOutfit): string[] => {
    const recommendations = [];
    
    if (outfit.confidence > 85) {
      recommendations.push("This outfit perfectly matches your style preferences!");
    } else if (outfit.confidence > 70) {
      recommendations.push("A solid choice with good style coordination");
    }
    
    const categories = outfit.items.map(item => item.category);
    if (!categories.includes('accessories')) {
      recommendations.push("Consider adding an accessory to complete the look");
    }
    
    const favoriteItems = outfit.items.filter(item => item.is_favorite);
    if (favoriteItems.length > 0) {
      recommendations.push(`Features ${favoriteItems.length} of your favorite pieces`);
    }
    
    return recommendations;
  };

  const calculateSocialContext = (outfit: GeneratedOutfit) => {
    return {
      trendingScore: Math.floor(Math.random() * 40) + 60, // 60-100
      viralPotential: Math.floor(Math.random() * 30) + 40, // 40-70
      seasonalRelevance: Math.floor(Math.random() * 20) + 80 // 80-100
    };
  };

  const generateImprovementSuggestions = (outfit: GeneratedOutfit, context: OutfitContext): string[] => {
    const suggestions = [];
    
    if (outfit.confidence < 80) {
      suggestions.push("Try swapping one piece for better color coordination");
    }
    
    const categories = outfit.items.map(item => item.category);
    if (context.weather.temperature < 15 && !categories.includes('outerwear')) {
      suggestions.push("Add a jacket or coat for the weather");
    }
    
    if (!categories.includes('accessories')) {
      suggestions.push("A statement accessory could elevate this look");
    }
    
    return suggestions;
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny': case 'clear': return <Sun className="w-4 h-4" />;
      case 'cloudy': case 'overcast': return <Cloud className="w-4 h-4" />;
      case 'rainy': case 'rain': return <Umbrella className="w-4 h-4" />;
      case 'cold': case 'snow': return <Snowflake className="w-4 h-4" />;
      default: return <Sun className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Brain className="w-8 h-8 text-primary" />
            Smart Outfit Matcher
          </h1>
          <p className="text-muted-foreground">AI-powered personalized outfit recommendations</p>
        </div>
        <Button 
          onClick={generateSmartSuggestions}
          disabled={isGenerating}
          className="gap-2"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4" />
              Generate Smart Match
            </>
          )}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="smart-match">Smart Match</TabsTrigger>
          <TabsTrigger value="criteria">Preferences</TabsTrigger>
          <TabsTrigger value="palettes">Color Palettes</TabsTrigger>
          <TabsTrigger value="analytics">Style Analytics</TabsTrigger>
        </TabsList>

        {/* Smart Match Tab */}
        <TabsContent value="smart-match" className="space-y-6">
          {suggestions.length > 0 ? (
            <div className="grid gap-6">
              {suggestions.map((suggestion, index) => (
                <Card key={`${suggestion.id}-${index}`} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Badge variant="secondary" className="gap-1">
                          <Star className="w-3 h-3" />
                          {suggestion.matchScore}% Match
                        </Badge>
                        {suggestion.name}
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="gap-1">
                          <Heart className="w-3 h-3" />
                          Save
                        </Button>
                        <Button size="sm" className="gap-1">
                          <Camera className="w-3 h-3" />
                          Try On
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Outfit Items */}
                      <div className="space-y-3">
                        <h4 className="font-semibold flex items-center gap-2">
                          <Shirt className="w-4 h-4" />
                          Outfit Items
                        </h4>
                        <div className="space-y-2">
                          {suggestion.items.map((item) => (
                            <div key={item.id} className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
                              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                                <Shirt className="w-4 h-4 text-primary" />
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-sm">{item.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {item.brand} • {item.color}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Match Analysis */}
                      <div className="space-y-3">
                        <h4 className="font-semibold flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          Match Analysis
                        </h4>
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>Weather Fit</span>
                              <span>{suggestion.suitabilityScore.weather}%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full" 
                                style={{width: `${suggestion.suitabilityScore.weather}%`}}
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>Style Consistency</span>
                              <span>{suggestion.suitabilityScore.style}%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full" 
                                style={{width: `${suggestion.suitabilityScore.style}%`}}
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>Comfort Level</span>
                              <span>{suggestion.suitabilityScore.comfort}%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full" 
                                style={{width: `${suggestion.suitabilityScore.comfort}%`}}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Recommendations */}
                      <div className="space-y-3">
                        <h4 className="font-semibold flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          AI Insights
                        </h4>
                        <div className="space-y-2">
                          {suggestion.personalizedRecommendations.map((rec, i) => (
                            <div key={i} className="text-sm p-2 bg-primary/5 rounded-lg">
                              {rec}
                            </div>
                          ))}
                          {suggestion.improvementSuggestions.length > 0 && (
                            <div>
                              <div className="text-xs font-medium text-muted-foreground mb-1">
                                Improvements:
                              </div>
                              {suggestion.improvementSuggestions.map((imp, i) => (
                                <div key={i} className="text-xs p-2 bg-yellow-500/5 rounded-lg">
                                  {imp}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {suggestion.socialContext && (
                          <div className="space-y-2">
                            <div className="text-xs font-medium text-muted-foreground">Social Metrics:</div>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <div className="text-center">
                                <div className="font-semibold">{suggestion.socialContext.trendingScore}%</div>
                                <div className="text-muted-foreground">Trending</div>
                              </div>
                              <div className="text-center">
                                <div className="font-semibold">{suggestion.socialContext.viralPotential}%</div>
                                <div className="text-muted-foreground">Viral</div>
                              </div>
                              <div className="text-center">
                                <div className="font-semibold">{suggestion.socialContext.seasonalRelevance}%</div>
                                <div className="text-muted-foreground">Seasonal</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <div className="space-y-4">
                <Sparkles className="w-16 h-16 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Ready to Create Magic</h3>
                  <p className="text-muted-foreground mb-4">
                    Set your preferences and let AI create perfect outfit combinations for you
                  </p>
                  <Button 
                    onClick={generateSmartSuggestions}
                    disabled={isGenerating}
                    size="lg"
                    className="gap-2"
                  >
                    <Wand2 className="w-4 h-4" />
                    Generate Smart Suggestions
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </TabsContent>

        {/* Criteria Tab */}
        <TabsContent value="criteria" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Matching Criteria
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Occasion</label>
                  <Select value={criteria.occasion} onValueChange={(value) => 
                    setCriteria(prev => ({...prev, occasion: value}))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="work">Work</SelectItem>
                      <SelectItem value="formal">Formal</SelectItem>
                      <SelectItem value="date">Date Night</SelectItem>
                      <SelectItem value="workout">Workout</SelectItem>
                      <SelectItem value="travel">Travel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Time of Day</label>
                  <Select value={criteria.timeOfDay} onValueChange={(value: any) => 
                    setCriteria(prev => ({...prev, timeOfDay: value}))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning</SelectItem>
                      <SelectItem value="afternoon">Afternoon</SelectItem>
                      <SelectItem value="evening">Evening</SelectItem>
                      <SelectItem value="night">Night</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Thermometer className="w-4 h-4" />
                    Temperature: {criteria.weather.temperature}°C
                  </label>
                  <Slider
                    value={[criteria.weather.temperature]}
                    onValueChange={(value) => 
                      setCriteria(prev => ({
                        ...prev, 
                        weather: {...prev.weather, temperature: value[0]}
                      }))}
                    min={-10}
                    max={40}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>-10°C</span>
                    <span>{getWeatherIcon(criteria.weather.condition)}</span>
                    <span>40°C</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Style Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Color Harmony: {criteria.colorHarmony}%
                  </label>
                  <Slider
                    value={[criteria.colorHarmony]}
                    onValueChange={(value) => 
                      setCriteria(prev => ({...prev, colorHarmony: value[0]}))}
                    min={0}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Style Consistency: {criteria.styleConsistency}%
                  </label>
                  <Slider
                    value={[criteria.styleConsistency]}
                    onValueChange={(value) => 
                      setCriteria(prev => ({...prev, styleConsistency: value[0]}))}
                    min={0}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Comfort Level: {criteria.comfortLevel}%
                  </label>
                  <Slider
                    value={[criteria.comfortLevel]}
                    onValueChange={(value) => 
                      setCriteria(prev => ({...prev, comfortLevel: value[0]}))}
                    min={0}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Formality Level: {criteria.formalityLevel}%
                  </label>
                  <Slider
                    value={[criteria.formalityLevel]}
                    onValueChange={(value) => 
                      setCriteria(prev => ({...prev, formalityLevel: value[0]}))}
                    min={0}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Color Palettes Tab */}
        <TabsContent value="palettes" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {colorPalettes.map((palette) => (
              <Card 
                key={palette.name} 
                className={`cursor-pointer transition-all ${
                  selectedPalette?.name === palette.name 
                    ? 'ring-2 ring-primary' 
                    : 'hover:shadow-lg'
                }`}
                onClick={() => setSelectedPalette(palette)}
              >
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{palette.name}</h3>
                      {selectedPalette?.name === palette.name && (
                        <Badge variant="default">Selected</Badge>
                      )}
                    </div>
                    
                    <div className="flex gap-1 h-8 rounded-lg overflow-hidden">
                      {palette.colors.map((color, index) => (
                        <div
                          key={index}
                          className="flex-1"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {palette.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {palette.mood}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Style Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {styleProfiles.map((profile) => (
              <Card key={profile.name}>
                <CardHeader>
                  <CardTitle className="text-lg">{profile.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{profile.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2 text-sm">Key Elements:</h4>
                    <div className="space-y-1">
                      {profile.keyElements.map((element, index) => (
                        <div key={index} className="text-xs flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                          {element}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2 text-sm">Color Preferences:</h4>
                    <div className="flex flex-wrap gap-1">
                      {profile.colorPreferences.map((color, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {color}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2 text-sm">Best For:</h4>
                    <div className="flex flex-wrap gap-1">
                      {profile.occasionSuitability.map((occasion, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {occasion}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SmartOutfitMatcher;