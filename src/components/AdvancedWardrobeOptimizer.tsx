import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Target, Zap, Calendar, ShoppingBag, Sparkles } from "lucide-react";
import { useWardrobe } from "@/hooks/useWardrobe";
import { useToast } from "@/hooks/use-toast";

interface OptimizationInsight {
  category: string;
  score: number;
  recommendation: string;
  impact: "high" | "medium" | "low";
  actionable: boolean;
}

export const AdvancedWardrobeOptimizer = () => {
  const { items } = useWardrobe();
  const [insights, setInsights] = useState<OptimizationInsight[]>([]);
  const [optimizationScore, setOptimizationScore] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (items.length > 0) {
      analyzeWardrobe();
    }
  }, [items]);

  const analyzeWardrobe = () => {
    const analysis: OptimizationInsight[] = [];
    let totalScore = 0;

    // Category Distribution Analysis
    const categoryCount: Record<string, number> = {};
    items.forEach(item => {
      categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
    });

    const categories = Object.keys(categoryCount);
    const avgItemsPerCategory = items.length / categories.length;

    categories.forEach(cat => {
      const count = categoryCount[cat];
      const score = Math.min(100, (count / avgItemsPerCategory) * 100);
      
      if (count < avgItemsPerCategory * 0.5) {
        analysis.push({
          category: cat,
          score,
          recommendation: `Your ${cat} collection could be expanded. Consider adding 2-3 versatile pieces.`,
          impact: "medium",
          actionable: true
        });
      }
    });

    // Color Harmony Analysis
    const colors = items.map(item => item.color?.toLowerCase() || 'unknown');
    const colorFrequency: Record<string, number> = {};
    colors.forEach(color => {
      colorFrequency[color] = (colorFrequency[color] || 0) + 1;
    });

    const dominantColors = Object.entries(colorFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    const colorScore = (dominantColors.length / 3) * 100;
    analysis.push({
      category: "Color Palette",
      score: colorScore,
      recommendation: `Your wardrobe is anchored by ${dominantColors.map(([c]) => c).join(', ')}. These create excellent mixing opportunities.`,
      impact: "high",
      actionable: false
    });

    // Versatility Score
    const versatileItems = items.filter(item => 
      item.tags?.includes('versatile') || 
      item.tags?.includes('basic') ||
      item.category === 'Tops' ||
      item.category === 'Bottoms'
    );
    const versatilityScore = (versatileItems.length / items.length) * 100;

    analysis.push({
      category: "Versatility",
      score: versatilityScore,
      recommendation: versatilityScore < 40 
        ? "Add more versatile basics that can be mixed and matched easily."
        : "Great job! Your wardrobe has strong versatile pieces.",
      impact: "high",
      actionable: versatilityScore < 40
    });

    // Season Coverage
    const seasons = ['spring', 'summer', 'fall', 'winter'];
    const seasonCoverage = seasons.filter(season => 
      items.some(item => item.tags?.includes(season))
    );
    const seasonScore = (seasonCoverage.length / 4) * 100;

    analysis.push({
      category: "Season Coverage",
      score: seasonScore,
      recommendation: seasonScore < 75 
        ? `Missing pieces for ${seasons.filter(s => !seasonCoverage.includes(s)).join(', ')} seasons.`
        : "Excellent year-round wardrobe coverage!",
      impact: "medium",
      actionable: seasonScore < 75
    });

    // Calculate overall optimization score
    const avgScore = analysis.reduce((sum, insight) => sum + insight.score, 0) / analysis.length;
    setOptimizationScore(Math.round(avgScore));
    setInsights(analysis);
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleOptimizeAction = (insight: OptimizationInsight) => {
    toast({
      title: "Optimization Tip",
      description: `Working on: ${insight.recommendation}`,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Advanced Wardrobe Optimizer
              </CardTitle>
              <CardDescription>
                AI-powered insights to maximize your wardrobe potential
              </CardDescription>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold ${getScoreColor(optimizationScore)}`}>
                {optimizationScore}%
              </div>
              <p className="text-xs text-muted-foreground">Optimization Score</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="insights" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="insights">
                <Sparkles className="h-4 w-4 mr-2" />
                Insights
              </TabsTrigger>
              <TabsTrigger value="recommendations">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Recommendations
              </TabsTrigger>
              <TabsTrigger value="trends">
                <TrendingUp className="h-4 w-4 mr-2" />
                Trends
              </TabsTrigger>
            </TabsList>

            <TabsContent value="insights" className="space-y-4 mt-4">
              {insights.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Add items to your wardrobe to see optimization insights
                </p>
              ) : (
                insights.map((insight, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{insight.category}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge className={getImpactColor(insight.impact)}>
                            {insight.impact} impact
                          </Badge>
                          <span className={`text-lg font-bold ${getScoreColor(insight.score)}`}>
                            {Math.round(insight.score)}%
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        {insight.recommendation}
                      </p>
                      {insight.actionable && (
                        <Button 
                          size="sm" 
                          onClick={() => handleOptimizeAction(insight)}
                          className="w-full"
                        >
                          <Zap className="h-4 w-4 mr-2" />
                          Take Action
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Smart Purchase Suggestions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-semibold text-sm mb-1">Essential Basics</h4>
                    <p className="text-xs text-muted-foreground">
                      White button-down shirt, black jeans, neutral blazer
                    </p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-semibold text-sm mb-1">Color Gaps</h4>
                    <p className="text-xs text-muted-foreground">
                      Navy blue items, earth tones, pastels for spring
                    </p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-semibold text-sm mb-1">Style Evolution</h4>
                    <p className="text-xs text-muted-foreground">
                      Statement accessories, layering pieces, seasonal trends
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trends" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Your Wardrobe Trends</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-semibold text-sm">Most Worn Category</h4>
                      <p className="text-xs text-muted-foreground">Casual Tops</p>
                    </div>
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-semibold text-sm">Style Preference</h4>
                      <p className="text-xs text-muted-foreground">Minimalist Casual</p>
                    </div>
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-semibold text-sm">Growth Area</h4>
                      <p className="text-xs text-muted-foreground">Evening Wear</p>
                    </div>
                    <Target className="h-5 w-5 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};