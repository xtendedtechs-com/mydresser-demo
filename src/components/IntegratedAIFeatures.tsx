/**
 * Integrated AI Features - Complete MyDresser AI Implementation
 * All features use original MyDresser IP services
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Brain, TrendingUp, Palette, Cloud } from 'lucide-react';
import { useWardrobe } from '@/hooks/useWardrobe';
import { myDresserAI } from '@/services/myDresserAI';
import { myDresserWeather } from '@/services/myDresserWeather';
import { myDresserAnalytics } from '@/services/myDresserAnalytics';
import { OutfitAI } from '@/ai/OutfitAI';
import { colorHarmonyEngine } from '@/ai/ColorHarmonyEngine';
import { toast } from 'sonner';

export const IntegratedAIFeatures = () => {
  const { items } = useWardrobe();
  const [loading, setLoading] = useState(false);
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [styleProfile, setStyleProfile] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  useEffect(() => {
    if (items.length > 0) {
      generateFullAnalysis();
    }
  }, [items]);

  const generateFullAnalysis = async () => {
    setLoading(true);
    try {
      // 1. Style Analysis
      const styleProfile = await myDresserAI.generatePersonalStyleProfile(items, {});
      setStyleProfile(styleProfile);

      // 2. Color Analysis
      const colorAnalysis = colorHarmonyEngine.analyzeOutfitColors(items.slice(0, 5));

      // 3. Weather-based suggestions
      const weather = myDresserWeather.generateWeatherData('Current Location');

      // 4. AI Outfit Generation
      const outfitAI = new OutfitAI();
      const suggestions = await Promise.all([
        outfitAI.generateOutfit({
          wardrobeItems: items,
          occasion: 'casual',
          weather,
          preferences: {}
        }),
        outfitAI.generateOutfit({
          wardrobeItems: items,
          occasion: 'work',
          weather,
          preferences: {}
        }),
        outfitAI.generateOutfit({
          wardrobeItems: items,
          occasion: 'evening',
          weather,
          preferences: {}
        })
      ]);

      // 5. Comprehensive recommendations
      const aiRecs = await myDresserAI.generateSmartRecommendations(
        items,
        styleProfile,
        { weather, preferences: {} }
      );

      // 6. Analytics insights
      const analytics = await myDresserAnalytics.generateUserAnalytics(
        'user-id',
        items,
        []
      );

      setAiInsights({
        style: styleProfile,
        colorAnalysis,
        weather,
        analytics
      });

      setRecommendations(aiRecs);
      toast.success('AI analysis complete!');
    } catch (error) {
      console.error('AI analysis error:', error);
      toast.error('Failed to generate AI analysis');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center space-y-4">
          <Brain className="w-12 h-12 animate-pulse mx-auto text-primary" />
          <p className="text-muted-foreground">Analyzing your wardrobe with AI...</p>
        </div>
      </div>
    );
  }

  if (!aiInsights) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">
            Add items to your wardrobe to unlock AI-powered insights
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            MyDresser AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{aiInsights.analytics.styleConsistency.toFixed(0)}%</p>
              <p className="text-sm text-muted-foreground">Style Consistency</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <Palette className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{aiInsights.analytics.colorHarmony.toFixed(0)}%</p>
              <p className="text-sm text-muted-foreground">Color Harmony</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <Cloud className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{Math.round(aiInsights.weather.temperature)}°C</p>
              <p className="text-sm text-muted-foreground">Current Weather</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="style" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="style">Style Profile</TabsTrigger>
          <TabsTrigger value="colors">Color Analysis</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="style" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Style DNA</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Dominant Style</p>
                <Badge variant="default" className="text-base">
                  {styleProfile.primaryStyle}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Secondary Style</p>
                <Badge variant="outline">
                  {styleProfile.secondaryStyle}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Lifestyle</p>
                <Badge variant="outline">
                  {styleProfile.lifestyle}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="colors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Color Palette Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Dominant Colors</p>
                  <div className="flex flex-wrap gap-2">
                    {aiInsights.colorAnalysis.dominantColors.map((color: string) => (
                      <Badge key={color} variant="outline">
                        {color}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Complementary Suggestions</p>
                  <div className="flex flex-wrap gap-2">
                    {aiInsights.colorAnalysis.suggestions.map((suggestion: string) => (
                      <Badge key={suggestion} variant="secondary">
                        {suggestion}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          {recommendations.slice(0, 3).map((rec, idx) => (
            <Card key={idx}>
              <CardHeader>
                <CardTitle className="text-base">{rec.title || 'AI Recommendation'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {rec.description || 'Curated by MyDresser AI'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {rec.items?.slice(0, 4).map((item: any, i: number) => (
                    <Badge key={i} variant="outline">
                      {item.name || 'Item'}
                    </Badge>
                  ))}
                </div>
                <div className="text-xs text-muted-foreground">
                  Confidence: {rec.confidence || 85}%
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      <Button onClick={generateFullAnalysis} disabled={loading} className="w-full">
        <Sparkles className="w-4 h-4 mr-2" />
        Regenerate AI Analysis
      </Button>
    </div>
  );
};