import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Sparkles, Calendar, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useWardrobe } from "@/hooks/useWardrobe";

interface TrendAnalysis {
  trends: Array<{
    name: string;
    popularity: number;
    relevance: string;
    recommendations: string[];
  }>;
  styleEvolution: {
    currentStyle: string;
    trajectory: string;
    suggestions: string[];
  };
  predictiveOutfits: Array<{
    occasion: string;
    items: string[];
    confidence: number;
  }>;
}

export const AITrendAnalyzer = () => {
  const [analysis, setAnalysis] = useState<TrendAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState("trends");
  const { items } = useWardrobe();

  const analyzeTrends = async (type: 'trends' | 'style_evolution' | 'predictive') => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-trend-analysis', {
        body: {
          wardrobeData: items.map(item => ({
            category: item.category,
            brand: item.brand,
            color: item.color,
            tags: item.tags,
            wear_count: item.wear_count,
            purchase_date: item.created_at
          })),
          analysisType: type
        }
      });

      if (error) throw error;

      // Parse the response and update analysis
      setAnalysis(data);
      toast.success("Trend analysis complete!");
    } catch (error) {
      console.error('Trend analysis error:', error);
      toast.error("Failed to analyze trends. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            AI Trend Analysis
          </CardTitle>
          <CardDescription>
            Discover fashion trends, track your style evolution, and get predictive outfit recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="trends">
                <TrendingUp className="h-4 w-4 mr-2" />
                Trends
              </TabsTrigger>
              <TabsTrigger value="evolution">
                <Calendar className="h-4 w-4 mr-2" />
                Style Evolution
              </TabsTrigger>
              <TabsTrigger value="predictive">
                <Target className="h-4 w-4 mr-2" />
                Predictions
              </TabsTrigger>
            </TabsList>

            <TabsContent value="trends" className="space-y-4 mt-4">
              <Button
                onClick={() => analyzeTrends('trends')}
                disabled={isAnalyzing}
                className="w-full"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {isAnalyzing ? "Analyzing..." : "Analyze Current Trends"}
              </Button>

              {analysis?.trends && (
                <div className="space-y-4">
                  {analysis.trends.map((trend, index) => (
                    <Card key={index}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-lg">{trend.name}</h3>
                            <Badge variant="secondary" className="mt-1">
                              {trend.popularity}% Popular
                            </Badge>
                          </div>
                          <Badge variant="outline">{trend.relevance}</Badge>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-text-muted">Recommendations:</p>
                          <ul className="list-disc list-inside space-y-1">
                            {trend.recommendations.map((rec, i) => (
                              <li key={i} className="text-sm">{rec}</li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="evolution" className="space-y-4 mt-4">
              <Button
                onClick={() => analyzeTrends('style_evolution')}
                disabled={isAnalyzing}
                className="w-full"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {isAnalyzing ? "Analyzing..." : "Analyze Style Evolution"}
              </Button>

              {analysis?.styleEvolution && (
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Current Style</h3>
                      <Badge variant="secondary" className="text-base">
                        {analysis.styleEvolution.currentStyle}
                      </Badge>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Style Trajectory</h3>
                      <p className="text-sm text-text-muted">
                        {analysis.styleEvolution.trajectory}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Suggestions</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {analysis.styleEvolution.suggestions.map((suggestion, i) => (
                          <li key={i} className="text-sm">{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="predictive" className="space-y-4 mt-4">
              <Button
                onClick={() => analyzeTrends('predictive')}
                disabled={isAnalyzing}
                className="w-full"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {isAnalyzing ? "Analyzing..." : "Generate Predictions"}
              </Button>

              {analysis?.predictiveOutfits && (
                <div className="space-y-4">
                  {analysis.predictiveOutfits.map((outfit, index) => (
                    <Card key={index}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-semibold">{outfit.occasion}</h3>
                          <Badge variant="secondary">
                            {Math.round(outfit.confidence * 100)}% Match
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-text-muted">Suggested Items:</p>
                          <div className="flex flex-wrap gap-2">
                            {outfit.items.map((item, i) => (
                              <Badge key={i} variant="outline">{item}</Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
