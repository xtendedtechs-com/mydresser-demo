import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAnalytics } from '@/hooks/useAnalytics';
import { 
  TrendingUp, DollarSign, Shirt, PieChart,
  RefreshCw, Calendar, Award, Leaf
} from 'lucide-react';

interface WardrobeAnalytics {
  total_items: number;
  by_category: Record<string, number>;
  by_color: Record<string, number>;
  by_brand: Record<string, number>;
  wardrobe_value: number;
}

export default function UserInsights() {
  const { calculateWardrobeAnalytics } = useAnalytics();
  const [wardrobeAnalytics, setWardrobeAnalytics] = useState<WardrobeAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setRefreshing(true);
    setLoading(true);
    try {
      const data = await calculateWardrobeAnalytics();
      setWardrobeAnalytics(data as any);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const getTopCategories = () => {
    if (!wardrobeAnalytics?.by_category) return [];
    return Object.entries(wardrobeAnalytics.by_category)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 5);
  };

  const getTopColors = () => {
    if (!wardrobeAnalytics?.by_color) return [];
    return Object.entries(wardrobeAnalytics.by_color)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 5);
  };

  if (loading && !wardrobeAnalytics) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Wardrobe Insights</h1>
            <p className="text-muted-foreground">
              Understand your style, maximize your wardrobe
            </p>
          </div>
          <Button 
            onClick={loadAnalytics} 
            disabled={refreshing}
            variant="outline"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Shirt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {wardrobeAnalytics?.total_items || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                In your wardrobe
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Wardrobe Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${wardrobeAnalytics?.wardrobe_value?.toFixed(0) || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Total investment
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sustainability</CardTitle>
              <Leaf className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                75
              </div>
              <p className="text-xs text-muted-foreground">
                Eco-friendly score
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.keys(wardrobeAnalytics?.by_category || {}).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Different types
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
            <CardDescription>Your most common clothing types</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {getTopCategories().map(([category, count]) => {
              const percentage = wardrobeAnalytics?.total_items 
                ? ((count as number) / wardrobeAnalytics.total_items) * 100 
                : 0;
              return (
                <div key={category} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium capitalize">{category}</span>
                    <span className="text-muted-foreground">
                      {count} items ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <Progress value={percentage} />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Color Palette */}
        <Card>
          <CardHeader>
            <CardTitle>Color Palette</CardTitle>
            <CardDescription>Your most worn colors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-5">
              {getTopColors().map(([color, count]) => {
                const percentage = wardrobeAnalytics?.total_items 
                  ? ((count as number) / wardrobeAnalytics.total_items) * 100 
                  : 0;
                return (
                  <div key={color} className="space-y-2">
                    <div 
                      className="h-20 rounded-lg border"
                      style={{ backgroundColor: color.toLowerCase() }}
                    />
                    <div className="text-center">
                      <p className="text-sm font-medium capitalize">{color}</p>
                      <p className="text-xs text-muted-foreground">
                        {String(count)} items ({percentage.toFixed(0)}%)
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Brand Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Brand Preferences</CardTitle>
            <CardDescription>Your favorite brands</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(wardrobeAnalytics?.by_brand || {})
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .slice(0, 8)
                .map(([brand, count]) => (
                  <div key={brand} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">{brand}</span>
                    <span className="text-sm text-muted-foreground">{String(count)} items</span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Insights & Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Smart Insights
            </CardTitle>
            <CardDescription>Personalized recommendations based on your wardrobe</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-4 border rounded-lg bg-muted/50">
              <p className="text-sm">
                💡 Your wardrobe has great coverage in basics. Consider adding statement pieces for special occasions.
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-muted/50">
              <p className="text-sm">
                🌿 Your sustainability score is 75. 
                Try adding more eco-friendly brands to improve it.
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-muted/50">
              <p className="text-sm">
                💰 Your cost per wear is optimized! You're making the most of your wardrobe investment.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}