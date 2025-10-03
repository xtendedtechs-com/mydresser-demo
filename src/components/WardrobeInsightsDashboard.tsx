import { useState, useEffect } from 'react';
import { TrendingUp, Package, AlertCircle, Sparkles, PieChart, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWardrobe } from '@/hooks/useWardrobe';
import { useToast } from '@/hooks/use-toast';

export const WardrobeInsightsDashboard = () => {
  const { items } = useWardrobe();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<any>(null);
  const [activeAnalysis, setActiveAnalysis] = useState('overview');

  const generateInsights = async (analysisType: string) => {
    if (items.length === 0) {
      toast({
        title: 'No items to analyze',
        description: 'Add items to your wardrobe to get AI insights.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    setActiveAnalysis(analysisType);

    try {
      const FUNCTION_URL = 'https://bdfyrtobxkwxobjspxjo.supabase.co/functions/v1/ai-wardrobe-insights';
      
      const response = await fetch(FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkZnlydG9ieGt3eG9ianNweGpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3NjU3NzEsImV4cCI6MjA3MzM0MTc3MX0.Ck8RUCFUdezGr46gj_4caj-kBegzp_O7nzqR0AelCmc'
        },
        body: JSON.stringify({
          wardrobeItems: items.map(item => ({
            id: item.id,
            category: item.category,
            name: item.name,
            color: item.color,
            brand: item.brand,
            condition: item.condition,
            season: item.season,
            wear_count: item.wear_count,
            is_favorite: item.is_favorite,
            purchase_price: item.purchase_price
          })),
          analysisType
        })
      });

      if (response.status === 429) {
        toast({
          title: 'Rate limit exceeded',
          description: 'Please wait before generating more insights.',
          variant: 'destructive'
        });
        return;
      }

      if (response.status === 402) {
        toast({
          title: 'AI credits depleted',
          description: 'Please add credits to continue.',
          variant: 'destructive'
        });
        return;
      }

      if (!response.ok) throw new Error('Failed to generate insights');

      const data = await response.json();
      setInsights(data);

    } catch (error) {
      console.error('Insights error:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate insights. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate basic stats
  const stats = {
    totalItems: items.length,
    categories: [...new Set(items.map(i => i.category))].length,
    avgWearCount: items.length > 0 
      ? (items.reduce((sum, i) => sum + (i.wear_count || 0), 0) / items.length).toFixed(1)
      : 0,
    favoriteCount: items.filter(i => i.is_favorite).length,
    totalValue: items.reduce((sum, i) => sum + (i.purchase_price || 0), 0).toFixed(2)
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Package className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
            <div className="text-2xl font-bold">{stats.totalItems}</div>
            <div className="text-xs text-muted-foreground">Total Items</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <PieChart className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
            <div className="text-2xl font-bold">{stats.categories}</div>
            <div className="text-xs text-muted-foreground">Categories</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <BarChart3 className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
            <div className="text-2xl font-bold">{stats.avgWearCount}</div>
            <div className="text-xs text-muted-foreground">Avg. Wear Count</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
            <div className="text-2xl font-bold">{stats.favoriteCount}</div>
            <div className="text-xs text-muted-foreground">Favorites</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Sparkles className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
            <div className="text-2xl font-bold">${stats.totalValue}</div>
            <div className="text-xs text-muted-foreground">Total Value</div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Wardrobe Insights
          </CardTitle>
          <CardDescription>
            Get intelligent analysis and recommendations for your wardrobe
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={activeAnalysis} onValueChange={setActiveAnalysis}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="gaps">Gaps Analysis</TabsTrigger>
              <TabsTrigger value="sustainability">Sustainability</TabsTrigger>
            </TabsList>

            <TabsContent value={activeAnalysis} className="mt-4 space-y-4">
              <Button
                onClick={() => generateInsights(activeAnalysis)}
                disabled={loading || items.length === 0}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate AI Insights
                  </>
                )}
              </Button>

              {insights && insights.insights && (
                <Card className="bg-muted/50">
                  <CardContent className="pt-6">
                    <div className="prose prose-sm max-w-none">
                      <p className="whitespace-pre-wrap text-sm">{insights.insights}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {!insights && !loading && (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">
                    Click "Generate AI Insights" to get personalized analysis
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
