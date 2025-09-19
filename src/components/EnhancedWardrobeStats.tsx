import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Shirt, 
  DollarSign, 
  Calendar, 
  Star,
  Target,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { useWardrobe } from '@/hooks/useWardrobe';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

export const EnhancedWardrobeStats = () => {
  const { items } = useWardrobe();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (items.length > 0) {
      calculateComprehensiveStats();
    }
  }, [items]);

  const calculateComprehensiveStats = () => {
    // Basic stats
    const totalItems = items.length;
    const totalValue = items.reduce((sum, item) => sum + (item.purchase_price || 0), 0);
    const totalWears = items.reduce((sum, item) => sum + (item.wear_count || 0), 0);
    const favoriteItems = items.filter(item => item.is_favorite).length;
    const averagePrice = totalItems > 0 ? totalValue / totalItems : 0;
    const averageWears = totalItems > 0 ? totalWears / totalItems : 0;
    
    // Cost per wear calculation
    const costPerWear = totalWears > 0 ? totalValue / totalWears : 0;
    
    // Category analysis
    const categoryDistribution = items.reduce((acc, item) => {
      const category = item.category || 'other';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const categoryData = Object.entries(categoryDistribution).map(([category, count]) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      count,
      percentage: Math.round((count / totalItems) * 100),
      value: items
        .filter(item => item.category === category)
        .reduce((sum, item) => sum + (item.purchase_price || 0), 0)
    }));

    // Brand analysis
    const brandDistribution = items.reduce((acc, item) => {
      const brand = item.brand || 'Unknown';
      acc[brand] = (acc[brand] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topBrands = Object.entries(brandDistribution)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 10)
      .map(([brand, count]) => ({
        brand,
        count,
        percentage: Math.round((count / totalItems) * 100),
        value: items
          .filter(item => item.brand === brand)
          .reduce((sum, item) => sum + (item.purchase_price || 0), 0)
      }));

    // Color analysis
    const colorDistribution = items.reduce((acc, item) => {
      const color = item.color || 'Unknown';
      acc[color] = (acc[color] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topColors = Object.entries(colorDistribution)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 8)
      .map(([color, count]) => ({
        color,
        count,
        percentage: Math.round((count / totalItems) * 100)
      }));

    // Usage patterns
    const wornItems = items.filter(item => (item.wear_count || 0) > 0);
    const unwornItems = items.filter(item => (item.wear_count || 0) === 0);
    const highUsageItems = items.filter(item => (item.wear_count || 0) > 5);
    const lowUsageItems = items.filter(item => (item.wear_count || 0) > 0 && (item.wear_count || 0) <= 2);

    const mostWornItems = items
      .filter(item => (item.wear_count || 0) > 0)
      .sort((a, b) => (b.wear_count || 0) - (a.wear_count || 0))
      .slice(0, 10);

    // Investment analysis
    const priceRanges = {
      budget: items.filter(item => (item.purchase_price || 0) < 50).length,
      mid: items.filter(item => (item.purchase_price || 0) >= 50 && (item.purchase_price || 0) < 150).length,
      premium: items.filter(item => (item.purchase_price || 0) >= 150 && (item.purchase_price || 0) < 300).length,
      luxury: items.filter(item => (item.purchase_price || 0) >= 300).length
    };

    const investmentData = [
      { range: 'Budget (<$50)', count: priceRanges.budget, percentage: Math.round((priceRanges.budget / totalItems) * 100) },
      { range: 'Mid ($50-$149)', count: priceRanges.mid, percentage: Math.round((priceRanges.mid / totalItems) * 100) },
      { range: 'Premium ($150-$299)', count: priceRanges.premium, percentage: Math.round((priceRanges.premium / totalItems) * 100) },
      { range: 'Luxury ($300+)', count: priceRanges.luxury, percentage: Math.round((priceRanges.luxury / totalItems) * 100) }
    ];

    // Monthly acquisition trends
    const monthlyData = items.reduce((acc, item) => {
      const month = new Date(item.created_at).toISOString().slice(0, 7);
      if (!acc[month]) {
        acc[month] = { count: 0, value: 0 };
      }
      acc[month].count += 1;
      acc[month].value += item.purchase_price || 0;
      return acc;
    }, {} as Record<string, {count: number, value: number}>);

    const monthlyTrends = Object.entries(monthlyData)
      .map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('en', { month: 'short', year: '2-digit' }),
        count: data.count,
        value: Math.round(data.value),
        avgPrice: Math.round(data.value / data.count)
      }))
      .slice(-12);

    // Seasonal analysis
    const seasonalData = items.reduce((acc, item) => {
      const season = item.season || 'all-season';
      acc[season] = (acc[season] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const seasonalChart = Object.entries(seasonalData).map(([season, count]) => ({
      season: season.charAt(0).toUpperCase() + season.slice(1).replace('-', ' '),
      count,
      percentage: Math.round((count / totalItems) * 100)
    }));

    setStats({
      overview: {
        totalItems,
        totalValue,
        totalWears,
        favoriteItems,
        averagePrice,
        averageWears,
        costPerWear,
        wornItems: wornItems.length,
        unwornItems: unwornItems.length,
        highUsageItems: highUsageItems.length,
        lowUsageItems: lowUsageItems.length
      },
      categoryData,
      topBrands,
      topColors,
      mostWornItems,
      investmentData,
      monthlyTrends,
      seasonalChart
    });
  };

  if (!stats) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto" />
            <p className="text-lg font-medium">No data to analyze</p>
            <p className="text-sm text-muted-foreground">Add items to your wardrobe to see detailed statistics</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658', '#ff7300'];

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Shirt className="w-8 h-8 text-primary" />
            </div>
            <p className="text-2xl font-bold">{stats.overview.totalItems}</p>
            <p className="text-sm text-muted-foreground">Total Items</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-2xl font-bold">${stats.overview.totalValue.toFixed(0)}</p>
            <p className="text-sm text-muted-foreground">Total Value</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Activity className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-2xl font-bold">{stats.overview.totalWears}</p>
            <p className="text-sm text-muted-foreground">Total Wears</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Target className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-2xl font-bold">${stats.overview.costPerWear.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">Cost per Wear</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="categories" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="brands">Brands</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="investment">Investment</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="categories">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
                <CardDescription>How your wardrobe is composed</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {stats.categoryData.map((category: any, index: number) => (
                  <div key={category.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{category.category}</span>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{category.count} items</Badge>
                        <Badge variant="secondary">${category.value.toFixed(0)}</Badge>
                      </div>
                    </div>
                    <Progress value={category.percentage} className="h-2" />
                    <p className="text-xs text-muted-foreground">{category.percentage}% of wardrobe</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Seasonal Breakdown</CardTitle>
                <CardDescription>Items by season</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPieChart>
                    <Pie
                      dataKey="count"
                      data={stats.seasonalChart}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      label={({ season, percentage }) => `${season} (${percentage}%)`}
                    >
                      {stats.seasonalChart.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="brands">
          <Card>
            <CardHeader>
              <CardTitle>Brand Analysis</CardTitle>
              <CardDescription>Your favorite brands and their performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {stats.topBrands.slice(0, 8).map((brand: any, index: number) => (
                  <div key={brand.brand} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{brand.brand}</p>
                      <p className="text-sm text-muted-foreground">
                        {brand.count} items • ${brand.value.toFixed(0)} value
                      </p>
                    </div>
                    <Badge variant="outline">{brand.percentage}%</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span>Most Worn Items</span>
                </CardTitle>
                <CardDescription>Your wardrobe workhorses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {stats.mostWornItems.slice(0, 8).map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.brand}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary">{item.wear_count} wears</Badge>
                      {item.purchase_price && (
                        <p className="text-xs text-muted-foreground">
                          ${(item.purchase_price / (item.wear_count || 1)).toFixed(2)}/wear
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usage Overview</CardTitle>
                <CardDescription>How well you're using your wardrobe</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Items Worn</span>
                    <Badge variant="default">{stats.overview.wornItems}</Badge>
                  </div>
                  <Progress value={(stats.overview.wornItems / stats.overview.totalItems) * 100} />
                  <p className="text-xs text-muted-foreground">
                    {Math.round((stats.overview.wornItems / stats.overview.totalItems) * 100)}% of your wardrobe has been worn
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>High Usage Items</span>
                    <Badge variant="secondary">{stats.overview.highUsageItems}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Items worn more than 5 times</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Never Worn</span>
                    <Badge variant="destructive">{stats.overview.unwornItems}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Consider donating or styling these items</p>
                </div>

                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Average Wears per Item</p>
                  <p className="text-2xl font-bold">{stats.overview.averageWears.toFixed(1)}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="investment">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Investment Breakdown</CardTitle>
                <CardDescription>How you spend on clothing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {stats.investmentData.map((range: any) => (
                  <div key={range.range} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{range.range}</span>
                      <Badge variant="outline">{range.count} items</Badge>
                    </div>
                    <Progress value={range.percentage} />
                    <p className="text-xs text-muted-foreground">{range.percentage}% of purchases</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Investment Insights</CardTitle>
                <CardDescription>Key metrics about your spending</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Average Item Price</p>
                    <p className="text-2xl font-bold">${stats.overview.averagePrice.toFixed(0)}</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Cost per Wear</p>
                    <p className="text-2xl font-bold">${stats.overview.costPerWear.toFixed(2)}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Top Colors</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {stats.topColors.slice(0, 6).map((color: any) => (
                      <div key={color.color} className="flex items-center justify-between text-sm">
                        <span>{color.color}</span>
                        <Badge variant="outline" className="text-xs">{color.count}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Shopping Trends</CardTitle>
              <CardDescription>Your acquisition patterns over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="count" fill="hsl(var(--primary))" name="Items Added" />
                  <Bar yAxisId="right" dataKey="value" fill="hsl(var(--secondary))" name="Value ($)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};