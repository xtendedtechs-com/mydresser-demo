import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Sparkles, 
  Brain, 
  TrendingUp, 
  Palette, 
  Cloud, 
  Calendar,
  Target,
  Zap,
  Eye,
  ShoppingBag
} from 'lucide-react';
import { useWardrobe } from '@/hooks/useWardrobe';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { OutfitAI } from '@/ai/OutfitAI';
import { colorHarmonyEngine } from '@/ai/ColorHarmonyEngine';
import { styleAnalyzer } from '@/ai/StyleAnalyzer';
import { toast } from 'sonner';

export const EnhancedAI = () => {
  const { items, loading: wardrobeLoading } = useWardrobe();
  const { preferences } = useUserPreferences();
  
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [styleProfile, setStyleProfile] = useState<any>(null);
  const [colorAnalysis, setColorAnalysis] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!wardrobeLoading && items.length > 0) {
      generateAIInsights();
    }
  }, [wardrobeLoading, items]);

  const generateAIInsights = async () => {
    try {
      setLoading(true);
      
      // Generate comprehensive AI analysis
      const outfitAI = new OutfitAI();
      
      // Analyze wardrobe composition
      const wardrobeAnalysis = analyzeWardrobeComposition(items);
      
      // Generate color harmony analysis
      const colors = items.map(item => item.color).filter(Boolean);
      const colorHarmonyAnalysis = analyzeColorPalette(colors);
      
      // Generate style profile
      const userStyleProfile = styleAnalyzer.analyzePersonalStyle(items);
      
      // Generate outfit recommendations
      const outfitRecommendations = await generateOutfitRecommendations(items);
      
      // Generate shopping recommendations
      const shoppingRecommendations = generateShoppingRecommendations(wardrobeAnalysis);

      setAiInsights({
        wardrobeScore: wardrobeAnalysis.score,
        completeness: wardrobeAnalysis.completeness,
        versatility: wardrobeAnalysis.versatility,
        seasonalBalance: wardrobeAnalysis.seasonalBalance,
        occasionCoverage: wardrobeAnalysis.occasionCoverage
      });
      
      setStyleProfile(userStyleProfile);
      setColorAnalysis(colorHarmonyAnalysis);
      setRecommendations([...outfitRecommendations, ...shoppingRecommendations]);
      
    } catch (error) {
      console.error('Error generating AI insights:', error);
      toast.error('Failed to generate AI insights');
    } finally {
      setLoading(false);
    }
  };

  const analyzeWardrobeComposition = (items: any[]) => {
    const categories = items.reduce((acc: any, item: any) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});

    const totalItems = items.length;
    const categoryBalance = calculateCategoryBalance(categories);
    const seasonalDistribution = calculateSeasonalDistribution(items);
    const occasionCoverage = calculateOccasionCoverage(items);

    return {
      score: Math.round((categoryBalance + seasonalDistribution + occasionCoverage) / 3),
      completeness: categoryBalance,
      versatility: calculateVersatility(items),
      seasonalBalance: seasonalDistribution,
      occasionCoverage
    };
  };

  const calculateCategoryBalance = (categories: any) => {
    const essentialCategories = ['tops', 'bottoms', 'outerwear', 'shoes'];
    const coveredEssentials = essentialCategories.filter(cat => categories[cat] > 0).length;
    return Math.round((coveredEssentials / essentialCategories.length) * 100);
  };

  const calculateSeasonalDistribution = (items: any[]) => {
    const seasons = ['spring', 'summer', 'fall', 'winter', 'all-season'];
    const seasonCounts = items.reduce((acc: any, item: any) => {
      const season = item.season || 'all-season';
      acc[season] = (acc[season] || 0) + 1;
      return acc;
    }, {});

    const coveredSeasons = seasons.filter(season => seasonCounts[season] > 0).length;
    return Math.round((coveredSeasons / seasons.length) * 100);
  };

  const calculateOccasionCoverage = (items: any[]) => {
    const occasions = ['casual', 'work', 'formal', 'party', 'sport'];
    const occasionCounts = items.reduce((acc: any, item: any) => {
      const occasion = item.occasion || 'casual';
      acc[occasion] = (acc[occasion] || 0) + 1;
      return acc;
    }, {});

    const coveredOccasions = occasions.filter(occasion => occasionCounts[occasion] > 0).length;
    return Math.round((coveredOccasions / occasions.length) * 100);
  };

  const calculateVersatility = (items: any[]) => {
    const versatileItems = items.filter(item => 
      item.occasion === 'versatile' || 
      item.season === 'all-season' ||
      ['neutral', 'black', 'white', 'gray', 'navy'].includes(item.color?.toLowerCase())
    ).length;

    return Math.round((versatileItems / items.length) * 100);
  };

  const analyzeColorPalette = (colors: string[]) => {
    // Create a simple color analysis
    const colorCounts = colors.reduce((acc: any, color: string) => {
      const normalizedColor = color.toLowerCase().trim();
      acc[normalizedColor] = (acc[normalizedColor] || 0) + 1;
      return acc;
    }, {});

    const sortedColors = Object.entries(colorCounts)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 5);

    return {
      dominantColors: sortedColors.map(([name, count]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        count,
        hex: getColorHex(name)
      })),
      recommendations: generateColorRecommendations(sortedColors.map(([name]) => name))
    };
  };

  const getColorHex = (colorName: string): string => {
    const colorMap: Record<string, string> = {
      'red': '#FF0000',
      'blue': '#0000FF',
      'green': '#008000',
      'yellow': '#FFFF00',
      'purple': '#800080',
      'orange': '#FFA500',
      'pink': '#FFC0CB',
      'black': '#000000',
      'white': '#FFFFFF',
      'gray': '#808080',
      'brown': '#A52A2A',
      'navy': '#000080',
      'beige': '#F5F5DC'
    };
    return colorMap[colorName.toLowerCase()] || '#CCCCCC';
  };

  const generateColorRecommendations = (colors: string[]) => {
    return [
      {
        colors: ['#000000', '#FFFFFF'],
        description: 'Classic black and white combination'
      },
      {
        colors: ['#000080', '#F5F5DC'],
        description: 'Navy and beige for timeless elegance'
      },
      {
        colors: ['#808080', '#FFFFFF', '#000000'],
        description: 'Monochromatic neutral palette'
      }
    ];
  };

  const generateOutfitRecommendations = async (items: any[]) => {
    const recommendations = [];
    const outfitAI = new OutfitAI();

    try {
      // Generate different types of outfits
      const contexts = [
        { occasion: 'work', weather: { temperature: 20 } },
        { occasion: 'casual', weather: { temperature: 22 } },
        { occasion: 'date', weather: { temperature: 18 } }
      ];

      for (const context of contexts) {
        const outfit = await outfitAI.generateOutfit({
          wardrobeItems: items,
          weather: context.weather,
          occasion: context.occasion
        });

        recommendations.push({
          type: 'outfit',
          title: `Perfect ${context.occasion} outfit`,
          description: outfit.reasoning,
          confidence: outfit.confidence,
          items: outfit.items,
          icon: Target
        });
      }
    } catch (error) {
      console.error('Error generating outfit recommendations:', error);
    }

    return recommendations.slice(0, 3);
  };

  const generateShoppingRecommendations = (analysis: any) => {
    const recommendations = [];

    if (analysis.completeness < 70) {
      recommendations.push({
        type: 'shopping',
        title: 'Fill wardrobe gaps',
        description: 'Add essential pieces to complete your wardrobe foundation',
        priority: 'high',
        suggestions: ['Basic white shirt', 'Dark jeans', 'Versatile blazer'],
        icon: ShoppingBag
      });
    }

    if (analysis.seasonalBalance < 60) {
      recommendations.push({
        type: 'shopping',
        title: 'Seasonal balance needed',
        description: 'Add pieces for missing seasons to ensure year-round coverage',
        priority: 'medium',
        suggestions: ['Light summer pieces', 'Warm winter layers'],
        icon: Cloud
      });
    }

    return recommendations;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <Brain className="w-12 h-12 animate-pulse text-primary mx-auto" />
            <p className="text-lg font-medium">AI analyzing your wardrobe...</p>
            <p className="text-muted-foreground">This may take a moment</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* AI Insights Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <span>AI Fashion Insights</span>
          </CardTitle>
          <CardDescription>
            Comprehensive analysis of your wardrobe and personalized recommendations
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="style">Style Profile</TabsTrigger>
          <TabsTrigger value="colors">Color Analysis</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {aiInsights && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Wardrobe Score</p>
                      <p className={`text-2xl font-bold ${getScoreColor(aiInsights.wardrobeScore)}`}>
                        {aiInsights.wardrobeScore}
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <Progress value={aiInsights.wardrobeScore} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Completeness</p>
                      <p className={`text-2xl font-bold ${getScoreColor(aiInsights.completeness)}`}>
                        {aiInsights.completeness}%
                      </p>
                    </div>
                    <Target className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <Progress value={aiInsights.completeness} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Versatility</p>
                      <p className={`text-2xl font-bold ${getScoreColor(aiInsights.versatility)}`}>
                        {aiInsights.versatility}%
                      </p>
                    </div>
                    <Zap className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <Progress value={aiInsights.versatility} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Seasonal Balance</p>
                      <p className={`text-2xl font-bold ${getScoreColor(aiInsights.seasonalBalance)}`}>
                        {aiInsights.seasonalBalance}%
                      </p>
                    </div>
                    <Calendar className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <Progress value={aiInsights.seasonalBalance} className="mt-2" />
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Style Profile Tab */}
        <TabsContent value="style" className="space-y-6">
          {styleProfile && (
            <Card>
              <CardHeader>
                <CardTitle>Your Style DNA</CardTitle>
                <CardDescription>AI-analyzed style preferences and patterns</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-4">Style Profile</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Primary Style</span>
                        <Badge variant="default">{styleProfile.primary}</Badge>
                      </div>
                      {styleProfile.secondary && (
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Secondary Style</span>
                          <Badge variant="outline">{styleProfile.secondary}</Badge>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Confidence</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={styleProfile.confidence} className="w-20" />
                          <span className="text-sm text-muted-foreground">{Math.round(styleProfile.confidence)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-4">Style Characteristics</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Formality</span>
                        <Progress value={styleProfile.formality} className="w-16" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Colorfulness</span>
                        <Progress value={styleProfile.colorfulness} className="w-16" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Experimentalness</span>
                        <Progress value={styleProfile.experimentalness} className="w-16" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Color Analysis Tab */}
        <TabsContent value="colors" className="space-y-6">
          {colorAnalysis && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Palette className="w-5 h-5" />
                  <span>Color Harmony Analysis</span>
                </CardTitle>
                <CardDescription>Your color preferences and harmony patterns</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-4">Dominant Colors</h4>
                    <div className="space-y-3">
                      {colorAnalysis.dominantColors?.map((color: any, index: number) => (
                        <div key={index} className="flex items-center space-x-3">
                          <div 
                            className="w-6 h-6 rounded-full border" 
                            style={{ backgroundColor: color.hex }}
                          />
                          <span className="font-medium">{color.name}</span>
                          <Badge variant="outline">{color.count} items</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-4">Recommended Combinations</h4>
                    <div className="space-y-3">
                      {colorAnalysis.recommendations?.map((combo: any, index: number) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            {combo.colors.map((color: string, i: number) => (
                              <div 
                                key={i}
                                className="w-4 h-4 rounded-full border" 
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                          <p className="text-sm text-muted-foreground">{combo.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendations.map((rec, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <rec.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium mb-2">{rec.title}</h4>
                      <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>
                      
                      {rec.type === 'shopping' && rec.suggestions && (
                        <div className="space-y-1">
                          {rec.suggestions.map((suggestion: string) => (
                            <Badge key={suggestion} variant="outline" className="mr-1">
                              {suggestion}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      {rec.confidence && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-sm">
                            <span>Confidence</span>
                            <span>{Math.round(rec.confidence * 100)}%</span>
                          </div>
                          <Progress value={rec.confidence * 100} className="mt-1" />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Regenerate Button */}
      <Card>
        <CardContent className="p-6 text-center">
          <Button onClick={generateAIInsights} disabled={loading}>
            <Brain className="w-4 h-4 mr-2" />
            Regenerate AI Analysis
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};